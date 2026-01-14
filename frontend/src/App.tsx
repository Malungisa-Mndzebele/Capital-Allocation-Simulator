import { useEffect, useState } from 'react';
import { api } from './api/client';
import type { GameState } from './types';
import { TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';

const USER_ID = 'player-1';

function App() {
    const [state, setState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        const newState = await api.nextTurn(USER_ID);
        setState(newState);
        setLoading(false);
    };

    const handleBuyStock = async () => {
        if (!state) return;
        const amount = 5000;
        if (state.cash < amount) return alert("Not enough cash!");
        const newState = await api.buyAsset(USER_ID, 'STOCK', amount);
        setState(newState);
    };

    if (!state) return <div className="p-10 text-center">Loading Simulator...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Activity className="text-blue-500" />
                    <h1 className="text-xl font-bold tracking-wider">CAPITAL ALLOCATOR / SIM</h1>
                </div>

                <div className="flex gap-6 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-xs uppercase">Net Worth</span>
                        <span className="font-mono text-xl text-green-400">${state.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-xs uppercase">Cash</span>
                        <span className="font-mono text-xl text-white">${state.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-gray-700 pl-4">
                        <span className="text-gray-400 text-xs uppercase">Date</span>
                        <span className="font-mono text-xl text-blue-300">Month {state.month}</span>
                    </div>
                </div>
            </header>

            <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

                {/* Left Col: Business */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp size={20} /> Business Operations
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <StatBox label="Revenue" value={`$${state.business.revenue.toFixed(0)}`} color="text-green-400" />
                        <StatBox label="Expenses" value={`$${state.business.expensesTotal.toFixed(0)}`} color="text-red-400" />
                        <StatBox label="Profit" value={`$${(state.business.revenue - state.business.expensesTotal).toFixed(0)}`}
                            color={(state.business.revenue - state.business.expensesTotal) > 0 ? "text-green-400" : "text-red-500"} />
                        <StatBox label="Staff" value={state.business.staff} />
                        <StatBox label="Inventory" value={state.business.inventory} />
                        <StatBox label="Capacity" value={state.business.capacity} />
                    </div>

                    <div className="space-y-2">
                        <div className="bg-gray-700/50 p-3 rounded">
                            <div className="text-xs text-gray-400 mb-1">Pricing Strategy</div>
                            <div className="text-xl font-mono">${state.business.prices.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded">
                            <div className="text-xs text-gray-400 mb-1">Demand</div>
                            <div className="text-xl font-mono">{state.business.demand.toFixed(0)} / mo</div>
                        </div>
                    </div>
                </div>

                {/* Middle Col: Market & Investment */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity size={20} /> Market & Portfolio
                    </h2>

                    <div className="mb-6 p-4 bg-gray-900 rounded border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Market Cycle</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${state.market.cycleStage === 'Recession' ? 'bg-red-900 text-red-200' :
                                state.market.cycleStage === 'Peak' ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'
                                }`}>{state.market.cycleStage.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Interest Rate</span>
                            <span className="font-mono">{(state.market.interestRate * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">S&P 500 Index</span>
                            <span className="font-mono">{state.market.stockMarketIndex.toFixed(0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Assets</h3>
                        <AssetRow name="Index Fund" value={state.portfolio.stocksValue} />
                        <AssetRow name="Bonds" value={state.portfolio.bondsValue} />
                        <AssetRow name="Real Estate" value={state.portfolio.realEstateValue} />
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <button
                            onClick={handleBuyStock}
                            disabled={state.cash < 5000}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                            <DollarSign size={16} /> Buy $5k Stocks
                        </button>
                    </div>
                </div>

                {/* Right Col: Events Log */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl overflow-hidden flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar size={20} /> Monthly Log
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-2">
                        {state.events.slice().reverse().map((evt: any, idx: number) => (
                            <div key={idx} className="bg-gray-700/40 p-3 rounded border-l-2 border-blue-500">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Month {evt.month}</span>
                                </div>
                                <div className="font-medium text-sm">{evt.description}</div>
                                <div className="text-xs text-blue-300 mt-1">{evt.impact}</div>
                            </div>
                        ))}
                        {state.events.length === 0 && <div className="text-gray-500 text-smitalic">No events this month.</div>}
                    </div>
                </div>

            </main>

            <footer className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center z-10 shadow-2xl">
                <div className="text-gray-400 text-sm">
                    Press "Next Month" to process simulation.
                </div>
                <button
                    onClick={handleNextTurn}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-green-500/20 transition-all active:scale-95 flex items-center gap-2">
                    {loading ? 'Processing...' : 'NEXT MONTH >>'}
                </button>
            </footer>
        </div>
    );
}

const StatBox = ({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) => (
    <div className="bg-gray-900 p-3 rounded border border-gray-700">
        <div className="text-xs text-gray-500 uppercase mb-1">{label}</div>
        <div className={`font-mono font-bold ${color}`}>{value}</div>
    </div>
);

const AssetRow = ({ name, value }: { name: string, value: number }) => (
    <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded hover:bg-gray-700/50 transition-colors">
        <span className="font-medium">{name}</span>
        <span className="font-mono text-green-300">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
    </div>
);

export default App;
