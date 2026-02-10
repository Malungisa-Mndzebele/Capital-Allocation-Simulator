# Implementation Plan: Retirement Accounts System

## Overview

This implementation plan adds a comprehensive retirement accounts system to the financial life simulator game, including 401(k), Traditional IRA, and Roth IRA accounts with realistic tax treatment, contribution limits, employer matching, vesting schedules, and withdrawal rules.

## Tasks

- [x] 1. Define retirement account data structures and types
  - Add `RetirementAccount` interface to types.ts with fields: id, type, balance, contributionRate, employerMatch, vestingSchedule, annualContributions, accountAge
  - Add retirement account types: '401k', 'traditional_ira', 'roth_ira'
  - Add `RetirementState` interface with accounts array and contribution tracking
  - Add `RetirementState` to `GameState` interface
  - Add retirement-related constants to config.ts (contribution limits, penalty rates, RMD age thresholds)
  - _Requirements: 1.1, 1.2, 2.1, 6.1, 6.2, 7.1, 8.1_

- [x] 2. Create RetirementLogic system module
  - [x] 2.1 Create backend/src/engine/systems/RetirementLogic.ts with class structure
    - Implement `processMonth()` method to handle monthly retirement account updates
    - Implement `applyInvestmentReturns()` method using market logic (tax-deferred growth)
    - Implement `resetAnnualContributions()` method for new calendar year
    - _Requirements: 2.5, 4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 Implement contribution processing methods
    - Implement `calculateContribution()` method with pre-tax deduction logic
    - Implement `processContribution()` method with contribution limit enforcement
    - Implement `canContribute()` method to check against annual limits
    - Handle catch-up contributions for age 50+ players
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3_

  - [x] 2.3 Implement employer matching logic
    - Implement `calculateEmployerMatch()` method with match formula support
    - Implement `applyVesting()` method to track vested vs unvested contributions
    - Implement `forfeitUnvestedContributions()` method for job changes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.4 Implement withdrawal logic
    - Implement `calculateWithdrawalPenalty()` method for early withdrawals
    - Implement `processWithdrawal()` method with tax and penalty calculations
    - Implement `calculateRMD()` method using IRS Uniform Lifetime Table
    - Handle different withdrawal rules for 401(k), Traditional IRA, and Roth IRA
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3. Integrate retirement accounts with GameEngine
  - [x] 3.1 Initialize retirement state in `getInitialState()`
    - Add empty retirement accounts array to initial state
    - Initialize contribution tracking fields
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Add retirement processing to `processTurn()`
    - Call RetirementLogic.processMonth() during turn processing
    - Apply investment returns to retirement accounts (tax-deferred)
    - Check for annual contribution limit resets
    - Check for RMD requirements at age 72
    - _Requirements: 2.1, 2.5, 4.1, 9.1, 9.2_

  - [x] 3.3 Integrate retirement contributions with income calculation
    - Deduct 401(k) contributions before calculating income tax
    - Handle Roth IRA contributions (after-tax)
    - Update cash flow to reflect retirement contributions
    - _Requirements: 2.2, 8.2_

  - [x] 3.4 Update net worth calculation to include retirement accounts
    - Add all retirement account balances to net worth
    - Track retirement accounts separately in financial dashboard
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 4. Integrate retirement benefits with CareerLogic
  - [x] 4.1 Add 401(k) benefits to job data structure
    - Define employer match formulas for different job types
    - Add `has401k` and `matchFormula` fields to career opportunities
    - Update job selection to apply 401(k) benefits
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 4.2 Handle job changes and vesting
    - Mark 401(k) as inactive when changing jobs
    - Forfeit unvested employer contributions on job change
    - Preserve account balance across job changes
    - _Requirements: 1.5, 3.4_

  - [x] 4.3 Add self-employment and business retirement options
    - Allow IRA access for self-employed players
    - Implement Solo 401(k) for business owners with higher limits
    - _Requirements: 10.4, 10.5_

- [x] 5. Add retirement account actions to server API
  - [x] 5.1 Add action types to config.ts
    - Add 'OPEN_RETIREMENT_ACCOUNT', 'SET_CONTRIBUTION_RATE', 'WITHDRAW_RETIREMENT' to VALID_ACTIONS
    - _Requirements: 1.1, 1.3, 5.1_

  - [x] 5.2 Implement action handlers in server.ts
    - Handle OPEN_RETIREMENT_ACCOUNT action (create new retirement account)
    - Handle SET_CONTRIBUTION_RATE action (update contribution percentage)
    - Handle WITHDRAW_RETIREMENT action (process withdrawal with penalties)
    - Validate actions against game state and rules
    - _Requirements: 1.1, 1.3, 5.1, 5.2, 5.3_

- [x] 6. Add retirement account UI components (Frontend)
  - [x] 6.1 Create RetirementDashboard component
    - Display all retirement accounts with balances and types
    - Show contribution rates and employer match information
    - Display annual contribution limits and remaining capacity
    - Show vesting status for employer contributions
    - _Requirements: 1.4, 11.1, 11.2, 11.5_

  - [x] 6.2 Create RetirementActions component
    - Add UI to open new retirement accounts (401k, IRA)
    - Add slider/input to set contribution percentage
    - Add withdrawal interface with penalty calculator
    - Display warnings for early withdrawals
    - _Requirements: 1.1, 1.3, 5.3, 12.3_

  - [x] 6.3 Update PlayerSidebar to show retirement summary
    - Add retirement account balances to net worth display
    - Show total retirement savings
    - Indicate tax-advantaged status with visual indicator
    - _Requirements: 11.1, 11.2, 11.5_

  - [x] 6.4 Update cash flow display to show retirement contributions
    - Show 401(k) contributions as pre-tax deduction
    - Show IRA contributions separately
    - Display employer match as additional income
    - _Requirements: 11.4_

- [x] 7. Add retirement guidance and tutorials
  - [x] 7.1 Create tutorial system for retirement accounts
    - Display tutorial when player first becomes eligible for 401(k)
    - Explain benefits of employer matching
    - Show contribution limit information
    - _Requirements: 12.1_

  - [x] 7.2 Add intelligent warnings and notifications
    - Warn when contribution rate is below employer match threshold
    - Notify about catch-up contributions at age 50
    - Alert about RMD requirements at age 72
    - Show notification when contribution limits increase
    - _Requirements: 12.2, 12.4, 6.5, 9.2_

  - [x] 7.3 Create withdrawal penalty calculator
    - Display calculator when player considers early withdrawal
    - Show breakdown of penalties, taxes, and net amount
    - Provide guidance on withdrawal strategies near retirement
    - _Requirements: 12.3, 12.5_

- [x] 8. Update retirement scoring and game completion
  - [x] 8.1 Enhance `calculateRetirementScore()` method
    - Add retirement account balance to scoring algorithm
    - Reward players with substantial retirement savings
    - Consider retirement readiness in final score
    - _Requirements: 11.1_

  - [x] 8.2 Add retirement-specific achievements
    - Add achievement for first retirement account opened
    - Add achievement for maximizing employer match
    - Add achievement for reaching contribution limits
    - Add achievement for $1M retirement savings
    - _Requirements: 11.1_

- [x] 9. Testing and validation
  - [x] 9.1 Write unit tests for RetirementLogic

    - Test contribution calculations with various income levels
    - Test employer matching formulas
    - Test vesting schedule calculations
    - Test withdrawal penalty calculations
    - Test RMD calculations
    - Test contribution limit enforcement
    - _Requirements: All_

  - [x] 9.2 Write integration tests for retirement system


    - Test full career lifecycle with 401(k)
    - Test job changes with vesting
    - Test retirement account growth over time
    - Test early withdrawal scenarios
    - Test RMD enforcement at age 72
    - _Requirements: All_

  - [x] 9.3 Test UI components

    - Test RetirementDashboard rendering
    - Test contribution rate updates
    - Test withdrawal flow
    - Test tutorial and notification display
    - _Requirements: 11.1, 11.2, 11.4, 12.1, 12.2_

- [x] 10. Documentation and polish
  - [x] 10.1 Update game guide with retirement information
    - Document retirement account types and benefits
    - Explain contribution strategies
    - Provide withdrawal guidance
    - _Requirements: 12.1, 12.5_

  - [x] 10.2 Add retirement examples to README
    - Show example retirement savings scenarios
    - Document API endpoints for retirement actions
    - Provide code examples for retirement logic
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Implementation should follow existing patterns in GameEngine and system modules
- Retirement accounts use the same market logic as regular investments but with tax-deferred growth
- The system integrates with existing career, business, and investment systems
- Testing framework needs to be set up (Jest or Vitest recommended for TypeScript)
