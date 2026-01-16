"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const BusinessLogic_1 = require("./systems/BusinessLogic");
const MarketLogic_1 = require("./systems/MarketLogic");
const InvestmentLogic_1 = require("./systems/InvestmentLogic");
const CareerLogic_1 = require("./systems/CareerLogic");
class GameEngine {
    static processTurn(currentState) {
        const newState = { ...currentState };
        newState.month += 1;
        newState.events = []; // Clear old events
        // Update Age (17yo start + months/12). 
        // Logic: Month 1-12 = 17. Month 13 = 18.
        newState.player.age = 17 + Math.floor((newState.month - 1) / 12);
        // 1. Market Phase (Always Active for Macro Context)
        const oldMarketIndex = newState.market.stockMarketIndex;
        newState.market = MarketLogic_1.MarketLogic.processMonth(newState.market);
        // 2. Lifestyle Cost Calculation
        // Relationship Costs
        let relationshipCost = 0;
        if (newState.player.relationshipStatus === 'Dating')
            relationshipCost = 200; // Dates, gifts
        if (newState.player.relationshipStatus === 'Married')
            relationshipCost = 800; // Shared life (though maybe income sharing later?)
        // Child Costs
        const childCost = newState.player.children * 600; // Diapers, food, school
        const totalExpenses = newState.lifestyle.rent +
            newState.lifestyle.food +
            newState.lifestyle.transport +
            newState.lifestyle.entertainment +
            relationshipCost +
            childCost;
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
                    impact: "You have a new child. Expenses increased by $600/mo."
                });
                // Happiness boost
                newState.player.happiness = 100;
            }
        }
        // --- LEVEL 1: CAREER & EDUCATION ---
        if (newState.level === 'Career') {
            const oldCareer = newState.career;
            newState.career = CareerLogic_1.CareerLogic.processMonth(newState.career);
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
            newState.player.energy = Math.min(100, newState.player.energy + recovery);
            // Check for Promotion
            if (newState.career.jobTitle !== oldCareer.jobTitle) {
                newState.events.push({
                    month: newState.month,
                    description: `PROMOTION!`,
                    impact: `Promoted to ${newState.career.jobTitle}. Salary: $${newState.career.salary}/yr`
                });
            }
            // Calculate Income
            const grossMonthly = newState.career.salary / 12;
            const tax = grossMonthly * 0.2; // 20% simplified tax
            const tuition = newState.career.isStudying ? newState.career.tuitionCost : 0;
            const monthlyNet = grossMonthly - tax - tuition - totalExpenses;
            newState.cash += monthlyNet;
            newState.events.push({
                month: newState.month,
                description: 'Financial Summary',
                impact: `Income: +$${(grossMonthly - tax).toFixed(0)} | Exp: -$${(totalExpenses + tuition).toFixed(0)} | Net: ${monthlyNet >= 0 ? '+' : ''}$${monthlyNet.toFixed(0)}`
            });
            // Age 21 Move Out Check
            if (newState.player.age >= 21 && newState.lifestyle.tier === 'Parents') {
                newState.events.push({
                    month: newState.month,
                    description: 'TIME TO MOVE OUT',
                    impact: `You turned 21. Parents are kicking you out. Choose a lifestyle.`
                });
            }
            // Homeless / Bankruptcy check
            if (newState.cash < 0) {
                newState.lifestyle.monthsMissedRent++;
                if (newState.lifestyle.monthsMissedRent >= 2) {
                    newState.lifestyle.tier = 'Homeless';
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
            // ... Level 2 ...
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
            // Deduct Lifestyle cost in Level 2 as well
            newState.cash -= totalExpenses;
            newState.events.push({
                month: newState.month,
                description: 'Business Operation Result',
                impact: `Profit: $${monthlyProfit.toFixed(2)} | Living Exp: -$${totalExpenses}`
            });
            // ...
            // Investment Phase
            newState.portfolio = InvestmentLogic_1.InvestmentLogic.processMonth(newState.portfolio, newState.market, oldMarketIndex);
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
        }
        // Net Worth (Universal)
        newState.netWorth = newState.cash +
            newState.portfolio.stocksValue +
            newState.portfolio.bondsValue +
            newState.portfolio.realEstateValue;
        return newState;
    }
    static getInitialState() {
        return {
            level: 'Career',
            month: 1,
            cash: 2000, // Starting capital
            netWorth: 2000,
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
                pregnancyMonth: 0
            },
            lifestyle: {
                tier: 'Parents',
                rent: 0,
                food: 200, // Mom makes food sometimes, but you buy snacks
                transport: 100, // Bus pass
                entertainment: 50,
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
                savingsGoal: 10000,
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
            gameOver: false,
            gameOverReason: ''
        };
    }
}
exports.GameEngine = GameEngine;
