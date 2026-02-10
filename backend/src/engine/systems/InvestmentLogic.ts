import { PortfolioState, MarketState } from '../types';

export class InvestmentLogic {
    static processMonth(portfolio: PortfolioState, market: MarketState, oldMarketIndex: number): PortfolioState {
        const newPortfolio = { ...portfolio };

        // 1. Calculate Stock Performance
        // Stocks track the market index exactly (Index Fund)
        const marketPerformance = (market.stockMarketIndex - oldMarketIndex) / oldMarketIndex;

        newPortfolio.stocksValue = newPortfolio.stocksValue * (1 + marketPerformance);

        // 2. Bonds Performance (Fixed Income) - improved yield
        const bondYield = market.interestRate + 0.01; // Bonds now yield 1% more than base rate
        const bondIncome = newPortfolio.bondsValue * (bondYield / 12); // Monthly yield

        // Auto-reinvest bond income into cash
        newPortfolio.cash += bondIncome;

        // 3. Real Estate
        // Rent income (5% cap rate) - calculated BEFORE appreciation
        const rent = (newPortfolio.realEstateValue * 0.05) / 12;
        newPortfolio.cash += rent;

        // Appreciation with inflation adjustment
        const appreciation = 0.002 + (market.inflationRate / 12); // 2.4% base + inflation
        newPortfolio.realEstateValue *= (1 + appreciation);
        
        // Property tax (1% annually)
        const propertyTax = (newPortfolio.realEstateValue * 0.01) / 12;
        newPortfolio.cash -= propertyTax;

        return newPortfolio;
    }
}
