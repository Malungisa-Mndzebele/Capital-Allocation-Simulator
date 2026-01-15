import React from 'react';
import type { PlayerStats, Lifestyle } from '../types';
import { User, Zap, Brain, BookOpen, Dumbbell, Home } from 'lucide-react';

interface PlayerSidebarProps {
    player: PlayerStats;
    lifestyle: Lifestyle;
}

const StatBar = ({ icon, label, value, color }: any) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-xs uppercase tracking-wider text-gray-400 font-bold">
            <span className="flex items-center gap-1">{icon} {label}</span>
            <span>{value.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    </div>
);

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ player, lifestyle }) => {
    return (
        <div className="w-full lg:w-72 bg-[#0F1016] border-r border-white/5 p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mb-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <User size={48} className="text-gray-300" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white">Player 1</h2>
                <div className="text-sm text-blue-400 font-mono">Age {player.age}</div>
            </div>

            <div className="mb-8">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Attributes</h3>
                <StatBar icon={<Dumbbell size={12} />} label="Strength" value={player.strength} color="bg-red-500" />
                <StatBar icon={<Brain size={12} />} label="Intellect" value={player.intelligence} color="bg-blue-500" />
                <StatBar icon={<BookOpen size={12} />} label="Wisdom" value={player.wisdom} color="bg-purple-500" />
                <StatBar icon={<Zap size={12} />} label="Energy" value={player.energy} color="bg-yellow-500" />
            </div>

            <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Lifestyle</h3>

                <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-2">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <Home size={16} />
                        <span className="font-bold">{lifestyle.tier}</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex justify-between"><span>Rent</span> <span>${lifestyle.rent}</span></div>
                        <div className="flex justify-between"><span>Food</span> <span>${lifestyle.food}</span></div>
                    </div>
                </div>

                {lifestyle.monthsMissedRent > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-bold animate-pulse">
                        ⚠️ MISSED RENT: {lifestyle.monthsMissedRent}/2 Months
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Family</h3>
                <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between items-center">
                        <span>Relationship</span>
                        <span className={player.relationshipStatus !== 'Single' ? 'text-pink-400 font-bold' : 'text-gray-500'}>
                            {player.relationshipStatus}
                        </span>
                    </div>
                    {player.relationshipStatus !== 'Single' && (
                        <div className="flex justify-between items-center text-xs text-gray-500 pl-2 border-l border-white/10">
                            <span>Cost</span>
                            <span>{player.relationshipStatus === 'Dating' ? '-$200/mo' : '-$800/mo'}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                        <span>Children</span>
                        <span className="font-bold text-white">{player.children}</span>
                    </div>
                    {player.children > 0 && (
                        <div className="flex justify-between items-center text-xs text-gray-500 pl-2 border-l border-white/10">
                            <span>Cost</span>
                            <span>-${player.children * 600}/mo</span>
                        </div>
                    )}

                    {player.isPregnant && (
                        <div className="p-2 mt-2 bg-pink-500/10 border border-pink-500/30 rounded text-pink-300 text-xs text-center font-bold animate-pulse">
                            👶 Baby Expected in {9 - player.pregnancyMonth} mos
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
