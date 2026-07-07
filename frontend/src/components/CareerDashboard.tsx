import React from 'react';
import type { GameState } from '../types';
import { GraduationCap, Target, AlertCircle, Home } from 'lucide-react';
import { LIFESTYLE_TIERS, TAX_RATE } from '../engine/config';
import { formatCurrency, Section, Stat, Bar } from './ui';

interface CareerDashboardProps {
    gameState: GameState;
    onToggleStudy: () => void;
    onSelectJob: (job: string) => void;
    onMakeDecision: (decisionId: string, optionId: string) => void;
    onUpdateLifestyle: (tier: string) => void;
}

const JOBS = [
    { id: 'Fast Food', emoji: '🍟', title: 'Fast Food Crew', pay: 18000, note: 'Low stress, dead end.' },
    { id: 'Warehouse', emoji: '📦', title: 'Warehouse Ops', pay: 24000, note: 'Physical labor, steady pay.' },
    { id: 'Sales', emoji: '💼', title: 'Door-to-Door Sales', pay: 30000, note: 'High burnout, high potential.' },
];

const LIFESTYLE_OPTIONS = ['Frugal', 'Moderate', 'Luxury'] as const;

export const CareerDashboard: React.FC<CareerDashboardProps> = ({
    gameState, onToggleStudy, onSelectJob, onMakeDecision, onUpdateLifestyle,
}) => {
    const { career, cash, lifestyle } = gameState;
    const hasJob = career.jobTitle !== '';
    const savingsPercent = Math.min((cash / career.savingsGoal) * 100, 100);
    const monthlyLiving = lifestyle.rent + lifestyle.food + lifestyle.transport + lifestyle.entertainment;
    const grossMonthly = career.salary / 12;
    const netMonthly = grossMonthly * (1 - TAX_RATE) - monthlyLiving - (career.isStudying ? career.tuitionCost : 0);

    // ── First-time job selection ──────────────────────────
    if (!hasJob) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Welcome to The Grind</h1>
                    <p className="text-slate-400">
                        You're 17 with {formatCurrency(cash)} to your name. Pick a first job to start earning —
                        your goal is to save {formatCurrency(career.savingsGoal)} and launch a business.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {JOBS.map(job => (
                        <button
                            key={job.id}
                            onClick={() => onSelectJob(job.id)}
                            className="panel-raised p-6 text-center hover:border-blue-500/50 hover:bg-white/[0.06] transition-all"
                        >
                            <div className="text-3xl mb-3">{job.emoji}</div>
                            <div className="font-bold text-white mb-1">{job.title}</div>
                            <div className="money text-blue-400 mb-2">{formatCurrency(job.pay)}<span className="text-xs text-slate-500">/yr</span></div>
                            <div className="text-xs text-slate-500">{job.note}</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Pending life decisions */}
            {career.pendingDecisions.length > 0 && (
                <Section icon={<AlertCircle size={16} className="text-amber-400" />} title="Life Decisions">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {career.pendingDecisions.map(d => (
                            <div key={d.id} className="bg-black/30 border border-amber-500/20 rounded-xl p-3">
                                <div className="font-bold text-white text-sm">{d.title}</div>
                                <p className="text-xs text-slate-400 mb-3">{d.description}</p>
                                <div className="space-y-2">
                                    {d.options.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => onMakeDecision(d.id, opt.id)}
                                            className="btn-ghost text-xs w-full py-2 px-3 justify-between"
                                        >
                                            <span>{opt.label}</span>
                                            {opt.cost !== 0 && (
                                                <span className={`font-mono ${opt.cost > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {opt.cost > 0 ? `-$${opt.cost}` : `+$${Math.abs(opt.cost)}`}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Financial overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Current Job" value={career.jobTitle} sub={`${formatCurrency(career.salary)}/yr`} />
                <Stat label="Education" value={career.educationLevel} tone="accent" />
                <Stat label="Net / Month" value={formatCurrency(netMonthly)} tone={netMonthly >= 0 ? 'good' : 'bad'} />
                <Stat label="Cash" value={formatCurrency(cash)} tone="good" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Savings goal */}
                <Section icon={<Target size={16} className="text-emerald-400" />} title="Business Fund">
                    <p className="text-sm text-slate-400 mb-3">
                        Save {formatCurrency(career.savingsGoal)} to quit and launch your first business.
                    </p>
                    <div className="flex items-center justify-between mb-2">
                        <span className="money text-2xl text-emerald-400">{formatCurrency(cash)}</span>
                        <span className="text-slate-500 text-sm font-mono">/ {formatCurrency(career.savingsGoal)}</span>
                    </div>
                    <Bar value={savingsPercent} color="bg-gradient-to-r from-emerald-600 to-emerald-400" />
                    <div className="text-xs text-slate-500 mt-1.5">{savingsPercent.toFixed(0)}% of the way there</div>
                </Section>

                {/* Education */}
                <Section icon={<GraduationCap size={16} className={career.isStudying ? 'text-amber-400' : 'text-slate-400'} />} title="Education">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Status</span>
                        <span className={career.isStudying ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {career.isStudying ? 'Enrolled' : 'Not studying'}
                        </span>
                    </div>
                    {career.isStudying && (
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Degree progress</span>
                                <span>{career.studyProgress} / 12 mo</span>
                            </div>
                            <Bar value={(career.studyProgress / 12) * 100} color="bg-amber-400" />
                            <div className="text-xs text-red-400 mt-1">Tuition -${career.tuitionCost}/mo</div>
                        </div>
                    )}
                    {career.educationLevel !== 'Master' ? (
                        <button
                            onClick={onToggleStudy}
                            className={career.isStudying ? 'btn-danger-ghost w-full py-2.5' : 'btn-primary w-full py-2.5'}
                        >
                            {career.isStudying ? 'Stop studying' : 'Enroll in night classes (-$400/mo)'}
                        </button>
                    ) : (
                        <div className="text-center p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-bold">
                            Max education reached
                        </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-2">Higher education promotes you to better-paying jobs with 401(k) benefits.</p>
                </Section>
            </div>

            {/* Lifestyle control (available any time you've moved out) */}
            {lifestyle.tier !== 'Parents' && lifestyle.tier !== 'Homeless' && (
                <Section icon={<Home size={16} className="text-blue-400" />} title="Lifestyle">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {LIFESTYLE_OPTIONS.map(tier => {
                            const t = LIFESTYLE_TIERS[tier];
                            const total = t.rent + t.food + t.transport + t.entertainment;
                            const active = lifestyle.tier === tier;
                            return (
                                <button
                                    key={tier}
                                    onClick={() => !active && onUpdateLifestyle(tier)}
                                    className={`text-left p-3 rounded-xl border transition-all ${active
                                        ? 'border-blue-500/60 bg-blue-500/10'
                                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-white text-sm">{tier}</span>
                                        {active && <span className="chip bg-blue-500/20 text-blue-300 text-[10px]">Current</span>}
                                    </div>
                                    <div className="money text-slate-300">{formatCurrency(total)}<span className="text-xs text-slate-500">/mo</span></div>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Nicer living recovers more energy each month but costs more.</p>
                </Section>
            )}
        </div>
    );
};
