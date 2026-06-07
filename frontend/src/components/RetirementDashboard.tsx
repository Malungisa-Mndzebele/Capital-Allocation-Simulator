import React from 'react';
import { PiggyBank, TrendingUp, Shield, Clock, AlertCircle } from 'lucide-react';
import type { RetirementState } from '../types';

interface RetirementDashboardProps {
    retirement: RetirementState;
    playerAge: number;
    grossIncome: number;
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

const getAccountTypeColor = (type: string): string => {
    switch (type) {
        case '401k': return 'text-blue-400';
        case 'traditional_ira': return 'text-purple-400';
        case 'roth_ira': return 'text-emerald-400';
        case 'solo_401k': return 'text-yellow-400';
        default: return 'text-gray-400';
    }
};

const getContributionLimit = (type: string, age: number): number => {
    const isCatchUp = age >= 50;
    
    if (type === '401k' || type === 'solo_401k') {
        return isCatchUp ? 30500 : 23000; // 2024 limits with catch-up
    } else if (type === 'traditional_ira' || type === 'roth_ira') {
        return isCatchUp ? 8000 : 7000; // 2024 IRA limits with catch-up
    }
    return 0;
};

export const RetirementDashboard: React.FC<RetirementDashboardProps> = ({ 
    retirement, 
    playerAge,
    grossIncome 
}) => {
    const totalRetirementBalance = retirement.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Calculate contribution limits
    const limit401k = getContributionLimit('401k', playerAge);
    const limitIRA = getContributionLimit('traditional_ira', playerAge);
    
    const remaining401k = Math.max(0, limit401k - retirement.currentYearContributions401k);
    const remainingIRA = Math.max(0, limitIRA - retirement.currentYearContributionsIRA);

    if (retirement.accounts.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <PiggyBank size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Retirement Accounts</h3>
                <p className="text-gray-400 text-sm">
                    Open a retirement account to start saving for your future with tax advantages.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="glass-card p-6 border-t-4 border-t-emerald-500/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Shield size={24} className="text-emerald-400" />
                        <h2 className="text-lg font-bold text-white">Retirement Savings</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase">Total Balance</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">
                            {formatCurrency(totalRetirementBalance)}
                        </div>
                    </div>
                </div>

                {/* Contribution Limits Summary */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">401(k) Remaining</div>
                        <div className="text-lg font-mono text-blue-300">
                            {formatCurrency(remaining401k)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            of {formatCurrency(limit401k)} limit
                        </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">IRA Remaining</div>
                        <div className="text-lg font-mono text-purple-300">
                            {formatCurrency(remainingIRA)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            of {formatCurrency(limitIRA)} limit
                        </div>
                    </div>
                </div>

                {playerAge >= 50 && (
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-xs flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>Catch-up contributions enabled (Age 50+)</span>
                    </div>
                )}
            </div>

            {/* Individual Accounts */}
            <div className="space-y-4">
                {retirement.accounts.map((account) => {
                    const vestedAmount = account.balance - account.unvestedBalance;
                    const vestedPercentage = account.vestingSchedule.vestedPercentage;
                    const monthlyContribution = (grossIncome / 12) * (account.contributionRate / 100);
                    const monthlyEmployerMatch = account.employerMatch > 0 
                        ? Math.min(
                            (grossIncome / 12) * (account.contributionRate / 100) * (account.employerMatch / 100),
                            (grossIncome / 12) * (account.employerMatchLimit / 100)
                          )
                        : 0;

                    return (
                        <div 
                            key={account.id} 
                            className={`glass-card p-5 ${!account.isActive ? 'opacity-60 border-gray-700' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${getAccountTypeColor(account.type)}`}>
                                        <PiggyBank size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${getAccountTypeColor(account.type)}`}>
                                            {getAccountTypeLabel(account.type)}
                                        </h3>
                                        <div className="text-xs text-gray-500">
                                            Account Age: {Math.floor(account.accountAge / 12)}y {account.accountAge % 12}m
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-mono font-bold text-white">
                                        {formatCurrency(account.balance)}
                                    </div>
                                    {!account.isActive && (
                                        <div className="text-xs text-gray-500 mt-1">Inactive</div>
                                    )}
                                </div>
                            </div>

                            {/* Contribution Info */}
                            {account.isActive && account.contributionRate > 0 && (
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-white/5 p-2 rounded">
                                        <div className="text-xs text-gray-500">Your Contribution</div>
                                        <div className="text-sm font-mono text-white">
                                            {account.contributionRate.toFixed(1)}% ({formatCurrency(monthlyContribution)}/mo)
                                        </div>
                                    </div>
                                    {account.employerMatch > 0 && (
                                        <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/30">
                                            <div className="text-xs text-emerald-400">Employer Match</div>
                                            <div className="text-sm font-mono text-emerald-300">
                                                {account.employerMatch}% up to {account.employerMatchLimit}% ({formatCurrency(monthlyEmployerMatch)}/mo)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Vesting Status */}
                            {account.unvestedBalance > 0 && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-400">Vesting Status</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Vested Amount</span>
                                            <span className="text-white font-mono">{formatCurrency(vestedAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Unvested Amount</span>
                                            <span className="text-yellow-400 font-mono">{formatCurrency(account.unvestedBalance)}</span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">Vesting Progress</span>
                                                <span className="text-white">{vestedPercentage.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 transition-all duration-500"
                                                    style={{ width: `${vestedPercentage}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {account.vestingSchedule.totalYears} year vesting schedule
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tax Status Indicator */}
                            <div className="mt-3 flex items-center gap-2 text-xs">
                                <TrendingUp size={12} className="text-blue-400" />
                                <span className="text-gray-400">
                                    {account.type === 'roth_ira' 
                                        ? 'Tax-free growth & withdrawals (after 59.5 & 5 years)'
                                        : 'Tax-deferred growth (taxed on withdrawal)'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
