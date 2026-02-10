import React from 'react';
import type { PlayerStats, Lifestyle, RetirementState } from '../types';
import { User, Zap, Brain, BookOpen, Dumbbell, Home, RotateCcw, Shield } from 'lucide-react';

interface PlayerSidebarProps {
    player: PlayerStats;
    lifestyle: Lifestyle;
    retirement?: RetirementState;
    onRestart?: () => void;
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

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ player, lifestyle, retirement, onRestart }) => {
    const totalRetirementBalance = retirement?.accounts.reduce((sum, acc) => sum + acc.balance, 0) || 0;
    const hasRetirementAccounts = (retirement?.accounts.length || 0) > 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            maximumFractionDigits: 0 
        }).format(val);
    };

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

            <div className="mt-8 flex-1">
                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Personality</h3>
                <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center group relative">
                        <span className="text-gray-400">Risk Tolerance</span>
                        <span className="font-mono text-white">{player.riskTolerance.toFixed(0)}</span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 w-48 z-10">
                            Affects investment returns. Increases when buying stocks or taking loans.
                        </div>
                    </div>
                    <div className="flex justify-between items-center group relative">
                        <span className="text-gray-400">Work Ethic</span>
                        <span className="font-mono text-white">{player.workEthic.toFixed(0)}</span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 w-48 z-10">
                            Affects promotion chances. Increases when studying or working hard.
                        </div>
                    </div>
                    <div className="flex justify-between items-center group relative">
                        <span className="text-gray-400">Social Skills</span>
                        <span className="font-mono text-white">{player.socialSkills.toFixed(0)}</span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 w-48 z-10">
                            Affects negotiation and promotions. Increases through relationships.
                        </div>
                    </div>
                    <div className="flex justify-between items-center group relative">
                        <span className="text-gray-400">Creativity</span>
                        <span className="font-mono text-white">{player.creativity.toFixed(0)}</span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 w-48 z-10">
                            Affects business innovation. Increases when starting businesses.
                        </div>
                    </div>
                    <div className="flex justify-between items-center group relative">
                        <span className="text-gray-400">Discipline</span>
                        <span className="font-mono text-white">{player.discipline.toFixed(0)}</span>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 w-48 z-10">
                            Affects study speed. Increases when paying off loans early.
                        </div>
                    </div>
                </div>
            </div>

            {/* Retirement Summary */}
            {hasRetirementAccounts && (
                <div className="mt-8">
                    <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Retirement</h3>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-bold uppercase">Tax-Advantaged</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-emerald-400 mb-1">
                            {formatCurrency(totalRetirementBalance)}
                        </div>
                        <div className="text-xs text-gray-400">
                            {retirement!.accounts.length} account{retirement!.accounts.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            )}

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

            {onRestart && (
                <div className="mt-8 pt-4 border-t border-white/5">
                    <button
                        onClick={onRestart}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg text-sm font-bold transition-all text-center"
                    >
                        <RotateCcw size={14} /> RESTART GAME
                    </button>
                </div>
            )}
        </div>
    );
};
