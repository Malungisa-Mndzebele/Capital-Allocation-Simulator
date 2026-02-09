// Challenge Mode - Self-imposed restrictions for experienced players

export interface Challenge {
    id: string;
    name: string;
    description: string;
    difficulty: 'Medium' | 'Hard' | 'Extreme';
    restrictions: ChallengeRestriction[];
    rewards: {
        achievementMultiplier: number;
        skillPointBonus: number;
    };
}

export interface ChallengeRestriction {
    type: 'no_loans' | 'no_education' | 'max_lifestyle' | 'no_stocks' | 'time_limit' | 'min_children' | 'no_business_staff';
    value?: any;
}

export const CHALLENGES: Challenge[] = [
    {
        id: 'debt_free',
        name: 'Debt-Free Journey',
        description: 'Complete the game without taking any loans',
        difficulty: 'Medium',
        restrictions: [
            { type: 'no_loans' }
        ],
        rewards: {
            achievementMultiplier: 1.5,
            skillPointBonus: 2
        }
    },
    {
        id: 'self_taught',
        name: 'Self-Taught Entrepreneur',
        description: 'Start a business without any formal education beyond high school',
        difficulty: 'Medium',
        restrictions: [
            { type: 'no_education' }
        ],
        rewards: {
            achievementMultiplier: 1.5,
            skillPointBonus: 2
        }
    },
    {
        id: 'frugal_millionaire',
        name: 'Frugal Millionaire',
        description: 'Reach $1M net worth while never upgrading beyond Frugal lifestyle',
        difficulty: 'Hard',
        restrictions: [
            { type: 'max_lifestyle', value: 'Frugal' }
        ],
        rewards: {
            achievementMultiplier: 2.0,
            skillPointBonus: 3
        }
    },
    {
        id: 'no_stocks',
        name: 'Real Assets Only',
        description: 'Build wealth without investing in stocks',
        difficulty: 'Medium',
        restrictions: [
            { type: 'no_stocks' }
        ],
        rewards: {
            achievementMultiplier: 1.5,
            skillPointBonus: 2
        }
    },
    {
        id: 'speed_run',
        name: 'Speed Run',
        description: 'Reach $500k net worth before age 30 (144 months)',
        difficulty: 'Hard',
        restrictions: [
            { type: 'time_limit', value: 144 }
        ],
        rewards: {
            achievementMultiplier: 2.0,
            skillPointBonus: 4
        }
    },
    {
        id: 'family_first',
        name: 'Family First',
        description: 'Reach $250k net worth while raising at least 3 children',
        difficulty: 'Hard',
        restrictions: [
            { type: 'min_children', value: 3 }
        ],
        rewards: {
            achievementMultiplier: 2.0,
            skillPointBonus: 3
        }
    },
    {
        id: 'solo_entrepreneur',
        name: 'Solo Entrepreneur',
        description: 'Build a profitable business without hiring any staff',
        difficulty: 'Extreme',
        restrictions: [
            { type: 'no_business_staff' }
        ],
        rewards: {
            achievementMultiplier: 2.5,
            skillPointBonus: 5
        }
    },
    {
        id: 'ultimate_challenge',
        name: 'The Ultimate Challenge',
        description: 'Debt-free, no education, frugal lifestyle, reach $500k before 30',
        difficulty: 'Extreme',
        restrictions: [
            { type: 'no_loans' },
            { type: 'no_education' },
            { type: 'max_lifestyle', value: 'Frugal' },
            { type: 'time_limit', value: 144 }
        ],
        rewards: {
            achievementMultiplier: 3.0,
            skillPointBonus: 10
        }
    }
];

export class ChallengeMode {
    static validateAction(challenge: Challenge | null, action: string, payload: any, gameState: any): { valid: boolean; reason?: string } {
        if (!challenge) return { valid: true };
        
        for (const restriction of challenge.restrictions) {
            switch (restriction.type) {
                case 'no_loans':
                    if (action === 'TAKE_LOAN') {
                        return { valid: false, reason: 'Challenge restriction: No loans allowed' };
                    }
                    break;
                    
                case 'no_education':
                    if (action === 'TOGGLE_STUDY' && !gameState.career.isStudying) {
                        return { valid: false, reason: 'Challenge restriction: No education beyond high school' };
                    }
                    break;
                    
                case 'max_lifestyle':
                    if (action === 'UPDATE_LIFESTYLE') {
                        const lifestyleTiers = ['Parents', 'Homeless', 'Frugal', 'Moderate', 'Luxury'];
                        const maxTierIndex = lifestyleTiers.indexOf(restriction.value);
                        const requestedTierIndex = lifestyleTiers.indexOf(payload.tier);
                        if (requestedTierIndex > maxTierIndex) {
                            return { valid: false, reason: `Challenge restriction: Lifestyle limited to ${restriction.value}` };
                        }
                    }
                    break;
                    
                case 'no_stocks':
                    if (action === 'BUY_ASSET' && payload.assetType === 'STOCK') {
                        return { valid: false, reason: 'Challenge restriction: No stock investments allowed' };
                    }
                    break;
                    
                case 'no_business_staff':
                    if (action === 'UPDATE_BUSINESS' && payload.staff !== undefined && payload.staff > 0) {
                        return { valid: false, reason: 'Challenge restriction: No staff allowed (solo entrepreneur)' };
                    }
                    break;
            }
        }
        
        return { valid: true };
    }
    
    static checkChallengeCompletion(challenge: Challenge, gameState: any): boolean {
        // Check if all restrictions were followed and goals met
        for (const restriction of challenge.restrictions) {
            switch (restriction.type) {
                case 'time_limit':
                    if (gameState.month > restriction.value) return false;
                    break;
                    
                case 'min_children':
                    if (gameState.player.children < restriction.value) return false;
                    break;
            }
        }
        
        // Check completion criteria based on challenge
        if (challenge.id === 'frugal_millionaire' && gameState.netWorth < 1000000) return false;
        if (challenge.id === 'speed_run' && gameState.netWorth < 500000) return false;
        if (challenge.id === 'family_first' && gameState.netWorth < 250000) return false;
        if (challenge.id === 'ultimate_challenge' && gameState.netWorth < 500000) return false;
        
        return true;
    }
    
    static getChallengeProgress(challenge: Challenge, gameState: any): string {
        const restrictions = challenge.restrictions.map(r => {
            switch (r.type) {
                case 'no_loans':
                    return `No loans: ${gameState.loans.length === 0 ? '✓' : '✗'}`;
                case 'no_education':
                    return `High school only: ${gameState.career.educationLevel === 'High School' ? '✓' : '✗'}`;
                case 'max_lifestyle':
                    return `Max lifestyle ${r.value}: ${gameState.lifestyle.tier}`;
                case 'no_stocks':
                    return `No stocks: ${gameState.portfolio.stocksValue === 0 ? '✓' : '✗'}`;
                case 'time_limit':
                    return `Time: ${gameState.month}/${r.value} months`;
                case 'min_children':
                    return `Children: ${gameState.player.children}/${r.value}`;
                case 'no_business_staff':
                    return `Solo: ${gameState.business.staff === 0 ? '✓' : '✗'}`;
                default:
                    return '';
            }
        }).filter(s => s).join(', ');
        
        return restrictions;
    }
}
