import React from 'react';
import { BookOpen, TrendingUp, DollarSign, Shield, X } from 'lucide-react';

interface RetirementTutorialProps {
    onClose: () => void;
    employerMatch: number;
    employerMatchLimit: number;
    contributionLimit: number;
    playerAge: number;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: 0 
    }).format(val);
};

export const RetirementTutorial: React.FC<RetirementTutorialProps> = ({
    onClose,
    employerMatch,
    employerMatchLimit,
    contributionLimit,
    playerAge
}) => {
    const hasCatchUp = playerAge >= 50;
    const totalLimit = hasCatchUp ? contributionLimit + 7500 : contributionLimit;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#1a1b26] to-[#24283b] border border-emerald-500/30 rounded-2xl max-w-3xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <BookOpen size={32} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">Welcome to 401(k) Benefits!</h2>
                            <p className="text-gray-400 text-sm mt-1">Your guide to retirement savings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* What is a 401(k)? */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={20} className="text-blue-400" />
                            <h3 className="text-xl font-bold text-white">What is a 401(k)?</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            A 401(k) is a tax-advantaged retirement savings account offered by your employer. 
                            Money you contribute is deducted from your paycheck <span className="text-emerald-400 font-bold">before taxes</span>, 
                            reducing your taxable income and helping you save more for retirement.
                        </p>
                    </div>

                    {/* Employer Matching */}
                    {employerMatch > 0 && (
                        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign size={20} className="text-emerald-400" />
                                <h3 className="text-xl font-bold text-emerald-400">Free Money: Employer Match!</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                Your employer will match <span className="text-emerald-400 font-bold">{employerMatch}%</span> of 
                                your contributions up to <span className="text-emerald-400 font-bold">{employerMatchLimit}%</span> of 
                                your salary. This is essentially <span className="text-yellow-400 font-bold">free money</span> added 
                                to your retirement savings!
                            </p>
                            <div className="bg-black/30 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Example:</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">If you contribute 6% of your salary:</span>
                                        <span className="text-white font-mono">$3,000/year</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-400">Employer adds {employerMatch}% match:</span>
                                        <span className="text-emerald-400 font-mono">+${(3000 * employerMatch / 100).toFixed(0)}/year</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-white/10">
                                        <span className="text-white font-bold">Total annual contribution:</span>
                                        <span className="text-emerald-400 font-mono font-bold">${(3000 + 3000 * employerMatch / 100).toFixed(0)}/year</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-400 text-sm font-bold">
                                    💡 Pro Tip: Always contribute at least {employerMatchLimit}% to maximize your employer match!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tax Benefits */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={20} className="text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Tax Benefits</h3>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">✓</span>
                                <span><span className="font-bold text-white">Pre-tax contributions:</span> Lower your taxable income now</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">✓</span>
                                <span><span className="font-bold text-white">Tax-deferred growth:</span> Investments grow without being taxed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">✓</span>
                                <span><span className="font-bold text-white">Compound interest:</span> Your money grows faster over time</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contribution Limits */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={20} className="text-blue-400" />
                            <h3 className="text-xl font-bold text-white">Contribution Limits</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Annual 401(k) limit (2024):</span>
                                <span className="text-white font-mono font-bold">{formatCurrency(contributionLimit)}</span>
                            </div>
                            {hasCatchUp && (
                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-400">Catch-up contribution (Age 50+):</span>
                                    <span className="text-yellow-400 font-mono font-bold">+$7,500</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                <span className="text-white font-bold">Your total limit:</span>
                                <span className="text-emerald-400 font-mono font-bold">{formatCurrency(totalLimit)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-red-400 mb-3">⚠️ Important to Know</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>Early withdrawals (before age 59.5) incur a <span className="text-red-400 font-bold">10% penalty</span> plus income taxes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>Employer contributions may have a <span className="text-yellow-400 font-bold">vesting schedule</span> (you earn them over time)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>If you change jobs, your 401(k) stays with you, but unvested employer contributions may be forfeited</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        Got It! Let's Start Saving
                    </button>
                </div>
            </div>
        </div>
    );
};
