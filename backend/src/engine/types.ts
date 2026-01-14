export interface GameState {
    month: number;
    cash: number;
    netWorth: number;
    business: BusinessState;
    portfolio: PortfolioState;
    market: MarketState;
    events: EventLog[];
}

export interface BusinessState {
    revenue: number;
    expensesTotal: number;
    staff: number;
    prices: number;
    demand: number;
    capacity: number;
    inventory: number;
}

export interface PortfolioState {
    stocksValue: number;
    bondsValue: number;
    realEstateValue: number;
    cash: number; // Investment cash specifically, or just use global cash? Let's use global.
}

export interface MarketState {
    cycleStage: 'Recession' | 'Recovery' | 'Peak' | 'Trough';
    interestRate: number;
    stockMarketIndex: number;
    inflationRate: number;
}

export interface EventLog {
    month: number;
    description: string;
    impact: string;
}
