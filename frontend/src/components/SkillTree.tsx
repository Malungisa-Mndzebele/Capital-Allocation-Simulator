import React from 'react';
import type { PlayerSkills } from '../types';

interface Skill {
    id: string;
    name: string;
    description: string;
    cost: number;
    prerequisite?: string;
    category: 'Career' | 'Business' | 'Investment' | 'Life';
}

// Mirror of backend SKILL_TREE
const SKILLS: Skill[] = [
    // Career
    { id: 'negotiator', name: 'Negotiator', description: '+10% salary from all jobs', cost: 2, category: 'Career' },
    { id: 'fast_learner', name: 'Fast Learner', description: '+50% study speed', cost: 3, category: 'Career' },
    { id: 'workaholic', name: 'Workaholic', description: 'Energy drains 50% slower', cost: 3, prerequisite: 'negotiator', category: 'Career' },
    { id: 'executive', name: 'Executive', description: '+25% salary, unlock CEO track', cost: 5, prerequisite: 'workaholic', category: 'Career' },
    
    // Business
    { id: 'entrepreneur', name: 'Entrepreneur', description: '-20% business startup cost', cost: 2, category: 'Business' },
    { id: 'marketing_guru', name: 'Marketing Guru', description: '+15% demand for all businesses', cost: 3, prerequisite: 'entrepreneur', category: 'Business' },
    { id: 'operations_expert', name: 'Operations Expert', description: '-25% operating costs', cost: 3, prerequisite: 'entrepreneur', category: 'Business' },
    { id: 'business_mogul', name: 'Business Mogul', description: '+30% profit margins', cost: 5, prerequisite: 'marketing_guru', category: 'Business' },
    
    // Investment
    { id: 'investor', name: 'Investor', description: '+1% returns on all investments', cost: 2, category: 'Investment' },
    { id: 'market_analyst', name: 'Market Analyst', description: 'See market predictions', cost: 3, prerequisite: 'investor', category: 'Investment' },
    { id: 'diversification', name: 'Diversification', description: 'Reduce volatility by 30%', cost: 3, prerequisite: 'investor', category: 'Investment' },
    { id: 'hedge_fund_manager', name: 'Hedge Fund Manager', description: '+3% returns', cost: 5, prerequisite: 'market_analyst', category: 'Investment' },
    
    // Life
    { id: 'frugal_living', name: 'Frugal Living', description: '-15% lifestyle costs', cost: 2, category: 'Life' },
    { id: 'health_nut', name: 'Health Nut', description: '+2 energy recovery/month', cost: 2, category: 'Life' },
    { id: 'social_butterfly', name: 'Social Butterfly', description: '-50% relationship costs', cost: 3, prerequisite: 'health_nut', category: 'Life' },
    { id: 'life_coach', name: 'Life Coach', description: '+$500/mo passive income', cost: 4, prerequisite: 'social_butterfly', category: 'Life' },
];

interface SkillTreeProps {
    skills: PlayerSkills;
    onUnlockSkill: (skillId: string) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skills, onUnlockSkill }) => {
    const categories = ['Career', 'Business', 'Investment', 'Life'] as const;
    
    const canUnlock = (skill: Skill): boolean => {
        if (skills.unlockedSkills.includes(skill.id)) return false;
        if (skills.skillPoints < skill.cost) return false;
        if (skill.prerequisite && !skills.unlockedSkills.includes(skill.prerequisite)) return false;
        return true;
    };
    
    const isUnlocked = (skillId: string) => skills.unlockedSkills.includes(skillId);
    
    return (
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Skill Tree</h3>
                <div className="text-yellow-400 font-bold text-lg">
                    ⭐ {skills.skillPoints} Skill Points
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map(category => (
                    <div key={category} className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
                            {category}
                        </h4>
                        {SKILLS.filter(s => s.category === category).map(skill => {
                            const unlocked = isUnlocked(skill.id);
                            const available = canUnlock(skill);
                            
                            return (
                                <div
                                    key={skill.id}
                                    className={`p-3 rounded-lg border transition-all relative ${
                                        unlocked
                                            ? 'bg-green-500/20 border-green-500/50'
                                            : available
                                            ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 cursor-pointer'
                                            : 'bg-white/5 border-white/10 opacity-50'
                                    }`}
                                    onClick={() => available && onUnlockSkill(skill.id)}
                                >
                                    {skill.prerequisite && !isUnlocked(skill.prerequisite) && (
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-gray-600" />
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold text-sm ${unlocked ? 'text-green-400' : 'text-white'}`}>
                                            {skill.name}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            unlocked ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'
                                        }`}>
                                            {unlocked ? '✓' : `${skill.cost}★`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{skill.description}</p>
                                    {skill.prerequisite && !isUnlocked(skill.prerequisite) && (
                                        <p className="text-xs text-red-400 mt-1">
                                            Requires: {SKILLS.find(s => s.id === skill.prerequisite)?.name}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                <p className="font-bold text-blue-400 mb-2">How to Earn Skill Points:</p>
                <ul className="space-y-1 text-xs">
                    <li>• 1 point every 12 months (1 year)</li>
                    <li>• 1 point every 5 achievements unlocked</li>
                </ul>
            </div>
        </div>
    );
};
