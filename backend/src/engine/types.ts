export type GameLevel = 'Career' | 'Business' | 'Investor';



export interface PlayerStats {
    age: number; // in years, derived from month? or stored? Let's verify. month 1 = 18yo?
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
    business: BusinessState; // Level 2 specific
    portfolio: PortfolioState; // Level 3 specific
    market: MarketState;
    events: EventLog[];
    gameOver: boolean;
    gameOverReason?: string;
}

export type BusinessType = 'Retail' | 'Tech' | 'Service';

// Re-using BusinessDecision structure for now, but generalized
export interface GameDecision {
    id: string;
    title: string;
    description: string;
    options: {
        id: string;
        label: string;
        cost: number; // can be 0
        effect: string; // serialized effect e.g. "energy:-10,fun:+20"
    }[];
    resolved: boolean;
}

export interface CareerState {
    jobTitle: string;
    salary: number;
    educationLevel: 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'PhD';
    tuitionCost: number;
    studyProgress: number; // 0-12 months typically
    isStudying: boolean;
    expensesLiving: number; // Deprecated, see Lifestyle
    savingsGoal: number; // E.g., 10000 to unlock Business
    pendingDecisions: GameDecision[];
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
