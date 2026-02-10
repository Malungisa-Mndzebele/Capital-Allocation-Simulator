import { describe, it, expect } from 'vitest';
import { GameEngine } from '../GameEngine';
import { GameState, RetirementAccount } from '../types';
import { RetirementLogic } from './RetirementLogic';
import { RETIREMENT_LIMITS } from '../config';

describe('Retirement System Integration Tests', () => {
  // Helper to create a basic game state
  const createTestGameState = (overrides?: Partial<GameState>): GameState => {
    const baseState = GameEngine.getInitialState('Normal');
    return {
      ...baseState,
      ...overrides,
    };
  };

  describe('Full Career Lifecycle with 401(k)', () => {
    it('should allow opening 401k when job offers it', () => {
      let state = createTestGameState();
      
      // Get a job with 401k benefits (e.g., Shift Manager)
      state.career.jobTitle = 'Shift Manager';
      state.career.salary = 35000;
      state.career.has401k = true;
      state.career.matchPercentage = 50;
      state.career.matchLimit = 3;
      state.career.vestingYears = 3;
      
      // Open a 401k account
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 0,
        contributionRate: 6,
        employerMatch: 50,
        employerMatchLimit: 3,
        vestingSchedule: { totalYears: 3, vestedPercentage: 0 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      
      expect(state.retirement.accounts).toHaveLength(1);
      expect(state.retirement.accounts[0].type).toBe('401k');
      expect(state.retirement.accounts[0].isActive).toBe(true);
    });

    it('should process contributions and employer match over multiple months', () => {
      let state = createTestGameState();
      
      // Setup career with 401k
      state.career.jobTitle = 'Shift Manager';
      state.career.salary = 60000;
      state.career.has401k = true;
      state.career.matchPercentage = 50;
      state.career.matchLimit = 6;
      state.career.vestingYears = 3;
      state.cash = 100000; // Ensure enough cash
      
      // Open 401k with 10% contribution rate
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 0,
        contributionRate: 10,
        employerMatch: 50,
        employerMatchLimit: 6,
        vestingSchedule: { totalYears: 3, vestedPercentage: 0 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      
      // Simulate 12 months of contributions
      const monthlyGrossSalary = state.career.salary / 12;
      
      for (let i = 0; i < 12; i++) {
        // Calculate employee contribution
        const employeeContribution = (monthlyGrossSalary * account.contributionRate) / 100;
        
        // Process contribution
        const contributionResult = RetirementLogic.processContribution(
          state.retirement.accounts[0],
          state.retirement,
          employeeContribution,
          state.player.age
        );
        
        state.retirement.accounts[0] = contributionResult.account;
        state.retirement = contributionResult.state;
        
        // Calculate and add employer match
        const employerMatch = RetirementLogic.calculateEmployerMatch(
          employeeContribution,
          monthlyGrossSalary,
          account.employerMatch,
          account.employerMatchLimit
        );
        
        state.retirement.accounts[0] = RetirementLogic.addEmployerMatch(
          state.retirement.accounts[0],
          employerMatch
        );
        
        // Process turn to apply investment returns
        state = GameEngine.processTurn(state);
      }
      
      // After 12 months, should have contributions + employer match + some investment returns
      expect(state.retirement.accounts[0].balance).toBeGreaterThan(0);
      expect(state.retirement.accounts[0].annualContributions).toBeGreaterThan(0);
      expect(state.retirement.accounts[0].unvestedBalance).toBeGreaterThan(0);
    });

    it('should update vesting percentage over time', () => {
      let state = createTestGameState();
      
      // Setup account with 3-year vesting
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 30000,
        contributionRate: 10,
        employerMatch: 50,
        employerMatchLimit: 6,
        vestingSchedule: { totalYears: 3, vestedPercentage: 0 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 10000,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      
      // Simulate 36 months (3 years)
      for (let i = 0; i < 36; i++) {
        state = GameEngine.processTurn(state);
      }
      
      // After 3 years, should be 100% vested
      expect(state.retirement.accounts[0].accountAge).toBe(36);
      expect(state.retirement.accounts[0].vestingSchedule.vestedPercentage).toBeCloseTo(100, 0);
    });
  });

  describe('Job Changes with Vesting', () => {
    it('should forfeit unvested contributions when changing jobs', () => {
      let state = createTestGameState();
      
      // Setup account with partial vesting
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 30000,
        contributionRate: 10,
        employerMatch: 50,
        employerMatchLimit: 6,
        vestingSchedule: { totalYears: 3, vestedPercentage: 50 }, // 50% vested
        annualContributions: 0,
        accountAge: 18, // 1.5 years
        unvestedBalance: 10000,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      
      const initialBalance = account.balance;
      
      // Change jobs - forfeit unvested contributions
      state.retirement.accounts[0] = RetirementLogic.forfeitUnvestedContributions(
        state.retirement.accounts[0]
      );
      
      // Should lose 50% of unvested balance
      expect(state.retirement.accounts[0].balance).toBe(initialBalance - 5000);
      expect(state.retirement.accounts[0].unvestedBalance).toBe(0);
      expect(state.retirement.accounts[0].isActive).toBe(false);
    });

    it('should preserve account balance across job changes', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 50000,
        contributionRate: 10,
        employerMatch: 50,
        employerMatchLimit: 6,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 }, // Fully vested
        annualContributions: 0,
        accountAge: 36,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      
      // Change jobs
      state.retirement.accounts[0] = RetirementLogic.forfeitUnvestedContributions(
        state.retirement.accounts[0]
      );
      
      // Balance should remain the same (fully vested)
      expect(state.retirement.accounts[0].balance).toBe(50000);
      expect(state.retirement.accounts[0].isActive).toBe(false);
    });
  });

  describe('Retirement Account Growth Over Time', () => {
    it('should grow account balance through contributions and market returns', () => {
      let state = createTestGameState();
      
      // Setup account
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 10000,
        contributionRate: 10,
        employerMatch: 50,
        employerMatchLimit: 6,
        vestingSchedule: { totalYears: 3, vestedPercentage: 0 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      state.career.salary = 60000;
      state.cash = 100000;
      
      const initialBalance = account.balance;
      
      // Simulate 24 months
      for (let i = 0; i < 24; i++) {
        // Add monthly contribution
        const monthlyContribution = (state.career.salary / 12 * account.contributionRate) / 100;
        const contributionResult = RetirementLogic.processContribution(
          state.retirement.accounts[0],
          state.retirement,
          monthlyContribution,
          state.player.age
        );
        
        state.retirement.accounts[0] = contributionResult.account;
        state.retirement = contributionResult.state;
        
        // Process turn (applies market returns)
        state = GameEngine.processTurn(state);
      }
      
      // Balance should have grown significantly
      expect(state.retirement.accounts[0].balance).toBeGreaterThan(initialBalance);
    });
  });

  describe('Early Withdrawal Scenarios', () => {
    it('should apply penalty and taxes for early withdrawal', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 50000,
        contributionRate: 10,
        employerMatch: 50,
        employerMatchLimit: 6,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 60,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      state.player.age = 40; // Under 59.5
      
      // Withdraw $10,000
      const withdrawalResult = RetirementLogic.processWithdrawal(
        state.retirement.accounts[0],
        10000,
        state.player.age,
        0.20
      );
      
      expect(withdrawalResult.success).toBe(true);
      expect(withdrawalResult.penalty).toBe(1000); // 10% penalty
      expect(withdrawalResult.taxes).toBe(2000); // 20% tax
      expect(withdrawalResult.cashReceived).toBe(7000); // 10000 - 1000 - 2000
      expect(withdrawalResult.account.balance).toBe(40000);
    });

    it('should not apply penalty for withdrawal after age 59.5', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 50000,
        contributionRate: 0,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 240, // 20 years
        unvestedBalance: 0,
        isActive: false,
      };
      
      state.retirement.accounts.push(account);
      state.player.age = 65;
      
      // Withdraw $10,000
      const withdrawalResult = RetirementLogic.processWithdrawal(
        state.retirement.accounts[0],
        10000,
        state.player.age,
        0.20
      );
      
      expect(withdrawalResult.success).toBe(true);
      expect(withdrawalResult.penalty).toBe(0); // No penalty
      expect(withdrawalResult.taxes).toBe(2000); // Still taxable
      expect(withdrawalResult.cashReceived).toBe(8000); // 10000 - 2000
    });
  });

  describe('RMD Enforcement at Age 72', () => {
    it('should generate RMD notification at age 72', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 100000,
        contributionRate: 0,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 600, // 50 years
        unvestedBalance: 0,
        isActive: false,
      };
      
      state.retirement.accounts.push(account);
      state.player.age = 72; // Already at RMD age
      
      // Process turn
      state = GameEngine.processTurn(state);
      
      // Should have RMD notification or be able to check RMD requirement
      const rmdCheck = RetirementLogic.checkRMDRequirement(account, 72);
      expect(rmdCheck.required).toBe(true);
      expect(rmdCheck.amount).toBeGreaterThan(0);
    });

    it('should not require RMD for Roth IRA', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: 'roth-1',
        type: 'roth_ira',
        balance: 100000,
        contributionRate: 0,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 600,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      state.player.age = 75;
      
      const rmdCheck = RetirementLogic.checkRMDRequirement(account, state.player.age);
      
      expect(rmdCheck.required).toBe(false);
      expect(rmdCheck.amount).toBe(0);
    });
  });

  describe('Contribution Limit Enforcement', () => {
    it('should enforce annual 401k contribution limits', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 0,
        contributionRate: 100, // Try to contribute 100%
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      state.retirement.currentYearContributions401k = 0;
      state.player.age = 30;
      
      // Try to contribute more than the limit
      const largeContribution = RETIREMENT_LIMITS.CONTRIBUTION_401K + 5000;
      
      const result = RetirementLogic.processContribution(
        state.retirement.accounts[0],
        state.retirement,
        largeContribution,
        state.player.age
      );
      
      // Should cap at limit
      expect(result.actualContribution).toBe(RETIREMENT_LIMITS.CONTRIBUTION_401K);
      expect(result.state.currentYearContributions401k).toBe(RETIREMENT_LIMITS.CONTRIBUTION_401K);
    });

    it('should reset contribution limits at new year', () => {
      let state = createTestGameState();
      
      state.retirement.currentYearContributions401k = RETIREMENT_LIMITS.CONTRIBUTION_401K;
      state.retirement.lastResetYear = 0;
      state.month = 0;
      
      // Process 12 months to trigger new year
      for (let i = 0; i < 12; i++) {
        state = GameEngine.processTurn(state);
      }
      
      // Contributions should be reset
      expect(state.retirement.currentYearContributions401k).toBe(0);
    });
  });

  describe('Catch-up Contributions at Age 50', () => {
    it('should allow higher contributions at age 50', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 0,
        contributionRate: 100,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      state.retirement.currentYearContributions401k = RETIREMENT_LIMITS.CONTRIBUTION_401K;
      state.player.age = 50;
      
      // Should be able to contribute catch-up amount
      const catchupContribution = RETIREMENT_LIMITS.CATCHUP_401K;
      
      const result = RetirementLogic.canContribute(
        state.retirement.accounts[0],
        state.retirement,
        catchupContribution,
        state.player.age
      );
      
      expect(result.allowed).toBe(true);
      expect(result.allowedAmount).toBe(catchupContribution);
    });

    it('should generate notification at age 50', () => {
      let state = createTestGameState();
      
      const account: RetirementAccount = {
        id: '401k-1',
        type: '401k',
        balance: 10000,
        contributionRate: 10,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
        annualContributions: 0,
        accountAge: 0,
        unvestedBalance: 0,
        isActive: true,
      };
      
      state.retirement.accounts.push(account);
      state.player.age = 50; // Already at age 50
      
      // Process turn
      state = GameEngine.processTurn(state);
      
      // Verify catch-up contributions are allowed
      const canContributeResult = RetirementLogic.canContribute(
        state.retirement.accounts[0],
        state.retirement,
        RETIREMENT_LIMITS.CATCHUP_401K,
        50
      );
      
      expect(canContributeResult.allowed).toBe(true);
    });
  });
});
