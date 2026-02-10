export type GameLevel = 'Career' | 'Business' | 'Investor';

export type RetirementAccountType = '401k' | 'traditional_ira' | 'roth_ira' | 'solo_401k';

export interface VestingSchedule {
    totalYears: number;
    vestedPercentage: number; // 0-100
}

export interface RetirementAccount {
    id: string;
    type: RetirementAccountType;
    balance: number;
    contributionRate: number; // percentage of gross income (0-100)
    employerMatch: number; // employer match percentage (e.g., 50 means 50% match)
    employerMatchLimit: number; // max percentage of salary that gets matched (e.g., 6)
    vestingSchedule: VestingSchedule;
    annualContributions: number; // tracks contributions in current calendar year
    accountAge: number; // in months
    unvestedBalance: number; // employer contributions not yet vested
    isActive: boolean; // false if player changed jobs
}

export interface RetirementState {
    accounts: RetirementAccount[];
    currentYearContributions401k: number;
    currentYearContributionsIRA: number;
    lastResetYear: number; // track when we last reset annual contributions
}

export interface CareerState {
    jobTitle: string;
    salary: number; // Yearly
    educationLevel: 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'PhD';
    tuitionCost: number; // Monthly cost if studying
    studyProgress: number; // Months studied
    isStudying: boolean;
    expensesLiving: number; // Base living expenses
    savingsGoal: number; // E.g., 10000 to unlock Business
    pendingDecisions: GameDecision[];
    has401k: boolean; // Whether current job offers 401(k)
    matchPercentage: number; // Employer match percentage (e.g., 50 means 50% match)
    matchLimit: number; // Max percentage of salary that gets matched (e.g., 6)
    vestingYears: number; // Years until full vesting (0 for immediate)
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
    // Personality traits (0-100)
    riskTolerance: number;
    workEthic: number;
    socialSkills: number;
    creativity: number;
    discipline: number;
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
    netWorthHistory: NetWorthDataPoint[];
    difficulty: 'Easy' | 'Normal' | 'Hard';
    player: PlayerStats;
    lifestyle: Lifestyle;
    career: CareerState; // Level 1 specific
    business: BusinessState;
    portfolio: PortfolioState;
    retirement: RetirementState;
    market: MarketState;
    events: EventLog[];
    achievements: Achievement[];
    loans: Loan[];
    creditScore: number;
    skills: PlayerSkills;
    activeChallenge: string | null;
    activeScenario: string | null;
    gameOver: boolean;
    gameOverReason?: string;
}

export interface NetWorthDataPoint {
    month: number;
    value: number;
}

export interface PlayerSkills {
    unlockedSkills: string[];
    skillPoints: number;
}

export interface Loan {
    id: string;
    type: 'student' | 'business' | 'mortgage';
    principal: number;
    balance: number;
    interestRate: number;
    monthlyPayment: number;
    remainingMonths: number;
    originationMonth: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
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
    hasSolo401k: boolean; // Whether business owner has set up Solo 401(k)
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
