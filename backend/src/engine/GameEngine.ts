import { GameState, BusinessState, MarketState, PortfolioState } from './types';
import { BusinessLogic } from './systems/BusinessLogic';
import { MarketLogic } from './systems/MarketLogic';
import { InvestmentLogic } from './systems/InvestmentLogic';

export class GameEngine {
    static processTurn(currentState: GameState): GameState {
        const newState = { ...currentState };
        newState.month += 1;
        newState.events = []; // Clear old events

        // 1. Market Phase
        const oldMarketIndex = newState.market.stockMarketIndex;
        newState.market = MarketLogic.processMonth(newState.market);

        // Log market change
        const marketChange = ((newState.market.stockMarketIndex - oldMarketIndex) / oldMarketIndex) * 100;
        newState.events.push({
            month: newState.month,
            description: `Market ${marketChange > 0 ? 'Rose' : 'Fell'}`,
            impact: `Index: ${newState.market.stockMarketIndex.toFixed(2)} (${marketChange.toFixed(2)}%)`
        });

        // 2. Business Phase
        newState.business = BusinessLogic.processMonth(newState.business, newState.market);

        const monthlyProfit = newState.business.revenue - newState.business.expensesTotal;
        newState.cash += monthlyProfit;

        newState.events.push({
            month: newState.month,
            description: 'Business Operation Result',
            impact: `Profit: $${monthlyProfit.toFixed(2)}`
        });

        // 3. Investment Phase
        newState.portfolio = InvestmentLogic.processMonth(newState.portfolio, newState.market, oldMarketIndex);

        // Add investment cash (dividends/rent) to main cash pile? Or keep separate?
        // Design said "Investment Income > Expenses". So let's flow it to main cash.
        const investmentIncome = newState.portfolio.cash;
        newState.cash += investmentIncome;
        newState.portfolio.cash = 0; // Reset accumulation for next month

        if (investmentIncome > 0) {
            newState.events.push({
                month: newState.month,
                description: 'Investment Income',
                impact: `Received $${investmentIncome.toFixed(2)}`
            });
        }

        // 4. Net Worth Calc
        newState.netWorth = newState.cash +
            newState.portfolio.stocksValue +
            newState.portfolio.bondsValue +
            newState.portfolio.realEstateValue;

        return newState;
    }

    static getInitialState(): GameState {
        return {
            month: 1,
            cash: 20000, // Seed money
            netWorth: 20000,
            business: {
                revenue: 0,
                expensesTotal: 0,
                staff: 2,
                prices: 4, // $4 coffee
                demand: 2000, // 2000 cups/month (~66/day)
                capacity: 2500,
                inventory: 5000
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
            events: []
        };
    }
}
