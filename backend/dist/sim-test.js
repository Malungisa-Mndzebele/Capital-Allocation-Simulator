"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameEngine_1 = require("./engine/GameEngine");
const runSimulation = () => {
    console.log("Starting Simulation...");
    let state = GameEngine_1.GameEngine.getInitialState();
    // Run for 24 months
    for (let i = 0; i < 24; i++) {
        state = GameEngine_1.GameEngine.processTurn(state);
        console.log(`\n--- Month ${state.month} ---`);
        console.log(`Cycle: ${state.market.cycleStage} | Rates: ${(state.market.interestRate * 100).toFixed(2)}%`);
        console.log(`Business: Rev $${state.business.revenue.toFixed(2)} | Exp $${state.business.expensesTotal.toFixed(2)} | Profit $${(state.business.revenue - state.business.expensesTotal).toFixed(2)}`);
        console.log(`Portfolio: Stocks $${state.portfolio.stocksValue.toFixed(2)} | Cash $${state.cash.toFixed(2)}`);
        console.log(`Net Worth: $${state.netWorth.toFixed(2)}`);
        // Strategy: If cash > 30k, buy stocks
        if (state.cash > 30000) {
            console.log(">>> STRATEGY ACTION: Buying $10k Stocks");
            state.cash -= 10000;
            state.portfolio.stocksValue += 10000;
        }
    }
};
runSimulation();
