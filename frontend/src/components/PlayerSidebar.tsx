import React from 'react';
import type { PlayerStats, Lifestyle, RetirementState } from '../types';
import { User, Zap, Brain, BookOpen, Dumbbell, Heart, Home, Shield, Baby } from 'lucide-react';
import { formatCurrency, Bar } from './ui';

interface PlayerSidebarProps {
    player: PlayerStats;
    lifestyle: Lifestyle;
    retirement?: RetirementState;
    creditScore: number;
}

const AttributeRow = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <div>
        <div className="flex justify-between items-center mb-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            <span className="flex items-center gap-1.5">{icon} {label}</span>
            <span className="text-slate-300">{value.toFixed(0)}</span>
        </div>
        <Bar value={value} color={color} />
    </div>
);

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ player, lifestyle, retirement, creditScore }) => {
    const totalRetirementBalance = retirement?.accounts.reduce((sum, acc) => sum + acc.balance, 0) || 0;
    const hasRetirementAccounts = (retirement?.accounts.length || 0) > 0;
    const monthlyLiving = lifestyle.rent + lifestyle.food + lifestyle.transport + lifestyle.entertainment;

    return (
        <aside className="w-full lg:w-72 shrink-0 bg-[#0d0f18] border-b lg:border-b-0 lg:border-r border-white/5 p-5 flex flex-col lg:h-full lg:overflow-y-auto">
            {/* Identity */}
            <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mb-3 shadow-[0_0_24px_rgba(96,165,250,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#0d0f18] flex items-center justify-center">
                        <User size={40} className="text-slate-300" />
                    </div>
                </div>
                <h2 className="text-lg font-bold text-white">You</h2>
                <div className="text-sm text-blue-400 font-mono">Age {player.age}</div>
            </div>

            {/* Attributes */}
            <div className="mb-6">
                <h3 className="label mb-3 border-b border-white/5 pb-2">Attributes</h3>
                <div className="space-y-3">
                    <AttributeRow icon={<Heart size={12} />} label="Happiness" value={player.happiness} color="bg-pink-500" />
                    <AttributeRow icon={<Zap size={12} />} label="Energy" value={player.energy} color="bg-amber-500" />
                    <AttributeRow icon={<Brain size={12} />} label="Intellect" value={player.intelligence} color="bg-blue-500" />
                    <AttributeRow icon={<BookOpen size={12} />} label="Wisdom" value={player.wisdom} color="bg-violet-500" />
                    <AttributeRow icon={<Dumbbell size={12} />} label="Strength" value={player.strength} color="bg-red-500" />
                </div>
                {player.happiness <= 30 && (
                    <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px]">
                        Low happiness is cutting your productivity to 70%.
                    </div>
                )}
            </div>

            {/* Lifestyle */}
            <div className="mb-6">
                <h3 className="label mb-3 border-b border-white/5 pb-2">Lifestyle</h3>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 font-bold text-emerald-400">
                            <Home size={15} /> {lifestyle.tier}
                        </span>
                        <span className="money text-sm text-red-300">-{formatCurrency(monthlyLiving)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <span className="flex justify-between"><span>Rent</span><span>${lifestyle.rent}</span></span>
                        <span className="flex justify-between"><span>Food</span><span>${lifestyle.food}</span></span>
                        <span className="flex justify-between"><span>Transport</span><span>${lifestyle.transport}</span></span>
                        <span className="flex justify-between"><span>Fun</span><span>${lifestyle.entertainment}</span></span>
                    </div>
                </div>
                {lifestyle.monthsMissedRent > 0 && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[11px] font-bold">
                        ⚠️ Missed rent: {lifestyle.monthsMissedRent}/2 months — eviction imminent
                    </div>
                )}
            </div>

            {/* Family */}
            <div className="mb-6">
                <h3 className="label mb-3 border-b border-white/5 pb-2">Family</h3>
                <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Relationship</span>
                        <span className={player.relationshipStatus !== 'Single' ? 'text-pink-400 font-bold' : 'text-slate-500'}>
                            {player.relationshipStatus}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Children</span>
                        <span className="text-white font-bold">{player.children}</span>
                    </div>
                    {player.isPregnant && (
                        <div className="mt-2 p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-300 text-[11px] text-center font-bold flex items-center justify-center gap-1">
                            <Baby size={12} /> Baby due in {9 - player.pregnancyMonth} months
                        </div>
                    )}
                </div>
            </div>

            {/* Financial snapshot */}
            <div className="mt-auto space-y-3">
                {hasRetirementAccounts && (
                    <div className="bg-emerald-500/[0.08] border border-emerald-500/25 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                            <Shield size={13} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Retirement</span>
                        </div>
                        <div className="money text-xl text-emerald-400">{formatCurrency(totalRetirementBalance)}</div>
                        <div className="text-[11px] text-slate-500">
                            {retirement!.accounts.length} account{retirement!.accounts.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between text-xs bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
                    <span className="text-slate-400">Credit Score</span>
                    <span className={`font-mono font-bold ${creditScore >= 670 ? 'text-emerald-400' : creditScore >= 600 ? 'text-amber-400' : 'text-red-400'}`}>
                        {creditScore}
                    </span>
                </div>
            </div>
        </aside>
    );
};
