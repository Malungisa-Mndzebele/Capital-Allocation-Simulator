import React, { useState } from 'react';
import { Store, Activity, Users, Package, AlertCircle, Minus, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { GameState } from '../types';
import { formatCurrency, Section, Stat, Bar } from './ui';

interface BusinessDashboardProps {
    gameState: GameState;
    onUpdateBusiness: (update: { prices?: number; staff?: number }) => void;
    onMakeDecision: (decisionId: string, optionId: string) => void;
}

const LABOR_COST: Record<string, number> = { Retail: 3000, Tech: 4000, Service: 5000 };
const BASE_PRICE: Record<string, number> = { Retail: 10, Tech: 30, Service: 150 };

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ gameState, onUpdateBusiness, onMakeDecision }) => {
    const { business, market } = gameState;
    const [priceInput, setPriceInput] = useState<string | null>(null);

    const profit = business.revenue - business.expensesTotal;
    const margin = business.revenue > 0 ? (profit / business.revenue) * 100 : 0;
    // Mirror of the engine's price elasticity: interested buyers scale with basePrice/price.
    const effectiveDemand = Math.round(business.demand * (BASE_PRICE[business.type] / Math.max(business.prices, 0.01)));
    const utilization = Math.min(100, (effectiveDemand / Math.max(business.capacity, 1)) * 100);
    const laborPerHead = LABOR_COST[business.type];

    const priceStep = business.type === 'Service' ? 10 : 1;
    const commitPrice = (value: number) => {
        if (value > 0 && value !== business.prices) onUpdateBusiness({ prices: value });
        setPriceInput(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Operations ─────────────────────────────────── */}
            <Section icon={<Store size={16} className="text-violet-400" />} title={`${business.type} Operations`}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <Stat label="Revenue" value={formatCurrency(business.revenue)} tone="good" sub="last month" />
                    <Stat label="Expenses" value={formatCurrency(business.expensesTotal)} tone="bad" sub="last month" />
                </div>

                <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="label">Net Operating Profit</span>
                        <span className={`chip ${profit >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                            {profit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {margin.toFixed(1)}% margin
                        </span>
                    </div>
                    <div className={`money text-3xl ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(profit)}<span className="text-sm text-slate-500">/mo</span>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>Buyer interest at this price: <span className="font-mono text-white">{effectiveDemand.toLocaleString()}</span></span>
                        <span>Capacity: <span className="font-mono text-white">{business.capacity.toLocaleString()}</span></span>
                    </div>
                    <Bar value={utilization} color={utilization > 95 ? 'bg-amber-500' : 'bg-violet-500'} />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                        {utilization > 95
                            ? 'Demand exceeds capacity — you can raise prices without losing sales.'
                            : 'Capacity to spare — lower prices attract more buyers.'}
                    </p>
                </div>

                {/* Controls — these drive the engine's UPDATE_BUSINESS action */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-3">
                        <div>
                            <div className="label">Product price</div>
                            <div className="text-[11px] text-slate-500">Higher price → fewer interested buyers</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => commitPrice(Math.max(priceStep, business.prices - priceStep))} className="btn-ghost w-8 h-8 p-0"><Minus size={14} /></button>
                            <input
                                className="field w-24 text-center"
                                value={priceInput ?? String(business.prices)}
                                onChange={e => setPriceInput(e.target.value)}
                                onBlur={() => priceInput !== null && commitPrice(parseFloat(priceInput) || business.prices)}
                                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            />
                            <button onClick={() => commitPrice(business.prices + priceStep)} className="btn-ghost w-8 h-8 p-0"><Plus size={14} /></button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-3">
                        <div>
                            <div className="label flex items-center gap-1"><Users size={12} /> Staff</div>
                            <div className="text-[11px] text-slate-500">{formatCurrency(laborPerHead)}/mo each</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => business.staff > 1 && onUpdateBusiness({ staff: business.staff - 1 })} disabled={business.staff <= 1} className="btn-ghost w-8 h-8 p-0"><Minus size={14} /></button>
                            <span className="money text-lg w-10 text-center">{business.staff}</span>
                            <button onClick={() => onUpdateBusiness({ staff: business.staff + 1 })} className="btn-ghost w-8 h-8 p-0"><Plus size={14} /></button>
                        </div>
                    </div>

                    {business.type === 'Retail' && (
                        <div className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-3">
                            <div className="label flex items-center gap-1"><Package size={12} /> Inventory</div>
                            <span className="money text-lg">{business.inventory.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </Section>

            {/* ── Market & Decisions ─────────────────────────── */}
            <div className="space-y-6">
                <Section icon={<Activity size={16} className="text-blue-400" />} title="Market Conditions">
                    <div className="grid grid-cols-2 gap-3">
                        <Stat
                            label="Economic Cycle"
                            value={market.cycleStage}
                            tone={market.cycleStage === 'Peak' || market.cycleStage === 'Recovery' ? 'good' : 'bad'}
                        />
                        <Stat label="S&P 500 Index" value={market.stockMarketIndex.toFixed(0)} tone="accent" />
                        <Stat label="Interest Rate" value={`${(market.interestRate * 100).toFixed(2)}%`} />
                        <Stat label="Inflation" value={`${(market.inflationRate * 100).toFixed(1)}%`} />
                    </div>
                </Section>

                {business.pendingDecisions.length > 0 && (
                    <Section
                        icon={<AlertCircle size={16} className="text-amber-400" />}
                        title={`Decisions Required (${business.pendingDecisions.length})`}
                    >
                        <div className="space-y-3">
                            {business.pendingDecisions.map(d => (
                                <div key={d.id} className="bg-black/30 border border-amber-500/20 rounded-xl p-3">
                                    <div className="font-bold text-sm text-white">{d.title}</div>
                                    <div className="text-xs text-slate-400 mb-3">{d.description}</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {d.options.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => onMakeDecision(d.id, opt.id)}
                                                className="btn-ghost text-xs py-2 px-3 justify-between"
                                            >
                                                <span>{opt.label}</span>
                                                <span className={opt.cost > 0 ? 'text-red-400 font-mono' : 'text-slate-500 font-mono'}>
                                                    {opt.cost > 0 ? `-$${opt.cost.toLocaleString()}` : 'Free'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
};
