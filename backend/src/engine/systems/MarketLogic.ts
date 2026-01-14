import { MarketState } from '../types';

export class MarketLogic {
    static processMonth(state: MarketState): MarketState {
        const newState = { ...state };

        // 1. Cycle Progression
        // Simple random chance to switch cycles
        const roll = Math.random();

        // 5% chance to change state
        if (roll < 0.05) {
            switch (state.cycleStage) {
                case 'Recovery': newState.cycleStage = 'Peak'; break;
                case 'Peak': newState.cycleStage = 'Recession'; break;
                case 'Recession': newState.cycleStage = 'Trough'; break;
                case 'Trough': newState.cycleStage = 'Recovery'; break;
            }
        }

        // 2. Interest Rate Adjustments
        // Central bank reacts to cycles
        if (newState.cycleStage === 'Peak') {
            newState.interestRate += 0.0025; // Hike rates to cool down
        } else if (newState.cycleStage === 'Recession') {
            newState.interestRate = Math.max(0.01, newState.interestRate - 0.005); // Cut rates
        }

        // 3. Stock Market Movement
        // High rates = lower stock prices
        let marketMove = 0;
        if (newState.cycleStage === 'Recovery') marketMove = 0.02 + (Math.random() * 0.03);
        if (newState.cycleStage === 'Peak') marketMove = 0.01 + (Math.random() * 0.01);
        if (newState.cycleStage === 'Recession') marketMove = -0.05 - (Math.random() * 0.05);
        if (newState.cycleStage === 'Trough') marketMove = (Math.random() * 0.02) - 0.01;

        // Interest rate gravity
        if (newState.interestRate > 0.05) marketMove -= 0.01;

        newState.stockMarketIndex = newState.stockMarketIndex * (1 + marketMove);

        // 4. Inflation
        if (newState.cycleStage === 'Peak') newState.inflationRate = 0.05;
        else newState.inflationRate = 0.02;

        return newState;
    }
}
