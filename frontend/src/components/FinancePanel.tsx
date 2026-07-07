import React, { useState } from 'react';
import { Landmark, TrendingUp, GraduationCap, Store, Home, Info } from 'lucide-react';
import type { GameState } from '../types';
import { LoanLogic } from '../engine/systems/LoanLogic';
import { MAX_LOAN_AMOUNTS } from '../engine/config';
import { formatCurrency, Section, Stat, Bar } from './ui';

interface FinancePanelProps {
    gameState: GameState;
    onTakeLoan: (loanType: 'student' | 'business' | 'mortgage', amount: number) => void;
    onPayLoan: (loanId: string, amount: number) => void;
    onBuyAsset: (assetType: 'STOCK' | 'BOND' | 'REAL_ESTATE', amount: number) => void;
    onSellAsset: (assetType: 'STOCK' | 'BOND' | 'REAL_ESTATE', amount: number) => void;
}

const LOAN_PRODUCTS = [
    { type: 'student' as const, name: 'Student Loan', icon: GraduationCap, term: '10 yr', baseRate: 0.045, note: 'Fund your education.' },
    { type: 'business' as const, name: 'Business Loan', icon: Store, term: '5 yr', baseRate: 0.08, note: 'Capital for your venture.' },
    { type: 'mortgage' as const, name: 'Mortgage', icon: Home, term: '30 yr', baseRate: 0.065, note: 'Leverage into real estate.' },
];

const ASSETS = [
    { type: 'STOCK' as const, name: 'Index Funds (S&P 500)', color: 'bg-violet-500', text: 'text-violet-300' },
    { type: 'BOND' as const, name: 'Government Bonds', color: 'bg-amber-500', text: 'text-amber-300' },
    { type: 'REAL_ESTATE' as const, name: 'Real Estate', color: 'bg-emerald-500', text: 'text-emerald-300' },
];

const creditRating = (score: number) => {
    if (score >= 800) return { label: 'Excellent', tone: 'text-emerald-400' };
    if (score >= 740) return { label: 'Very Good', tone: 'text-emerald-300' };
    if (score >= 670) return { label: 'Good', tone: 'text-blue-300' };
    if (score >= 600) return { label: 'Fair', tone: 'text-amber-300' };
    return { label: 'Poor — loans denied', tone: 'text-red-400' };
};

export const FinancePanel: React.FC<FinancePanelProps> = ({ gameState, onTakeLoan, onPayLoan, onBuyAsset, onSellAsset }) => {
    const { creditScore, loans, portfolio, cash, level, month } = gameState;
    const [loanAmounts, setLoanAmounts] = useState<Record<string, string>>({});
    const [tradeAmounts, setTradeAmounts] = useState<Record<string, string>>({});

    const rating = creditRating(creditScore);
    const investingActive = level !== 'Career';
    const assetValue = (t: string) =>
        t === 'STOCK' ? portfolio.stocksValue : t === 'BOND' ? portfolio.bondsValue : portfolio.realEstateValue;
    const portfolioTotal = portfolio.stocksValue + portfolio.bondsValue + portfolio.realEstateValue;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* ── Credit & Loans ─────────────────────────────── */}
            <div className="space-y-6">
                <Section icon={<Landmark size={16} className="text-blue-400" />} title="Credit & Loans">
                    <div className="flex items-center gap-4 mb-5">
                        <div>
                            <div className="label mb-1">Credit Score</div>
                            <div className="money text-3xl text-white">{creditScore}</div>
                            <div className={`text-xs font-bold ${rating.tone}`}>{rating.label}</div>
                        </div>
                        <div className="flex-1 self-center">
                            <Bar value={creditScore - 300} max={550} color={creditScore >= 670 ? 'bg-emerald-500' : creditScore >= 600 ? 'bg-amber-500' : 'bg-red-500'} />
                            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                                <span>300</span><span>850</span>
                            </div>
                        </div>
                    </div>

                    {loans.length > 0 ? (
                        <div className="space-y-3 mb-5">
                            <div className="label">Active loans</div>
                            {loans.map(loan => (
                                <div key={loan.id} className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm text-white capitalize">{loan.type} loan</span>
                                        <span className="chip bg-white/5 text-slate-300 border border-white/10">
                                            {(loan.interestRate * 100).toFixed(2)}% APR
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-3">
                                        <div><span className="text-slate-500 block">Balance</span><span className="text-red-300">{formatCurrency(loan.balance)}</span></div>
                                        <div><span className="text-slate-500 block">Payment</span><span className="text-slate-200">{formatCurrency(loan.monthlyPayment)}/mo</span></div>
                                        <div><span className="text-slate-500 block">Remaining</span><span className="text-slate-200">{loan.remainingMonths} mo</span></div>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1000, 5000].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => onPayLoan(loan.id, amt)}
                                                disabled={cash < Math.min(amt, loan.balance)}
                                                className="btn-ghost text-xs px-3 py-1.5 flex-1"
                                            >
                                                Pay ${amt >= 1000 ? `${amt / 1000}k` : amt}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => onPayLoan(loan.id, loan.balance)}
                                            disabled={cash < loan.balance}
                                            className="btn-go text-xs px-3 py-1.5 flex-1"
                                        >
                                            Pay off ({formatCurrency(loan.balance)})
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500 mb-5">No active loans. Debt-free! 🎉</div>
                    )}

                    <div className="label mb-3">Borrow</div>
                    {creditScore < 600 && (
                        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                            <Info size={14} /> Your credit score is below 600 — lenders will reject you.
                        </div>
                    )}
                    <div className="space-y-3">
                        {LOAN_PRODUCTS.map(product => {
                            const raw = loanAmounts[product.type] ?? '';
                            const amount = parseInt(raw) || 0;
                            const max = MAX_LOAN_AMOUNTS[product.type];
                            // Same rate formula the engine uses, so the preview is exact.
                            const preview = amount > 0
                                ? LoanLogic.createLoan(product.type, amount, month, creditScore)
                                : null;
                            return (
                                <div key={product.type} className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="flex items-center gap-2 font-bold text-sm text-white">
                                            <product.icon size={15} className="text-blue-400" /> {product.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            ~{(product.baseRate * 100).toFixed(1)}% · {product.term} · max {formatCurrency(max)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            max={max}
                                            placeholder={`Amount (max ${formatCurrency(max)})`}
                                            className="field"
                                            value={raw}
                                            onChange={e => setLoanAmounts({ ...loanAmounts, [product.type]: e.target.value })}
                                        />
                                        <button
                                            onClick={() => { onTakeLoan(product.type, amount); setLoanAmounts({ ...loanAmounts, [product.type]: '' }); }}
                                            disabled={amount <= 0 || amount > max || creditScore < 600}
                                            className="btn-primary px-4 py-2 text-sm shrink-0"
                                        >
                                            Borrow
                                        </button>
                                    </div>
                                    {preview && amount <= max && (
                                        <div className="text-xs text-slate-400 font-mono mt-2">
                                            → {(preview.interestRate * 100).toFixed(2)}% APR, {formatCurrency(preview.monthlyPayment)}/mo for {preview.remainingMonths} months
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            </div>

            {/* ── Investments ────────────────────────────────── */}
            <div className="space-y-6">
                <Section icon={<TrendingUp size={16} className="text-violet-400" />} title="Investment Portfolio">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Stat label="Invested" value={formatCurrency(portfolioTotal)} tone="accent" />
                        <Stat label="Cash Available" value={formatCurrency(cash)} tone={cash >= 0 ? 'good' : 'bad'} />
                    </div>

                    {!investingActive && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            <span>You can buy assets now, but market growth only compounds once you run a business. Focus on your savings goal first.</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {ASSETS.map(asset => {
                            const value = assetValue(asset.type);
                            const raw = tradeAmounts[asset.type] ?? '';
                            const amount = parseInt(raw) || 0;
                            return (
                                <div key={asset.type} className="bg-black/20 border border-white/5 rounded-xl p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="flex items-center gap-2 text-sm font-bold text-white">
                                            <span className={`w-2.5 h-2.5 rounded-sm ${asset.color}`} /> {asset.name}
                                        </span>
                                        <span className={`money text-sm ${asset.text}`}>{formatCurrency(value)}</span>
                                    </div>
                                    <Bar value={value} max={Math.max(portfolioTotal, 1)} color={asset.color} />
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            type="number"
                                            min={0}
                                            placeholder="Amount"
                                            className="field"
                                            value={raw}
                                            onChange={e => setTradeAmounts({ ...tradeAmounts, [asset.type]: e.target.value })}
                                        />
                                        <button
                                            onClick={() => { onBuyAsset(asset.type, amount); setTradeAmounts({ ...tradeAmounts, [asset.type]: '' }); }}
                                            disabled={amount <= 0 || amount > cash}
                                            className="btn-go px-4 py-2 text-sm shrink-0"
                                        >
                                            Buy
                                        </button>
                                        <button
                                            onClick={() => { onSellAsset(asset.type, amount); setTradeAmounts({ ...tradeAmounts, [asset.type]: '' }); }}
                                            disabled={amount <= 0 || amount > value}
                                            className="btn-danger-ghost px-4 py-2 text-sm shrink-0"
                                        >
                                            Sell
                                        </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[1000, 5000, 25000].map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => setTradeAmounts({ ...tradeAmounts, [asset.type]: String(preset) })}
                                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                ${preset / 1000}k
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setTradeAmounts({ ...tradeAmounts, [asset.type]: String(Math.floor(Math.max(cash, 0))) })}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            Max cash
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-4">Selling incurs a 2% transaction fee.</p>
                </Section>
            </div>
        </div>
    );
};
