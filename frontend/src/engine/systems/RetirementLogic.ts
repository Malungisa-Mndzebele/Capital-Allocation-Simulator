import type { RetirementState, RetirementAccount, MarketState, RetirementAccountType } from '../types';
import { RETIREMENT_LIMITS } from '../config';

export class RetirementLogic {
    /**
     * Process monthly updates for all retirement accounts
     * Requirements: 2.5, 4.1, 4.2, 4.3, 4.4
     */
    static processMonth(
        retirementState: RetirementState,
        market: MarketState,
        oldMarketIndex: number,
        currentMonth: number,
        _playerAge: number
    ): RetirementState {
        let newState = { ...retirementState };
        
        // Update account ages
        newState.accounts = newState.accounts.map(account => ({
            ...account,
            accountAge: account.accountAge + 1
        }));

        // Apply investment returns to all accounts (tax-deferred growth)
        newState.accounts = this.applyInvestmentReturns(
            newState.accounts,
            market,
            oldMarketIndex
        );

        // Check if we need to reset annual contributions (new calendar year).
        // Year N spans months (N-1)*12+1 .. N*12, so month 1-12 = year 1, month 13 = year 2.
        const currentYear = Math.ceil(currentMonth / 12);
        if (newState.lastResetYear < currentYear) {
            newState = this.resetAnnualContributions(newState, currentYear);
        }

        // Update vesting percentages for all accounts
        newState.accounts = newState.accounts.map(account => 
            this.updateVesting(account)
        );

        return newState;
    }

    /**
     * Apply investment returns to retirement accounts using market logic
     * Tax-deferred growth - no capital gains tax applied
     * Requirements: 4.1, 4.2, 4.3, 4.4
     */
    static applyInvestmentReturns(
        accounts: RetirementAccount[],
        market: MarketState,
        oldMarketIndex: number
    ): RetirementAccount[] {
        // Calculate market performance (same as regular investments)
        const marketPerformance = (market.stockMarketIndex - oldMarketIndex) / oldMarketIndex;

        return accounts.map(account => ({
            ...account,
            balance: account.balance * (1 + marketPerformance),
            unvestedBalance: account.unvestedBalance * (1 + marketPerformance)
        }));
    }

    /**
     * Reset annual contribution counters at the start of a new calendar year
     * Requirements: 2.5
     */
    static resetAnnualContributions(
        state: RetirementState,
        currentYear: number
    ): RetirementState {
        return {
            ...state,
            currentYearContributions401k: 0,
            currentYearContributionsIRA: 0,
            lastResetYear: currentYear,
            accounts: state.accounts.map(account => ({
                ...account,
                annualContributions: 0
            }))
        };
    }

    /**
     * Update vesting percentage based on account age
     * Requirements: 3.2, 3.3
     */
    private static updateVesting(account: RetirementAccount): RetirementAccount {
        if (account.vestingSchedule.totalYears === 0) {
            // Immediate vesting
            return {
                ...account,
                vestingSchedule: { ...account.vestingSchedule, vestedPercentage: 100 },
                unvestedBalance: 0
            };
        }

        const accountYears = account.accountAge / 12;
        const vestedPercentage = Math.min(
            100,
            (accountYears / account.vestingSchedule.totalYears) * 100
        );

        return {
            ...account,
            vestingSchedule: { ...account.vestingSchedule, vestedPercentage }
        };
    }

    /**
     * Calculate contribution amount based on gross income and contribution rate
     * Pre-tax deduction for 401(k) and Traditional IRA
     * Requirements: 2.1, 2.2
     */
    static calculateContribution(
        grossIncome: number,
        contributionRate: number,
        _accountType: RetirementAccountType
    ): number {
        // Contribution rate is a percentage (0-100)
        const contribution = (grossIncome * contributionRate) / 100;
        return Math.max(0, contribution);
    }

    /**
     * Process a contribution to a retirement account with limit enforcement
     * Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3
     */
    static processContribution(
        account: RetirementAccount,
        retirementState: RetirementState,
        contributionAmount: number,
        playerAge: number
    ): { account: RetirementAccount; state: RetirementState; actualContribution: number } {
        // Check if contribution is allowed
        const canContributeResult = this.canContribute(
            account,
            retirementState,
            contributionAmount,
            playerAge
        );

        if (!canContributeResult.allowed) {
            return {
                account,
                state: retirementState,
                actualContribution: 0
            };
        }

        // Use the allowed amount (may be less than requested due to limits)
        const actualContribution = canContributeResult.allowedAmount;

        // Update account balance and annual contributions
        const updatedAccount = {
            ...account,
            balance: account.balance + actualContribution,
            annualContributions: account.annualContributions + actualContribution
        };

        // Update state contribution tracking
        const updatedState = { ...retirementState };
        if (account.type === '401k' || account.type === 'solo_401k') {
            updatedState.currentYearContributions401k += actualContribution;
        } else {
            updatedState.currentYearContributionsIRA += actualContribution;
        }

        return {
            account: updatedAccount,
            state: updatedState,
            actualContribution
        };
    }

    /**
     * Check if a contribution is allowed and calculate the maximum allowed amount
     * Handles catch-up contributions for age 50+ players
     * Requirements: 2.3, 2.4, 6.1, 6.2, 6.3, 10.5
     */
    static canContribute(
        account: RetirementAccount,
        retirementState: RetirementState,
        requestedAmount: number,
        playerAge: number
    ): { allowed: boolean; allowedAmount: number; reason?: string } {
        // Determine contribution limit based on account type
        let baseLimit: number;
        let catchupLimit: number;
        let currentYearContributions: number;

        if (account.type === '401k') {
            baseLimit = RETIREMENT_LIMITS.CONTRIBUTION_401K;
            catchupLimit = RETIREMENT_LIMITS.CATCHUP_401K;
            currentYearContributions = retirementState.currentYearContributions401k;
        } else if (account.type === 'solo_401k') {
            // Solo 401(k) has higher limits (employee + employer contributions)
            baseLimit = RETIREMENT_LIMITS.SOLO_401K_EMPLOYER;
            catchupLimit = RETIREMENT_LIMITS.CATCHUP_401K;
            currentYearContributions = retirementState.currentYearContributions401k;
        } else {
            // Traditional IRA or Roth IRA
            baseLimit = RETIREMENT_LIMITS.CONTRIBUTION_IRA;
            catchupLimit = RETIREMENT_LIMITS.CATCHUP_IRA;
            currentYearContributions = retirementState.currentYearContributionsIRA;
        }

        // Add catch-up contribution if age 50+
        const totalLimit = playerAge >= 50 ? baseLimit + catchupLimit : baseLimit;

        // Calculate remaining contribution room
        const remainingRoom = totalLimit - currentYearContributions;

        if (remainingRoom <= 0) {
            return {
                allowed: false,
                allowedAmount: 0,
                reason: 'Annual contribution limit reached'
            };
        }

        // Allow contribution up to remaining room
        const allowedAmount = Math.min(requestedAmount, remainingRoom);

        return {
            allowed: true,
            allowedAmount
        };
    }

    /**
     * Calculate employer match based on employee contribution and match formula
     * Requirements: 3.1, 3.2
     */
    static calculateEmployerMatch(
        employeeContribution: number,
        grossSalary: number,
        matchPercentage: number,
        matchLimit: number
    ): number {
        // matchPercentage: e.g., 50 means 50% match
        // matchLimit: e.g., 6 means match up to 6% of salary
        
        // Calculate the maximum salary percentage that gets matched
        const maxMatchableSalary = (grossSalary * matchLimit) / 100;
        
        // Calculate the actual matchable amount (lesser of contribution or limit)
        const matchableAmount = Math.min(employeeContribution, maxMatchableSalary);
        
        // Apply the match percentage
        const employerMatch = (matchableAmount * matchPercentage) / 100;
        
        return Math.max(0, employerMatch);
    }

    /**
     * Apply vesting to determine how much of employer contributions are owned
     * Requirements: 3.2, 3.3
     */
    static applyVesting(account: RetirementAccount): {
        vestedAmount: number;
        unvestedAmount: number;
    } {
        const vestedPercentage = account.vestingSchedule.vestedPercentage;
        const vestedAmount = (account.unvestedBalance * vestedPercentage) / 100;
        const unvestedAmount = account.unvestedBalance - vestedAmount;

        return {
            vestedAmount,
            unvestedAmount
        };
    }

    /**
     * Forfeit unvested employer contributions when changing jobs
     * Requirements: 3.4, 3.5
     */
    static forfeitUnvestedContributions(account: RetirementAccount): RetirementAccount {
        const { unvestedAmount } = this.applyVesting(account);

        // Remove unvested contributions from balance
        const newBalance = account.balance - unvestedAmount;

        return {
            ...account,
            balance: Math.max(0, newBalance),
            unvestedBalance: 0,
            isActive: false // Mark account as inactive when leaving job
        };
    }

    /**
     * Add employer match contribution to account
     * Requirements: 3.1, 3.2, 3.3
     */
    static addEmployerMatch(
        account: RetirementAccount,
        matchAmount: number
    ): RetirementAccount {
        return {
            ...account,
            balance: account.balance + matchAmount,
            unvestedBalance: account.unvestedBalance + matchAmount
        };
    }

    /**
     * Calculate early withdrawal penalty
     * Requirements: 5.1, 5.2, 5.3
     */
    static calculateWithdrawalPenalty(
        withdrawalAmount: number,
        playerAge: number,
        accountType: RetirementAccountType,
        accountAge: number,
        isContributionOnly: boolean = false
    ): {
        penalty: number;
        taxableAmount: number;
        netAmount: number;
    } {
        let penalty = 0;
        let taxableAmount = withdrawalAmount;

        // Roth IRA special rules
        if (accountType === 'roth_ira') {
            if (isContributionOnly) {
                // Roth IRA contributions can be withdrawn anytime tax-free and penalty-free
                penalty = 0;
                taxableAmount = 0;
            } else {
                // Withdrawing earnings
                const accountYears = accountAge / 12;
                if (playerAge >= RETIREMENT_LIMITS.PENALTY_FREE_AGE && accountYears >= 5) {
                    // Qualified distribution - no tax or penalty
                    penalty = 0;
                    taxableAmount = 0;
                } else {
                    // Non-qualified distribution - penalty and tax on earnings
                    penalty = withdrawalAmount * RETIREMENT_LIMITS.EARLY_WITHDRAWAL_PENALTY;
                    taxableAmount = withdrawalAmount;
                }
            }
        } else {
            // 401(k) and Traditional IRA
            if (playerAge >= RETIREMENT_LIMITS.PENALTY_FREE_AGE) {
                // No penalty, but still taxable
                penalty = 0;
                taxableAmount = withdrawalAmount;
            } else {
                // Early withdrawal - 10% penalty plus taxes
                penalty = withdrawalAmount * RETIREMENT_LIMITS.EARLY_WITHDRAWAL_PENALTY;
                taxableAmount = withdrawalAmount;
            }
        }

        // Net amount after penalty (taxes applied separately by game engine)
        const netAmount = withdrawalAmount - penalty;

        return {
            penalty,
            taxableAmount,
            netAmount
        };
    }

    /**
     * Process a withdrawal from a retirement account
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    static processWithdrawal(
        account: RetirementAccount,
        withdrawalAmount: number,
        playerAge: number,
        taxRate: number
    ): {
        account: RetirementAccount;
        cashReceived: number;
        penalty: number;
        taxes: number;
        success: boolean;
        message?: string;
    } {
        // Validate withdrawal amount
        if (withdrawalAmount <= 0 || withdrawalAmount > account.balance) {
            return {
                account,
                cashReceived: 0,
                penalty: 0,
                taxes: 0,
                success: false,
                message: 'Invalid withdrawal amount'
            };
        }

        // Calculate penalty and taxable amount
        const { penalty, taxableAmount, netAmount } = this.calculateWithdrawalPenalty(
            withdrawalAmount,
            playerAge,
            account.type,
            account.accountAge
        );

        // Calculate taxes on taxable amount
        const taxes = taxableAmount * taxRate;

        // Calculate final cash received
        const cashReceived = netAmount - taxes;

        // Update account balance
        const updatedAccount = {
            ...account,
            balance: account.balance - withdrawalAmount
        };

        return {
            account: updatedAccount,
            cashReceived: Math.max(0, cashReceived),
            penalty,
            taxes,
            success: true
        };
    }

    /**
     * Calculate Required Minimum Distribution using IRS Uniform Lifetime Table
     * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
     */
    static calculateRMD(
        accountBalance: number,
        playerAge: number
    ): number {
        // RMD not required before age 72
        if (playerAge < RETIREMENT_LIMITS.RMD_AGE) {
            return 0;
        }

        // Simplified IRS Uniform Lifetime Table (distribution periods)
        const distributionPeriods: Record<number, number> = {
            72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7,
            77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4,
            82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
            87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5,
            92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4,
            97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4
        };

        // Get distribution period for age (use 100+ for ages beyond table)
        const distributionPeriod = distributionPeriods[playerAge] || 6.4;

        // RMD = Account Balance / Distribution Period
        const rmd = accountBalance / distributionPeriod;

        return rmd;
    }

    /**
     * Check if RMD is required and calculate the amount
     * Requirements: 9.1, 9.2, 9.5
     */
    static checkRMDRequirement(
        account: RetirementAccount,
        playerAge: number
    ): {
        required: boolean;
        amount: number;
        accountType: RetirementAccountType;
    } {
        // Roth IRA does not require RMD during owner's lifetime
        if (account.type === 'roth_ira') {
            return {
                required: false,
                amount: 0,
                accountType: account.type
            };
        }

        // Check if player is at RMD age
        if (playerAge < RETIREMENT_LIMITS.RMD_AGE) {
            return {
                required: false,
                amount: 0,
                accountType: account.type
            };
        }

        // Calculate RMD
        const rmdAmount = this.calculateRMD(account.balance, playerAge);

        return {
            required: true,
            amount: rmdAmount,
            accountType: account.type
        };
    }

    /**
     * Check eligibility for retirement account types based on employment status
     * Requirements: 10.4, 10.5
     */
    static checkAccountEligibility(
        gameLevel: string,
        has401k: boolean
    ): {
        canOpen401k: boolean;
        canOpenIRA: boolean;
        canOpenSolo401k: boolean;
    } {
        return {
            canOpen401k: has401k && gameLevel === 'Career', // Only if employer offers 401(k)
            canOpenIRA: true, // Anyone can open an IRA
            canOpenSolo401k: gameLevel === 'Business' // Only business owners
        };
    }
}
