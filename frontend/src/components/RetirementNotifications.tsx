import React from 'react';
import { AlertTriangle, Info, TrendingUp, Gift } from 'lucide-react';
import type { RetirementState, CareerState } from '../types';

interface RetirementNotificationsProps {
    retirement: RetirementState;
    career: CareerState;
    playerAge: number;
    grossIncome: number;
}

interface Notification {
    id: string;
    type: 'warning' | 'info' | 'success';
    icon: React.ReactNode;
    title: string;
    message: string;
}

export const RetirementNotifications: React.FC<RetirementNotificationsProps> = ({
    retirement,
    career,
    playerAge,
    grossIncome
}) => {
    const notifications: Notification[] = [];

    // Check for employer match warnings
    const active401k = retirement.accounts.find(acc => acc.type === '401k' && acc.isActive);
    if (active401k && active401k.employerMatch > 0) {
        const contributionRate = active401k.contributionRate;
        const matchLimit = active401k.employerMatchLimit;
        
        if (contributionRate < matchLimit) {
            const missedMatch = (grossIncome / 12) * ((matchLimit - contributionRate) / 100) * (active401k.employerMatch / 100);
            notifications.push({
                id: 'employer-match-warning',
                type: 'warning',
                icon: <AlertTriangle size={18} />,
                title: 'Missing Employer Match',
                message: `You're contributing ${contributionRate.toFixed(1)}% but your employer matches up to ${matchLimit}%. Increase to ${matchLimit}% to get ~$${missedMatch.toFixed(0)}/month in free money!`
            });
        } else if (contributionRate >= matchLimit) {
            notifications.push({
                id: 'employer-match-success',
                type: 'success',
                icon: <Gift size={18} />,
                title: 'Maximizing Employer Match',
                message: `Great job! You're getting the full employer match of ${active401k.employerMatch}% up to ${matchLimit}% of your salary.`
            });
        }
    }

    // Check for catch-up contribution eligibility at age 50
    if (playerAge === 50 && retirement.accounts.length > 0) {
        notifications.push({
            id: 'catchup-eligible',
            type: 'info',
            icon: <TrendingUp size={18} />,
            title: 'Catch-Up Contributions Available',
            message: `You're now 50! You can contribute an extra $7,500 to your 401(k) and $1,000 to IRAs annually. Your new limits: 401(k) $30,500, IRA $8,000.`
        });
    }

    // Check for RMD requirements at age 72
    if (playerAge === 72) {
        const traditionalAccounts = retirement.accounts.filter(
            acc => acc.type === '401k' || acc.type === 'traditional_ira' || acc.type === 'solo_401k'
        );
        if (traditionalAccounts.length > 0) {
            notifications.push({
                id: 'rmd-required',
                type: 'warning',
                icon: <AlertTriangle size={18} />,
                title: 'Required Minimum Distributions',
                message: `You've reached age 72. You must take Required Minimum Distributions (RMDs) from your traditional retirement accounts by year end or face a 50% penalty!`
            });
        }
    }

    // Check for contribution limit increases (simplified - would need year tracking)
    // This is a placeholder for when contribution limits increase
    const currentYear = 2024 + Math.floor((playerAge - 17) / 1); // Rough estimate
    if (currentYear > 2024 && retirement.accounts.length > 0) {
        // In a real implementation, we'd track when limits actually change
        // For now, we'll skip this notification to avoid false positives
    }

    // Check if player has no retirement accounts but is eligible
    if (retirement.accounts.length === 0 && (career.has401k || grossIncome > 0)) {
        notifications.push({
            id: 'no-retirement-accounts',
            type: 'info',
            icon: <Info size={18} />,
            title: 'Start Saving for Retirement',
            message: career.has401k 
                ? `Your employer offers a 401(k) with ${career.matchPercentage}% match. Open an account to start building your retirement savings!`
                : `Consider opening an IRA to start saving for retirement with tax advantages.`
        });
    }

    // Check if player is contributing but not enough to get full match
    if (active401k && active401k.contributionRate > 0 && active401k.contributionRate < active401k.employerMatchLimit) {
        const currentMonthlyMatch = (grossIncome / 12) * (active401k.contributionRate / 100) * (active401k.employerMatch / 100);
        const potentialMonthlyMatch = (grossIncome / 12) * (active401k.employerMatchLimit / 100) * (active401k.employerMatch / 100);
        const missedAnnually = (potentialMonthlyMatch - currentMonthlyMatch) * 12;
        
        notifications.push({
            id: 'partial-match',
            type: 'warning',
            icon: <AlertTriangle size={18} />,
            title: 'Leaving Money on the Table',
            message: `You're missing out on $${missedAnnually.toFixed(0)}/year in employer contributions. Increase your contribution rate to ${active401k.employerMatchLimit}%!`
        });
    }

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`p-4 rounded-xl border ${
                        notification.type === 'warning'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : notification.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                    } animate-in slide-in-from-top-2 duration-300`}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={`mt-0.5 ${
                                notification.type === 'warning'
                                    ? 'text-yellow-400'
                                    : notification.type === 'success'
                                    ? 'text-emerald-400'
                                    : 'text-blue-400'
                            }`}
                        >
                            {notification.icon}
                        </div>
                        <div className="flex-1">
                            <div
                                className={`font-bold text-sm mb-1 ${
                                    notification.type === 'warning'
                                        ? 'text-yellow-400'
                                        : notification.type === 'success'
                                        ? 'text-emerald-400'
                                        : 'text-blue-400'
                                }`}
                            >
                                {notification.title}
                            </div>
                            <div className="text-sm text-gray-300 leading-relaxed">
                                {notification.message}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
