// Centralized game constants — single source of truth for balancing

export const SALARIES: Record<string, number> = {
    'Fast Food': 18000,
    'Warehouse': 24000,
    'Sales': 30000,
};

export const TAX_RATE = 0.20;

export const LIFESTYLE_TIERS: Record<string, { rent: number; food: number; transport: number; entertainment: number }> = {
    Parents: { rent: 0, food: 300, transport: 150, entertainment: 100 }, // Increased from 200/100/50
    Frugal: { rent: 800, food: 300, transport: 100, entertainment: 0 },
    Moderate: { rent: 1500, food: 600, transport: 300, entertainment: 200 },
    Luxury: { rent: 3000, food: 1200, transport: 500, entertainment: 1000 },
};

export const RELATIONSHIP_COSTS: Record<string, number> = {
    Single: 0,
    Dating: 200,
    Married: 800,
};

export const CHILD_COST_PER_MONTH = 1200;

export const TUITION_COST = 400;

export const BUSINESS_STARTUP_COST = 10000;

export const BUSINESS_DEFAULTS: Record<string, { inventory: number; capacity: number; prices: number; demand: number }> = {
    Retail: { inventory: 2000, capacity: 2500, prices: 4, demand: 2000 },
    Tech: { inventory: 0, capacity: 10000, prices: 29, demand: 450 }, // Increased from 300 to start closer to breakeven
    Service: { inventory: 0, capacity: 200, prices: 150, demand: 350 }, // Reduced from 500 to add challenge
};

export const VALID_ACTIONS = [
    'RESET', 'UPDATE_LIFESTYLE', 'MAKE_DECISION', 'TOGGLE_STUDY',
    'SELECT_JOB', 'START_BUSINESS', 'BUY_ASSET', 'SELL_ASSET', 'UPDATE_BUSINESS',
    'TAKE_LOAN', 'PAY_LOAN', 'UNLOCK_SKILL', 'START_CHALLENGE', 'START_SCENARIO',
    'OPEN_RETIREMENT_ACCOUNT', 'SET_CONTRIBUTION_RATE', 'WITHDRAW_RETIREMENT',
    'BUY_LUXURY', 'SELL_LUXURY', 'TOGGLE_SUBSCRIPTION',
] as const;

export const VALID_ASSET_TYPES = ['STOCK', 'BOND', 'REAL_ESTATE'] as const;
export const VALID_LIFESTYLE_TIERS = ['Parents', 'Frugal', 'Moderate', 'Luxury'] as const;
export const VALID_JOB_TITLES = ['Fast Food', 'Warehouse', 'Sales'] as const;
export const VALID_BUSINESS_TYPES = ['Retail', 'Tech', 'Service'] as const;

export const VALID_LOAN_TYPES = ['student', 'business', 'mortgage'] as const;

export const MAX_LOAN_AMOUNTS: Record<string, number> = {
    student: 50000,
    business: 100000,
    mortgage: 500000,
};

// Retirement account constants (2024 IRS limits)
export const RETIREMENT_LIMITS = {
    CONTRIBUTION_401K: 23000,
    CONTRIBUTION_IRA: 7000,
    CATCHUP_401K: 7500, // Additional for age 50+
    CATCHUP_IRA: 1000, // Additional for age 50+
    SOLO_401K_EMPLOYER: 46000, // Total limit for Solo 401(k) (employee + employer contributions)
    EARLY_WITHDRAWAL_PENALTY: 0.10, // 10% penalty
    RMD_AGE: 72, // Required Minimum Distribution age
    PENALTY_FREE_AGE: 59.5, // Age when withdrawals are penalty-free
    RMD_PENALTY: 0.50, // 50% penalty for missing RMD
};

// Vesting schedules (in years)
export const VESTING_SCHEDULES = {
    IMMEDIATE: { totalYears: 0, vestedPercentage: 100 },
    THREE_YEAR: { totalYears: 3, vestedPercentage: 0 },
    FIVE_YEAR: { totalYears: 5, vestedPercentage: 0 },
};

// Common employer match formulas
export const EMPLOYER_MATCH_FORMULAS = {
    NONE: { matchPercentage: 0, matchLimit: 0 },
    STANDARD: { matchPercentage: 50, matchLimit: 6 }, // 50% match up to 6% of salary
    GENEROUS: { matchPercentage: 100, matchLimit: 6 }, // 100% match up to 6% of salary
    BASIC: { matchPercentage: 50, matchLimit: 3 }, // 50% match up to 3% of salary
};

// 401(k) benefits by job type
export const JOB_401K_BENEFITS: Record<string, { has401k: boolean; matchPercentage: number; matchLimit: number; vestingYears: number }> = {
    'Fast Food': { has401k: false, matchPercentage: 0, matchLimit: 0, vestingYears: 0 },
    'Warehouse': { has401k: false, matchPercentage: 0, matchLimit: 0, vestingYears: 0 },
    'Sales': { has401k: false, matchPercentage: 0, matchLimit: 0, vestingYears: 0 },
    'Shift Manager': { has401k: true, matchPercentage: 50, matchLimit: 3, vestingYears: 3 }, // Basic match
    'Regional Manager': { has401k: true, matchPercentage: 50, matchLimit: 6, vestingYears: 3 }, // Standard match
    'Director of Operations': { has401k: true, matchPercentage: 100, matchLimit: 6, vestingYears: 3 }, // Generous match
};

// ── Luxury spending ──────────────────────────────────────────────────────────
// Big-ticket toys. Most depreciate (a money pit — the point of the sim);
// real estate appreciates; experiences are pure one-time consumption.
export interface LuxuryCatalogItem {
    id: string;
    name: string;
    icon: string; // emoji
    cost: number; // one-time purchase price
    upkeep: number; // monthly running cost (crew, fuel, docking, taxes...)
    happiness: number; // one-time happiness boost on purchase (0-100 scale)
    kind: 'depreciating' | 'appreciating' | 'consumable';
    blurb: string;
}

export const LUXURY_CATALOG: LuxuryCatalogItem[] = [
    { id: 'watch', name: 'Luxury Watch', icon: '⌚', cost: 50_000, upkeep: 100, happiness: 3, kind: 'depreciating', blurb: 'A wrist-worn flex. Holds a little value.' },
    { id: 'sports_car', name: 'Sports Car', icon: '🏎️', cost: 250_000, upkeep: 1_500, happiness: 6, kind: 'depreciating', blurb: 'Loses value the moment you drive it off the lot.' },
    { id: 'yacht', name: 'Superyacht', icon: '🛥️', cost: 5_000_000, upkeep: 50_000, happiness: 12, kind: 'depreciating', blurb: 'Crew, fuel, and docking will bleed you dry.' },
    { id: 'mansion', name: 'Beachfront Mansion', icon: '🏰', cost: 15_000_000, upkeep: 40_000, happiness: 15, kind: 'appreciating', blurb: 'Prime real estate — appreciates over time.' },
    { id: 'jet', name: 'Private Jet', icon: '✈️', cost: 20_000_000, upkeep: 150_000, happiness: 18, kind: 'depreciating', blurb: 'Ultimate convenience, brutal upkeep.' },
    { id: 'island', name: 'Private Island', icon: '🏝️', cost: 75_000_000, upkeep: 100_000, happiness: 30, kind: 'appreciating', blurb: 'Your own country. Land only appreciates.' },
    { id: 'space', name: 'Trip to Space', icon: '🚀', cost: 30_000_000, upkeep: 0, happiness: 40, kind: 'consumable', blurb: 'A once-in-a-lifetime experience. No resale — just memories.' },
];

// Monthly indulgences the player can switch on and off. Small stat boosts,
// ongoing cost.
export interface LuxurySubscription {
    id: string;
    name: string;
    icon: string;
    monthlyCost: number;
    happiness?: number; // applied each month, clamped to 100
    energy?: number;
    strength?: number;
    blurb: string;
}

export const LUXURY_SUBSCRIPTIONS: LuxurySubscription[] = [
    { id: 'trainer', name: 'Personal Trainer', icon: '🏋️', monthlyCost: 4_000, strength: 2, energy: 1, blurb: 'Stay strong and energized.' },
    { id: 'club', name: 'Country Club', icon: '⛳', monthlyCost: 6_000, happiness: 2, blurb: 'Network on the green.' },
    { id: 'chef', name: 'Personal Chef', icon: '🍽️', monthlyCost: 8_000, happiness: 2, energy: 1, blurb: 'Eat like royalty, every day.' },
    { id: 'security', name: 'Private Security', icon: '🛡️', monthlyCost: 12_000, happiness: 1, blurb: 'Peace of mind, round the clock.' },
    { id: 'philanthropy', name: 'Charity Foundation', icon: '❤️', monthlyCost: 20_000, happiness: 5, blurb: 'Giving back feels good.' },
    { id: 'travel', name: 'First-Class Travel', icon: '🌍', monthlyCost: 25_000, happiness: 4, blurb: 'See the world in style.' },
];
