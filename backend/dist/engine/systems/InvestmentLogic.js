"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentLogic = void 0;
class InvestmentLogic {
    static processMonth(portfolio, market, oldMarketIndex) {
        const newPortfolio = { ...portfolio };
        // 1. Calculate Stock Performance
        // Stocks track the market index exactly (Index Fund)
        const marketPerformance = (market.stockMarketIndex - oldMarketIndex) / oldMarketIndex;
        newPortfolio.stocksValue = newPortfolio.stocksValue * (1 + marketPerformance);
        // 2. Bonds Performance (Fixed Income)
        // Bond price is inversely related to interest rates mostly, but here we treat it as Yield
        const bondYield = market.interestRate;
        const bondIncome = newPortfolio.bondsValue * (bondYield / 12); // Monthly yield
        // Auto-reinvest bond income into cash
        newPortfolio.cash += bondIncome;
        // 3. Real Estate
        // Slow steady growth + rent
        const appreciation = 0.003; // 0.3% per month
        newPortfolio.realEstateValue *= (1 + appreciation);
        // Rent income (5% cap rate)
        const rent = (newPortfolio.realEstateValue * 0.05) / 12;
        newPortfolio.cash += rent;
        return newPortfolio;
    }
}
exports.InvestmentLogic = InvestmentLogic;
