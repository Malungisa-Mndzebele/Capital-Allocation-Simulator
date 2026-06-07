// Scenario Mode - Pre-built challenging scenarios
import { GameState } from '../types';
import { LoanLogic } from './LoanLogic';
import { CareerLogic } from './CareerLogic';
import { LIFESTYLE_TIERS } from '../config';

export interface Scenario {
    id: string;
    name: string;
    description: string;
    difficulty: 'Medium' | 'Hard' | 'Extreme';
    startingConditions: {
        cash: number;
        age: number;
        educationLevel: 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'PhD';
        jobTitle: string;
        salary: number;
        lifestyle: string;
        relationshipStatus: 'Single' | 'Dating' | 'Married';
        children: number;
        loans: Array<{
            type: 'student' | 'business' | 'mortgage';
            amount: number;
        }>;
        assets?: {
            stocks?: number;
            bonds?: number;
            realEstate?: number;
        };
    };
    goal: {
        description: string;
        targetNetWorth?: number;
        targetAge?: number; // must reach the goal on or before this age
        requireDebtFree?: boolean;
    };
    tips: string[];
}

export const SCENARIOS: Scenario[] = [
    {
        id: 'student_debt_crisis',
        name: 'Student Debt Crisis',
        description: 'Fresh out of college with a Master\'s degree and $50k in student loans.',
        difficulty: 'Medium',
        startingConditions: {
            cash: 2000,
            age: 24,
            educationLevel: 'Master',
            jobTitle: 'Sales',
            salary: 30000,
            lifestyle: 'Frugal',
            relationshipStatus: 'Single',
            children: 0,
            loans: [{ type: 'student', amount: 50000 }]
        },
        goal: {
            description: 'Pay off all loans and reach $100k net worth',
            targetNetWorth: 100000,
            requireDebtFree: true
        },
        tips: ['Focus on career advancement', 'Balance loan repayment vs investing']
    },
    {
        id: 'single_parent',
        name: 'Single Parent Struggle',
        description: 'Raising 2 kids alone on a warehouse salary. Every dollar counts.',
        difficulty: 'Hard',
        startingConditions: {
            cash: 1000,
            age: 28,
            educationLevel: 'High School',
            jobTitle: 'Warehouse',
            salary: 24000,
            lifestyle: 'Frugal',
            relationshipStatus: 'Single',
            children: 2,
            loans: []
        },
        goal: {
            description: 'Reach $50k net worth while maintaining your family',
            targetNetWorth: 50000
        },
        tips: ['Study to unlock higher-paying roles', 'Watch your monthly cash flow closely']
    },
    {
        id: 'business_bankruptcy',
        name: 'Business Bankruptcy',
        description: 'Your business failed. You\'re 35 with debt and no job. Start over.',
        difficulty: 'Hard',
        startingConditions: {
            cash: 500,
            age: 35,
            educationLevel: 'Bachelor',
            jobTitle: '',
            salary: 0,
            lifestyle: 'Frugal',
            relationshipStatus: 'Single',
            children: 0,
            loans: [{ type: 'business', amount: 30000 }]
        },
        goal: {
            description: 'Recover and reach $200k net worth before age 50',
            targetNetWorth: 200000,
            targetAge: 50
        },
        tips: ['Get any job quickly to stop the bleeding', 'Pay down high-interest business debt']
    },
    {
        id: 'golden_handcuffs',
        name: 'Golden Handcuffs',
        description: 'High salary, luxury lifestyle, but drowning in debt.',
        difficulty: 'Medium',
        startingConditions: {
            cash: 3000,
            age: 32,
            educationLevel: 'Master',
            jobTitle: 'Director of Operations',
            salary: 95000,
            lifestyle: 'Luxury',
            relationshipStatus: 'Married',
            children: 1,
            loans: [
                { type: 'mortgage', amount: 200000 },
                { type: 'student', amount: 20000 }
            ]
        },
        goal: {
            description: 'Become debt-free and reach $250k net worth',
            targetNetWorth: 250000,
            requireDebtFree: true
        },
        tips: ['Downgrade your lifestyle to free up cash', 'Aggressively pay off debt']
    },
    {
        id: 'late_bloomer',
        name: 'Late Bloomer',
        description: 'You\'re 40 with nothing saved. Time to catch up on retirement.',
        difficulty: 'Hard',
        startingConditions: {
            cash: 2000,
            age: 40,
            educationLevel: 'Bachelor',
            jobTitle: 'Regional Manager',
            salary: 55000,
            lifestyle: 'Moderate',
            relationshipStatus: 'Married',
            children: 2,
            loans: []
        },
        goal: {
            description: 'Reach $500k net worth before retirement at 65',
            targetNetWorth: 500000,
            targetAge: 65
        },
        tips: ['Open a 401(k) and max the employer match', 'Use catch-up contributions after age 50']
    },
    {
        id: 'inheritance_windfall',
        name: 'Inheritance Windfall',
        description: 'You inherited $100k. Will you invest wisely or waste it?',
        difficulty: 'Medium',
        startingConditions: {
            cash: 100000,
            age: 25,
            educationLevel: 'Bachelor',
            jobTitle: 'Sales',
            salary: 30000,
            lifestyle: 'Moderate',
            relationshipStatus: 'Single',
            children: 0,
            loans: []
        },
        goal: {
            description: 'Turn $100k into $1M before age 40',
            targetNetWorth: 1000000,
            targetAge: 40
        },
        tips: ['Invest the windfall rather than spending it', 'Consider starting a business for higher returns']
    },
    {
        id: 'market_crash_survivor',
        name: 'Market Crash Survivor',
        description: 'The market crashed. Your portfolio is down 50%. Can you recover?',
        difficulty: 'Extreme',
        startingConditions: {
            cash: 5000,
            age: 45,
            educationLevel: 'Master',
            jobTitle: 'Director of Operations',
            salary: 95000,
            lifestyle: 'Moderate',
            relationshipStatus: 'Married',
            children: 2,
            loans: [],
            assets: { stocks: 50000, bonds: 20000, realEstate: 30000 }
        },
        goal: {
            description: 'Recover to $500k net worth before retirement',
            targetNetWorth: 500000,
            targetAge: 65
        },
        tips: ['Stay invested through the recovery', 'Diversify across asset classes']
    },
    {
        id: 'immigrant_dream',
        name: 'Immigrant Dream',
        description: 'New to the country with $200 and a dream. Build your empire.',
        difficulty: 'Extreme',
        startingConditions: {
            cash: 200,
            age: 22,
            educationLevel: 'High School',
            jobTitle: 'Fast Food',
            salary: 18000,
            lifestyle: 'Frugal',
            relationshipStatus: 'Single',
            children: 0,
            loans: []
        },
        goal: {
            description: 'Reach $1M net worth - the American Dream',
            targetNetWorth: 1000000
        },
        tips: ['Educate yourself to climb the career ladder', 'Reinvest every spare dollar']
    }
];

export class ScenarioMode {
    /**
     * Apply a scenario's starting conditions on top of a fresh game state.
     */
    static applyScenario(scenario: Scenario, baseState: GameState): GameState {
        const state: GameState = JSON.parse(JSON.stringify(baseState));
        const c = scenario.startingConditions;

        state.cash = c.cash;
        state.player.age = c.age;
        // Month basis matches GameEngine: age = 17 + floor((month - 1) / 12).
        state.month = (c.age - 17) * 12 + 1;
        state.player.relationshipStatus = c.relationshipStatus;
        state.player.children = c.children;

        state.career.educationLevel = c.educationLevel;
        state.career.jobTitle = c.jobTitle;
        state.career.salary = c.salary;
        // Apply any 401(k) benefits that come with the scenario's job title.
        state.career = CareerLogic.apply401kBenefits(state.career);

        const costs = LIFESTYLE_TIERS[c.lifestyle];
        if (costs) {
            state.lifestyle.tier = c.lifestyle as GameState['lifestyle']['tier'];
            state.lifestyle.rent = costs.rent;
            state.lifestyle.food = costs.food;
            state.lifestyle.transport = costs.transport;
            state.lifestyle.entertainment = costs.entertainment;
        }

        // Create real loans so payments/interest behave like any other loan.
        state.loans = (c.loans || []).map(loan =>
            LoanLogic.createLoan(loan.type, loan.amount, state.month, 700)
        );

        if (c.assets) {
            state.portfolio.stocksValue = c.assets.stocks || 0;
            state.portfolio.bondsValue = c.assets.bonds || 0;
            state.portfolio.realEstateValue = c.assets.realEstate || 0;
        }

        // Recompute net worth for the new starting position.
        const totalDebt = state.loans.reduce((sum, loan) => sum + loan.balance, 0);
        state.netWorth =
            state.cash +
            state.portfolio.stocksValue +
            state.portfolio.bondsValue +
            state.portfolio.realEstateValue -
            totalDebt;
        state.netWorthHistory = [{ month: state.month, value: state.netWorth }];

        state.events = [{
            month: state.month,
            description: `Scenario Started: ${scenario.name}`,
            impact: scenario.goal.description
        }];

        return state;
    }

    /**
     * Evaluate scenario progress. `completed` signals victory; `reason` (when set)
     * signals failure with a player-facing message.
     */
    static checkScenarioCompletion(
        scenario: Scenario,
        gameState: GameState
    ): { completed: boolean; reason?: string } {
        const goal = scenario.goal;

        const netWorthMet = !goal.targetNetWorth || gameState.netWorth >= goal.targetNetWorth;
        const debtMet = !goal.requireDebtFree || gameState.loans.length === 0;
        const ageOk = !goal.targetAge || gameState.player.age <= goal.targetAge;

        if (netWorthMet && debtMet && ageOk) {
            return { completed: true };
        }

        // Failure: blew past the age deadline without meeting the goal.
        if (goal.targetAge && gameState.player.age > goal.targetAge) {
            return {
                completed: false,
                reason: `Scenario failed: you did not reach the goal by age ${goal.targetAge}.`
            };
        }

        return { completed: false };
    }

    static getScenarioProgress(scenario: Scenario, gameState: GameState): string {
        const target = scenario.goal.targetNetWorth || 0;
        return `Net Worth: ${gameState.netWorth} / ${target}`;
    }
}
