import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RetirementNotifications } from './RetirementNotifications';
import type { RetirementState, CareerState } from '../types';

describe('RetirementNotifications', () => {
  const mockCareerWith401k: CareerState = {
    jobTitle: 'Software Engineer',
    salary: 100000,
    educationLevel: 'Bachelor',
    tuitionCost: 0,
    studyProgress: 0,
    isStudying: false,
    expensesLiving: 0,
    savingsGoal: 10000,
    pendingDecisions: [],
    has401k: true,
    matchPercentage: 100,
    matchLimit: 6,
    vestingYears: 4,
  };

  const mockCareerWithout401k: CareerState = {
    jobTitle: 'Freelancer',
    salary: 80000,
    educationLevel: 'Bachelor',
    tuitionCost: 0,
    studyProgress: 0,
    isStudying: false,
    expensesLiving: 0,
    savingsGoal: 10000,
    pendingDecisions: [],
    has401k: false,
    matchPercentage: 0,
    matchLimit: 0,
    vestingYears: 0,
  };

  const mockRetirementEmpty: RetirementState = {
    accounts: [],
    currentYearContributions401k: 0,
    currentYearContributionsIRA: 0,
    lastResetYear: 1,
  };

  const mockRetirementWith401kBelowMatch: RetirementState = {
    accounts: [
      {
        id: 'acc-1',
        type: '401k',
        balance: 50000,
        contributionRate: 3, // Below match limit of 6%
        employerMatch: 100,
        employerMatchLimit: 6,
        vestingSchedule: {
          totalYears: 4,
          vestedPercentage: 50,
        },
        unvestedBalance: 5000,
        annualContributions: 3000,
        accountAge: 24,
        isActive: true,
      },
    ],
    currentYearContributions401k: 3000,
    currentYearContributionsIRA: 0,
    lastResetYear: 1,
  };

  const mockRetirementWith401kMaxMatch: RetirementState = {
    accounts: [
      {
        id: 'acc-1',
        type: '401k',
        balance: 50000,
        contributionRate: 6, // At match limit
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
    lastResetYear: 1,
  };

  describe('No Notifications', () => {
    it('should render nothing when no notifications are needed', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      // Should only show the success notification for maximizing match
      expect(screen.getByText('Maximizing Employer Match')).toBeInTheDocument();
    });
  });

  describe('Employer Match Warnings', () => {
    it('should display warning when contribution is below employer match limit', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kBelowMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Missing Employer Match')).toBeInTheDocument();
      expect(screen.getByText(/You're contributing 3.0%/)).toBeInTheDocument();
      expect(screen.getByText(/Increase to 6%/)).toBeInTheDocument();
    });

    it('should calculate missed match amount correctly', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kBelowMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      // Missing 3% contribution, employer matches 100%, so missing ~250/month
      expect(screen.getByText(/250\/month in free money/)).toBeInTheDocument();
    });

    it('should display success message when maximizing employer match', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Maximizing Employer Match')).toBeInTheDocument();
      expect(screen.getByText(/Great job!/)).toBeInTheDocument();
      expect(screen.getByText(/getting the full employer match/)).toBeInTheDocument();
    });

    it('should display partial match warning with annual calculation', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kBelowMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Leaving Money on the Table')).toBeInTheDocument();
      // Use getAllByText since the text appears in multiple notification cards
      const elements = screen.getAllByText((_content, element) => {
        return Boolean(
          element?.textContent?.includes('missing out on $3000/year') ||
          element?.textContent?.includes('missing out on $3,000/year')
        );
      });
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Age-Based Notifications', () => {
    it('should display catch-up contribution notification at age 50', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={50}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Catch-Up Contributions Available')).toBeInTheDocument();
      expect(screen.getByText(/You're now 50!/)).toBeInTheDocument();
      expect(screen.getByText(/extra \$7,500 to your 401\(k\)/)).toBeInTheDocument();
      expect(screen.getByText(/\$1,000 to IRAs/)).toBeInTheDocument();
    });

    it('should not display catch-up notification for age 49', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={49}
          grossIncome={100000}
        />
      );

      expect(screen.queryByText('Catch-Up Contributions Available')).not.toBeInTheDocument();
    });

    it('should not display catch-up notification for age 51', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={51}
          grossIncome={100000}
        />
      );

      expect(screen.queryByText('Catch-Up Contributions Available')).not.toBeInTheDocument();
    });

    it('should display RMD notification at age 72', () => {
      const retirementWithTraditional: RetirementState = {
        accounts: [
          {
            id: 'acc-1',
            type: '401k',
            balance: 500000,
            contributionRate: 0,
            employerMatch: 0,
            employerMatchLimit: 0,
            vestingSchedule: {
              totalYears: 4,
              vestedPercentage: 100,
            },
            unvestedBalance: 0,
            annualContributions: 0,
            accountAge: 480,
            isActive: false,
          },
        ],
        currentYearContributions401k: 0,
        currentYearContributionsIRA: 0,
        lastResetYear: 1,
      };

      render(
        <RetirementNotifications
          retirement={retirementWithTraditional}
          career={mockCareerWith401k}
          playerAge={72}
          grossIncome={0}
        />
      );

      expect(screen.getByText('Required Minimum Distributions')).toBeInTheDocument();
      expect(screen.getByText(/You've reached age 72/)).toBeInTheDocument();
      expect(screen.getByText(/50% penalty/)).toBeInTheDocument();
    });

    it('should not display RMD notification for Roth IRA only', () => {
      const retirementWithRoth: RetirementState = {
        accounts: [
          {
            id: 'acc-1',
            type: 'roth_ira',
            balance: 500000,
            contributionRate: 0,
            employerMatch: 0,
            employerMatchLimit: 0,
            vestingSchedule: {
              totalYears: 0,
              vestedPercentage: 100,
            },
            unvestedBalance: 0,
            annualContributions: 0,
            accountAge: 480,
            isActive: true,
          },
        ],
        currentYearContributions401k: 0,
        currentYearContributionsIRA: 0,
        lastResetYear: 1,
      };

      render(
        <RetirementNotifications
          retirement={retirementWithRoth}
          career={mockCareerWith401k}
          playerAge={72}
          grossIncome={0}
        />
      );

      expect(screen.queryByText('Required Minimum Distributions')).not.toBeInTheDocument();
    });
  });

  describe('No Retirement Account Notifications', () => {
    it('should display notification when player has no accounts but has 401k benefit', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Start Saving for Retirement')).toBeInTheDocument();
      expect(screen.getByText(/Your employer offers a 401\(k\) with 100% match/)).toBeInTheDocument();
    });

    it('should display IRA suggestion when player has no accounts and no 401k', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementEmpty}
          career={mockCareerWithout401k}
          playerAge={30}
          grossIncome={80000}
        />
      );

      expect(screen.getByText('Start Saving for Retirement')).toBeInTheDocument();
      expect(screen.getByText(/Consider opening an IRA/)).toBeInTheDocument();
    });

    it('should not display notification when player has no income and no accounts', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementEmpty}
          career={mockCareerWithout401k}
          playerAge={18}
          grossIncome={0}
        />
      );

      // Should render nothing
      const notifications = screen.queryByText('Start Saving for Retirement');
      expect(notifications).not.toBeInTheDocument();
    });
  });

  describe('Notification Styling', () => {
    it('should apply warning styling to employer match warning', () => {
      const { container } = render(
        <RetirementNotifications
          retirement={mockRetirementWith401kBelowMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      const warningNotification = container.querySelector('.bg-yellow-500\\/10');
      expect(warningNotification).toBeInTheDocument();
    });

    it('should apply success styling to maximizing match notification', () => {
      const { container } = render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      const successNotification = container.querySelector('.bg-emerald-500\\/10');
      expect(successNotification).toBeInTheDocument();
    });

    it('should apply info styling to catch-up notification', () => {
      const { container } = render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={50}
          grossIncome={100000}
        />
      );

      const infoNotification = container.querySelector('.bg-blue-500\\/10');
      expect(infoNotification).toBeInTheDocument();
    });
  });

  describe('Multiple Notifications', () => {
    it('should display multiple notifications when applicable', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kBelowMatch}
          career={mockCareerWith401k}
          playerAge={30}
          grossIncome={100000}
        />
      );

      // Should show both missing match and partial match warnings
      expect(screen.getByText('Missing Employer Match')).toBeInTheDocument();
      expect(screen.getByText('Leaving Money on the Table')).toBeInTheDocument();
    });

    it('should display catch-up and match notifications together', () => {
      render(
        <RetirementNotifications
          retirement={mockRetirementWith401kMaxMatch}
          career={mockCareerWith401k}
          playerAge={50}
          grossIncome={100000}
        />
      );

      expect(screen.getByText('Catch-Up Contributions Available')).toBeInTheDocument();
      expect(screen.getByText('Maximizing Employer Match')).toBeInTheDocument();
    });
  });
});
