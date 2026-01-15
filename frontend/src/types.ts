export type GameLevel = 'Career' | 'Business' | 'Investor';

export interface CareerState {
    jobTitle: string;
    salary: number; // Yearly
    educationLevel: 'High School' | 'Associate' | 'Bachelor' | 'Master';
    tuitionCost: number; // Monthly cost if studying
    studyProgress: number; // Months studied
    isStudying: boolean;
    expensesLiving: number; // Base living expenses
    savingsGoal: number; // E.g., 10000 to unlock Business
    pendingDecisions: GameDecision[];
}

export interface PlayerStats {
    age: number;
    strength: number;
    energy: number;
    intelligence: number;
    wisdom: number;
    happiness: number;
    relationshipStatus: 'Single' | 'Dating' | 'Married';
    children: number;
    isPregnant: boolean;
    pregnancyMonth: number;
}

export interface Lifestyle {
    tier: 'Parents' | 'Homeless' | 'Frugal' | 'Moderate' | 'Luxury';
    rent: number;
    food: number;
    transport: number;
    entertainment: number;
    monthsMissedRent: number;
    monthsHomeless: number;
}

export interface GameState {
    level: GameLevel; // Current Stage
    month: number;
    cash: number;
    netWorth: number;
    player: PlayerStats;
    lifestyle: Lifestyle;
    career: CareerState; // Level 1 specific
    business: BusinessState;
    portfolio: PortfolioState;
    market: MarketState;
    events: EventLog[];
    gameOver: boolean;
    gameOverReason?: string;
}

export type BusinessType = 'Retail' | 'Tech' | 'Service';

export interface GameDecision {
    id: string;
    title: string;
    description: string;
    options: {
        id: string;
        label: string;
        cost: number;
        effect: string;
    }[];
    resolved: boolean;
}

export interface BusinessState {
    type: BusinessType;
    revenue: number;
    expensesTotal: number;
    staff: number;
    prices: number;
    demand: number;
    capacity: number;
    inventory: number;
    pendingDecisions: GameDecision[];
}

export interface PortfolioState {
    stocksValue: number;
    bondsValue: number;
    realEstateValue: number;
    cash: number;
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
