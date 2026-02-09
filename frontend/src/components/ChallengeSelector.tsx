import React from 'react';
import { Target, Trophy, Flame } from 'lucide-react';

interface Challenge {
    id: string;
    name: string;
    description: string;
    difficulty: 'Medium' | 'Hard' | 'Extreme';
    rewards: {
        achievementMultiplier: number;
        skillPointBonus: number;
    };
}

const CHALLENGES: Challenge[] = [
    {
        id: 'debt_free',
        name: 'Debt-Free Journey',
        description: 'Complete the game without taking any loans',
        difficulty: 'Medium',
        rewards: { achievementMultiplier: 1.5, skillPointBonus: 2 }
    },
    {
        id: 'self_taught',
        name: 'Self-Taught Entrepreneur',
        description: 'Start a business without any formal education beyond high school',
        difficulty: 'Medium',
        rewards: { achievementMultiplier: 1.5, skillPointBonus: 2 }
    },
    {
        id: 'frugal_millionaire',
        name: 'Frugal Millionaire',
        description: 'Reach $1M net worth while never upgrading beyond Frugal lifestyle',
        difficulty: 'Hard',
        rewards: { achievementMultiplier: 2.0, skillPointBonus: 3 }
    },
    {
        id: 'no_stocks',
        name: 'Real Assets Only',
        description: 'Build wealth without investing in stocks',
        difficulty: 'Medium',
        rewards: { achievementMultiplier: 1.5, skillPointBonus: 2 }
    },
    {
        id: 'speed_run',
        name: 'Speed Run',
        description: 'Reach $500k net worth before age 30 (144 months)',
        difficulty: 'Hard',
        rewards: { achievementMultiplier: 2.0, skillPointBonus: 4 }
    },
    {
        id: 'family_first',
        name: 'Family First',
        description: 'Reach $250k net worth while raising at least 3 children',
        difficulty: 'Hard',
        rewards: { achievementMultiplier: 2.0, skillPointBonus: 3 }
    },
    {
        id: 'solo_entrepreneur',
        name: 'Solo Entrepreneur',
        description: 'Build a profitable business without hiring any staff',
        difficulty: 'Extreme',
        rewards: { achievementMultiplier: 2.5, skillPointBonus: 5 }
    },
    {
        id: 'ultimate_challenge',
        name: 'The Ultimate Challenge',
        description: 'Debt-free, no education, frugal lifestyle, reach $500k before 30',
        difficulty: 'Extreme',
        rewards: { achievementMultiplier: 3.0, skillPointBonus: 10 }
    }
];

interface ChallengeSelectorProps {
    onSelectChallenge: (challengeId: string) => void;
    onClose: () => void;
}

export const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({ onSelectChallenge, onClose }) => {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Medium': return 'text-blue-400 border-blue-500/50';
            case 'Hard': return 'text-orange-400 border-orange-500/50';
            case 'Extreme': return 'text-red-400 border-red-500/50';
            default: return 'text-gray-400 border-gray-500/50';
        }
    };
    
    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'Medium': return <Target size={20} />;
            case 'Hard': return <Trophy size={20} />;
            case 'Extreme': return <Flame size={20} />;
            default: return <Target size={20} />;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0F1016] border border-white/10 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#0F1016] border-b border-white/10 p-6 z-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Challenge Mode</h2>
                    <p className="text-gray-400">Test your skills with self-imposed restrictions. Earn bonus rewards!</p>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CHALLENGES.map(challenge => (
                        <button
                            key={challenge.id}
                            onClick={() => onSelectChallenge(challenge.id)}
                            className="group p-6 rounded-lg border border-white/10 hover:border-blue-500/50 bg-white/5 hover:bg-blue-500/10 transition-all text-left"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getDifficultyIcon(challenge.difficulty)}
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${getDifficultyColor(challenge.difficulty)}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Rewards</div>
                                    <div className="text-yellow-400 font-bold">+{challenge.rewards.skillPointBonus} ⭐</div>
                                    <div className="text-xs text-green-400">{challenge.rewards.achievementMultiplier}x 🏆</div>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                {challenge.name}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {challenge.description}
                            </p>
                        </button>
                    ))}
                </div>
                
                <div className="sticky bottom-0 bg-[#0F1016] border-t border-white/10 p-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                            <p className="font-bold text-white mb-1">How it works:</p>
                            <p>• Challenges impose restrictions on your gameplay</p>
                            <p>• Complete the challenge to earn bonus skill points and achievement multipliers</p>
                            <p>• Your game will restart with the challenge active</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
