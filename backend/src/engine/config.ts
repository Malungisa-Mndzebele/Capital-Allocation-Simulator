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
