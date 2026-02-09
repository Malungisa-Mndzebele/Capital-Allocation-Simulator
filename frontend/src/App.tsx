import { useState, useEffect } from 'react'
import './index.css'
import type { GameState } from './types'
import { getGameState, nextTurn, performAction } from './api/client'
import {
    TrendingUp,
    DollarSign,
    Activity,
    Briefcase,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    AlertCircle,
    Calendar,
    Skull,
    Home
} from 'lucide-react'
import { CareerDashboard } from './components/CareerDashboard'
import { PlayerSidebar } from './components/PlayerSidebar'
import { SkillTree } from './components/SkillTree'
import { NetWorthChart } from './components/NetWorthChart'
import { VisualProgression } from './components/VisualProgression'
import { ChallengeSelector } from './components/ChallengeSelector'
import { ScenarioSelector } from './components/ScenarioSelector'
import { ChallengeProgress } from './components/ChallengeProgress'
import { ScenarioProgress } from './components/ScenarioProgress'

// --- HELPER COMPONENTS ---

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

const AssetItem = ({ name, value, total, color, onSell }: any) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    const canSell = value > 0 && onSell;
    return (
        <div className="p-3 rounded-lg hover:bg-white/5 transition-colors group">
            <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{name}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-400 group-hover:text-white transition-colors">{formatCurrency(value)}</span>
                    {canSell && (
                        <button 
                            onClick={() => onSell(Math.min(5000, value))}
                            className="text-xs px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Sell
                        </button>
                    )}
                </div>
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

const PercentBadge = ({ val }: { val: number }) => (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${val >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
        {val >= 0 ? '+' : ''}{val.toFixed(1)}%
    </span>
);

const CycleIcon = ({ stage }: { stage: string }) => {
    if (stage === 'Peak' || stage === 'Recovery') return <TrendingUp className="text-emerald-500" size={32} />;
    return <ArrowDownRight className="text-red-500" size={32} />;
};


// --- MAIN APP ---

function App() {
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [processing, setProcessing] = useState<boolean>(false)
    const [showBusinessSelector, setShowBusinessSelector] = useState<boolean>(false)
    const [showLifestyleSelector, setShowLifestyleSelector] = useState<boolean>(false)
    const [showChallengeSelector, setShowChallengeSelector] = useState<boolean>(false)
    const [showScenarioSelector, setShowScenarioSelector] = useState<boolean>(false)
    const [activeTab, setActiveTab] = useState<'game' | 'skills' | 'stats'>('game')
    const userId = "user_123"

    // Initialization
    useEffect(() => {
        getGameState(userId).then(state => {
            setGameState(state)
            setLoading(false)
        }).catch(err => {
            console.error("Failed to load game:", err)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        if (gameState && gameState.player.age >= 21 && gameState.lifestyle.tier === 'Parents') {
            setShowLifestyleSelector(true);
        }
    }, [gameState]);

    // Derived State helper
    const profit = gameState?.business ? (gameState.business.revenue - gameState.business.expensesTotal) : 0;
    const isProfitable = profit > 0;

    // Safe destructuring — only used after loading guards below
    const business = gameState?.business;
    const market = gameState?.market;
    const portfolio = gameState?.portfolio;
    const events = gameState?.events;
    const cash = gameState?.cash ?? 0;
    const netWorth = gameState?.netWorth ?? 0;

    const handleNextTurn = async () => {
        if (!gameState) return;
        if (gameState.gameOver) return;

        if ((gameState.career.pendingDecisions && gameState.career.pendingDecisions.length > 0) ||
            (gameState.business.pendingDecisions && gameState.business.pendingDecisions.length > 0)) {
            return;
        }

        setProcessing(true);

        setTimeout(async () => {
            try {
                const newState = await nextTurn(userId);
                setGameState(newState);
            } catch (e) {
                console.error(e);
            } finally {
                setProcessing(false);
            }
        }, 600);
    };

    const handleToggleStudy = async () => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'TOGGLE_STUDY');
            setGameState(newState);
        } catch (e) {
            console.error(e);
        }
    }

    const handleSelectJob = async (job: string) => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'SELECT_JOB', { jobTitle: job });
            setGameState(newState);
        } catch (e) {
            console.error(e);
        }
    }

    const handleMakeDecision = async (decisionId: string, optionId: string) => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'MAKE_DECISION', { decisionId, optionId });
            setGameState(newState);
        } catch (e) {
            console.error(e);
        }
    }

    const handleStartBusiness = async (type: string) => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'START_BUSINESS', { businessType: type });
            setGameState(newState);
            setShowBusinessSelector(false);
        } catch (e) {
            console.error(e);
        }
    }

    const handleUpdateLifestyle = async (tier: string) => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'UPDATE_LIFESTYLE', { tier });
            setGameState(newState);
            setShowLifestyleSelector(false);
        } catch (e) {
            console.error(e);
        }
    }

    const handleBuyStock = async () => {
        if (!gameState) return;
        const amount = 5000;
        if (gameState.cash < amount) return;
        try {
            const newState = await performAction(userId, 'BUY_ASSET', { assetType: 'STOCK', amount });
            setGameState(newState);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSellAsset = async (assetType: 'STOCK' | 'BOND' | 'REAL_ESTATE', amount: number) => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'SELL_ASSET', { assetType, amount });
            setGameState(newState);
        } catch (e) {
            console.error(e);
            alert('Failed to sell asset: ' + (e as any).response?.data?.error || 'Unknown error');
        }
    };

    const handleRestart = async () => {
        if (!confirm("Are you sure you want to restart the game? current progress will be lost.")) return;
        try {
            const newState = await performAction(userId, 'RESET');
            setGameState(newState);
            setShowLifestyleSelector(false);
            setShowBusinessSelector(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnlockSkill = async (skillId: string) => {
        if (!gameState) return;
        try {
            const newState = await performAction(userId, 'UNLOCK_SKILL', { skillId });
            setGameState(newState);
        } catch (e) {
            console.error(e);
            alert('Failed to unlock skill: ' + (e as any).response?.data?.error || 'Unknown error');
        }
    };
    
    const handleStartChallenge = async (challengeId: string) => {
        if (!confirm("Starting a challenge will restart your game. Continue?")) return;
        try {
            const newState = await performAction(userId, 'START_CHALLENGE', { challengeId, difficulty: gameState?.difficulty || 'Normal' });
            setGameState(newState);
            setShowChallengeSelector(false);
        } catch (e) {
            console.error(e);
            alert('Failed to start challenge: ' + (e as any).response?.data?.error || 'Unknown error');
        }
    };
    
    const handleStartScenario = async (scenarioId: string) => {
        if (!confirm("Starting a scenario will restart your game. Continue?")) return;
        try {
            const newState = await performAction(userId, 'START_SCENARIO', { scenarioId });
            setGameState(newState);
            setShowScenarioSelector(false);
        } catch (e) {
            console.error(e);
            alert('Failed to start scenario: ' + (e as any).response?.data?.error || 'Unknown error');
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-blue-500 flex items-center justify-center font-mono animate-pulse">INITIALIZING SYSTEM...</div>
    if (!gameState) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono">CONNECTION FAILURE</div>

    if (gameState.gameOver) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-1000">
                <Skull size={120} className="text-red-600 mb-6 animate-pulse" />
                <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">GAME OVER</h1>
                <p className="text-xl text-red-400 font-mono mb-8 max-w-lg">{gameState.gameOverReason || 'Your journey has ended.'}</p>
                <div className="p-4 border border-white/10 rounded bg-white/5 text-gray-400 text-sm">
                    Final Net Worth: {formatCurrency(gameState.netWorth)} <br />
                    Age: {gameState.player.age}
                </div>
                <button onClick={handleRestart} className="mt-8 px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200">
                    RESTART SIMULATION
                </button>
            </div>
        )
    }

    // Common Wrapper with Sidebar
    return (
        <div className="flex h-screen bg-[#0a0b14] text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
            {/* Sidebar (Always Visible) */}
            <PlayerSidebar player={gameState.player} lifestyle={gameState.lifestyle} onRestart={handleRestart} />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Top Nav (Modified to fit space) */}
                <nav className="border-b border-white/5 bg-[#0a0b14]/90 backdrop-blur-md z-40 shrink-0">
                    <div className="px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded border border-white/10 ${gameState.level === 'Career' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-purple-600/20 border-purple-500/50'}`}>
                                {gameState.level === 'Career' ? <Briefcase size={20} className="text-blue-400" /> : <Zap size={20} className="text-purple-400" />}
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-widest text-white leading-none uppercase">{gameState.level} MODE</h1>
                                <div className="text-[10px] text-gray-500">MONTH {gameState.month}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <NavStat label="Cash" value={gameState.cash} />
                            <NavStat label="Net Worth" value={gameState.netWorth} highlight />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowChallengeSelector(true)}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50 rounded transition-all"
                                >
                                    🎯 Challenge
                                </button>
                                <button
                                    onClick={() => setShowScenarioSelector(true)}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 rounded transition-all"
                                >
                                    📖 Scenario
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Tab Navigation */}
                <div className="border-b border-white/5 bg-[#0a0b14]/90 backdrop-blur-md shrink-0">
                    <div className="px-6 flex gap-2">
                        <button
                            onClick={() => setActiveTab('game')}
                            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeTab === 'game'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            Game
                        </button>
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeTab === 'skills'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            Skills {gameState.skills.skillPoints > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-yellow-500/30 text-yellow-400 rounded text-xs">
                                    {gameState.skills.skillPoints}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeTab === 'stats'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            Stats
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">
                        {/* Challenge/Scenario Progress */}
                        {gameState.activeChallenge && (
                            <ChallengeProgress challengeId={gameState.activeChallenge} gameState={gameState} />
                        )}
                        {gameState.activeScenario && (
                            <ScenarioProgress scenarioId={gameState.activeScenario} gameState={gameState} />
                        )}
                        
                        {activeTab === 'game' && (
                            <>
                        {gameState.level === 'Career' ? (
                            <>
                                <CareerDashboard
                                    gameState={gameState}
                                    onToggleStudy={handleToggleStudy}
                                    onSelectJob={handleSelectJob}
                                    onNextMonth={handleNextTurn}
                                    onMakeDecision={handleMakeDecision}
                                />
                                {gameState.cash >= gameState.career.savingsGoal && (
                                    <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
                                        <button
                                            onClick={() => setShowBusinessSelector(true)}
                                            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 transition-all"
                                        >
                                            🚀 LAUNCH BUSINESS
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // BUSINESS DASHBOARD (Inline for now to save space in file)
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    <SectionHeader icon={<TrendingUp size={18} />} title={`${business?.type} Operations`} />

                                    <div className="glass-card p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Briefcase size={100} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
                                            <StatDisplay label="Revenue" value={business?.revenue ?? 0} type="currency" color="text-emerald-400" />
                                            <StatDisplay label="Expenses" value={business?.expensesTotal ?? 0} type="currency" color="text-red-400" />

                                            <div className="col-span-2 p-4 rounded-xl bg-black/20 border border-white/5">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-sm text-gray-400">Net Operating Profit</span>
                                                    <PercentBadge val={((profit / (business?.revenue || 1)) || 0) * 100} />
                                                </div>
                                                <div className={`text-3xl font-mono font-bold ${isProfitable ? 'text-emerald-400 text-glow' : 'text-red-500'}`}>
                                                    {formatCurrency(profit)}
                                                </div>
                                            </div>

                                            <StatDisplay label="Customers" value={business?.demand ?? 0} type="number" suffix="/mo" />
                                            <StatDisplay label="Capacity" value={business?.capacity ?? 0} type="number" suffix="units" />
                                        </div>
                                    </div>

                                    <div className="glass-card p-6">
                                        <h3 className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4">Operational Config</h3>
                                        <div className="space-y-4">
                                            <ConfigRow label="Product Price" value={formatCurrency(business?.prices ?? 0)} />
                                            <ConfigRow label="Staff Count" value={business?.staff ?? 0} />
                                            <ConfigRow label="Inventory Level" value={business?.inventory ?? 0} />
                                        </div>
                                    </div>

                                    {/* Pending Decisions Section */}
                                    {(business?.pendingDecisions?.length ?? 0) > 0 && (
                                        <div className="glass-card p-4 border border-yellow-500/30 bg-yellow-500/5 relative z-10">
                                            <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                                <AlertCircle size={20} />
                                                <h3 className="font-bold">Decisions Required ({business!.pendingDecisions.length})</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {business!.pendingDecisions.map(d => (
                                                    <div key={d.id} className="p-3 bg-black/40 rounded border border-white/10">
                                                        <div className="font-bold text-sm text-white">{d.title}</div>
                                                        <div className="text-xs text-gray-400 mb-2">{d.description}</div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {d.options.map(opt => (
                                                                <button key={opt.id} onClick={() => handleMakeDecision(d.id, opt.id)} className="text-xs bg-white/10 hover:bg-white/20 py-1.5 px-2 rounded text-left flex justify-between">
                                                                    <span>{opt.label}</span>
                                                                    <span className="text-gray-500">{opt.cost > 0 ? `-$${opt.cost}` : 'Free'}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    <SectionHeader icon={<Activity size={18} />} title="Market Intelligence" />

                                    <div className="glass-card p-6 border-t-4 border-t-blue-500/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase mb-1">Global Economy</div>
                                                <div className="text-2xl font-bold text-white">{market?.cycleStage}</div>
                                            </div>
                                            <CycleIcon stage={market?.cycleStage ?? 'Recovery'} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                                <div className="text-xs text-gray-500">Interest Rate</div>
                                                <div className="text-xl font-mono text-blue-300">{((market?.interestRate ?? 0) * 100).toFixed(2)}%</div>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                                <div className="text-xs text-gray-500">S&P 500</div>
                                                <div className="text-xl font-mono text-purple-300">{(market?.stockMarketIndex ?? 0).toFixed(0)}</div>
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
                                            <AssetItem 
                                                name="Index Funds (S&P 500)" 
                                                value={portfolio?.stocksValue ?? 0} 
                                                total={netWorth} 
                                                color="bg-purple-500" 
                                                onSell={(amt: number) => handleSellAsset('STOCK', amt)}
                                            />
                                            <AssetItem 
                                                name="Government Bonds" 
                                                value={portfolio?.bondsValue ?? 0} 
                                                total={netWorth} 
                                                color="bg-yellow-500"
                                                onSell={(amt: number) => handleSellAsset('BOND', amt)}
                                            />
                                            <AssetItem 
                                                name="Real Estate" 
                                                value={portfolio?.realEstateValue ?? 0} 
                                                total={netWorth} 
                                                color="bg-emerald-500"
                                                onSell={(amt: number) => handleSellAsset('REAL_ESTATE', amt)}
                                            />
                                            <AssetItem 
                                                name="Cash Reserves" 
                                                value={cash} 
                                                total={netWorth} 
                                                color="bg-blue-500"
                                            />
                                        </div>

                                        <div className="p-4 bg-black/20 border-t border-white/5">
                                            <button
                                                onClick={handleBuyStock}
                                                disabled={cash < 5000}
                                                className="w-full py-3 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                <DollarSign size={18} /> Allocate $5k to Stocks
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-140px)]">
                                    <SectionHeader icon={<Calendar size={18} />} title="Event Log" />

                                    <div className="glass-card flex-1 overflow-hidden flex flex-col">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                            {(events ?? []).slice().reverse().map((evt: any, idx: number) => (
                                                <EventCard key={idx} evt={evt} />
                                            ))}
                                            {(events ?? []).length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
                                                    <AlertCircle size={32} />
                                                    <span>No events recorded yet.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNextTurn}
                                        disabled={processing || ((business?.pendingDecisions?.length ?? 0) > 0)}
                                        className={`mt-6 w-full py-4 text-xl font-bold rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-3 ${((business?.pendingDecisions?.length ?? 0) > 0)
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
                                            : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white hover:-translate-y-1 shadow-emerald-500/20'
                                            }`}
                                    >
                                        {processing ? (
                                            <>Processing <span className="animate-spin">⟳</span></>
                                        ) : ((business?.pendingDecisions?.length ?? 0) > 0) ? (
                                            <><AlertCircle size={24} /> DECISIONS REQUIRED</>
                                        ) : (
                                            <>PROCESS MONTH <ArrowUpRight strokeWidth={3} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                            </>
                        )}
                        
                        {activeTab === 'skills' && (
                            <SkillTree 
                                skills={gameState.skills} 
                                onUnlockSkill={handleUnlockSkill}
                            />
                        )}
                        
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <VisualProgression 
                                    netWorth={gameState.netWorth}
                                    lifestyle={gameState.lifestyle.tier}
                                    level={gameState.level}
                                />
                                <NetWorthChart 
                                    netWorthHistory={gameState.netWorthHistory}
                                    currentNetWorth={gameState.netWorth}
                                    currentMonth={gameState.month}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Business Selection Modal */}
            {showBusinessSelector && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-2">Select Business Model</h2>
                        <p className="text-gray-400 mb-8">Choose your path to build an empire. Each business type has different capital requirements and scalability.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <button onClick={() => handleStartBusiness('Retail')} className="group p-4 rounded-xl border border-white/10 hover:border-blue-500 bg-white/5 hover:bg-blue-500/10 transition-all text-left">
                                <div className="mb-3 text-blue-400 group-hover:text-blue-300"><Briefcase size={28} /></div>
                                <div className="font-bold text-lg text-white mb-1">Retail</div>
                                <div className="text-xs text-gray-400 leading-relaxed">Stable cash flow, high inventory costs. <br /><span className="text-emerald-400">Med Risk / Med Reward</span></div>
                            </button>

                            <button onClick={() => handleStartBusiness('Tech')} className="group p-4 rounded-xl border border-white/10 hover:border-purple-500 bg-white/5 hover:bg-purple-500/10 transition-all text-left">
                                <div className="mb-3 text-purple-400 group-hover:text-purple-300"><Zap size={28} /></div>
                                <div className="font-bold text-lg text-white mb-1">Tech SaaS</div>
                                <div className="text-xs text-gray-400 leading-relaxed">Massive scalability, low initial revenue. <br /><span className="text-purple-400">High Risk / High Reward</span></div>
                            </button>

                            <button onClick={() => handleStartBusiness('Service')} className="group p-4 rounded-xl border border-white/10 hover:border-yellow-500 bg-white/5 hover:bg-yellow-500/10 transition-all text-left">
                                <div className="mb-3 text-yellow-400 group-hover:text-yellow-300"><Activity size={28} /></div>
                                <div className="font-bold text-lg text-white mb-1">Consulting</div>
                                <div className="text-xs text-gray-400 leading-relaxed">Immediate profit, limited by time. <br /><span className="text-yellow-400">Low Risk / Low Reward</span></div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowBusinessSelector(false)}
                            className="w-full py-3 text-gray-500 hover:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Lifestyle Selection Modal */}
            {showLifestyleSelector && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center mb-8">
                            <Home size={64} className="text-blue-500 mb-4" />
                            <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Time to Move Out!</h2>
                            <p className="text-gray-400 max-w-lg">You turned 21. Your parents have packed your bags. You must now pay for your own Rent, Food, and Transportation. Choose your lifestyle wisely.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <button onClick={() => handleUpdateLifestyle('Frugal')} className="group p-4 rounded-xl border border-white/10 hover:border-green-500 bg-white/5 hover:bg-green-500/10 transition-all text-center">
                                <div className="font-bold text-lg text-green-400 mb-1">Frugal</div>
                                <div className="text-2xl font-mono text-white mb-2">$1,200<span className="text-xs text-gray-500">/mo</span></div>
                                <div className="text-xs text-gray-400 leading-relaxed">Shared apartment, ramen noodles, public bus. <br /><span className="text-red-400">-Happ/Energy</span></div>
                            </button>

                            <button onClick={() => handleUpdateLifestyle('Moderate')} className="group p-4 rounded-xl border border-white/10 hover:border-blue-500 bg-white/5 hover:bg-blue-500/10 transition-all text-center">
                                <div className="font-bold text-lg text-blue-400 mb-1">Moderate</div>
                                <div className="text-2xl font-mono text-white mb-2">$2,600<span className="text-xs text-gray-500">/mo</span></div>
                                <div className="text-xs text-gray-400 leading-relaxed">Studio apartment, healthy food, used car. <br /><span className="text-green-400">Stable stats</span></div>
                            </button>

                            <button onClick={() => handleUpdateLifestyle('Luxury')} className="group p-4 rounded-xl border border-white/10 hover:border-purple-500 bg-white/5 hover:bg-purple-500/10 transition-all text-center">
                                <div className="font-bold text-lg text-purple-400 mb-1">Luxury</div>
                                <div className="text-2xl font-mono text-white mb-2">$5,700<span className="text-xs text-gray-500">/mo</span></div>
                                <div className="text-xs text-gray-400 leading-relaxed">Penthouse, eating out, sports car. <br /><span className="text-purple-400">++Energy/Happ</span></div>
                            </button>
                        </div>

                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-center">
                            <button
                                onClick={handleRestart}
                                className="text-red-500 hover:text-red-400 font-bold transition-colors flex items-center gap-2"
                            >
                                <Skull size={16} /> RESET GAME SAVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Challenge Selector Modal */}
            {showChallengeSelector && (
                <ChallengeSelector
                    onSelectChallenge={handleStartChallenge}
                    onClose={() => setShowChallengeSelector(false)}
                />
            )}
            
            {/* Scenario Selector Modal */}
            {showScenarioSelector && (
                <ScenarioSelector
                    onSelectScenario={handleStartScenario}
                    onClose={() => setShowScenarioSelector(false)}
                />
            )}
        </div>
    )
}

export default App
