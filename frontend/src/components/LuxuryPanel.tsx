import React from 'react';
import { Gem, Flame, Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react';
import type { GameState } from '../types';
import { LUXURY_CATALOG, LUXURY_SUBSCRIPTIONS } from '../engine/config';
import { LuxuryLogic } from '../engine/systems/LuxuryLogic';
import { formatCurrency, Section, Stat } from './ui';

interface LuxuryPanelProps {
    gameState: GameState;
    onBuyLuxury: (itemId: string) => void;
    onSellLuxury: (assetId: string) => void;
    onToggleSubscription: (subId: string) => void;
}

const kindTag: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    appreciating: { label: 'Appreciates', className: 'bg-emerald-500/15 text-emerald-300', icon: <TrendingUp size={11} /> },
    depreciating: { label: 'Depreciates', className: 'bg-red-500/15 text-red-300', icon: <TrendingDown size={11} /> },
    consumable: { label: 'Experience', className: 'bg-violet-500/15 text-violet-300', icon: <Sparkles size={11} /> },
};

export const LuxuryPanel: React.FC<LuxuryPanelProps> = ({ gameState, onBuyLuxury, onSellLuxury, onToggleSubscription }) => {
    const luxury = LuxuryLogic.normalize(gameState.luxury);
    const cash = gameState.cash;
    const monthlyBurn = LuxuryLogic.totalMonthlyBurn(luxury);
    const collectionValue = LuxuryLogic.totalValue(luxury);
    const activeSubs = new Set(luxury.subscriptions);

    // Count owned per catalog id so we can show quantity.
    const ownedByType = luxury.ownedAssets.reduce<Record<string, number>>((m, a) => {
        m[a.type] = (m[a.type] || 0) + 1; return m;
    }, {});

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Stat label="Cash Available" value={formatCurrency(cash)} tone={cash >= 0 ? 'good' : 'bad'} />
                <Stat label="Collection Value" value={formatCurrency(collectionValue)} tone="accent" sub={`${luxury.ownedAssets.length} item${luxury.ownedAssets.length !== 1 ? 's' : ''}`} />
                <Stat label="Monthly Burn" value={`${formatCurrency(monthlyBurn)}`} tone={monthlyBurn > 0 ? 'bad' : 'default'} sub="upkeep + indulgences" />
            </div>

            <div className="p-3 rounded-lg bg-amber-500/[0.07] border border-amber-500/25 text-amber-200/90 text-xs flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>Spending is the enemy of compounding — but you earned it. Toys depreciate and cost upkeep; only real estate holds its value. Every dollar here is a dollar not invested.</span>
            </div>

            {/* Owned collection */}
            {luxury.ownedAssets.length > 0 && (
                <Section icon={<Gem size={16} className="text-violet-400" />} title="Your Collection">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {luxury.ownedAssets.map(asset => {
                            const def = LUXURY_CATALOG.find(l => l.id === asset.type);
                            const change = asset.currentValue - asset.purchasePrice;
                            const changePct = asset.purchasePrice > 0 ? (change / asset.purchasePrice) * 100 : 0;
                            return (
                                <div key={asset.id} className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="flex items-center gap-2 font-bold text-white">
                                            <span className="text-xl">{def?.icon}</span> {asset.name}
                                        </span>
                                        {def && (
                                            <span className={`chip ${kindTag[def.kind].className}`}>
                                                {kindTag[def.kind].icon}{kindTag[def.kind].label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                                        <div><span className="text-slate-500 block">Current value</span><span className="text-white">{formatCurrency(asset.currentValue)}</span></div>
                                        <div>
                                            <span className="text-slate-500 block">Since purchase</span>
                                            <span className={change >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                                                {change >= 0 ? '+' : ''}{changePct.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div><span className="text-slate-500 block">Upkeep</span><span className="text-red-300">{formatCurrency(def?.upkeep ?? 0)}/mo</span></div>
                                        <div><span className="text-slate-500 block">Paid</span><span className="text-slate-300">{formatCurrency(asset.purchasePrice)}</span></div>
                                    </div>
                                    <button onClick={() => onSellLuxury(asset.id)} className="btn-danger-ghost w-full py-2 text-xs">
                                        Sell (~{formatCurrency(Math.round(asset.currentValue * (def?.kind === 'appreciating' ? 0.95 : 0.85)))})
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}

            {/* The toy store */}
            <Section icon={<Flame size={16} className="text-amber-400" />} title="The Toy Store">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {LUXURY_CATALOG.map(item => {
                        const affordable = cash >= item.cost;
                        const owned = ownedByType[item.id];
                        return (
                            <div key={item.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-3xl">{item.icon}</span>
                                    <span className={`chip ${kindTag[item.kind].className}`}>
                                        {kindTag[item.kind].icon}{kindTag[item.kind].label}
                                    </span>
                                </div>
                                <div className="font-bold text-white">{item.name}</div>
                                <div className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">{item.blurb}</div>
                                <div className="text-xs font-mono text-slate-400 space-y-0.5 mb-3">
                                    <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="text-white">{formatCurrency(item.cost)}</span></div>
                                    {item.upkeep > 0 && <div className="flex justify-between"><span className="text-slate-500">Upkeep</span><span className="text-red-300">{formatCurrency(item.upkeep)}/mo</span></div>}
                                    <div className="flex justify-between"><span className="text-slate-500">Happiness</span><span className="text-pink-300">+{item.happiness}</span></div>
                                </div>
                                <button
                                    onClick={() => onBuyLuxury(item.id)}
                                    disabled={!affordable}
                                    className="btn-go w-full py-2 text-sm"
                                >
                                    {affordable ? 'Buy' : 'Not enough cash'}
                                </button>
                                {owned > 0 && <div className="text-[10px] text-slate-500 text-center mt-1.5">You own {owned}</div>}
                            </div>
                        );
                    })}
                </div>
            </Section>

            {/* Monthly indulgences */}
            <Section icon={<Sparkles size={16} className="text-emerald-400" />} title="Monthly Indulgences">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {LUXURY_SUBSCRIPTIONS.map(sub => {
                        const active = activeSubs.has(sub.id);
                        const effects = [
                            sub.happiness && `+${sub.happiness} happiness`,
                            sub.energy && `+${sub.energy} energy`,
                            sub.strength && `+${sub.strength} strength`,
                        ].filter(Boolean).join(' · ');
                        return (
                            <button
                                key={sub.id}
                                onClick={() => onToggleSubscription(sub.id)}
                                className={`text-left rounded-xl border p-3 transition-all ${active
                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                    : 'border-white/10 bg-black/20 hover:bg-white/[0.05]'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="flex items-center gap-2 font-bold text-white text-sm">
                                        <span className="text-lg">{sub.icon}</span> {sub.name}
                                    </span>
                                    <span className={`chip ${active ? 'bg-emerald-500/25 text-emerald-200' : 'bg-white/5 text-slate-400'}`}>
                                        {active ? 'Active' : 'Off'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mb-1">{sub.blurb}</div>
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="text-red-300">{formatCurrency(sub.monthlyCost)}/mo</span>
                                    {effects && <span className="text-slate-500">{effects}</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Section>
        </div>
    );
};
