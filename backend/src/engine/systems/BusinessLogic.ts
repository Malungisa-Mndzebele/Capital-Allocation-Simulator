import { BusinessState, MarketState } from '../types';

export class BusinessLogic {
    static processMonth(state: BusinessState, market: MarketState): BusinessState {
        const newState = { ...state };

        // 1. Demand Calculation
        // Base demand is modified by Price and Market Cycle
        let demandFactor = 1.0;
        if (market.cycleStage === 'Recession') demandFactor = 0.7;
        if (market.cycleStage === 'Peak') demandFactor = 1.2;

        // Price elasticity
        const priceFactor = 10 / newState.prices; // Simplified: Lower price = higher demand

        const effectiveDemand = newState.demand * demandFactor * priceFactor;

        // 2. Sales Volume (capped by capacity)
        const salesVolume = Math.min(effectiveDemand, newState.capacity);

        // 3. Revenue
        newState.revenue = salesVolume * newState.prices;

        // 4. Expenses
        // Fixed costs + Variable costs (materials, labor)
        const marketingCost = 500; // Hardcoded simplified
        const laborCost = newState.staff * 3000;
        const materialCost = salesVolume * 0.5; // $0.50 per unit (Coffee beans are cheap)

        newState.expensesTotal = laborCost + materialCost + marketingCost + 1000; // +Rent

        // 5. Growth (Simplified: if profitable, demand grows slightly)
        if (newState.revenue > newState.expensesTotal) {
            newState.demand *= 1.02;
        }

        return newState;
    }
}
