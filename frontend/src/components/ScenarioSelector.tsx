import React from 'react';
import { BookOpen, Target, Flame } from 'lucide-react';

interface Scenario {
    id: string;
    name: string;
    description: string;
    difficulty: 'Medium' | 'Hard' | 'Extreme';
    goal: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: 'student_debt_crisis',
        name: 'Student Debt Crisis',
        description: 'Fresh out of college with a Master\'s degree and $50k in student loans.',
        difficulty: 'Medium',
        goal: 'Pay off all loans and reach $100k net worth'
    },
    {
        id: 'single_parent',
        name: 'Single Parent Struggle',
        description: 'Raising 2 kids alone on a warehouse salary. Every dollar counts.',
        difficulty: 'Hard',
        goal: 'Reach $50k net worth while maintaining family'
    },
    {
        id: 'business_bankruptcy',
        name: 'Business Bankruptcy',
        description: 'Your business failed. You\'re 35 with debt and no job. Start over.',
        difficulty: 'Hard',
        goal: 'Recover and reach $200k net worth before age 50'
    },
    {
        id: 'golden_handcuffs',
        name: 'Golden Handcuffs',
        description: 'High salary, luxury lifestyle, but drowning in debt.',
        difficulty: 'Medium',
        goal: 'Become debt-free and reach $250k net worth'
    },
    {
        id: 'late_bloomer',
        name: 'Late Bloomer',
        description: 'You\'re 40 with nothing saved. Time to catch up on retirement.',
        difficulty: 'Hard',
        goal: 'Reach $500k net worth before retirement at 65'
    },
    {
        id: 'inheritance_windfall',
        name: 'Inheritance Windfall',
        description: 'You inherited $100k. Will you invest wisely or waste it?',
        difficulty: 'Medium',
        goal: 'Turn $100k into $1M before age 40'
    },
    {
        id: 'market_crash_survivor',
        name: 'Market Crash Survivor',
        description: 'The market crashed. Your portfolio is down 50%. Can you recover?',
        difficulty: 'Extreme',
        goal: 'Recover to $500k net worth before retirement'
    },
    {
        id: 'immigrant_dream',
        name: 'Immigrant Dream',
        description: 'New to the country with $200 and a dream. Build your empire.',
        difficulty: 'Extreme',
        goal: 'Reach $1M net worth - the American Dream'
    }
];

interface ScenarioSelectorProps {
    onSelectScenario: (scenarioId: string) => void;
    onClose: () => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onSelectScenario, onClose }) => {
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
            case 'Hard': return <BookOpen size={20} />;
            case 'Extreme': return <Flame size={20} />;
            default: return <Target size={20} />;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0F1016] border border-white/10 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#0F1016] border-b border-white/10 p-6 z-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Scenario Mode</h2>
                    <p className="text-gray-400">Start with unique challenging situations. Can you overcome them?</p>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SCENARIOS.map(scenario => (
                        <button
                            key={scenario.id}
                            onClick={() => onSelectScenario(scenario.id)}
                            className="group p-6 rounded-lg border border-white/10 hover:border-purple-500/50 bg-white/5 hover:bg-purple-500/10 transition-all text-left"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getDifficultyIcon(scenario.difficulty)}
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${getDifficultyColor(scenario.difficulty)}`}>
                                        {scenario.difficulty}
                                    </span>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {scenario.name}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-3">
                                {scenario.description}
                            </p>
                            <div className="pt-3 border-t border-white/10">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Goal</div>
                                <div className="text-sm text-emerald-400 font-bold">
                                    {scenario.goal}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
                <div className="sticky bottom-0 bg-[#0F1016] border-t border-white/10 p-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                            <p className="font-bold text-white mb-1">How it works:</p>
                            <p>• Each scenario starts you in a unique situation with specific challenges</p>
                            <p>• Complete the scenario goal to win</p>
                            <p>• Your game will restart with the scenario conditions</p>
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
