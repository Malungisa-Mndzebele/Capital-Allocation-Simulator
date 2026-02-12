// Scenario Mode - Pre-built challenging scenarios

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
        targetAge?: number;
        customCondition?: string;
    };
    tips: string[];
}

export const SCENARIOS: Scenario[] = [
    {
        id: 'student_debt_crisis',
        name: 'Student Debt Crisis',
        description: 'Fresh out of college with $50k in student loans',
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
            description: 'Pay off loans and reach $100k net worth',
            targetNetWorth: 100000
        },
        tips: ['Focus on career advancement', 'Balance loan repayment vs investing']
    }
];

export class ScenarioMode {
    static applyScenario(scenario: Scenario, baseState: any): any {
        const state = { ...baseState };
        const conditions = scenario.startingConditions;
        
        state.cash = conditions.cash;
        state.player.age = conditions.age;
        state.month = (conditions.age - 17) * 12 + 1;
        state.career.educationLevel = conditions.educationLevel;
        state.career.jobTitle = conditions.jobTitle;
        state.career.salary = conditions.salary;
        
        return state;
    }
    
    static checkScenarioCompletion(scenario: Scenario, gameState: any): { completed: boolean; reason?: string } {
        if (gameState.netWorth >= (scenario.goal.targetNetWorth || 0)) {
            return { completed: true };
        }
        return { completed: false };
    }
    
    static getScenarioProgress(scenario: Scenario, gameState: any): string {
        return `Net Worth: ${gameState.netWorth}`;
    }
}
