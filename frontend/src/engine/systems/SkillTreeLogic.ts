// Skill Tree System - Unlockable abilities that provide permanent bonuses

export interface Skill {
    id: string;
    name: string;
    description: string;
    cost: number; // Skill points required
    prerequisite?: string; // Skill ID that must be unlocked first
    category: 'Career' | 'Business' | 'Investment' | 'Life';
    effect: SkillEffect;
}

export interface SkillEffect {
    type: 'stat_boost' | 'income_multiplier' | 'cost_reduction' | 'unlock_feature' | 'passive_income';
    value: number;
    target?: string;
}

export interface PlayerSkills {
    unlockedSkills: string[];
    skillPoints: number;
}

export const SKILL_TREE: Skill[] = [
    // Career Skills
    {
        id: 'negotiator',
        name: 'Negotiator',
        description: '+10% salary from all jobs',
        cost: 2,
        category: 'Career',
        effect: { type: 'income_multiplier', value: 0.1, target: 'salary' }
    },
    {
        id: 'fast_learner',
        name: 'Fast Learner',
        description: '+50% study speed',
        cost: 3,
        category: 'Career',
        effect: { type: 'stat_boost', value: 0.5, target: 'study_speed' }
    },
    {
        id: 'workaholic',
        name: 'Workaholic',
        description: 'Energy drains 50% slower',
        cost: 3,
        prerequisite: 'negotiator',
        category: 'Career',
        effect: { type: 'cost_reduction', value: 0.5, target: 'energy_drain' }
    },
    {
        id: 'executive',
        name: 'Executive',
        description: '+25% salary, unlock CEO track',
        cost: 5,
        prerequisite: 'workaholic',
        category: 'Career',
        effect: { type: 'income_multiplier', value: 0.25, target: 'salary' }
    },
    
    // Business Skills
    {
        id: 'entrepreneur',
        name: 'Entrepreneur',
        description: '-20% business startup cost',
        cost: 2,
        category: 'Business',
        effect: { type: 'cost_reduction', value: 0.2, target: 'business_startup' }
    },
    {
        id: 'marketing_guru',
        name: 'Marketing Guru',
        description: '+15% demand for all businesses',
        cost: 3,
        prerequisite: 'entrepreneur',
        category: 'Business',
        effect: { type: 'stat_boost', value: 0.15, target: 'demand' }
    },
    {
        id: 'operations_expert',
        name: 'Operations Expert',
        description: '-25% operating costs',
        cost: 3,
        prerequisite: 'entrepreneur',
        category: 'Business',
        effect: { type: 'cost_reduction', value: 0.25, target: 'business_expenses' }
    },
    {
        id: 'business_mogul',
        name: 'Business Mogul',
        description: '+30% profit margins, unlock franchising',
        cost: 5,
        prerequisite: 'marketing_guru',
        category: 'Business',
        effect: { type: 'income_multiplier', value: 0.3, target: 'business_profit' }
    },
    
    // Investment Skills
    {
        id: 'investor',
        name: 'Investor',
        description: '+1% returns on all investments',
        cost: 2,
        category: 'Investment',
        effect: { type: 'income_multiplier', value: 0.01, target: 'investment_returns' }
    },
    {
        id: 'market_analyst',
        name: 'Market Analyst',
        description: 'See market predictions 3 months ahead',
        cost: 3,
        prerequisite: 'investor',
        category: 'Investment',
        effect: { type: 'unlock_feature', value: 1, target: 'market_forecast' }
    },
    {
        id: 'diversification',
        name: 'Diversification',
        description: 'Reduce portfolio volatility by 30%',
        cost: 3,
        prerequisite: 'investor',
        category: 'Investment',
        effect: { type: 'cost_reduction', value: 0.3, target: 'volatility' }
    },
    {
        id: 'hedge_fund_manager',
        name: 'Hedge Fund Manager',
        description: '+3% returns, unlock options trading',
        cost: 5,
        prerequisite: 'market_analyst',
        category: 'Investment',
        effect: { type: 'income_multiplier', value: 0.03, target: 'investment_returns' }
    },
    
    // Life Skills
    {
        id: 'frugal_living',
        name: 'Frugal Living',
        description: '-15% lifestyle costs',
        cost: 2,
        category: 'Life',
        effect: { type: 'cost_reduction', value: 0.15, target: 'lifestyle' }
    },
    {
        id: 'health_nut',
        name: 'Health Nut',
        description: '+2 energy recovery per month',
        cost: 2,
        category: 'Life',
        effect: { type: 'stat_boost', value: 2, target: 'energy_recovery' }
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: '-50% relationship costs',
        cost: 3,
        prerequisite: 'health_nut',
        category: 'Life',
        effect: { type: 'cost_reduction', value: 0.5, target: 'relationship_costs' }
    },
    {
        id: 'life_coach',
        name: 'Life Coach',
        description: '+$500/mo passive income from coaching',
        cost: 4,
        prerequisite: 'social_butterfly',
        category: 'Life',
        effect: { type: 'passive_income', value: 500, target: 'coaching' }
    }
];

export class SkillTreeLogic {
    static canUnlockSkill(skill: Skill, playerSkills: PlayerSkills): boolean {
        // Check if already unlocked
        if (playerSkills.unlockedSkills.includes(skill.id)) {
            return false;
        }
        
        // Check skill points
        if (playerSkills.skillPoints < skill.cost) {
            return false;
        }
        
        // Check prerequisite
        if (skill.prerequisite && !playerSkills.unlockedSkills.includes(skill.prerequisite)) {
            return false;
        }
        
        return true;
    }
    
    static unlockSkill(skill: Skill, playerSkills: PlayerSkills): PlayerSkills {
        if (!this.canUnlockSkill(skill, playerSkills)) {
            throw new Error('Cannot unlock skill');
        }
        
        return {
            unlockedSkills: [...playerSkills.unlockedSkills, skill.id],
            skillPoints: playerSkills.skillPoints - skill.cost
        };
    }
    
    static getSkillBonus(playerSkills: PlayerSkills, target: string): number {
        const relevantSkills = SKILL_TREE.filter(skill => 
            playerSkills.unlockedSkills.includes(skill.id) && 
            skill.effect.target === target
        );
        
        let totalBonus = 0;
        for (const skill of relevantSkills) {
            if (skill.effect.type === 'income_multiplier' || skill.effect.type === 'stat_boost') {
                totalBonus += skill.effect.value;
            } else if (skill.effect.type === 'cost_reduction') {
                totalBonus -= skill.effect.value; // Negative for cost reduction
            }
        }
        
        return totalBonus;
    }
    
    static getPassiveIncome(playerSkills: PlayerSkills): number {
        const passiveSkills = SKILL_TREE.filter(skill => 
            playerSkills.unlockedSkills.includes(skill.id) && 
            skill.effect.type === 'passive_income'
        );
        
        return passiveSkills.reduce((total, skill) => total + skill.effect.value, 0);
    }
    
    static awardSkillPoints(month: number, achievements: number): number {
        // Award skill points based on milestones
        let points = 0;
        
        // Every 12 months (1 year)
        if (month % 12 === 0) points += 1;
        
        // Every 5 achievements
        if (achievements > 0 && achievements % 5 === 0) points += 1;
        
        return points;
    }
}
