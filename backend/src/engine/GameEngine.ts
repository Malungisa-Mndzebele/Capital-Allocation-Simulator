import { GameState, BusinessState, MarketState, PortfolioState, CareerState } from './types';
import { BusinessLogic } from './systems/BusinessLogic';
import { MarketLogic } from './systems/MarketLogic';
import { InvestmentLogic } from './systems/InvestmentLogic';
import { CareerLogic } from './systems/CareerLogic';
import { LoanLogic } from './systems/LoanLogic';
import { RetirementLogic } from './systems/RetirementLogic';
import { PersonalityLogic } from './systems/PersonalityLogic';
import { SkillTreeLogic } from './systems/SkillTreeLogic';
import { ChallengeMode, CHALLENGES } from './systems/ChallengeMode';
import { ScenarioMode, SCENARIOS } from './systems/ScenarioMode';
import { TAX_RATE, RELATIONSHIP_COSTS, CHILD_COST_PER_MONTH, LIFESTYLE_TIERS, RETIREMENT_LIMITS } from './config';
import { checkAchievements } from './achievements';

export class GameEngine {
    static processTurn(currentState: GameState): GameState {
        // Deep copy to avoid mutation of original state
        const newState: GameState = JSON.parse(JSON.stringify(currentState));
        newState.month += 1;
        newState.events = []; // Clear old events

        // Update Age (17yo start + months/12). 
        // Logic: Month 1-12 = 17. Month 13 = 18.
        newState.player.age = 17 + Math.floor((newState.month - 1) / 12);

        // 1. Market Phase (Always Active for Macro Context)
        const oldMarketIndex = newState.market.stockMarketIndex;
        newState.market = MarketLogic.processMonth(newState.market);

        // 2. Retirement Account Processing (tax-deferred growth)
        newState.retirement = RetirementLogic.processMonth(
            newState.retirement,
            newState.market,
            oldMarketIndex,
            newState.month,
            newState.player.age
        );

        // Check for RMD requirements at age 72
        if (newState.player.age >= RETIREMENT_LIMITS.RMD_AGE) {
            newState.retirement.accounts.forEach(account => {
                const rmdCheck = RetirementLogic.checkRMDRequirement(account, newState.player.age);
                if (rmdCheck.required && rmdCheck.amount > 0) {
                    newState.events.push({
                        month: newState.month,
                        description: 'Required Minimum Distribution Due',
                        impact: `You must withdraw $${rmdCheck.amount.toFixed(0)} from your ${account.type} by year end.`
                    });
                }
            });
        }

        // Check for catch-up contribution eligibility at age 50
        if (newState.player.age === 50 && newState.retirement.accounts.length > 0) {
            newState.events.push({
                month: newState.month,
                description: 'Catch-Up Contributions Available',
                impact: `You're now 50! You can contribute an extra $7,500 to 401(k) and $1,000 to IRAs annually.`
            });
        }

        // Check for employer match warnings
        const active401k = newState.retirement.accounts.find(acc => acc.type === '401k' && acc.isActive);
        if (active401k && active401k.employerMatch > 0 && active401k.contributionRate < active401k.employerMatchLimit) {
            // Only warn occasionally (every 6 months) to avoid spam
            if (newState.month % 6 === 0) {
                newState.events.push({
                    month: newState.month,
                    description: 'Employer Match Reminder',
                    impact: `You're contributing ${active401k.contributionRate.toFixed(1)}% but could get full match at ${active401k.employerMatchLimit}%. Don't leave free money on the table!`
                });
            }
        }

        // 3. Lifestyle Cost Calculation
        const relationshipCost = RELATIONSHIP_COSTS[newState.player.relationshipStatus] ?? 0;
        const childCost = newState.player.children * CHILD_COST_PER_MONTH;
        
        // Apply skill bonuses to lifestyle costs
        const lifestyleCostReduction = SkillTreeLogic.getSkillBonus(newState.skills, 'lifestyle');
        const relationshipCostReduction = SkillTreeLogic.getSkillBonus(newState.skills, 'relationship_costs');
        
        const adjustedLifestyleCosts = (newState.lifestyle.rent + newState.lifestyle.food + 
            newState.lifestyle.transport + newState.lifestyle.entertainment) * (1 + lifestyleCostReduction);
        const adjustedRelationshipCost = relationshipCost * (1 + relationshipCostReduction);

        // Process loan payments
        const loanResult = LoanLogic.processMonthlyPayments(newState.loans);
        newState.loans = loanResult.updatedLoans;
        const loanPayment = loanResult.totalPayment;
        
        if (loanResult.paidOffLoans.length > 0) {
            loanResult.paidOffLoans.forEach(loanId => {
                const loan = newState.loans.find(l => l.id === loanId);
                if (loan) {
                    newState.events.push({
                        month: newState.month,
                        description: `Loan Paid Off!`,
                        impact: `${loan.type} loan fully repaid. Credit score improved.`
                    });
                }
            });
        }

        const totalExpenses = adjustedLifestyleCosts +
            adjustedRelationshipCost +
            childCost +
            loanPayment;

        // Pregnancy Progression
        if (newState.player.isPregnant) {
            newState.player.pregnancyMonth++;
            if (newState.player.pregnancyMonth >= 9) {
                newState.player.isPregnant = false;
                newState.player.pregnancyMonth = 0;
                newState.player.children++;

                newState.events.push({
                    month: newState.month,
                    description: "BABY BORN!",
                    impact: "You have a new child. Expenses increased by $1200/mo."
                });

                // Happiness boost
                newState.player.happiness = 100;
            }
        }

        // --- LEVEL 1: CAREER & EDUCATION ---
        if (newState.level === 'Career') {
            const oldCareer = newState.career;
            const studySpeedBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'study_speed');
            newState.career = CareerLogic.processMonth(newState.career, {
                intelligence: newState.player.intelligence,
                wisdom: newState.player.wisdom,
                strength: newState.player.strength
            }, studySpeedBonus);
            
            // Add relationship/family decisions based on actual status
            if (newState.player.relationshipStatus === 'Single' && Math.random() < 0.1) {
                newState.career.pendingDecisions.push({
                    id: `relationship_${Date.now()}`,
                    title: "Relationship",
                    description: "You met someone interesting at a coffee shop.",
                    options: [
                        { id: "date", label: "Ask for Date ($50)", cost: 50, effect: "relationship:Dating,happiness:+20" },
                        { id: "pass", label: "Not Ready", cost: 0, effect: "" }
                    ],
                    resolved: false
                });
            }
            
            if ((newState.player.relationshipStatus === 'Dating' || newState.player.relationshipStatus === 'Married') 
                && !newState.player.isPregnant && Math.random() < 0.05) {
                newState.career.pendingDecisions.push({
                    id: `family_${Date.now()}`,
                    title: "Family Planning",
                    description: "Partner suggests trying for a baby.",
                    options: [
                        { id: "try", label: "Agree", cost: 0, effect: "pregnancy:start" },
                        { id: "wait", label: "Wait", cost: 0, effect: "happiness:-5" }
                    ],
                    resolved: false
                });
            }

            // Stat Updates based on Activity
            if (newState.career.jobTitle === 'Fast Food') {
                newState.player.strength = Math.min(100, newState.player.strength + 0.2);
                newState.player.energy = Math.max(0, newState.player.energy - 2);
            } else if (newState.career.jobTitle === 'Warehouse') {
                newState.player.strength = Math.min(100, newState.player.strength + 0.5);
                newState.player.energy = Math.max(0, newState.player.energy - 3);
            } else if (newState.career.jobTitle === 'Sales') {
                newState.player.wisdom = Math.min(100, newState.player.wisdom + 0.3);
                newState.player.energy = Math.max(0, newState.player.energy - 3);
            }

            if (newState.career.isStudying) {
                newState.player.intelligence = Math.min(100, newState.player.intelligence + 0.5);
                newState.player.energy = Math.max(0, newState.player.energy - 1);
            }

            // Energy recovery
            let recovery = 2;
            if (newState.lifestyle.tier === 'Parents') recovery = 3;
            if (newState.lifestyle.tier === 'Luxury') recovery = 5;
            if (newState.lifestyle.tier === 'Homeless') recovery = -2; // Draining
            
            // Skill bonus (Health Nut)
            const energyRecoveryBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'energy_recovery');
            recovery += energyRecoveryBonus;

            newState.player.energy = Math.min(100, Math.max(0, newState.player.energy + recovery));

            // Check for Promotion
            if (newState.career.jobTitle !== oldCareer.jobTitle) {
                newState.events.push({
                    month: newState.month,
                    description: `PROMOTION!`,
                    impact: `Promoted to ${newState.career.jobTitle}. Salary: $${newState.career.salary}/yr`
                });
                
                // Handle 401(k) account changes on job change
                // Mark old 401(k) as inactive and forfeit unvested contributions
                newState.retirement.accounts = newState.retirement.accounts.map(account => {
                    if (account.type === '401k' && account.isActive) {
                        // Forfeit unvested contributions
                        const forfeited = RetirementLogic.forfeitUnvestedContributions(account);
                        
                        if (forfeited.balance < account.balance) {
                            const forfeitedAmount = account.balance - forfeited.balance;
                            newState.events.push({
                                month: newState.month,
                                description: 'Unvested 401(k) Contributions Forfeited',
                                impact: `Lost $${forfeitedAmount.toFixed(0)} in unvested employer contributions due to job change.`
                            });
                        }
                        
                        return forfeited;
                    }
                    return account;
                });
            }

            // Calculate Income with happiness productivity modifier
            const grossMonthly = newState.career.salary / 12;
            
            // Happiness affects productivity: 0-30 = 70%, 31-70 = 100%, 71-100 = 110%
            let productivityMultiplier = 1.0;
            if (newState.player.happiness <= 30) productivityMultiplier = 0.7;
            else if (newState.player.happiness >= 71) productivityMultiplier = 1.1;
            
            // Difficulty modifier
            if (newState.difficulty === 'Easy') productivityMultiplier *= 1.2;
            else if (newState.difficulty === 'Hard') productivityMultiplier *= 0.8;
            
            // Personality bonus (work ethic + social skills affect promotions/income)
            const personalityBonus = PersonalityLogic.getPersonalityBonus(newState.player, 'promotion_chance');
            productivityMultiplier *= (1 + personalityBonus);
            
            // Skill bonuses (Negotiator, Workaholic, Executive)
            const salarySkillBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'salary');
            const salaryWithSkills = newState.career.salary * (1 + salarySkillBonus);
            const adjustedGrossMonthly = (salaryWithSkills / 12) * productivityMultiplier;
            
            // Process retirement contributions (pre-tax for 401k and Traditional IRA)
            let totalRetirementContributions = 0;
            let totalEmployerMatch = 0;
            
            // Process active retirement accounts
            const activeAccounts = newState.retirement.accounts.filter(acc => acc.isActive);
            for (const account of activeAccounts) {
                if (account.contributionRate > 0) {
                    // Calculate employee contribution
                    const contribution = RetirementLogic.calculateContribution(
                        adjustedGrossMonthly,
                        account.contributionRate,
                        account.type
                    );
                    
                    // Process contribution with limit enforcement
                    const result = RetirementLogic.processContribution(
                        account,
                        newState.retirement,
                        contribution,
                        newState.player.age
                    );
                    
                    // Update account in state
                    const accountIndex = newState.retirement.accounts.findIndex(a => a.id === account.id);
                    if (accountIndex !== -1) {
                        newState.retirement.accounts[accountIndex] = result.account;
                    }
                    newState.retirement = result.state;
                    
                    totalRetirementContributions += result.actualContribution;
                    
                    // Calculate and add employer match for 401k
                    if (account.type === '401k' && result.actualContribution > 0) {
                        const employerMatch = RetirementLogic.calculateEmployerMatch(
                            result.actualContribution,
                            adjustedGrossMonthly,
                            account.employerMatch,
                            account.employerMatchLimit
                        );
                        
                        if (employerMatch > 0) {
                            // Add employer match to account
                            const updatedAccount = RetirementLogic.addEmployerMatch(
                                newState.retirement.accounts[accountIndex],
                                employerMatch
                            );
                            newState.retirement.accounts[accountIndex] = updatedAccount;
                            totalEmployerMatch += employerMatch;
                        }
                    }
                }
            }
            
            // Calculate taxable income (after pre-tax retirement contributions)
            // 401k and Traditional IRA contributions are pre-tax
            const preTaxContributions = newState.retirement.accounts
                .filter(acc => acc.isActive && (acc.type === '401k' || acc.type === 'traditional_ira'))
                .reduce((sum, acc) => {
                    const accountIndex = newState.retirement.accounts.findIndex(a => a.id === acc.id);
                    return sum + (newState.retirement.accounts[accountIndex].annualContributions / 12);
                }, 0);
            
            const taxableIncome = adjustedGrossMonthly - preTaxContributions;
            const tax = taxableIncome * TAX_RATE;
            const tuition = newState.career.isStudying ? newState.career.tuitionCost : 0;
            
            // Add passive income from skills (Life Coach)
            const passiveIncome = SkillTreeLogic.getPassiveIncome(newState.skills);
            
            // Roth IRA contributions are after-tax
            const afterTaxContributions = newState.retirement.accounts
                .filter(acc => acc.isActive && acc.type === 'roth_ira')
                .reduce((sum, acc) => {
                    const accountIndex = newState.retirement.accounts.findIndex(a => a.id === acc.id);
                    return sum + (newState.retirement.accounts[accountIndex].annualContributions / 12);
                }, 0);
            
            const monthlyNet = adjustedGrossMonthly - tax - tuition - totalExpenses + passiveIncome - totalRetirementContributions;

            newState.cash += monthlyNet;
            
            // Add event for retirement contributions if any were made
            if (totalRetirementContributions > 0) {
                newState.events.push({
                    month: newState.month,
                    description: 'Retirement Contributions',
                    impact: `Contributed $${totalRetirementContributions.toFixed(0)}${totalEmployerMatch > 0 ? ` + $${totalEmployerMatch.toFixed(0)} employer match` : ''}`
                });
            }
            
            if (productivityMultiplier !== 1.0) {
                newState.events.push({
                    month: newState.month,
                    description: productivityMultiplier > 1 ? 'High Morale Bonus' : 'Low Morale Penalty',
                    impact: `Productivity: ${(productivityMultiplier * 100).toFixed(0)}% (Happiness: ${newState.player.happiness})`
                });
            }

            newState.events.push({
                month: newState.month,
                description: 'Financial Summary',
                impact: `Income: +$${(adjustedGrossMonthly - tax - totalRetirementContributions).toFixed(0)} | Exp: -$${(totalExpenses + tuition).toFixed(0)} | Net: ${monthlyNet >= 0 ? '+' : ''}$${monthlyNet.toFixed(0)}`
            });

            // Age 21 Move Out Check - Force to Frugal if still with parents
            if (newState.player.age >= 21 && newState.lifestyle.tier === 'Parents') {
                newState.lifestyle.tier = 'Frugal';
                newState.lifestyle.rent = LIFESTYLE_TIERS.Frugal.rent;
                newState.lifestyle.food = LIFESTYLE_TIERS.Frugal.food;
                newState.lifestyle.transport = LIFESTYLE_TIERS.Frugal.transport;
                newState.lifestyle.entertainment = LIFESTYLE_TIERS.Frugal.entertainment;
                newState.events.push({
                    month: newState.month,
                    description: 'FORCED TO MOVE OUT',
                    impact: `You turned 21. Parents kicked you out. Auto-assigned Frugal lifestyle.`
                });
            }

            // Homeless / Bankruptcy check
            if (newState.cash < 0) {
                newState.lifestyle.monthsMissedRent++;
                if (newState.lifestyle.monthsMissedRent >= 2) {
                    newState.lifestyle.tier = 'Homeless';
                    newState.lifestyle.rent = 0;
                    newState.lifestyle.food = 50; // Scraps
                    newState.lifestyle.transport = 0;
                    newState.lifestyle.entertainment = 0;
                    newState.lifestyle.monthsHomeless++;
                    newState.events.push({
                        month: newState.month,
                        description: 'EVICTION NOTICE',
                        impact: `You have been evicted for missing rent.`
                    });
                }
            } else {
                newState.lifestyle.monthsMissedRent = 0; // Reset if cash positive
            }

            if (newState.lifestyle.monthsHomeless >= 2 && newState.cash < 0) {
                newState.gameOver = true;
                newState.gameOverReason = "You have been homeless and broke for too long. Game Over.";
            }
            
            // Retirement check (age 65)
            if (newState.player.age >= 65) {
                newState.gameOver = true;
                const retirementScore = this.calculateRetirementScore(newState);
                newState.gameOverReason = `Retirement at age 65! Final Net Worth: $${newState.netWorth.toFixed(0)}. Retirement Score: ${retirementScore}/100`;
            }

            // Level up logic...
            if (newState.cash >= newState.career.savingsGoal) {
                newState.events.push({
                    month: newState.month,
                    description: 'CAPITAL GOAL MET',
                    impact: `You have saved $${newState.career.savingsGoal}. You can now START BUSINESS.`
                });
            }

        } else {
            // ... Level 2: BUSINESS & INVESTMENTS ...
            // Log market change
            const marketChange = ((newState.market.stockMarketIndex - oldMarketIndex) / oldMarketIndex) * 100;
            newState.events.push({
                month: newState.month,
                description: `Market ${marketChange > 0 ? 'Rose' : 'Fell'}`,
                impact: `Index: ${newState.market.stockMarketIndex.toFixed(2)} (${marketChange.toFixed(2)}%)`
            });

            // Business Phase
            newState.business = BusinessLogic.processMonth(newState.business, newState.market);
            
            // Apply skill bonuses to business
            const demandSkillBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'demand');
            const expenseSkillBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'business_expenses');
            const profitSkillBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'business_profit');
            
            // Apply bonuses
            if (demandSkillBonus !== 0) {
                newState.business.demand *= (1 + demandSkillBonus);
            }
            
            const adjustedExpenses = newState.business.expensesTotal * (1 + expenseSkillBonus); // expenseSkillBonus is negative for reduction
            const adjustedRevenue = newState.business.revenue * (1 + profitSkillBonus);
            
            const monthlyProfit = adjustedRevenue - adjustedExpenses;
            
            // Add passive income from skills
            const passiveIncome = SkillTreeLogic.getPassiveIncome(newState.skills);
            
            newState.cash += monthlyProfit + passiveIncome;
            
            // Random business events (20% chance per month)
            if (Math.random() < 0.2) {
                const businessEvents = [
                    { desc: 'Major Client Signed', impact: 'Revenue boost this month', effect: () => { newState.cash += 5000; } },
                    { desc: 'Equipment Breakdown', impact: 'Unexpected repair costs', effect: () => { newState.cash -= 2000; } },
                    { desc: 'Viral Marketing Success', impact: 'Demand surge', effect: () => { newState.business.demand *= 1.15; } },
                    { desc: 'Employee Quit', impact: 'Productivity temporarily reduced', effect: () => { newState.business.capacity *= 0.9; } },
                    { desc: 'Tax Audit (Clean)', impact: 'No issues found, reputation improved', effect: () => { newState.creditScore += 10; } },
                    { desc: 'Supplier Discount', impact: 'Lower costs this month', effect: () => { newState.cash += 1500; } },
                    { desc: 'Competitor Opened Nearby', impact: 'Demand decreased', effect: () => { newState.business.demand *= 0.85; } },
                    { desc: 'Industry Award', impact: 'Brand recognition increased', effect: () => { newState.business.demand *= 1.1; } },
                ];
                
                const event = businessEvents[Math.floor(Math.random() * businessEvents.length)];
                event.effect();
                newState.events.push({
                    month: newState.month,
                    description: `Business Event: ${event.desc}`,
                    impact: event.impact
                });
            }

            // Deduct Lifestyle cost in Level 2 as well
            newState.cash -= totalExpenses;
            
            // Bankruptcy check for Business level
            if (newState.cash < -50000) {
                newState.gameOver = true;
                newState.gameOverReason = "Your business has accumulated too much debt. Bankruptcy declared.";
            }

            newState.events.push({
                month: newState.month,
                description: 'Business Operation Result',
                impact: `Profit: $${monthlyProfit.toFixed(2)} | Living Exp: -$${totalExpenses}`
            });
            // ...
            // Investment Phase
            const oldPortfolio = { ...newState.portfolio };
            newState.portfolio = InvestmentLogic.processMonth(newState.portfolio, newState.market, oldMarketIndex);
            
            // Apply investment skill bonuses
            const investmentReturnBonus = SkillTreeLogic.getSkillBonus(newState.skills, 'investment_returns');
            if (investmentReturnBonus !== 0) {
                // Calculate the gains/losses from this month
                const stockGain = newState.portfolio.stocksValue - oldPortfolio.stocksValue;
                const bondGain = newState.portfolio.bondsValue - oldPortfolio.bondsValue;
                const realEstateGain = newState.portfolio.realEstateValue - oldPortfolio.realEstateValue;
                
                // Apply bonus to gains (or reduce losses)
                newState.portfolio.stocksValue += stockGain * investmentReturnBonus;
                newState.portfolio.bondsValue += bondGain * investmentReturnBonus;
                newState.portfolio.realEstateValue += realEstateGain * investmentReturnBonus;
            }

            const investmentIncome = newState.portfolio.cash;
            newState.cash += investmentIncome;
            newState.portfolio.cash = 0; // Reset accumulation

            if (investmentIncome > 0) {
                newState.events.push({
                    month: newState.month,
                    description: 'Investment Income',
                    impact: `Received $${investmentIncome.toFixed(2)}`
                });
            }
            
            // Apply inflation to expenses (annual adjustment)
            if (newState.month % 12 === 0 && newState.month > 1) {
                const inflationRate = newState.market.inflationRate;
                
                // Increase lifestyle costs
                newState.lifestyle.rent = Math.round(newState.lifestyle.rent * (1 + inflationRate));
                newState.lifestyle.food = Math.round(newState.lifestyle.food * (1 + inflationRate));
                newState.lifestyle.transport = Math.round(newState.lifestyle.transport * (1 + inflationRate));
                newState.lifestyle.entertainment = Math.round(newState.lifestyle.entertainment * (1 + inflationRate));
                
                newState.events.push({
                    month: newState.month,
                    description: 'Annual Inflation Adjustment',
                    impact: `Living costs increased by ${(inflationRate * 100).toFixed(1)}%`
                });
            }
        }

        // Net Worth (Universal) — includes business value estimate, retirement accounts, minus debt
        const businessValue = newState.level !== 'Career'
            ? Math.max(0, (newState.business.revenue - newState.business.expensesTotal) * 12 * 3) // ~3x annual profit
            : 0;
        const totalDebt = newState.loans.reduce((sum, loan) => sum + loan.balance, 0);
        const totalRetirementBalance = newState.retirement.accounts.reduce((sum, account) => sum + account.balance, 0);
        
        newState.netWorth = newState.cash +
            newState.portfolio.stocksValue +
            newState.portfolio.bondsValue +
            newState.portfolio.realEstateValue +
            totalRetirementBalance +
            businessValue -
            totalDebt;
        
        // Track net worth history
        newState.netWorthHistory.push({
            month: newState.month,
            value: newState.netWorth
        });

        // Check for new achievements
        const newAchievements = checkAchievements(newState, newState.achievements);
        const unlockedThisTurn = newAchievements.filter(a => 
            a.unlocked && a.unlockedAt === newState.month && 
            !newState.achievements.find(old => old.id === a.id && old.unlocked)
        );
        
        if (unlockedThisTurn.length > 0) {
            unlockedThisTurn.forEach(achievement => {
                newState.events.push({
                    month: newState.month,
                    description: `🏆 Achievement Unlocked: ${achievement.title}`,
                    impact: achievement.description
                });
            });
        }
        
        newState.achievements = newAchievements;
        
        // Award skill points based on milestones
        const oldAchievementCount = currentState.achievements.filter(a => a.unlocked).length;
        const newAchievementCount = newState.achievements.filter(a => a.unlocked).length;
        const skillPointsEarned = SkillTreeLogic.awardSkillPoints(newState.month, newAchievementCount);
        
        if (skillPointsEarned > 0) {
            newState.skills.skillPoints += skillPointsEarned;
            newState.events.push({
                month: newState.month,
                description: `⭐ Skill Point Earned!`,
                impact: `You earned ${skillPointsEarned} skill point(s). Total: ${newState.skills.skillPoints}`
            });
        }
        
        // Update credit score
        newState.creditScore = LoanLogic.calculateCreditScore(newState);
        
        // Check challenge completion
        if (newState.activeChallenge) {
            const challenge = CHALLENGES.find(c => c.id === newState.activeChallenge);
            if (challenge && ChallengeMode.checkChallengeCompletion(challenge, newState)) {
                newState.events.push({
                    month: newState.month,
                    description: `🏆 CHALLENGE COMPLETED: ${challenge.name}!`,
                    impact: `Earned ${challenge.rewards.skillPointBonus} bonus skill points!`
                });
                newState.skills.skillPoints += challenge.rewards.skillPointBonus;
                // Don't clear challenge - let player continue with restrictions if they want
            }
        }
        
        // Check scenario completion
        if (newState.activeScenario) {
            const scenario = SCENARIOS.find((s: any) => s.id === newState.activeScenario);
            if (scenario) {
                const completion = ScenarioMode.checkScenarioCompletion(scenario, newState);
                if (completion.completed) {
                    newState.events.push({
                        month: newState.month,
                        description: `🎉 SCENARIO COMPLETED: ${scenario.name}!`,
                        impact: scenario.goal.description
                    });
                    newState.gameOver = true;
                    newState.gameOverReason = `Victory! ${scenario.goal.description}`;
                } else if (completion.reason) {
                    // Scenario failed
                    newState.gameOver = true;
                    newState.gameOverReason = completion.reason;
                }
            }
        }

        return newState;
    }

    static calculateRetirementScore(state: GameState): number {
        let score = 0;
        
        // Calculate total retirement savings
        const totalRetirementBalance = state.retirement.accounts.reduce((sum, account) => sum + account.balance, 0);
        
        // Net worth (max 35 points - reduced to make room for enhanced retirement scoring)
        if (state.netWorth >= 5000000) score += 35;
        else if (state.netWorth >= 2000000) score += 30;
        else if (state.netWorth >= 1000000) score += 25;
        else if (state.netWorth >= 500000) score += 20;
        else if (state.netWorth >= 250000) score += 15;
        else if (state.netWorth >= 100000) score += 12;
        else if (state.netWorth >= 50000) score += 8;
        else if (state.netWorth >= 10000) score += 4;
        
        // Retirement account balance (max 20 points - increased from 15)
        // Rewards substantial retirement savings
        if (totalRetirementBalance >= 2000000) score += 20;
        else if (totalRetirementBalance >= 1000000) score += 18;
        else if (totalRetirementBalance >= 500000) score += 15;
        else if (totalRetirementBalance >= 250000) score += 12;
        else if (totalRetirementBalance >= 100000) score += 9;
        else if (totalRetirementBalance >= 50000) score += 6;
        else if (totalRetirementBalance >= 10000) score += 3;
        
        // Retirement readiness bonus (max 10 points)
        // Considers retirement savings as percentage of net worth
        if (state.netWorth > 0) {
            const retirementPercentage = (totalRetirementBalance / state.netWorth) * 100;
            if (retirementPercentage >= 50) score += 10; // Excellent retirement planning
            else if (retirementPercentage >= 30) score += 7; // Good retirement planning
            else if (retirementPercentage >= 15) score += 4; // Moderate retirement planning
            else if (retirementPercentage >= 5) score += 2; // Some retirement planning
        }
        
        // Education (max 10 points)
        if (state.career.educationLevel === 'Master') score += 10;
        else if (state.career.educationLevel === 'Bachelor') score += 7;
        else if (state.career.educationLevel === 'Associate') score += 4;
        
        // Business success (max 10 points - reduced from 15)
        if (state.level === 'Business') {
            const monthlyProfit = state.business.revenue - state.business.expensesTotal;
            if (monthlyProfit >= 50000) score += 10;
            else if (monthlyProfit >= 20000) score += 7;
            else if (monthlyProfit >= 10000) score += 4;
        }
        
        // Family (max 5 points - reduced from 10)
        if (state.player.relationshipStatus === 'Married') score += 3;
        if (state.player.children > 0) score += 2;
        
        // Achievements (max 10 points)
        const unlockedCount = state.achievements.filter(a => a.unlocked).length;
        score += Math.min(10, unlockedCount);
        
        // Debt-free bonus (max 10 points)
        if (state.loans.length === 0) score += 10;
        else if (state.loans.length <= 1) score += 5;
        
        return Math.min(100, score);
    }

    static getInitialState(difficulty: 'Easy' | 'Normal' | 'Hard' = 'Normal'): GameState {
        let startingCash = 500;
        let savingsGoal = 10000;
        
        if (difficulty === 'Easy') {
            startingCash = 2000;
            savingsGoal = 7500;
        } else if (difficulty === 'Hard') {
            startingCash = 100;
            savingsGoal = 15000;
        }
        
        return {
            level: 'Career',
            month: 1,
            cash: startingCash,
            netWorth: startingCash,
            difficulty,
            player: {
                age: 17,
                strength: 50,
                energy: 100,
                intelligence: 50,
                wisdom: 10,
                happiness: 100,
                relationshipStatus: 'Single',
                children: 0,
                isPregnant: false,
                pregnancyMonth: 0,
                riskTolerance: 50,
                workEthic: 50,
                socialSkills: 50,
                creativity: 50,
                discipline: 50
            },
            lifestyle: {
                tier: 'Parents',
                rent: LIFESTYLE_TIERS.Parents.rent,
                food: LIFESTYLE_TIERS.Parents.food,
                transport: LIFESTYLE_TIERS.Parents.transport,
                entertainment: LIFESTYLE_TIERS.Parents.entertainment,
                monthsMissedRent: 0,
                monthsHomeless: 0
            },
            career: {
                jobTitle: '',
                salary: 0,
                educationLevel: 'High School',
                tuitionCost: 0,
                studyProgress: 0,
                isStudying: false,
                expensesLiving: 0, // Deprecated in favor of lifestyle
                savingsGoal,
                pendingDecisions: [],
                has401k: false,
                matchPercentage: 0,
                matchLimit: 0,
                vestingYears: 0
            },
            business: {
                type: 'Retail',
                revenue: 0,
                expensesTotal: 0,
                staff: 2,
                prices: 4,
                demand: 2000,
                capacity: 2500,
                inventory: 5000,
                pendingDecisions: [],
                hasSolo401k: false
            },
            portfolio: {
                stocksValue: 0,
                bondsValue: 0,
                realEstateValue: 0,
                cash: 0
            },
            retirement: {
                accounts: [],
                currentYearContributions401k: 0,
                currentYearContributionsIRA: 0,
                lastResetYear: 1 // Start at year 1 (month 1-12)
            },
            market: {
                cycleStage: 'Recovery',
                interestRate: 0.03,
                stockMarketIndex: 1000,
                inflationRate: 0.02
            },
            events: [{
                month: 1,
                description: 'Welcome to Level 1',
                impact: 'Goal: Save $10,000 to start your business.'
            }],
            achievements: [],
            loans: [],
            creditScore: 700,
            skills: {
                unlockedSkills: [],
                skillPoints: 0
            },
            netWorthHistory: [{ month: 1, value: startingCash }],
            activeChallenge: null,
            activeScenario: null,
            gameOver: false,
            gameOverReason: ''
        };
    }
}
