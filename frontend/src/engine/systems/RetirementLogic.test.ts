import { describe, it, expect } from 'vitest';
import { RetirementLogic } from './RetirementLogic';
import type { RetirementAccount, RetirementState, MarketState } from '../types';
import { RETIREMENT_LIMITS } from '../config';

describe('RetirementLogic', () => {
  // Helper function to create a test retirement account
  const createTestAccount = (overrides?: Partial<RetirementAccount>): RetirementAccount => ({
    id: 'test-account-1',
    type: '401k',
    balance: 10000,
    contributionRate: 10,
    employerMatch: 50,
    employerMatchLimit: 6,
    vestingSchedule: { totalYears: 3, vestedPercentage: 0 },
    annualContributions: 5000,
    accountAge: 12,
    unvestedBalance: 2000,
    isActive: true,
    ...overrides,
  });

  const createTestRetirementState = (overrides?: Partial<RetirementState>): RetirementState => ({
    accounts: [],
    currentYearContributions401k: 0,
    currentYearContributionsIRA: 0,
    lastResetYear: 0,
    ...overrides,
  });

  const createTestMarket = (overrides?: Partial<MarketState>): MarketState => ({
    cycleStage: 'Recovery',
    interestRate: 0.05,
    stockMarketIndex: 1000,
    inflationRate: 0.03,
    ...overrides,
  });

  describe('calculateContribution', () => {
    it('should calculate contribution correctly for 401k', () => {
      const contribution = RetirementLogic.calculateContribution(50000, 10, '401k');
      expect(contribution).toBe(5000);
    });

    it('should calculate contribution correctly for different rates', () => {
      expect(RetirementLogic.calculateContribution(60000, 5, '401k')).toBe(3000);
      expect(RetirementLogic.calculateContribution(80000, 15, 'traditional_ira')).toBe(12000);
    });

    it('should return 0 for 0% contribution rate', () => {
      expect(RetirementLogic.calculateContribution(50000, 0, '401k')).toBe(0);
    });

    it('should handle 100% contribution rate', () => {
      expect(RetirementLogic.calculateContribution(50000, 100, '401k')).toBe(50000);
    });
  });

  describe('canContribute', () => {
    it('should allow contribution within 401k limits', () => {
      const account = createTestAccount({ type: '401k' });
      const state = createTestRetirementState({ currentYearContributions401k: 10000 });
      
      const result = RetirementLogic.canContribute(account, state, 5000, 30);
      
      expect(result.allowed).toBe(true);
      expect(result.allowedAmount).toBe(5000);
    });

    it('should enforce 401k contribution limit', () => {
      const account = createTestAccount({ type: '401k' });
      const state = createTestRetirementState({ 
        currentYearContributions401k: RETIREMENT_LIMITS.CONTRIBUTION_401K 
      });
      
      const result = RetirementLogic.canContribute(account, state, 5000, 30);
      
      expect(result.allowed).toBe(false);
      expect(result.allowedAmount).toBe(0);
      expect(result.reason).toBe('Annual contribution limit reached');
    });

    it('should allow catch-up contributions for age 50+', () => {
      const account = createTestAccount({ type: '401k' });
      const state = createTestRetirementState({ 
        currentYearContributions401k: RETIREMENT_LIMITS.CONTRIBUTION_401K 
      });
      
      const result = RetirementLogic.canContribute(account, state, 5000, 50);
      
      expect(result.allowed).toBe(true);
      expect(result.allowedAmount).toBe(5000);
    });

    it('should cap contribution at remaining room', () => {
      const account = createTestAccount({ type: '401k' });
      const state = createTestRetirementState({ 
        currentYearContributions401k: RETIREMENT_LIMITS.CONTRIBUTION_401K - 1000 
      });
      
      const result = RetirementLogic.canContribute(account, state, 5000, 30);
      
      expect(result.allowed).toBe(true);
      expect(result.allowedAmount).toBe(1000);
    });

    it('should enforce IRA contribution limits separately', () => {
      const account = createTestAccount({ type: 'traditional_ira' });
      const state = createTestRetirementState({ 
        currentYearContributionsIRA: RETIREMENT_LIMITS.CONTRIBUTION_IRA 
      });
      
      const result = RetirementLogic.canContribute(account, state, 1000, 30);
      
      expect(result.allowed).toBe(false);
      expect(result.allowedAmount).toBe(0);
    });

    it('should allow IRA catch-up contributions for age 50+', () => {
      const account = createTestAccount({ type: 'traditional_ira' });
      const state = createTestRetirementState({ 
        currentYearContributionsIRA: RETIREMENT_LIMITS.CONTRIBUTION_IRA 
      });
      
      const result = RetirementLogic.canContribute(account, state, 500, 50);
      
      expect(result.allowed).toBe(true);
      expect(result.allowedAmount).toBe(500);
    });
  });

  describe('processContribution', () => {
    it('should process valid contribution and update account balance', () => {
      const account = createTestAccount({ balance: 10000, annualContributions: 5000 });
      const state = createTestRetirementState({ currentYearContributions401k: 5000 });
      
      const result = RetirementLogic.processContribution(account, state, 2000, 30);
      
      expect(result.actualContribution).toBe(2000);
      expect(result.account.balance).toBe(12000);
      expect(result.account.annualContributions).toBe(7000);
      expect(result.state.currentYearContributions401k).toBe(7000);
    });

    it('should not process contribution when limit reached', () => {
      const account = createTestAccount({ type: '401k' });
      const state = createTestRetirementState({ 
        currentYearContributions401k: RETIREMENT_LIMITS.CONTRIBUTION_401K 
      });
      
      const result = RetirementLogic.processContribution(account, state, 5000, 30);
      
      expect(result.actualContribution).toBe(0);
      expect(result.account.balance).toBe(account.balance);
    });

    it('should cap contribution at remaining limit', () => {
      const account = createTestAccount({ balance: 10000 });
      const state = createTestRetirementState({ 
        currentYearContributions401k: RETIREMENT_LIMITS.CONTRIBUTION_401K - 500 
      });
      
      const result = RetirementLogic.processContribution(account, state, 2000, 30);
      
      expect(result.actualContribution).toBe(500);
      expect(result.account.balance).toBe(10500);
    });
  });

  describe('calculateEmployerMatch', () => {
    it('should calculate standard employer match (50% up to 6%)', () => {
      const employeeContribution = 3000; // 6% of 50000
      const grossSalary = 50000;
      const matchPercentage = 50;
      const matchLimit = 6;
      
      const match = RetirementLogic.calculateEmployerMatch(
        employeeContribution,
        grossSalary,
        matchPercentage,
        matchLimit
      );
      
      expect(match).toBe(1500); // 50% of 3000
    });

    it('should cap match at employer limit', () => {
      const employeeContribution = 5000; // 10% of 50000
      const grossSalary = 50000;
      const matchPercentage = 50;
      const matchLimit = 6; // Only match up to 6% of salary
      
      const match = RetirementLogic.calculateEmployerMatch(
        employeeContribution,
        grossSalary,
        matchPercentage,
        matchLimit
      );
      
      expect(match).toBe(1500); // 50% of 3000 (6% of 50000)
    });

    it('should calculate 100% match correctly', () => {
      const employeeContribution = 3000;
      const grossSalary = 50000;
      const matchPercentage = 100;
      const matchLimit = 6;
      
      const match = RetirementLogic.calculateEmployerMatch(
        employeeContribution,
        grossSalary,
        matchPercentage,
        matchLimit
      );
      
      expect(match).toBe(3000); // 100% of 3000
    });

    it('should return 0 for no employer match', () => {
      const match = RetirementLogic.calculateEmployerMatch(3000, 50000, 0, 0);
      expect(match).toBe(0);
    });
  });

  describe('applyVesting', () => {
    it('should calculate vested and unvested amounts', () => {
      const account = createTestAccount({
        unvestedBalance: 10000,
        vestingSchedule: { totalYears: 4, vestedPercentage: 50 },
      });
      
      const result = RetirementLogic.applyVesting(account);
      
      expect(result.vestedAmount).toBe(5000);
      expect(result.unvestedAmount).toBe(5000);
    });

    it('should handle 100% vested', () => {
      const account = createTestAccount({
        unvestedBalance: 10000,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
      });
      
      const result = RetirementLogic.applyVesting(account);
      
      expect(result.vestedAmount).toBe(10000);
      expect(result.unvestedAmount).toBe(0);
    });

    it('should handle 0% vested', () => {
      const account = createTestAccount({
        unvestedBalance: 10000,
        vestingSchedule: { totalYears: 5, vestedPercentage: 0 },
      });
      
      const result = RetirementLogic.applyVesting(account);
      
      expect(result.vestedAmount).toBe(0);
      expect(result.unvestedAmount).toBe(10000);
    });
  });

  describe('forfeitUnvestedContributions', () => {
    it('should remove unvested contributions when leaving job', () => {
      const account = createTestAccount({
        balance: 20000,
        unvestedBalance: 10000,
        vestingSchedule: { totalYears: 4, vestedPercentage: 50 },
      });
      
      const result = RetirementLogic.forfeitUnvestedContributions(account);
      
      expect(result.balance).toBe(15000); // 20000 - 5000 (50% of 10000 unvested)
      expect(result.unvestedBalance).toBe(0);
      expect(result.isActive).toBe(false);
    });

    it('should not remove vested contributions', () => {
      const account = createTestAccount({
        balance: 20000,
        unvestedBalance: 10000,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
      });
      
      const result = RetirementLogic.forfeitUnvestedContributions(account);
      
      expect(result.balance).toBe(20000); // All vested, nothing forfeited
      expect(result.unvestedBalance).toBe(0);
    });
  });

  describe('calculateWithdrawalPenalty', () => {
    it('should apply 10% penalty for early 401k withdrawal', () => {
      const result = RetirementLogic.calculateWithdrawalPenalty(10000, 40, '401k', 60, false);
      
      expect(result.penalty).toBe(1000); // 10% of 10000
      expect(result.taxableAmount).toBe(10000);
      expect(result.netAmount).toBe(9000);
    });

    it('should not apply penalty for withdrawal after age 59.5', () => {
      const result = RetirementLogic.calculateWithdrawalPenalty(10000, 60, '401k', 60, false);
      
      expect(result.penalty).toBe(0);
      expect(result.taxableAmount).toBe(10000);
      expect(result.netAmount).toBe(10000);
    });

    it('should allow penalty-free Roth IRA contribution withdrawals', () => {
      const result = RetirementLogic.calculateWithdrawalPenalty(5000, 40, 'roth_ira', 24, true);
      
      expect(result.penalty).toBe(0);
      expect(result.taxableAmount).toBe(0);
      expect(result.netAmount).toBe(5000);
    });

    it('should apply penalty for early Roth IRA earnings withdrawal', () => {
      const result = RetirementLogic.calculateWithdrawalPenalty(5000, 40, 'roth_ira', 24, false);
      
      expect(result.penalty).toBe(500);
      expect(result.taxableAmount).toBe(5000);
      expect(result.netAmount).toBe(4500);
    });

    it('should allow qualified Roth IRA distribution (age 59.5+ and 5 years)', () => {
      const result = RetirementLogic.calculateWithdrawalPenalty(10000, 60, 'roth_ira', 72, false);
      
      expect(result.penalty).toBe(0);
      expect(result.taxableAmount).toBe(0);
      expect(result.netAmount).toBe(10000);
    });
  });

  describe('processWithdrawal', () => {
    it('should process valid withdrawal with penalty and taxes', () => {
      const account = createTestAccount({ balance: 20000 });
      const taxRate = 0.20;
      
      const result = RetirementLogic.processWithdrawal(account, 10000, 40, taxRate);
      
      expect(result.success).toBe(true);
      expect(result.penalty).toBe(1000); // 10% early withdrawal penalty
      expect(result.taxes).toBe(2000); // 20% tax on 10000
      expect(result.cashReceived).toBe(7000); // 10000 - 1000 - 2000
      expect(result.account.balance).toBe(10000);
    });

    it('should reject withdrawal exceeding balance', () => {
      const account = createTestAccount({ balance: 5000 });
      
      const result = RetirementLogic.processWithdrawal(account, 10000, 40, 0.20);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid withdrawal amount');
      expect(result.cashReceived).toBe(0);
    });

    it('should reject negative withdrawal amount', () => {
      const account = createTestAccount({ balance: 10000 });
      
      const result = RetirementLogic.processWithdrawal(account, -1000, 40, 0.20);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid withdrawal amount');
    });

    it('should process penalty-free withdrawal after age 59.5', () => {
      const account = createTestAccount({ balance: 20000 });
      const taxRate = 0.20;
      
      const result = RetirementLogic.processWithdrawal(account, 10000, 60, taxRate);
      
      expect(result.success).toBe(true);
      expect(result.penalty).toBe(0);
      expect(result.taxes).toBe(2000);
      expect(result.cashReceived).toBe(8000); // 10000 - 2000 (no penalty)
    });
  });

  describe('calculateRMD', () => {
    it('should return 0 for age below 72', () => {
      const rmd = RetirementLogic.calculateRMD(100000, 70);
      expect(rmd).toBe(0);
    });

    it('should calculate RMD correctly for age 72', () => {
      const rmd = RetirementLogic.calculateRMD(100000, 72);
      expect(rmd).toBeCloseTo(3649.64, 2); // 100000 / 27.4
    });

    it('should calculate RMD correctly for age 80', () => {
      const rmd = RetirementLogic.calculateRMD(200000, 80);
      expect(rmd).toBeCloseTo(9900.99, 2); // 200000 / 20.2
    });

    it('should use minimum distribution period for age 100+', () => {
      const rmd = RetirementLogic.calculateRMD(100000, 105);
      expect(rmd).toBeCloseTo(15625, 2); // 100000 / 6.4
    });
  });

  describe('checkRMDRequirement', () => {
    it('should not require RMD for Roth IRA', () => {
      const account = createTestAccount({ type: 'roth_ira', balance: 100000 });
      
      const result = RetirementLogic.checkRMDRequirement(account, 75);
      
      expect(result.required).toBe(false);
      expect(result.amount).toBe(0);
    });

    it('should not require RMD before age 72', () => {
      const account = createTestAccount({ type: '401k', balance: 100000 });
      
      const result = RetirementLogic.checkRMDRequirement(account, 70);
      
      expect(result.required).toBe(false);
      expect(result.amount).toBe(0);
    });

    it('should require RMD for Traditional IRA at age 72+', () => {
      const account = createTestAccount({ type: 'traditional_ira', balance: 100000 });
      
      const result = RetirementLogic.checkRMDRequirement(account, 72);
      
      expect(result.required).toBe(true);
      expect(result.amount).toBeGreaterThan(0);
    });

    it('should require RMD for 401k at age 72+', () => {
      const account = createTestAccount({ type: '401k', balance: 150000 });
      
      const result = RetirementLogic.checkRMDRequirement(account, 75);
      
      expect(result.required).toBe(true);
      expect(result.amount).toBeCloseTo(6097.56, 2); // 150000 / 24.6
    });
  });

  describe('applyInvestmentReturns', () => {
    it('should apply positive market returns to accounts', () => {
      const accounts = [
        createTestAccount({ balance: 10000, unvestedBalance: 2000 }),
      ];
      const market = createTestMarket({ stockMarketIndex: 1100 });
      const oldMarketIndex = 1000;
      
      const result = RetirementLogic.applyInvestmentReturns(accounts, market, oldMarketIndex);
      
      expect(result[0].balance).toBe(11000); // 10% gain
      expect(result[0].unvestedBalance).toBe(2200); // 10% gain
    });

    it('should apply negative market returns to accounts', () => {
      const accounts = [
        createTestAccount({ balance: 10000, unvestedBalance: 2000 }),
      ];
      const market = createTestMarket({ stockMarketIndex: 900 });
      const oldMarketIndex = 1000;
      
      const result = RetirementLogic.applyInvestmentReturns(accounts, market, oldMarketIndex);
      
      expect(result[0].balance).toBe(9000); // 10% loss
      expect(result[0].unvestedBalance).toBe(1800); // 10% loss
    });

    it('should handle multiple accounts', () => {
      const accounts = [
        createTestAccount({ id: 'acc1', balance: 10000 }),
        createTestAccount({ id: 'acc2', balance: 20000 }),
      ];
      const market = createTestMarket({ stockMarketIndex: 1050 });
      const oldMarketIndex = 1000;
      
      const result = RetirementLogic.applyInvestmentReturns(accounts, market, oldMarketIndex);
      
      expect(result[0].balance).toBe(10500);
      expect(result[1].balance).toBe(21000);
    });
  });

  describe('resetAnnualContributions', () => {
    it('should reset all contribution counters for new year', () => {
      const state = createTestRetirementState({
        currentYearContributions401k: 15000,
        currentYearContributionsIRA: 5000,
        lastResetYear: 2023,
        accounts: [
          createTestAccount({ annualContributions: 10000 }),
          createTestAccount({ annualContributions: 5000 }),
        ],
      });
      
      const result = RetirementLogic.resetAnnualContributions(state, 2024);
      
      expect(result.currentYearContributions401k).toBe(0);
      expect(result.currentYearContributionsIRA).toBe(0);
      expect(result.lastResetYear).toBe(2024);
      expect(result.accounts[0].annualContributions).toBe(0);
      expect(result.accounts[1].annualContributions).toBe(0);
    });
  });

  describe('processMonth', () => {
    it('should update account ages monthly', () => {
      const state = createTestRetirementState({
        accounts: [createTestAccount({ accountAge: 12 })],
      });
      const market = createTestMarket({ stockMarketIndex: 1000 });
      
      const result = RetirementLogic.processMonth(state, market, 1000, 12, 30);
      
      expect(result.accounts[0].accountAge).toBe(13);
    });

    it('should apply investment returns', () => {
      const state = createTestRetirementState({
        accounts: [createTestAccount({ balance: 10000 })],
      });
      const market = createTestMarket({ stockMarketIndex: 1100 });
      
      const result = RetirementLogic.processMonth(state, market, 1000, 12, 30);
      
      expect(result.accounts[0].balance).toBe(11000);
    });

    it('should reset contributions at new year', () => {
      const state = createTestRetirementState({
        currentYearContributions401k: 10000,
        lastResetYear: 0,
        accounts: [createTestAccount({ annualContributions: 10000 })],
      });
      const market = createTestMarket({ stockMarketIndex: 1000 });
      
      const result = RetirementLogic.processMonth(state, market, 1000, 12, 30);
      
      expect(result.currentYearContributions401k).toBe(0);
      expect(result.lastResetYear).toBe(1);
    });

    it('should update vesting percentages', () => {
      const state = createTestRetirementState({
        accounts: [
          createTestAccount({
            accountAge: 36, // 3 years
            vestingSchedule: { totalYears: 3, vestedPercentage: 0 },
          }),
        ],
      });
      const market = createTestMarket({ stockMarketIndex: 1000 });
      
      const result = RetirementLogic.processMonth(state, market, 1000, 12, 30);
      
      expect(result.accounts[0].vestingSchedule.vestedPercentage).toBeGreaterThan(0);
    });
  });

  describe('checkAccountEligibility', () => {
    it('should allow 401k only when employer offers it', () => {
      const result = RetirementLogic.checkAccountEligibility('Career', true);
      
      expect(result.canOpen401k).toBe(true);
      expect(result.canOpenIRA).toBe(true);
      expect(result.canOpenSolo401k).toBe(false);
    });

    it('should not allow 401k without employer benefit', () => {
      const result = RetirementLogic.checkAccountEligibility('Career', false);
      
      expect(result.canOpen401k).toBe(false);
      expect(result.canOpenIRA).toBe(true);
      expect(result.canOpenSolo401k).toBe(false);
    });

    it('should allow Solo 401k for business owners', () => {
      const result = RetirementLogic.checkAccountEligibility('Business', false);
      
      expect(result.canOpen401k).toBe(false);
      expect(result.canOpenIRA).toBe(true);
      expect(result.canOpenSolo401k).toBe(true);
    });

    it('should always allow IRA', () => {
      expect(RetirementLogic.checkAccountEligibility('Career', false).canOpenIRA).toBe(true);
      expect(RetirementLogic.checkAccountEligibility('Business', false).canOpenIRA).toBe(true);
      expect(RetirementLogic.checkAccountEligibility('Investor', false).canOpenIRA).toBe(true);
    });
  });

  describe('addEmployerMatch', () => {
    it('should add employer match to balance and unvested balance', () => {
      const account = createTestAccount({ balance: 10000, unvestedBalance: 2000 });
      
      const result = RetirementLogic.addEmployerMatch(account, 1500);
      
      expect(result.balance).toBe(11500);
      expect(result.unvestedBalance).toBe(3500);
    });

    it('should handle zero match', () => {
      const account = createTestAccount({ balance: 10000, unvestedBalance: 2000 });
      
      const result = RetirementLogic.addEmployerMatch(account, 0);
      
      expect(result.balance).toBe(10000);
      expect(result.unvestedBalance).toBe(2000);
    });
  });
});
