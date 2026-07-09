import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'
import type { GameState, EventLog } from './types'
import { getGameState, nextTurn, performAction, resetGame } from './api/client'
import {
    Briefcase, Zap, Shield, Trophy, TrendingUp, Landmark,
    ArrowRight, AlertCircle, Rocket, RotateCcw, Target, BookOpen, Sparkles, Gem,
} from 'lucide-react'

import { PlayerSidebar } from './components/PlayerSidebar'
import { CareerDashboard } from './components/CareerDashboard'
import { BusinessDashboard } from './components/BusinessDashboard'
import { FinancePanel } from './components/FinancePanel'
import { EventFeed } from './components/EventFeed'
import { SkillTree } from './components/SkillTree'
import { NetWorthChart } from './components/NetWorthChart'
import { VisualProgression } from './components/VisualProgression'
import { AchievementsPanel } from './components/AchievementsPanel'
import { ChallengeSelector } from './components/ChallengeSelector'
import { ScenarioSelector } from './components/ScenarioSelector'
import { ChallengeProgress } from './components/ChallengeProgress'
import { ScenarioProgress } from './components/ScenarioProgress'
import { RetirementDashboard } from './components/RetirementDashboard'
import { RetirementActions } from './components/RetirementActions'
import { RetirementTutorial } from './components/RetirementTutorial'
import { RetirementNotifications } from './components/RetirementNotifications'
import { GameOverScreen } from './components/GameOverScreen'
import { NewGameModal } from './components/NewGameModal'
import { LuxuryPanel } from './components/LuxuryPanel'
import { formatCurrency, formatCompact, Modal, ToastStack, type ToastMessage } from './components/ui'

const userId = 'user_123'
const HISTORY_CAP = 250
type Tab = 'game' | 'finance' | 'luxury' | 'retirement' | 'skills' | 'progress'
type Difficulty = 'Easy' | 'Normal' | 'Hard'

const BUSINESS_TYPES = [
    { id: 'Retail', icon: Briefcase, iconColor: 'text-blue-400', riskColor: 'text-blue-400', name: 'Retail', blurb: 'Stable cash flow, inventory-limited.', risk: 'Med risk / med reward' },
    { id: 'Tech', icon: Zap, iconColor: 'text-violet-400', riskColor: 'text-violet-400', name: 'Tech SaaS', blurb: 'Huge scalability, slow start.', risk: 'High risk / high reward' },
    { id: 'Service', icon: Sparkles, iconColor: 'text-amber-400', riskColor: 'text-amber-400', name: 'Consulting', blurb: 'Immediate profit, capped by hours.', risk: 'Low risk / low reward' },
]

function App() {
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [eventHistory, setEventHistory] = useState<EventLog[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('game')

    const [showBusinessSelector, setShowBusinessSelector] = useState(false)
    const [showChallengeSelector, setShowChallengeSelector] = useState(false)
    const [showScenarioSelector, setShowScenarioSelector] = useState(false)
    const [showRetirementTutorial, setShowRetirementTutorial] = useState(false)
    const [showNewGame, setShowNewGame] = useState(false)
    const [hasSeenRetirementTutorial, setHasSeenRetirementTutorial] = useState(false)

    const [toasts, setToasts] = useState<ToastMessage[]>([])
    const toastId = useRef(0)
    const prevStateRef = useRef<GameState | null>(null)

    const notify = useCallback((text: string, kind: 'error' | 'info' = 'error') => {
        const id = ++toastId.current
        setToasts(t => [...t, { id, text, kind }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
    }, [])

    const dismissToast = (id: number) => setToasts(t => t.filter(x => x.id !== id))

    // Apply a new state while maintaining a persistent event log. The engine
    // clears state.events every turn, so we accumulate them here.
    const apply = useCallback((newState: GameState, fresh = false) => {
        const prev = prevStateRef.current
        setEventHistory(hist => {
            let added: EventLog[]
            if (fresh || !prev) {
                added = newState.events
                hist = []
            } else if (newState.month !== prev.month) {
                added = newState.events // a turn was processed (events reset then repopulated)
            } else {
                added = newState.events.slice(prev.events.length) // an action appended within the month
            }
            return [...added].reverse().concat(hist).slice(0, HISTORY_CAP)
        })
        prevStateRef.current = newState
        setGameState(newState)
    }, [])

    // Run an action, applying the result or surfacing the error as a toast.
    const run = useCallback(async (fn: () => Promise<GameState>, fresh = false) => {
        try {
            apply(await fn(), fresh)
        } catch (e) {
            notify(e instanceof Error ? e.message : 'Something went wrong')
        }
    }, [apply, notify])

    // Initial load
    useEffect(() => {
        getGameState(userId)
            .then(state => apply(state, true))
            .catch(err => notify(err instanceof Error ? err.message : 'Failed to load game'))
            .finally(() => setLoading(false))
    }, [apply, notify])

    // Retirement tutorial when first eligible for a 401(k)
    useEffect(() => {
        if (gameState && !hasSeenRetirementTutorial && gameState.career.has401k && gameState.retirement.accounts.length === 0) {
            setShowRetirementTutorial(true)
            setHasSeenRetirementTutorial(true)
        }
    }, [gameState, hasSeenRetirementTutorial])

    // Dynamic document title
    useEffect(() => {
        if (!gameState) { document.title = 'Capital Allocation Simulator'; return }
        document.title = `${gameState.level} · ${formatCompact(gameState.netWorth)} — Capital Allocator`
    }, [gameState?.level, gameState?.netWorth])

    // ── Handlers ──────────────────────────────────────────
    const handleNextTurn = () => {
        if (!gameState || gameState.gameOver || processing) return
        if (gameState.career.pendingDecisions.length > 0 || gameState.business.pendingDecisions.length > 0) return
        setProcessing(true)
        setTimeout(async () => {
            await run(() => nextTurn(userId))
            setProcessing(false)
        }, 350)
    }

    const act = (action: string, payload?: Record<string, unknown>) => run(() => performAction(userId, action, payload))

    const handleNewGame = (difficulty: Difficulty) => {
        run(() => resetGame(userId, difficulty), true)
        setShowNewGame(false)
        setShowBusinessSelector(false)
        setActiveTab('game')
        setHasSeenRetirementTutorial(false)
    }

    const handleStartChallenge = (challengeId: string) => {
        run(() => performAction(userId, 'START_CHALLENGE', { challengeId, difficulty: gameState?.difficulty || 'Normal' }), true)
        setShowChallengeSelector(false)
        setActiveTab('game')
    }

    const handleStartScenario = (scenarioId: string) => {
        run(() => performAction(userId, 'START_SCENARIO', { scenarioId }), true)
        setShowScenarioSelector(false)
        setActiveTab('game')
    }

    // ── Render guards ─────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-blue-400 font-mono animate-pulse">
            Loading simulation…
        </div>
    )
    if (!gameState) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-red-400 font-mono">
            Could not load the game.
            <button onClick={() => handleNewGame('Normal')} className="btn-primary px-6 py-2">Start fresh</button>
        </div>
    )
    if (gameState.gameOver) {
        return (
            <>
                <GameOverScreen gameState={gameState} onNewGame={handleNewGame} />
                <ToastStack toasts={toasts} onDismiss={dismissToast} />
            </>
        )
    }

    const { level, month, cash, netWorth, career, business } = gameState
    const pendingDecisions = career.pendingDecisions.length + business.pendingDecisions.length
    const canLaunchBusiness = level === 'Career' && cash >= career.savingsGoal
    const ageProgress = ((gameState.player.age - 17) / (65 - 17)) * 100
    const retirementCount = gameState.retirement.accounts.length

    const luxuryCount = gameState.luxury?.ownedAssets?.length || 0
    const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
        { id: 'game', label: 'Game', icon: level === 'Career' ? <Briefcase size={14} /> : <TrendingUp size={14} /> },
        { id: 'finance', label: 'Finance', icon: <Landmark size={14} /> },
        { id: 'luxury', label: 'Luxury', icon: <Gem size={14} />, badge: luxuryCount || undefined, badgeColor: 'bg-violet-500/30 text-violet-300' },
        { id: 'retirement', label: 'Retirement', icon: <Shield size={14} />, badge: retirementCount || undefined, badgeColor: 'bg-emerald-500/30 text-emerald-300' },
        { id: 'skills', label: 'Skills', icon: <Sparkles size={14} />, badge: gameState.skills.skillPoints || undefined, badgeColor: 'bg-amber-500/30 text-amber-300' },
        { id: 'progress', label: 'Progress', icon: <Trophy size={14} /> },
    ]

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-[#0b0d16] text-slate-100">
            <PlayerSidebar
                player={gameState.player}
                lifestyle={gameState.lifestyle}
                retirement={gameState.retirement}
                creditScore={gameState.creditScore}
            />

            <div className="flex-1 flex flex-col lg:h-full lg:overflow-hidden min-w-0">
                {/* Header */}
                <header className="shrink-0 sticky top-0 lg:static z-30 border-b border-white/5 bg-[#0b0d16]/95 backdrop-blur-md">
                    <div className="px-5 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg border ${level === 'Career' ? 'bg-blue-600/15 border-blue-500/40' : 'bg-violet-600/15 border-violet-500/40'}`}>
                                {level === 'Career' ? <Briefcase size={18} className="text-blue-400" /> : <Zap size={18} className="text-violet-400" />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-white uppercase tracking-wide leading-none">{level} Mode</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Month {month} · Age {gameState.player.age}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="text-right hidden sm:block">
                                <div className="label">Cash</div>
                                <div className="money text-lg text-white">{formatCurrency(cash)}</div>
                            </div>
                            <div className="text-right">
                                <div className="label">Net Worth</div>
                                <div className={`money text-lg ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(netWorth)}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowChallengeSelector(true)} title="Challenges" className="btn-ghost px-2.5 py-2 text-xs"><Target size={15} /></button>
                                <button onClick={() => setShowScenarioSelector(true)} title="Scenarios" className="btn-ghost px-2.5 py-2 text-xs"><BookOpen size={15} /></button>
                                <button onClick={() => setShowNewGame(true)} title="New game" className="btn-ghost px-2.5 py-2 text-xs"><RotateCcw size={15} /></button>
                            </div>
                        </div>
                    </div>
                    {/* Lifetime progress 17 → 65 */}
                    <div className="h-0.5 bg-white/5">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700" style={{ width: `${ageProgress}%` }} />
                    </div>
                </header>

                {/* Tabs */}
                <nav className="shrink-0 border-b border-white/5 px-5 flex gap-1 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab ${activeTab === t.id ? 'tab-active' : ''}`}>
                            {t.icon}{t.label}
                            {t.badge !== undefined && <span className={`chip ${t.badgeColor}`}>{t.badge}</span>}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-5 md:p-6">
                    <div className="max-w-7xl mx-auto space-y-6 pb-4">
                        {gameState.activeChallenge && <ChallengeProgress challengeId={gameState.activeChallenge} gameState={gameState} />}
                        {gameState.activeScenario && <ScenarioProgress scenarioId={gameState.activeScenario} gameState={gameState} />}

                        {activeTab === 'game' && (
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 xl:col-span-8 space-y-6">
                                    {level === 'Career' ? (
                                        <CareerDashboard
                                            gameState={gameState}
                                            onToggleStudy={() => act('TOGGLE_STUDY')}
                                            onSelectJob={job => act('SELECT_JOB', { jobTitle: job })}
                                            onMakeDecision={(decisionId, optionId) => act('MAKE_DECISION', { decisionId, optionId })}
                                            onUpdateLifestyle={tier => act('UPDATE_LIFESTYLE', { tier })}
                                        />
                                    ) : (
                                        <BusinessDashboard
                                            gameState={gameState}
                                            onUpdateBusiness={update => act('UPDATE_BUSINESS', update)}
                                            onMakeDecision={(decisionId, optionId) => act('MAKE_DECISION', { decisionId, optionId })}
                                        />
                                    )}
                                </div>
                                <div className="col-span-12 xl:col-span-4">
                                    <div className="xl:sticky xl:top-0 h-[60vh] xl:h-[calc(100vh-13rem)]">
                                        <EventFeed history={eventHistory} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'finance' && (
                            <FinancePanel
                                gameState={gameState}
                                onTakeLoan={(loanType, amount) => act('TAKE_LOAN', { loanType, amount })}
                                onPayLoan={(loanId, amount) => act('PAY_LOAN', { loanId, amount })}
                                onBuyAsset={(assetType, amount) => act('BUY_ASSET', { assetType, amount })}
                                onSellAsset={(assetType, amount) => act('SELL_ASSET', { assetType, amount })}
                            />
                        )}

                        {activeTab === 'luxury' && (
                            <LuxuryPanel
                                gameState={gameState}
                                onBuyLuxury={itemId => act('BUY_LUXURY', { itemId })}
                                onSellLuxury={assetId => act('SELL_LUXURY', { assetId })}
                                onToggleSubscription={subId => act('TOGGLE_SUBSCRIPTION', { subId })}
                            />
                        )}

                        {activeTab === 'retirement' && (
                            <div className="space-y-6">
                                <RetirementNotifications retirement={gameState.retirement} career={career} playerAge={gameState.player.age} grossIncome={career.salary} />
                                <RetirementActions
                                    retirement={gameState.retirement} career={career} business={business}
                                    playerAge={gameState.player.age} cash={cash}
                                    onOpenAccount={accountType => act('OPEN_RETIREMENT_ACCOUNT', { accountType })}
                                    onSetContributionRate={(accountId, rate) => act('SET_CONTRIBUTION_RATE', { accountId, contributionRate: rate })}
                                    onWithdraw={(accountId, amount) => act('WITHDRAW_RETIREMENT', { accountId, amount })}
                                />
                                <RetirementDashboard retirement={gameState.retirement} playerAge={gameState.player.age} grossIncome={career.salary} />
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <SkillTree skills={gameState.skills} onUnlockSkill={skillId => act('UNLOCK_SKILL', { skillId })} />
                        )}

                        {activeTab === 'progress' && (
                            <div className="space-y-6">
                                <VisualProgression netWorth={netWorth} lifestyle={gameState.lifestyle.tier} level={level} />
                                <div className="panel-raised p-5">
                                    <NetWorthChart netWorthHistory={gameState.netWorthHistory} currentNetWorth={netWorth} currentMonth={month} />
                                </div>
                                <AchievementsPanel achievements={gameState.achievements} />
                            </div>
                        )}
                    </div>
                </main>

                {/* Persistent action bar */}
                <footer className="shrink-0 sticky bottom-0 lg:static z-30 border-t border-white/5 bg-[#0b0d16]/95 backdrop-blur-md px-5 py-3">
                    <div className="max-w-7xl mx-auto flex items-center gap-3">
                        {canLaunchBusiness && (
                            <button onClick={() => setShowBusinessSelector(true)} className="btn-go px-5 py-3 shrink-0">
                                <Rocket size={18} /> Launch Business
                            </button>
                        )}
                        <div className="flex-1 text-sm text-slate-500 hidden md:block">
                            {pendingDecisions > 0
                                ? <span className="text-amber-400 flex items-center gap-2"><AlertCircle size={15} /> Resolve {pendingDecisions} decision{pendingDecisions > 1 ? 's' : ''} to continue</span>
                                : canLaunchBusiness
                                    ? 'Goal reached — launch a business, or keep saving.'
                                    : 'Advance time to earn income and progress.'}
                        </div>
                        <button
                            onClick={handleNextTurn}
                            disabled={processing || pendingDecisions > 0}
                            className="btn-primary px-6 py-3 text-base min-w-[180px]"
                        >
                            {processing
                                ? <>Processing<span className="animate-spin ml-1">⟳</span></>
                                : pendingDecisions > 0
                                    ? <><AlertCircle size={18} /> Decisions Required</>
                                    : <>Process Month {month} <ArrowRight size={18} /></>}
                        </button>
                    </div>
                </footer>
            </div>

            {/* Modals */}
            {showBusinessSelector && (
                <Modal onClose={() => setShowBusinessSelector(false)} wide>
                    <h2 className="text-2xl font-bold text-white mb-1">Select a Business Model</h2>
                    <p className="text-slate-400 mb-6 text-sm">
                        Startup cost is {formatCurrency(10000)} (less with the Entrepreneur skill). This ends Career mode.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {BUSINESS_TYPES.map(b => (
                            <button
                                key={b.id}
                                onClick={() => { act('START_BUSINESS', { businessType: b.id }); setShowBusinessSelector(false); setActiveTab('game') }}
                                className="text-left panel-raised p-5 hover:bg-white/[0.06] transition-all"
                            >
                                <b.icon size={24} className={`mb-3 ${b.iconColor}`} />
                                <div className="font-bold text-white mb-1">{b.name}</div>
                                <div className="text-xs text-slate-400 mb-2 leading-relaxed">{b.blurb}</div>
                                <div className={`text-xs font-bold ${b.riskColor}`}>{b.risk}</div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowBusinessSelector(false)} className="w-full py-2.5 text-slate-500 hover:text-white text-sm">Cancel</button>
                </Modal>
            )}

            {showChallengeSelector && <ChallengeSelector onSelectChallenge={handleStartChallenge} onClose={() => setShowChallengeSelector(false)} />}
            {showScenarioSelector && <ScenarioSelector onSelectScenario={handleStartScenario} onClose={() => setShowScenarioSelector(false)} />}
            {showNewGame && <NewGameModal onStart={handleNewGame} onClose={() => setShowNewGame(false)} title="Start a New Run" />}
            {showRetirementTutorial && (
                <RetirementTutorial
                    onClose={() => setShowRetirementTutorial(false)}
                    employerMatch={career.matchPercentage}
                    employerMatchLimit={career.matchLimit}
                    contributionLimit={23000}
                    playerAge={gameState.player.age}
                />
            )}

            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </div>
    )
}

export default App
