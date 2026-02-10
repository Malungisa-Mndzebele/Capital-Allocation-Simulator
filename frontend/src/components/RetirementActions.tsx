import React, { useState } from 'react';
import { PlusCircle, TrendingDown, AlertTriangle, DollarSign, Info } from 'lucide-react';
import type { RetirementState, CareerState, BusinessState } from '../types';

interface RetirementActionsProps {
    retirement: RetirementState;
    career: CareerState;
    business: BusinessState;
    playerAge: number;
    cash: number;
    onOpenAccount: (accountType: string) => void;
    onSetContributionRate: (accountId: string, rate: number) => void;
    onWithdraw: (accountId: string, amount: number) => void;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: 0 
    }).format(val);
};

const getAccountTypeLabel = (type: string): string => {
    switch (type) {
        case '401k': return '401(k)';
        case 'traditional_ira': return 'Traditional IRA';
        case 'roth_ira': return 'Roth IRA';
        case 'solo_401k': return 'Solo 401(k)';
        default: return type;
    }
};

export const RetirementActions: React.FC<RetirementActionsProps> = ({
    retirement,
    career,
    business,
    playerAge,
    cash: _cash,
    onOpenAccount,
    onSetContributionRate,
    onWithdraw
}) => {
    const [showOpenAccount, setShowOpenAccount] = useState(false);
    const [showContributionRate, setShowContributionRate] = useState(false);
    const [showWithdrawal, setShowWithdrawal] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [contributionRate, setContributionRate] = useState<number>(0);
    const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);

    const has401k = career.has401k;
    const hasBusiness = business.type !== undefined && business.type !== null;
    const hasActive401k = retirement.accounts.some(acc => acc.type === '401k' && acc.isActive);
    const hasTraditionalIRA = retirement.accounts.some(acc => acc.type === 'traditional_ira');
    const hasRothIRA = retirement.accounts.some(acc => acc.type === 'roth_ira');
    const hasSolo401k = retirement.accounts.some(acc => acc.type === 'solo_401k');

    const canOpen401k = has401k && !hasActive401k;
    const canOpenTraditionalIRA = !hasTraditionalIRA;
    const canOpenRothIRA = !hasRothIRA;
    const canOpenSolo401k = hasBusiness && !hasSolo401k;

    const handleOpenAccountClick = (accountType: string) => {
        onOpenAccount(accountType);
        setShowOpenAccount(false);
    };

    const handleSetContributionRate = () => {
        if (selectedAccountId && contributionRate >= 0 && contributionRate <= 100) {
            onSetContributionRate(selectedAccountId, contributionRate);
            setShowContributionRate(false);
            setSelectedAccountId('');
            setContributionRate(0);
        }
    };

    const handleWithdraw = () => {
        if (selectedAccountId && withdrawalAmount > 0) {
            const account = retirement.accounts.find(acc => acc.id === selectedAccountId);
            if (account && withdrawalAmount <= account.balance) {
                onWithdraw(selectedAccountId, withdrawalAmount);
                setShowWithdrawal(false);
                setSelectedAccountId('');
                setWithdrawalAmount(0);
            }
        }
    };

    const calculateWithdrawalPenalty = (amount: number): { penalty: number; tax: number; net: number } => {
        const isEarlyWithdrawal = playerAge < 59.5;
        const penalty = isEarlyWithdrawal ? amount * 0.10 : 0;
        const tax = amount * 0.22; // Simplified tax rate
        const net = amount - penalty - tax;
        return { penalty, tax, net };
    };

    const selectedAccount = retirement.accounts.find(acc => acc.id === selectedAccountId);
    const withdrawalCalc = withdrawalAmount > 0 ? calculateWithdrawalPenalty(withdrawalAmount) : null;

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    onClick={() => setShowOpenAccount(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 rounded-lg font-bold transition-all"
                >
                    <PlusCircle size={18} />
                    Open Account
                </button>

                <button
                    onClick={() => setShowContributionRate(true)}
                    disabled={retirement.accounts.filter(acc => acc.isActive).length === 0}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DollarSign size={18} />
                    Set Contribution
                </button>

                <button
                    onClick={() => setShowWithdrawal(true)}
                    disabled={retirement.accounts.length === 0}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TrendingDown size={18} />
                    Withdraw
                </button>
            </div>

            {/* Open Account Modal */}
            {showOpenAccount && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-2">Open Retirement Account</h2>
                        <p className="text-gray-400 mb-6">Choose the type of retirement account to open.</p>

                        <div className="space-y-3 mb-6">
                            {canOpen401k && (
                                <button
                                    onClick={() => handleOpenAccountClick('401k')}
                                    className="w-full p-4 rounded-xl border border-white/10 hover:border-blue-500 bg-white/5 hover:bg-blue-500/10 transition-all text-left"
                                >
                                    <div className="font-bold text-lg text-blue-400 mb-1">401(k)</div>
                                    <div className="text-sm text-gray-400">
                                        Employer-sponsored plan with matching contributions. Pre-tax contributions.
                                    </div>
                                    <div className="text-xs text-emerald-400 mt-2">
                                        ✓ Employer match: {career.matchPercentage}% up to {career.matchLimit}%
                                    </div>
                                </button>
                            )}

                            {canOpenTraditionalIRA && (
                                <button
                                    onClick={() => handleOpenAccountClick('traditional_ira')}
                                    className="w-full p-4 rounded-xl border border-white/10 hover:border-purple-500 bg-white/5 hover:bg-purple-500/10 transition-all text-left"
                                >
                                    <div className="font-bold text-lg text-purple-400 mb-1">Traditional IRA</div>
                                    <div className="text-sm text-gray-400">
                                        Individual retirement account. Pre-tax contributions, lower annual limit.
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Annual limit: $7,000 {playerAge >= 50 ? '+ $1,000 catch-up' : ''}
                                    </div>
                                </button>
                            )}

                            {canOpenRothIRA && (
                                <button
                                    onClick={() => handleOpenAccountClick('roth_ira')}
                                    className="w-full p-4 rounded-xl border border-white/10 hover:border-emerald-500 bg-white/5 hover:bg-emerald-500/10 transition-all text-left"
                                >
                                    <div className="font-bold text-lg text-emerald-400 mb-1">Roth IRA</div>
                                    <div className="text-sm text-gray-400">
                                        After-tax contributions, tax-free growth and withdrawals in retirement.
                                    </div>
                                    <div className="text-xs text-emerald-400 mt-2">
                                        ✓ Tax-free withdrawals after age 59.5 & 5 years
                                    </div>
                                </button>
                            )}

                            {canOpenSolo401k && (
                                <button
                                    onClick={() => handleOpenAccountClick('solo_401k')}
                                    className="w-full p-4 rounded-xl border border-white/10 hover:border-yellow-500 bg-white/5 hover:bg-yellow-500/10 transition-all text-left"
                                >
                                    <div className="font-bold text-lg text-yellow-400 mb-1">Solo 401(k)</div>
                                    <div className="text-sm text-gray-400">
                                        For business owners. Higher contribution limits as both employer and employee.
                                    </div>
                                    <div className="text-xs text-yellow-400 mt-2">
                                        ✓ Higher limits: Up to $66,000 {playerAge >= 50 ? '+ $7,500 catch-up' : ''}
                                    </div>
                                </button>
                            )}

                            {!canOpen401k && !canOpenTraditionalIRA && !canOpenRothIRA && !canOpenSolo401k && (
                                <div className="p-4 bg-gray-800/50 rounded-lg text-center text-gray-400">
                                    No new accounts available. You've opened all eligible account types.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowOpenAccount(false)}
                            className="w-full py-3 text-gray-500 hover:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Set Contribution Rate Modal */}
            {showContributionRate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-2">Set Contribution Rate</h2>
                        <p className="text-gray-400 mb-6">Choose an account and set your contribution percentage.</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Select Account</label>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => {
                                        setSelectedAccountId(e.target.value);
                                        const account = retirement.accounts.find(acc => acc.id === e.target.value);
                                        if (account) {
                                            setContributionRate(account.contributionRate);
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Select Account --</option>
                                    {retirement.accounts.filter(acc => acc.isActive).map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {getAccountTypeLabel(acc.type)} - {formatCurrency(acc.balance)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedAccountId && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Contribution Rate: {contributionRate.toFixed(1)}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={contributionRate}
                                            onChange={(e) => setContributionRate(parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>

                                    {selectedAccount && selectedAccount.employerMatch > 0 && (
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
                                            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                                                <Info size={14} />
                                                <span className="font-bold">Employer Match</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Your employer matches {selectedAccount.employerMatch}% up to {selectedAccount.employerMatchLimit}% of salary.
                                                {contributionRate < selectedAccount.employerMatchLimit && (
                                                    <span className="block mt-1 text-yellow-400">
                                                        ⚠️ Increase to {selectedAccount.employerMatchLimit}% to maximize match!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSetContributionRate}
                                disabled={!selectedAccountId}
                                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Set Rate
                            </button>
                            <button
                                onClick={() => {
                                    setShowContributionRate(false);
                                    setSelectedAccountId('');
                                    setContributionRate(0);
                                }}
                                className="flex-1 py-3 text-gray-500 hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#1a1b26] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={24} className="text-red-500" />
                            <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
                        </div>
                        <p className="text-gray-400 mb-6">
                            {playerAge < 59.5 
                                ? 'Early withdrawal will incur penalties and taxes.'
                                : 'Withdrawals are penalty-free at your age.'}
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Select Account</label>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => {
                                        setSelectedAccountId(e.target.value);
                                        setWithdrawalAmount(0);
                                    }}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500 focus:outline-none"
                                >
                                    <option value="">-- Select Account --</option>
                                    {retirement.accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {getAccountTypeLabel(acc.type)} - {formatCurrency(acc.balance)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedAccountId && selectedAccount && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Withdrawal Amount
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={selectedAccount.balance}
                                            step="100"
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-red-500 focus:outline-none"
                                            placeholder="Enter amount"
                                        />
                                        <div className="text-xs text-gray-600 mt-1">
                                            Available: {formatCurrency(selectedAccount.balance)}
                                        </div>
                                    </div>

                                    {withdrawalCalc && withdrawalAmount > 0 && (
                                        <>
                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                                                <div className="text-sm font-bold text-red-400 mb-3">Withdrawal Breakdown</div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Gross Amount</span>
                                                        <span className="text-white font-mono">{formatCurrency(withdrawalAmount)}</span>
                                                    </div>
                                                    {withdrawalCalc.penalty > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-red-400">Early Withdrawal Penalty (10%)</span>
                                                            <span className="text-red-400 font-mono">-{formatCurrency(withdrawalCalc.penalty)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-yellow-400">Income Tax (22%)</span>
                                                        <span className="text-yellow-400 font-mono">-{formatCurrency(withdrawalCalc.tax)}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-2 border-t border-white/10">
                                                        <span className="text-white font-bold">Net Amount</span>
                                                        <span className="text-emerald-400 font-mono font-bold">{formatCurrency(withdrawalCalc.net)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                                                        <span>Total Cost</span>
                                                        <span>{((withdrawalCalc.penalty + withdrawalCalc.tax) / withdrawalAmount * 100).toFixed(1)}% of withdrawal</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Withdrawal Guidance */}
                                            {playerAge < 59.5 && (
                                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                                    <div className="text-xs font-bold text-yellow-400 mb-2">⚠️ Early Withdrawal Warning</div>
                                                    <div className="text-xs text-gray-300 space-y-1">
                                                        <p>You'll lose {((withdrawalCalc.penalty + withdrawalCalc.tax) / withdrawalAmount * 100).toFixed(0)}% to penalties and taxes.</p>
                                                        <p className="text-yellow-400">Consider alternatives:</p>
                                                        <ul className="list-disc list-inside ml-2 space-y-0.5">
                                                            <li>Take a loan instead</li>
                                                            <li>Reduce expenses temporarily</li>
                                                            <li>Wait until age 59.5 for penalty-free withdrawal</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {playerAge >= 59.5 && playerAge < 72 && (
                                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                                                    <div className="text-xs font-bold text-blue-400 mb-2">💡 Withdrawal Strategy</div>
                                                    <div className="text-xs text-gray-300 space-y-1">
                                                        <p>You're in the penalty-free withdrawal window!</p>
                                                        <p className="text-blue-400">Smart strategies:</p>
                                                        <ul className="list-disc list-inside ml-2 space-y-0.5">
                                                            <li>Withdraw only what you need</li>
                                                            <li>Consider tax implications</li>
                                                            <li>Leave funds invested for growth</li>
                                                            <li>Plan for RMDs starting at age 72</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {playerAge >= 72 && (
                                                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                                                    <div className="text-xs font-bold text-purple-400 mb-2">📋 RMD Period</div>
                                                    <div className="text-xs text-gray-300 space-y-1">
                                                        <p>You must take Required Minimum Distributions.</p>
                                                        <p className="text-purple-400">Important notes:</p>
                                                        <ul className="list-disc list-inside ml-2 space-y-0.5">
                                                            <li>Failure to take RMD = 50% penalty</li>
                                                            <li>RMD amount increases with age</li>
                                                            <li>Roth IRAs don't require RMDs</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleWithdraw}
                                disabled={!selectedAccountId || withdrawalAmount <= 0 || (selectedAccount && withdrawalAmount > selectedAccount.balance)}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Withdrawal
                            </button>
                            <button
                                onClick={() => {
                                    setShowWithdrawal(false);
                                    setSelectedAccountId('');
                                    setWithdrawalAmount(0);
                                }}
                                className="flex-1 py-3 text-gray-500 hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
