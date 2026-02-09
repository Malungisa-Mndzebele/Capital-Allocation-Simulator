"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const BusinessLogic_1 = require("./systems/BusinessLogic");
const MarketLogic_1 = require("./systems/MarketLogic");
const InvestmentLogic_1 = require("./systems/InvestmentLogic");
const CareerLogic_1 = require("./systems/CareerLogic");
const LoanLogic_1 = require("./systems/LoanLogic");
const PersonalityLogic_1 = require("./systems/PersonalityLogic");
const SkillTreeLogic_1 = require("./systems/SkillTreeLogic");
const config_1 = require("./config");
const achievements_1 = require("./achievements");
class GameEngine {
    static processTurn(currentState) {
        // Deep copy to avoid mutation of original state
        const newState = JSON.parse(JSON.stringify(currentState));
        newState.month += 1;
        newState.events = []; // Clear old events
        // Update Age (17yo start + months/12). 
        // Logic: Month 1-12 = 17. Month 13 = 18.
        newState.player.age = 17 + Math.floor((newState.month - 1) / 12);
        // 1. Market Phase (Always Active for Macro Context)
        const oldMarketIndex = newState.market.stockMarketIndex;
        newState.market = MarketLogic_1.MarketLogic.processMonth(newState.market);
        // 2. Lifestyle Cost Calculation
        const relationshipCost = config_1.RELATIONSHIP_COSTS[newState.player.relationshipStatus] ?? 0;
        const childCost = newState.player.children * config_1.CHILD_COST_PER_MONTH;
        // Process loan payments
        const loanResult = LoanLogic_1.LoanLogic.processMonthlyPayments(newState.loans);
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
        const totalExpenses = newState.lifestyle.rent +
            newState.lifestyle.food +
            newState.lifestyle.transport +
            newState.lifestyle.entertainment +
            relationshipCost +
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
            newState.career = CareerLogic_1.CareerLogic.processMonth(newState.career, {
                intelligence: newState.player.intelligence,
                wisdom: newState.player.wisdom,
                strength: newState.player.strength
            });
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
            }
            else if (newState.career.jobTitle === 'Warehouse') {
                newState.player.strength = Math.min(100, newState.player.strength + 0.5);
                newState.player.energy = Math.max(0, newState.player.energy - 3);
            }
            else if (newState.career.jobTitle === 'Sales') {
                newState.player.wisdom = Math.min(100, newState.player.wisdom + 0.3);
                newState.player.energy = Math.max(0, newState.player.energy - 3);
            }
            if (newState.career.isStudying) {
                newState.player.intelligence = Math.min(100, newState.player.intelligence + 0.5);
                newState.player.energy = Math.max(0, newState.player.energy - 1);
            }
            // Energy recovery
            let recovery = 2;
            if (newState.lifestyle.tier === 'Parents')
                recovery = 3;
            if (newState.lifestyle.tier === 'Luxury')
                recovery = 5;
            if (newState.lifestyle.tier === 'Homeless')
                recovery = -2; // Draining
            newState.player.energy = Math.min(100, Math.max(0, newState.player.energy + recovery));
            // Check for Promotion
            if (newState.career.jobTitle !== oldCareer.jobTitle) {
                newState.events.push({
                    month: newState.month,
                    description: `PROMOTION!`,
                    impact: `Promoted to ${newState.career.jobTitle}. Salary: $${newState.career.salary}/yr`
                });
            }
            // Calculate Income with happiness productivity modifier
            const grossMonthly = newState.career.salary / 12;
            // Happiness affects productivity: 0-30 = 70%, 31-70 = 100%, 71-100 = 110%
            let productivityMultiplier = 1.0;
            if (newState.player.happiness <= 30)
                productivityMultiplier = 0.7;
            else if (newState.player.happiness >= 71)
                productivityMultiplier = 1.1;
            // Difficulty modifier
            if (newState.difficulty === 'Easy')
                productivityMultiplier *= 1.2;
            else if (newState.difficulty === 'Hard')
                productivityMultiplier *= 0.8;
            // Work ethic bonus
            const workEthicBonus = PersonalityLogic_1.PersonalityLogic.getPersonalityBonus(newState.player, 'promotion_chance');
            productivityMultiplier *= (1 + workEthicBonus);
            const effectiveIncome = grossMonthly * productivityMultiplier;
            const tax = effectiveIncome * config_1.TAX_RATE;
            const tuition = newState.career.isStudying ? newState.career.tuitionCost : 0;
            const monthlyNet = effectiveIncome - tax - tuition - totalExpenses;
            newState.cash += monthlyNet;
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
                impact: `Income: +$${(grossMonthly - tax).toFixed(0)} | Exp: -$${(totalExpenses + tuition).toFixed(0)} | Net: ${monthlyNet >= 0 ? '+' : ''}$${monthlyNet.toFixed(0)}`
            });
            // Age 21 Move Out Check - Force to Frugal if still with parents
            if (newState.player.age >= 21 && newState.lifestyle.tier === 'Parents') {
                newState.lifestyle.tier = 'Frugal';
                newState.lifestyle.rent = config_1.LIFESTYLE_TIERS.Frugal.rent;
                newState.lifestyle.food = config_1.LIFESTYLE_TIERS.Frugal.food;
                newState.lifestyle.transport = config_1.LIFESTYLE_TIERS.Frugal.transport;
                newState.lifestyle.entertainment = config_1.LIFESTYLE_TIERS.Frugal.entertainment;
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
            }
            else {
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
        }
        else {
            // ... Level 2: BUSINESS & INVESTMENTS ...
            // Log market change
            const marketChange = ((newState.market.stockMarketIndex - oldMarketIndex) / oldMarketIndex) * 100;
            newState.events.push({
                month: newState.month,
                description: `Market ${marketChange > 0 ? 'Rose' : 'Fell'}`,
                impact: `Index: ${newState.market.stockMarketIndex.toFixed(2)} (${marketChange.toFixed(2)}%)`
            });
            // Business Phase
            newState.business = BusinessLogic_1.BusinessLogic.processMonth(newState.business, newState.market);
            const monthlyProfit = newState.business.revenue - newState.business.expensesTotal;
            newState.cash += monthlyProfit;
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
            newState.portfolio = InvestmentLogic_1.InvestmentLogic.processMonth(newState.portfolio, newState.market, oldMarketIndex, newState.month);
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
        // Net Worth (Universal) — includes business value estimate
        const businessValue = newState.level !== 'Career'
            ? Math.max(0, (newState.business.revenue - newState.business.expensesTotal) * 12 * 3) // ~3x annual profit
            : 0;
        newState.netWorth = newState.cash +
            newState.portfolio.stocksValue +
            newState.portfolio.bondsValue +
            newState.portfolio.realEstateValue +
            businessValue;
        // Check for new achievements
        const newAchievements = (0, achievements_1.checkAchievements)(newState, newState.achievements);
        const unlockedThisTurn = newAchievements.filter(a => a.unlocked && a.unlockedAt === newState.month &&
            !newState.achievements.find(old => old.id === a.id && old.unlocked));
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
        const skillPointsEarned = SkillTreeLogic_1.SkillTreeLogic.awardSkillPoints(newState.month, newAchievementCount);
        if (skillPointsEarned > 0) {
            newState.skills.skillPoints += skillPointsEarned;
            newState.events.push({
                month: newState.month,
                description: `⭐ Skill Point Earned!`,
                impact: `You earned ${skillPointsEarned} skill point(s). Total: ${newState.skills.skillPoints}`
            });
        }
        // Update credit score
        newState.creditScore = LoanLogic_1.LoanLogic.calculateCreditScore(newState);
        return newState;
    }
    static calculateRetirementScore(state) {
        let score = 0;
        // Net worth (max 40 points)
        if (state.netWorth >= 5000000)
            score += 40;
        else if (state.netWorth >= 2000000)
            score += 35;
        else if (state.netWorth >= 1000000)
            score += 30;
        else if (state.netWorth >= 500000)
            score += 25;
        else if (state.netWorth >= 250000)
            score += 20;
        else if (state.netWorth >= 100000)
            score += 15;
        else if (state.netWorth >= 50000)
            score += 10;
        else if (state.netWorth >= 10000)
            score += 5;
        // Education (max 15 points)
        if (state.career.educationLevel === 'Master')
            score += 15;
        else if (state.career.educationLevel === 'Bachelor')
            score += 10;
        else if (state.career.educationLevel === 'Associate')
            score += 5;
        // Business success (max 15 points)
        if (state.level === 'Business') {
            const monthlyProfit = state.business.revenue - state.business.expensesTotal;
            if (monthlyProfit >= 50000)
                score += 15;
            else if (monthlyProfit >= 20000)
                score += 10;
            else if (monthlyProfit >= 10000)
                score += 5;
        }
        // Family (max 10 points)
        if (state.player.relationshipStatus === 'Married')
            score += 5;
        if (state.player.children > 0)
            score += 5;
        // Achievements (max 10 points)
        const unlockedCount = state.achievements.filter(a => a.unlocked).length;
        score += Math.min(10, unlockedCount);
        // Debt-free bonus (max 10 points)
        if (state.loans.length === 0)
            score += 10;
        else if (state.loans.length <= 1)
            score += 5;
        return Math.min(100, score);
    }
    static getInitialState(difficulty = 'Normal') {
        let startingCash = 500;
        let savingsGoal = 10000;
        if (difficulty === 'Easy') {
            startingCash = 2000;
            savingsGoal = 7500;
        }
        else if (difficulty === 'Hard') {
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
                rent: config_1.LIFESTYLE_TIERS.Parents.rent,
                food: config_1.LIFESTYLE_TIERS.Parents.food,
                transport: config_1.LIFESTYLE_TIERS.Parents.transport,
                entertainment: config_1.LIFESTYLE_TIERS.Parents.entertainment,
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
                pendingDecisions: []
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
                pendingDecisions: []
            },
            portfolio: {
                stocksValue: 0,
                bondsValue: 0,
                realEstateValue: 0,
                cash: 0
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
            gameOver: false,
            gameOverReason: ''
        };
    }
}
exports.GameEngine = GameEngine;
