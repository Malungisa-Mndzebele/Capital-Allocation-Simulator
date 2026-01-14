import { useEffect, useState } from 'react';
import { api } from './api/client';
import type { GameState } from './types';
import { TrendingUp, DollarSign, Activity, Calendar, Zap, ArrowUpRight, ArrowDownRight, Briefcase, BarChart3, AlertCircle } from 'lucide-react';

const USER_ID = 'player-1';

function App() {
    const [state, setState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = async () => {
        try {
            setLoading(true);
            const data = await api.getState(USER_ID);
            setState(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNextTurn = async () => {
        if (!state) return;
        setProcessing(true);
        setTimeout(async () => {
            const newState = await api.nextTurn(USER_ID);
            setState(newState);
            setProcessing(false);
        }, 600);
    };

    const handleBuyStock = async () => {
        if (!state) return;
        const amount = 5000;
        if (state.cash < amount) return;
        const newState = await api.buyAsset(USER_ID, 'STOCK', amount);
        setState(newState);
    };

    if (!state) return (
        <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center text-blue-500 animate-pulse">
            <Activity size={48} />
        </div>
    );

    const profit = state.business.revenue - state.business.expensesTotal;
    const isProfitable = profit > 0;

    return (
        <div className="min-h-screen text-gray-200 pb-20 selection:bg-blue-500/30">
            <nav className="fixed top-0 w-full glass-panel z-50 px-6 py-3 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 text-blue-400">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-none">CAPITAL<span className="text-blue-500">SIM</span></h1>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">Allocation Engine v1.0</div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <NavStat label="Net Worth" value={state.netWorth} highlight />
                    <div className="h-8 w-px bg-white/10"></div>
                    <NavStat label="Liquid Cash" value={state.cash} />
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Timeline</div>
                        <div className="text-xl font-mono text-blue-200">Month <span className="text-white">{state.month}</span></div>
                    </div>
                </div>
            </nav>

            <main className="pt-28 px-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-6">

                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <SectionHeader icon={<TrendingUp size={18} />} title="Business Operations" />

                    <div className="glass-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Briefcase size={100} />
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
                            <StatDisplay label="Revenue" value={state.business.revenue} type="currency" color="text-emerald-400" />
                            <StatDisplay label="Expenses" value={state.business.expensesTotal} type="currency" color="text-red-400" />

                            <div className="col-span-2 p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm text-gray-400">Net Operating Profit</span>
                                    <PercentBadge val={((profit / state.business.revenue) || 0) * 100} />
                                </div>
                                <div className={`text-3xl font-mono font-bold ${isProfitable ? 'text-emerald-400 text-glow' : 'text-red-500'}`}>
                                    {formatCurrency(profit)}
                                </div>
                            </div>

                            <StatDisplay label="Customers" value={state.business.demand} type="number" suffix="/mo" />
                            <StatDisplay label="Capacity" value={state.business.capacity} type="number" suffix="units" />
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">Operational Config</h3>
                        <div className="space-y-4">
                            <ConfigRow label="Product Price" value={formatCurrency(state.business.prices)} />
                            <ConfigRow label="Staff Count" value={state.business.staff} />
                            <ConfigRow label="Inventory Level" value={state.business.inventory} />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <SectionHeader icon={<Activity size={18} />} title="Market Intelligence" />

                    <div className="glass-card p-6 border-t-4 border-t-blue-500/50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs text-gray-400 uppercase mb-1">Global Economy</div>
                                <div className="text-2xl font-bold text-white">{state.market.cycleStage}</div>
                            </div>
                            <CycleIcon stage={state.market.cycleStage} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-500">Interest Rate</div>
                                <div className="text-xl font-mono text-blue-300">{(state.market.interestRate * 100).toFixed(2)}%</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-500">S&P 500</div>
                                <div className="text-xl font-mono text-purple-300">{state.market.stockMarketIndex.toFixed(0)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-0 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex justify-between items-center">
                                <span className="font-outfit font-bold">Portfolio Composition</span>
                                <BarChart3 size={16} className="text-gray-500" />
                            </div>
                        </div>
                        <div className="p-4 space-y-1">
                            <AssetItem name="Index Funds (S&P 500)" value={state.portfolio.stocksValue} total={state.netWorth} color="bg-purple-500" />
                            <AssetItem name="Government Bonds" value={state.portfolio.bondsValue} total={state.netWorth} color="bg-yellow-500" />
                            <AssetItem name="Real Estate" value={state.portfolio.realEstateValue} total={state.netWorth} color="bg-emerald-500" />
                            <AssetItem name="Cash Reserves" value={state.cash} total={state.netWorth} color="bg-blue-500" />
                        </div>

                        <div className="p-4 bg-black/20 border-t border-white/5">
                            <button
                                onClick={handleBuyStock}
                                disabled={state.cash < 5000}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                <DollarSign size={18} /> Alloate $5k to Stocks
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-140px)]">
                    <SectionHeader icon={<Calendar size={18} />} title="Event Log" />

                    <div className="glass-card flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {state.events.slice().reverse().map((evt: any, idx: number) => (
                                <EventCard key={idx} evt={evt} />
                            ))}
                            {state.events.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
                                    <AlertCircle size={32} />
                                    <span>No events recorded yet.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleNextTurn}
                        disabled={processing}
                        className="mt-6 w-full py-4 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl shadow-lg shadow-emerald-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3">
                        {processing ? (
                            <>Processing <span className="animate-spin">⟳</span></>
                        ) : (
                            <>PROCESS MONTH <ArrowUpRight strokeWidth={3} /></>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

const NavStat = ({ label, value, highlight = false }: { label: string, value: number, highlight?: boolean }) => (
    <div className="text-right">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</div>
        <div className={`font-mono text-xl font-bold ${highlight ? 'text-emerald-400 text-glow' : 'text-white'}`}>
            {formatCurrency(value)}
        </div>
    </div>
);

const SectionHeader = ({ icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 text-blue-400 mb-2 px-2">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
    </div>
);

const StatDisplay = ({ label, value, type, suffix, color = "text-white" }: any) => (
    <div>
        <div className="text-xs text-gray-500 uppercase mb-1 font-semibold">{label}</div>
        <div className={`font-mono text-xl ${color}`}>
            {type === 'currency' ? formatCurrency(value) : value.toLocaleString()}
            {suffix && <span className="text-sm text-gray-600 ml-1">{suffix}</span>}
        </div>
    </div>
);

const ConfigRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono text-white">{value}</span>
    </div>
);

const PercentBadge = ({ val }: { val: number }) => (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${val >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
        {val >= 0 ? '+' : ''}{val.toFixed(1)}%
    </span>
);

const CycleIcon = ({ stage }: { stage: string }) => {
    if (stage === 'Peak' || stage === 'Recovery') return <TrendingUp className="text-emerald-500" size={32} />;
    return <ArrowDownRight className="text-red-500" size={32} />;
};

const AssetItem = ({ name, value, total, color }: any) => {
    const percent = (value / total) * 100;
    return (
        <div className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-default group">
            <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{name}</span>
                <span className="text-sm font-mono text-gray-400 group-hover:text-white transition-colors">{formatCurrency(value)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${Math.max(percent, 0)}%` }}></div>
            </div>
        </div>
    );
};

const EventCard = ({ evt }: any) => (
    <div className="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Month {evt.month}</span>
        </div>
        <div className="text-sm font-medium text-gray-200 mb-1 leading-tight">{evt.description}</div>
        <div className="text-xs text-emerald-400 font-mono">{evt.impact}</div>
    </div>
);

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

export default App;
