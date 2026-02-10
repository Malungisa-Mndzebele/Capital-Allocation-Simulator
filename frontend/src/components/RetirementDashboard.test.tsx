import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RetirementDashboard } from './RetirementDashboard';
import type { RetirementState } from '../types';

describe('RetirementDashboard', () => {
  const mockRetirementEmpty: RetirementState = {
    accounts: [],
    currentYearContributions401k: 0,
    currentYearContributionsIRA: 0,
  };

  const mockRetirementWith401k: RetirementState = {
    accounts: [
      {
        id: 'acc-1',
        type: '401k',
        balance: 50000,
        contributionRate: 6,
        employerMatch: 100,
        employerMatchLimit: 6,
        vestingSchedule: {
          totalYears: 4,
          vestedPercentage: 50,
        },
        unvestedBalance: 5000,
        annualContributions: 6000,
        accountAge: 24,
        isActive: true,
      },
    ],
    currentYearContributions401k: 6000,
    currentYearContributionsIRA: 0,
  };

  const mockRetirementMultipleAccounts: RetirementState = {
    accounts: [
      {
        id: 'acc-1',
        type: '401k',
        balance: 50000,
        contributionRate: 10,
        employerMatch: 100,
        employerMatchLimit: 6,
        vestingSchedule: {
          totalYears: 4,
          vestedPercentage: 75,
        },
        unvestedBalance: 2500,
        annualContributions: 10000,
        accountAge: 36,
        isActive: true,
      },
      {
        id: 'acc-2',
        type: 'traditional_ira',
        balance: 25000,
        contributionRate: 0,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: {
          totalYears: 0,
          vestedPercentage: 100,
        },
        unvestedBalance: 0,
        annualContributions: 7000,
        accountAge: 18,
        isActive: true,
      },
      {
        id: 'acc-3',
        type: 'roth_ira',
        balance: 15000,
        contributionRate: 0,
        employerMatch: 0,
        employerMatchLimit: 0,
        vestingSchedule: {
          totalYears: 0,
          vestedPercentage: 100,
        },
        unvestedBalance: 0,
        annualContributions: 5000,
        accountAge: 12,
        isActive: true,
      },
    ],
    currentYearContributions401k: 10000,
    currentYearContributionsIRA: 7000,
  };

  describe('Empty State', () => {
    it('should display empty state when no retirement accounts exist', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementEmpty}
          playerAge={30}
          grossIncome={60000}
        />
      );

      expect(screen.getByText('No Retirement Accounts')).toBeInTheDocument();
      expect(
        screen.getByText(/Open a retirement account to start saving/)
      ).toBeInTheDocument();
    });
  });

  describe('Single Account Display', () => {
    it('should display 401(k) account with correct balance', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('401(k)')).toBeInTheDocument();
      // Use getAllByText since balance appears in multiple places (total and account)
      const balances = screen.getAllByText('$50,000');
      expect(balances.length).toBeGreaterThan(0);
    });

    it('should display contribution rate and monthly contribution', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText(/6\.0%/)).toBeInTheDocument();
      // Use getAllByText since monthly contribution appears in both employee and employer sections
      const monthlyContributions = screen.getAllByText(/\$500\/mo/);
      expect(monthlyContributions.length).toBeGreaterThan(0);
    });

    it('should display employer match information', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText(/Employer Match/)).toBeInTheDocument();
      expect(screen.getByText(/100% up to 6%/)).toBeInTheDocument();
    });

    it('should display vesting status when unvested balance exists', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Vesting Status')).toBeInTheDocument();
      expect(screen.getByText('Vested Amount')).toBeInTheDocument();
      expect(screen.getByText('Unvested Amount')).toBeInTheDocument();
      expect(screen.getByText('$45,000')).toBeInTheDocument(); // Vested
      expect(screen.getByText('$5,000')).toBeInTheDocument(); // Unvested
    });

    it('should display account age correctly', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText(/Account Age: 2y 0m/)).toBeInTheDocument();
    });

    it('should display tax status for traditional accounts', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(
        screen.getByText(/Tax-deferred growth \(taxed on withdrawal\)/)
      ).toBeInTheDocument();
    });
  });

  describe('Multiple Accounts Display', () => {
    it('should display all retirement accounts', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementMultipleAccounts}
          playerAge={35}
          grossIncome={120000}
        />
      );

      expect(screen.getByText('401(k)')).toBeInTheDocument();
      expect(screen.getByText('Traditional IRA')).toBeInTheDocument();
      expect(screen.getByText('Roth IRA')).toBeInTheDocument();
    });

    it('should display total retirement balance', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementMultipleAccounts}
          playerAge={35}
          grossIncome={120000}
        />
      );

      // Total: 50000 + 25000 + 15000 = 90000
      expect(screen.getByText('$90,000')).toBeInTheDocument();
    });

    it('should display different tax status for Roth IRA', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementMultipleAccounts}
          playerAge={35}
          grossIncome={120000}
        />
      );

      expect(
        screen.getByText(/Tax-free growth & withdrawals/)
      ).toBeInTheDocument();
    });
  });

  describe('Contribution Limits', () => {
    it('should display remaining 401k contribution capacity', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      // Limit is 23000, contributed 6000, remaining 17000
      expect(screen.getByText('401(k) Remaining')).toBeInTheDocument();
      expect(screen.getByText('$17,000')).toBeInTheDocument();
      expect(screen.getByText(/of \$23,000 limit/)).toBeInTheDocument();
    });

    it('should display remaining IRA contribution capacity', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('IRA Remaining')).toBeInTheDocument();
      expect(screen.getByText('$7,000')).toBeInTheDocument();
      expect(screen.getByText(/of \$7,000 limit/)).toBeInTheDocument();
    });

    it('should display catch-up contribution notice for age 50+', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={50}
          grossIncome={100000}
        />
      );

      expect(
        screen.getByText(/Catch-up contributions enabled \(Age 50\+\)/)
      ).toBeInTheDocument();
    });

    it('should show higher limits for age 50+', () => {
      render(
        <RetirementDashboard
          retirement={mockRetirementWith401k}
          playerAge={50}
          grossIncome={100000}
        />
      );

      // 401k limit with catch-up: 30500
      expect(screen.getByText(/of \$30,500 limit/)).toBeInTheDocument();
    });
  });

  describe('Inactive Accounts', () => {
    it('should display inactive status for old 401k accounts', () => {
      const retirementWithInactive: RetirementState = {
        accounts: [
          {
            id: 'acc-1',
            type: '401k',
            balance: 30000,
            contributionRate: 0,
            employerMatch: 0,
            employerMatchLimit: 0,
            vestingSchedule: {
              totalYears: 4,
              vestedPercentage: 100,
            },
            unvestedBalance: 0,
            annualContributions: 0,
            accountAge: 48,
            isActive: false,
          },
        ],
        currentYearContributions401k: 0,
        currentYearContributionsIRA: 0,
      };

      render(
        <RetirementDashboard
          retirement={retirementWithInactive}
          playerAge={35}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });
});
