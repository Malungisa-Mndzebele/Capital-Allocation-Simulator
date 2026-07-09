// Achievement system for tracking player milestones

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number; // month
}

export interface AchievementCheck {
    id: string;
    check: (state: any) => boolean;
    title: string;
    description: string;
}

export const ACHIEVEMENTS: AchievementCheck[] = [
    {
        id: 'first_job',
        title: 'First Paycheck',
        description: 'Get your first job',
        check: (state) => state.career.jobTitle !== ''
    },
    {
        id: 'student',
        title: 'Lifelong Learner',
        description: 'Enroll in education',
        check: (state) => state.career.isStudying
    },
    {
        id: 'graduate',
        title: 'Graduate',
        description: 'Complete a degree',
        check: (state) => state.career.educationLevel !== 'High School'
    },
    {
        id: 'masters',
        title: 'Master of Business',
        description: 'Earn a Master\'s degree',
        check: (state) => state.career.educationLevel === 'Master'
    },
    {
        id: 'first_10k',
        title: 'Five Figures',
        description: 'Save $10,000',
        check: (state) => state.cash >= 10000
    },
    {
        id: 'first_100k',
        title: 'Six Figures',
        description: 'Reach $100,000 net worth',
        check: (state) => state.netWorth >= 100000
    },
    {
        id: 'millionaire',
        title: 'Millionaire',
        description: 'Reach $1,000,000 net worth',
        check: (state) => state.netWorth >= 1000000
    },
    {
        id: 'entrepreneur',
        title: 'Entrepreneur',
        description: 'Start a business',
        check: (state) => state.level === 'Business'
    },
    {
        id: 'profitable',
        title: 'In the Black',
        description: 'Run a profitable business for 3 months',
        check: (state) => state.level === 'Business' && state.business.revenue > state.business.expensesTotal
    },
    {
        id: 'investor',
        title: 'Investor',
        description: 'Buy your first investment',
        check: (state) => (state.portfolio.stocksValue + state.portfolio.bondsValue + state.portfolio.realEstateValue) > 0
    },
    {
        id: 'diversified',
        title: 'Diversified Portfolio',
        description: 'Own stocks, bonds, and real estate',
        check: (state) => state.portfolio.stocksValue > 0 && state.portfolio.bondsValue > 0 && state.portfolio.realEstateValue > 0
    },
    {
        id: 'family_person',
        title: 'Family Person',
        description: 'Get married and have a child',
        check: (state) => state.player.relationshipStatus === 'Married' && state.player.children > 0
    },
    {
        id: 'survivor',
        title: 'Survivor',
        description: 'Recover from homelessness',
        check: (state) => state.lifestyle.monthsHomeless > 0 && state.lifestyle.tier !== 'Homeless' && state.cash > 5000
    },
    {
        id: 'decade',
        title: 'Decade of Growth',
        description: 'Play for 10 years (120 months)',
        check: (state) => state.month >= 120
    },
    {
        id: 'luxury_life',
        title: 'Living Large',
        description: 'Maintain luxury lifestyle for 12 months',
        check: (state) => state.lifestyle.tier === 'Luxury'
    },
    {
        id: 'first_retirement_account',
        title: 'Planning Ahead',
        description: 'Open your first retirement account',
        check: (state) => state.retirement.accounts.length > 0
    },
    {
        id: 'max_employer_match',
        title: 'Free Money',
        description: 'Maximize employer 401(k) match for 12 consecutive months',
        check: (state) => {
            const active401k = state.retirement.accounts.find((acc: any) => acc.type === '401k' && acc.isActive);
            if (!active401k || active401k.employerMatch === 0) return false;
            // Check if contribution rate meets or exceeds employer match limit
            return active401k.contributionRate >= active401k.employerMatchLimit;
        }
    },
    {
        id: 'contribution_limit',
        title: 'Maxed Out',
        description: 'Reach annual contribution limit for a retirement account',
        check: (state) => {
            // Check if any account has reached its contribution limit
            const has401k = state.retirement.accounts.some((acc: any) => 
                acc.type === '401k' && acc.annualContributions >= 23000
            );
            const hasIRA = state.retirement.accounts.some((acc: any) => 
                (acc.type === 'traditional_ira' || acc.type === 'roth_ira') && 
                acc.annualContributions >= 7000
            );
            return has401k || hasIRA;
        }
    },
    {
        id: 'retirement_millionaire',
        title: 'Retirement Millionaire',
        description: 'Accumulate $1,000,000 in retirement accounts',
        check: (state) => {
            const totalRetirementBalance = state.retirement.accounts.reduce(
                (sum: number, account: any) => sum + account.balance,
                0
            );
            return totalRetirementBalance >= 1000000;
        }
    },
    {
        id: 'baller',
        title: 'Baller',
        description: 'Own a private jet',
        check: (state) => (state.luxury?.ownedAssets || []).some((a: any) => a.type === 'jet')
    },
    {
        id: 'island_life',
        title: 'Island Life',
        description: 'Own a private island',
        check: (state) => (state.luxury?.ownedAssets || []).some((a: any) => a.type === 'island')
    }
];

export function checkAchievements(state: any, currentAchievements: Achievement[]): Achievement[] {
    const updated = [...currentAchievements];
    
    ACHIEVEMENTS.forEach(achievementCheck => {
        const existing = updated.find(a => a.id === achievementCheck.id);
        
        if (!existing) {
            // New achievement, check if unlocked
            if (achievementCheck.check(state)) {
                updated.push({
                    id: achievementCheck.id,
                    title: achievementCheck.title,
                    description: achievementCheck.description,
                    unlocked: true,
                    unlockedAt: state.month
                });
            } else {
                // Add as locked
                updated.push({
                    id: achievementCheck.id,
                    title: achievementCheck.title,
                    description: achievementCheck.description,
                    unlocked: false
                });
            }
        } else if (!existing.unlocked && achievementCheck.check(state)) {
            // Unlock existing achievement
            existing.unlocked = true;
            existing.unlockedAt = state.month;
        }
    });
    
    return updated;
}
