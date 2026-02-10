import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetirementTutorial } from './RetirementTutorial';

describe('RetirementTutorial', () => {
  const mockOnClose = vi.fn();

  describe('Tutorial Display', () => {
    it('should render tutorial with title and description', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText('Welcome to 401(k) Benefits!')).toBeInTheDocument();
      expect(screen.getByText('Your guide to retirement savings')).toBeInTheDocument();
    });

    it('should display what is a 401(k) section', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText('What is a 401(k)?')).toBeInTheDocument();
      expect(screen.getByText(/tax-advantaged retirement savings account/)).toBeInTheDocument();
      expect(screen.getByText(/before taxes/)).toBeInTheDocument();
    });

    it('should display employer match section when match is available', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText('Free Money: Employer Match!')).toBeInTheDocument();
      // Use getAllByText since text appears in multiple places in the tutorial
      const matchElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('Your employer will match 100%');
      });
      expect(matchElements.length).toBeGreaterThan(0);
      
      const limitElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('up to 6%');
      });
      expect(limitElements.length).toBeGreaterThan(0);
    });

    it('should display employer match example calculation', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText(/If you contribute 6% of your salary:/)).toBeInTheDocument();
      expect(screen.getByText(/Employer adds 100% match:/)).toBeInTheDocument();
      expect(screen.getByText(/Total annual contribution:/)).toBeInTheDocument();
    });

    it('should display pro tip about maximizing employer match', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText(/Always contribute at least 6% to maximize your employer match!/)).toBeInTheDocument();
    });

    it('should display tax benefits section', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText('Tax Benefits')).toBeInTheDocument();
      expect(screen.getByText(/Pre-tax contributions:/)).toBeInTheDocument();
      expect(screen.getByText(/Tax-deferred growth:/)).toBeInTheDocument();
      expect(screen.getByText(/Compound interest:/)).toBeInTheDocument();
    });

    it('should display contribution limits section', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText('Contribution Limits')).toBeInTheDocument();
      expect(screen.getByText(/Annual 401\(k\) limit \(2024\):/)).toBeInTheDocument();
      // Use getAllByText since $23,000 appears multiple times in the tutorial
      const limits = screen.getAllByText('$23,000');
      expect(limits.length).toBeGreaterThan(0);
    });

    it('should display catch-up contribution info for age 50+', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={50}
        />
      );

      expect(screen.getByText(/Catch-up contribution \(Age 50\+\):/)).toBeInTheDocument();
      expect(screen.getByText('+$7,500')).toBeInTheDocument();
      expect(screen.getByText('$30,500')).toBeInTheDocument(); // Total limit
    });

    it('should not display catch-up contribution info for age < 50', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.queryByText(/Catch-up contribution/)).not.toBeInTheDocument();
    });

    it('should display important notes section', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.getByText('⚠️ Important to Know')).toBeInTheDocument();
      expect(screen.getByText(/Early withdrawals \(before age 59.5\)/)).toBeInTheDocument();
      expect(screen.getByText(/10% penalty/)).toBeInTheDocument();
      expect(screen.getByText(/vesting schedule/)).toBeInTheDocument();
    });
  });

  describe('Tutorial Interaction', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      const closeButton = screen.getAllByRole('button')[0]; // X button
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when action button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      await user.click(screen.getByText("Got It! Let's Start Saving"));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Different Employer Match Scenarios', () => {
    it('should display correct match percentage for 50% match', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={50}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      // Use getAllByText since text appears in multiple places
      const elements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('Your employer will match 50%');
      });
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display correct match limit for 4% limit', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={4}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      // Use getAllByText since text appears in multiple places
      const elements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('up to 4%');
      });
      expect(elements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Always contribute at least 4% to maximize your employer match!/)).toBeInTheDocument();
    });

    it('should not display employer match section when match is 0', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={0}
          employerMatchLimit={0}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      expect(screen.queryByText('Free Money: Employer Match!')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have close button accessible', () => {
      render(
        <RetirementTutorial
          onClose={mockOnClose}
          employerMatch={100}
          employerMatchLimit={6}
          contributionLimit={23000}
          playerAge={30}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
