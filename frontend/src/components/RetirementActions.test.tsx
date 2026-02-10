import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetirementActions } from './RetirementActions';
import type { RetirementState, CareerState, BusinessState } from '../types';

describe('RetirementActions', () => {
  const mockCareerWith401k: CareerState = {
    currentJob: 'Software Engineer',
    salary: 100000,
    yearsExperience: 5,
    has401k: true,
    matchPercentage: 100,
    matchLimit: 6,
  };

  const mockCareerWithout401k: CareerState = {
    currentJob: 'Freelancer',
    salary: 80000,
    yearsExperience: 3,
    has401k: false,
    matchPercentage: 0,
    matchLimit: 0,
  };

  const mockBusinessActive: BusinessState = {
    type: 'tech_startup',
    revenue: 50000,
    expenses: 30000,
    employees: 2,
  };

  const mockBusinessInactive: BusinessState = {
    type: undefined,
    revenue: 0,
    expenses: 0,
    employees: 0,
  };

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

  const mockOnOpenAccount = vi.fn();
  const mockOnSetContributionRate = vi.fn();
  const mockOnWithdraw = vi.fn();

  describe('Action Buttons', () => {
    it('should render all three action buttons', () => {
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      expect(screen.getByText('Open Account')).toBeInTheDocument();
      expect(screen.getByText('Set Contribution')).toBeInTheDocument();
      expect(screen.getByText('Withdraw')).toBeInTheDocument();
    });

    it('should disable Set Contribution button when no active accounts', () => {
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      const setContributionButton = screen.getByText('Set Contribution').closest('button');
      expect(setContributionButton).toBeDisabled();
    });

    it('should disable Withdraw button when no accounts exist', () => {
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      const withdrawButton = screen.getByText('Withdraw').closest('button');
      expect(withdrawButton).toBeDisabled();
    });
  });

  describe('Open Account Modal', () => {
    it('should open modal when Open Account button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));

      expect(screen.getByText('Open Retirement Account')).toBeInTheDocument();
      expect(screen.getByText(/Choose the type of retirement account/)).toBeInTheDocument();
    });

    it('should show 401(k) option when career has 401k benefits', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));

      expect(screen.getByText('401(k)')).toBeInTheDocument();
      expect(screen.getByText(/Employer-sponsored plan/)).toBeInTheDocument();
      expect(screen.getByText(/Employer match: 100% up to 6%/)).toBeInTheDocument();
    });

    it('should show Traditional IRA option', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWithout401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));

      expect(screen.getByText('Traditional IRA')).toBeInTheDocument();
      expect(screen.getByText(/Individual retirement account/)).toBeInTheDocument();
    });

    it('should show Roth IRA option', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWithout401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));

      expect(screen.getByText('Roth IRA')).toBeInTheDocument();
      expect(screen.getByText(/After-tax contributions/)).toBeInTheDocument();
      expect(screen.getByText(/Tax-free withdrawals after age 59.5/)).toBeInTheDocument();
    });

    it('should show Solo 401(k) option when player has business', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWithout401k}
          business={mockBusinessActive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));

      expect(screen.getByText('Solo 401(k)')).toBeInTheDocument();
      expect(screen.getByText(/For business owners/)).toBeInTheDocument();
    });

    it('should call onOpenAccount when account type is selected', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));
      await user.click(screen.getByText('401(k)'));

      expect(mockOnOpenAccount).toHaveBeenCalledWith('401k');
    });

    it('should close modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementEmpty}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Open Account'));
      expect(screen.getByText('Open Retirement Account')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));
      await waitFor(() => {
        expect(screen.queryByText('Open Retirement Account')).not.toBeInTheDocument();
      });
    });
  });

  describe('Set Contribution Rate Modal', () => {
    it('should open modal when Set Contribution button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Set Contribution'));

      expect(screen.getByText('Set Contribution Rate')).toBeInTheDocument();
      expect(screen.getByText(/Choose an account and set your contribution percentage/)).toBeInTheDocument();
    });

    it('should display account selection dropdown', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Set Contribution'));

      expect(screen.getByText('Select Account')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should display contribution rate slider', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Set Contribution'));

      // Select an account first
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'acc-1');

      expect(screen.getByText(/Contribution Rate:/)).toBeInTheDocument();
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should show employer match warning when contribution is below match limit', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Set Contribution'));

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'acc-1');

      // Current rate is 6%, which matches the limit, so no warning
      // Let's change it to 3%
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });

      await waitFor(() => {
        expect(screen.getByText(/Increase to 6% to maximize match!/)).toBeInTheDocument();
      });
    });

    it('should call onSetContributionRate when Set Rate is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Set Contribution'));

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'acc-1');

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '10' } });

      await user.click(screen.getByText('Set Rate'));

      expect(mockOnSetContributionRate).toHaveBeenCalledWith('acc-1', 10);
    });
  });

  describe('Withdrawal Modal', () => {
    it('should open modal when Withdraw button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));

      expect(screen.getByText('Withdraw Funds')).toBeInTheDocument();
    });

    it('should show early withdrawal warning for age < 59.5', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));

      expect(screen.getByText(/Early withdrawal will incur penalties and taxes/)).toBeInTheDocument();
    });

    it('should show penalty-free message for age >= 59.5', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={60}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));

      expect(screen.getByText(/Withdrawals are penalty-free at your age/)).toBeInTheDocument();
    });

    it('should display withdrawal breakdown with penalty for early withdrawal', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'acc-1');

      const input = screen.getByPlaceholderText('Enter amount');
      await user.type(input, '10000');

      await waitFor(() => {
        expect(screen.getByText('Withdrawal Breakdown')).toBeInTheDocument();
        expect(screen.getByText(/Early Withdrawal Penalty \(10%\)/)).toBeInTheDocument();
        expect(screen.getByText(/Income Tax \(22%\)/)).toBeInTheDocument();
        expect(screen.getByText('Net Amount')).toBeInTheDocument();
      });
    });

    it('should call onWithdraw when Confirm Withdrawal is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'acc-1');

      const input = screen.getByPlaceholderText('Enter amount');
      await user.type(input, '10000');

      await user.click(screen.getByText('Confirm Withdrawal'));

      expect(mockOnWithdraw).toHaveBeenCalledWith('acc-1', 10000);
    });

    it('should show withdrawal guidance for different age ranges', async () => {
      const user = userEvent.setup();
      
      // Test age < 59.5
      const { rerender } = render(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={30}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'acc-1');
      const input = screen.getByPlaceholderText('Enter amount');
      await user.type(input, '10000');

      await waitFor(() => {
        expect(screen.getByText(/Early Withdrawal Warning/)).toBeInTheDocument();
      });

      // Close modal
      await user.click(screen.getByText('Cancel'));

      // Test age 60-71
      rerender(
        <RetirementActions
          retirement={mockRetirementWith401k}
          career={mockCareerWith401k}
          business={mockBusinessInactive}
          playerAge={65}
          cash={10000}
          onOpenAccount={mockOnOpenAccount}
          onSetContributionRate={mockOnSetContributionRate}
          onWithdraw={mockOnWithdraw}
        />
      );

      await user.click(screen.getByText('Withdraw'));
      const select2 = screen.getByRole('combobox');
      await user.selectOptions(select2, 'acc-1');
      const input2 = screen.getByPlaceholderText('Enter amount');
      await user.type(input2, '10000');

      await waitFor(() => {
        expect(screen.getByText(/Withdrawal Strategy/)).toBeInTheDocument();
      });
    });
  });
});
