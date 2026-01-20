import React from 'react';
import type { GameState } from '../types';
import { Briefcase, GraduationCap, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';

interface CareerDashboardProps {
    gameState: GameState;
    onToggleStudy: () => void;
    onSelectJob: (job: string) => void;
    onNextMonth: () => void;
    onMakeDecision?: (decisionId: string, optionId: string) => void;
}

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ gameState, onToggleStudy, onSelectJob, onNextMonth, onMakeDecision }) => {
    const { career, cash, month } = gameState;
    const progressPercent = (career.studyProgress / 12) * 100; // Simplified 12-month per degree step for UI
    const savingsPercent = Math.min((cash / career.savingsGoal) * 100, 100);
    const hasJob = career.jobTitle !== '';

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full text-blue-100">
            {/* Header / Stats */}
            {!hasJob ? (
                <div className="glass-panel p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to The Grind</h1>
                    <p className="text-gray-400 mb-8 max-w-lg">You are 17 years old with $0 to your name. You need to start earning money immediately to cover living expenses.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <button onClick={() => onSelectJob('Fast Food')} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500 hover:bg-orange-500/10 transition-all group">
                            <div className="text-2xl mb-2">🍟</div>
                            <div className="text-lg font-bold text-white mb-1">Fast Food Crew</div>
                            <div className="text-orange-400 font-mono">$18,000/yr</div>
                            <div className="text-xs text-gray-500 mt-2">Low stress, dead end.</div>
                        </button>

                        <button onClick={() => onSelectJob('Warehouse')} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition-all group">
                            <div className="text-2xl mb-2">📦</div>
                            <div className="text-lg font-bold text-white mb-1">Warehouse Ops</div>
                            <div className="text-blue-400 font-mono">$24,000/yr</div>
                            <div className="text-xs text-gray-500 mt-2">Physical labor, steady pay.</div>
                        </button>

                        <button onClick={() => onSelectJob('Sales')} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500 hover:bg-green-500/10 transition-all group">
                            <div className="text-2xl mb-2">💼</div>
                            <div className="text-lg font-bold text-white mb-1">Door-to-Door Sales</div>
                            <div className="text-green-400 font-mono">$30,000/yr</div>
                            <div className="text-xs text-gray-500 mt-2">High burnout, high potential.</div>
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* PENDING DECISIONS */}
                    {career?.pendingDecisions?.length > 0 && (
                        <div className="w-full glass-card p-6 border border-yellow-500/30 bg-yellow-500/5 mb-6 relative z-10">
                            <div className="flex items-center gap-2 text-yellow-400 mb-4">
                                <AlertCircle size={24} />
                                <h2 className="text-xl font-bold uppercase tracking-widest">Life Decisions</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {career.pendingDecisions.map(d => (
                                    <div key={d.id} className="bg-black/40 p-4 rounded border border-white/10">
                                        <h3 className="font-bold text-white mb-1">{d.title}</h3>
                                        <p className="text-sm text-gray-400 mb-4">{d.description}</p>
                                        <div className="space-y-2">
                                            {d.options.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => onMakeDecision && onMakeDecision(d.id, opt.id)}
                                                    className="w-full p-2 text-sm bg-white/10 hover:bg-white/20 rounded flex justify-between items-center transition-colors"
                                                >
                                                    <span className="font-medium text-gray-200">{opt.label}</span>
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
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 flex flex-col items-center">
                            <span className="text-sm text-blue-400">Month</span>
                            <span className="text-2xl font-bold">{month}</span>
                        </div>
                        <div className="glass-card p-4 flex flex-col items-center">
                            <span className="text-sm text-blue-400">Cash / Goal</span>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold font-mono text-green-400">${cash.toFixed(0)}</span>
                                <span className="text-xs text-gray-500">of ${career.savingsGoal}</span>
                            </div>
                        </div>
                        <div className="glass-card p-4 flex flex-col items-center">
                            <span className="text-sm text-blue-400">Monthly Net Income</span>
                            <span className="text-2xl font-bold text-green-300">
                                ${((career.salary / 12) * 0.8 - career.expensesLiving - (career.isStudying ? career.tuitionCost : 0)).toFixed(0)}
                            </span>
                        </div>
                        <div className="glass-card p-4 flex flex-col items-center">
                            <span className="text-sm text-blue-400">Current Job</span>
                            <span className="text-xl font-bold text-white">{career.jobTitle}</span>
                            <span className="text-xs text-gray-400">${(career.salary / 1000).toFixed(0)}k/yr</span>
                        </div>
                    </div>

                    {/* Main Action Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Career & Work Panel */}
                        <div className="glass-panel p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Briefcase size={120} />
                            </div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Briefcase className="text-blue-400" /> Active Career
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span>Education Level</span>
                                    <span className="font-bold text-yellow-400">{career.educationLevel}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span>Monthly Gross Pay</span>
                                    <span>${(career.salary / 12).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span>Living Expenses</span>
                                    <span className="text-red-400">-${career.expensesLiving}</span>
                                </div>
                            </div>
                        </div>

                        {/* Education Panel */}
                        <div className={`glass-panel p-6 relative overflow-hidden transition-all ${career.isStudying ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <GraduationCap size={120} />
                            </div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <GraduationCap className={career.isStudying ? "text-yellow-400" : "text-gray-400"} />
                                Education Path
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span>Status</span>
                                    <span className={`font-bold ${career.isStudying ? 'text-green-400' : 'text-gray-500'}`}>
                                        {career.isStudying ? 'ENROLLED' : 'NOT STUDYING'}
                                    </span>
                                </div>
                                {career.isStudying && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Degree Progress</span>
                                            <span>{career.studyProgress} / 12 mos</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-yellow-400 h-full transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Tuition Cost</span>
                                            <span className="text-red-400">-${career.tuitionCost}/mo</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {career.educationLevel !== 'Master' ? (
                                <button
                                    onClick={onToggleStudy}
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${career.isStudying
                                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/50'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                                        }`}
                                >
                                    {career.isStudying ? 'Stop Studying' : 'Enroll in Night Classes (-$400/mo)'}
                                </button>
                            ) : (
                                <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 font-bold">
                                    MAX EDUCATION LEVEL REACHED
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Savings Goal Progress */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <DollarSign className="text-green-400" /> Capital Allocation Fund
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">Save $10,000 to quit your job and start your first business.</p>
                        <div className="w-full bg-gray-800 h-6 rounded-full overflow-hidden relative border border-white/10">
                            <div
                                className="bg-gradient-to-r from-green-600 to-emerald-400 h-full transition-all duration-700 items-center justify-end flex pr-2"
                                style={{ width: `${savingsPercent}%` }}
                            >
                                <span className="text-xs font-bold text-black drop-shadow-none">{savingsPercent.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Turn Projector */}
                    <button
                        onClick={onNextMonth}
                        disabled={career?.pendingDecisions?.length > 0}
                        className={`mt-4 w-full py-6 text-xl font-bold rounded-xl shadow-2xl border border-white/10 transition-all transform ${career?.pendingDecisions?.length > 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                    >
                        {career?.pendingDecisions?.length > 0 ? (
                            <span className="flex items-center justify-center gap-2"><AlertCircle size={24} /> DECISION REQUIRED</span>
                        ) : (
                            <>PROCESS MONTH {month} <ArrowRight className="inline ml-2" size={24} /></>
                        )}
                    </button>
                </>
            )}
        </div>
    );
};
