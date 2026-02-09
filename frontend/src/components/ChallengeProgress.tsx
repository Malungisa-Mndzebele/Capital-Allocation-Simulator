import React from 'react';
import { Target, Trophy, CheckCircle, XCircle } from 'lucide-react';

interface ChallengeProgressProps {
    challengeId: string;
    gameState: any;
}

const CHALLENGE_INFO: Record<string, { name: string; goal: string; difficulty: string }> = {
    debt_free: { name: 'Debt-Free Journey', goal: 'Complete without loans', difficulty: 'Medium' },
    self_taught: { name: 'Self-Taught Entrepreneur', goal: 'Business without education', difficulty: 'Medium' },
    frugal_millionaire: { name: 'Frugal Millionaire', goal: '$1M with Frugal lifestyle', difficulty: 'Hard' },
    no_stocks: { name: 'Real Assets Only', goal: 'Build wealth without stocks', difficulty: 'Medium' },
    speed_run: { name: 'Speed Run', goal: '$500k before age 30', difficulty: 'Hard' },
    family_first: { name: 'Family First', goal: '$250k with 3+ children', difficulty: 'Hard' },
    solo_entrepreneur: { name: 'Solo Entrepreneur', goal: 'Profitable business, no staff', difficulty: 'Extreme' },
    ultimate_challenge: { name: 'The Ultimate Challenge', goal: 'All restrictions, $500k before 30', difficulty: 'Extreme' }
};

export const ChallengeProgress: React.FC<ChallengeProgressProps> = ({ challengeId, gameState }) => {
    const challenge = CHALLENGE_INFO[challengeId];
    if (!challenge) return null;
    
    const getProgress = () => {
        const checks: { label: string; passed: boolean }[] = [];
        
        switch (challengeId) {
            case 'debt_free':
                checks.push({ label: 'No loans taken', passed: gameState.loans.length === 0 });
                break;
            case 'self_taught':
                checks.push({ label: 'High school only', passed: gameState.career.educationLevel === 'High School' });
                break;
            case 'frugal_millionaire':
                checks.push({ label: 'Frugal lifestyle', passed: gameState.lifestyle.tier === 'Frugal' || gameState.lifestyle.tier === 'Parents' });
                checks.push({ label: '$1M net worth', passed: gameState.netWorth >= 1000000 });
                break;
            case 'no_stocks':
                checks.push({ label: 'No stocks', passed: gameState.portfolio.stocksValue === 0 });
                break;
            case 'speed_run':
                checks.push({ label: 'Before age 30', passed: gameState.player.age < 30 });
                checks.push({ label: '$500k net worth', passed: gameState.netWorth >= 500000 });
                break;
            case 'family_first':
                checks.push({ label: '3+ children', passed: gameState.player.children >= 3 });
                checks.push({ label: '$250k net worth', passed: gameState.netWorth >= 250000 });
                break;
            case 'solo_entrepreneur':
                checks.push({ label: 'No staff', passed: gameState.business.staff === 0 });
                checks.push({ label: 'Profitable', passed: gameState.business.revenue > gameState.business.expensesTotal });
                break;
            case 'ultimate_challenge':
                checks.push({ label: 'No loans', passed: gameState.loans.length === 0 });
                checks.push({ label: 'High school only', passed: gameState.career.educationLevel === 'High School' });
                checks.push({ label: 'Frugal lifestyle', passed: gameState.lifestyle.tier === 'Frugal' || gameState.lifestyle.tier === 'Parents' });
                checks.push({ label: 'Before age 30', passed: gameState.player.age < 30 });
                checks.push({ label: '$500k net worth', passed: gameState.netWorth >= 500000 });
                break;
        }
        
        return checks;
    };
    
    const progress = getProgress();
    const allPassed = progress.every(c => c.passed);
    
    return (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target size={20} className="text-blue-400" />
                    <span className="font-bold text-white">{challenge.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        {challenge.difficulty}
                    </span>
                </div>
                {allPassed && (
                    <Trophy size={20} className="text-yellow-400 animate-pulse" />
                )}
            </div>
            
            <div className="space-y-2">
                {progress.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        {check.passed ? (
                            <CheckCircle size={16} className="text-green-400" />
                        ) : (
                            <XCircle size={16} className="text-gray-600" />
                        )}
                        <span className={check.passed ? 'text-green-400' : 'text-gray-400'}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>
            
            {allPassed && (
                <div className="mt-3 pt-3 border-t border-blue-500/30 text-center">
                    <span className="text-yellow-400 font-bold text-sm">
                        🏆 Challenge Complete! Bonus rewards earned!
                    </span>
                </div>
            )}
        </div>
    );
};
