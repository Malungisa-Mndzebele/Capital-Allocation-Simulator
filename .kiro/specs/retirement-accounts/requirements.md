# Requirements Document: Retirement Accounts System

## Introduction

This document specifies the requirements for implementing a comprehensive retirement accounts system in the financial life simulator game. The system will include 401(k) accounts with employer matching, contribution limits, tax advantages, early withdrawal penalties, and integration with the existing career and financial systems.

## Glossary

- **Game_Engine**: The core game system that manages player state, turn progression, and game mechanics
- **Retirement_Account**: A tax-advantaged investment account (401(k), Traditional IRA, or Roth IRA)
- **Employer_Match**: Employer contribution to a 401(k) based on employee contribution percentage
- **Contribution_Limit**: Annual maximum amount that can be contributed to retirement accounts (IRS limits)
- **Vesting_Schedule**: Timeline over which employer contributions become owned by the employee
- **Early_Withdrawal_Penalty**: 10% penalty plus taxes for withdrawing before age 59.5
- **Required_Minimum_Distribution**: Mandatory withdrawals from retirement accounts starting at age 72
- **Tax_Deferred_Growth**: Investment growth not taxed until withdrawal
- **Player_State**: Current game state including age, income, expenses, and financial accounts

## Requirements

### Requirement 1: 401(k) Account Management

**User Story:** As a player, I want to open and manage a 401(k) retirement account, so that I can save for retirement with tax advantages and employer matching.

#### Acceptance Criteria

1. WHEN a player has a job with 401(k) benefits, THE Game_Engine SHALL allow the player to enroll in the 401(k) plan
2. WHEN a player enrolls in a 401(k), THE Game_Engine SHALL create a Retirement_Account with type "401k" and initial balance of zero
3. WHEN a player sets their contribution percentage, THE Game_Engine SHALL validate it is between 0% and 100% of gross income
4. WHEN a player has an active 401(k), THE Game_Engine SHALL display the account balance, contribution rate, and employer match rate
5. WHEN a player changes jobs, THE Game_Engine SHALL preserve the 401(k) account balance and mark it as inactive

### Requirement 2: Contribution Processing

**User Story:** As a player, I want my 401(k) contributions to be automatically deducted from my paycheck, so that I can consistently save for retirement.

#### Acceptance Criteria

1. WHEN the player receives income, THE Game_Engine SHALL calculate the 401(k) contribution as (gross_income * contribution_percentage)
2. WHEN calculating take-home pay, THE Game_Engine SHALL deduct 401(k) contributions before calculating income tax
3. WHEN a 401(k) contribution is made, THE Game_Engine SHALL add the contribution amount to the Retirement_Account balance
4. WHEN annual contributions reach the Contribution_Limit, THE Game_Engine SHALL prevent further contributions for that calendar year
5. WHEN a new calendar year begins, THE Game_Engine SHALL reset the annual contribution counter to zero

### Requirement 3: Employer Matching

**User Story:** As a player, I want to receive employer matching contributions to my 401(k), so that I can maximize my retirement savings.

#### Acceptance Criteria

1. WHEN a player makes a 401(k) contribution, THE Game_Engine SHALL calculate the employer match based on the employer's match formula
2. WHEN the employer match is calculated, THE Game_Engine SHALL add the match amount to the Retirement_Account balance
3. WHEN employer contributions are added, THE Game_Engine SHALL track them separately with a Vesting_Schedule
4. WHEN a player leaves a job before fully vested, THE Game_Engine SHALL remove unvested employer contributions from the account
5. WHEN a player reaches full vesting, THE Game_Engine SHALL mark all employer contributions as fully owned

### Requirement 4: Investment Growth

**User Story:** As a player, I want my 401(k) balance to grow through investments, so that my retirement savings increase over time.

#### Acceptance Criteria

1. WHEN a turn passes, THE Game_Engine SHALL apply investment returns to the Retirement_Account balance
2. WHEN calculating investment returns, THE Game_Engine SHALL use the same market logic as regular investment accounts
3. WHEN investment gains occur in a Retirement_Account, THE Game_Engine SHALL not apply capital gains tax
4. WHEN investment losses occur in a Retirement_Account, THE Game_Engine SHALL update the balance accordingly
5. WHEN displaying account performance, THE Game_Engine SHALL show total contributions, employer match, and investment gains separately

### Requirement 5: Early Withdrawal Penalties

**User Story:** As a player, I want to understand the consequences of early 401(k) withdrawals, so that I can make informed financial decisions.

#### Acceptance Criteria

1. WHEN a player attempts to withdraw from a Retirement_Account before age 59.5, THE Game_Engine SHALL calculate a 10% Early_Withdrawal_Penalty
2. WHEN an early withdrawal is processed, THE Game_Engine SHALL add the withdrawn amount to taxable income for that year
3. WHEN calculating the withdrawal amount, THE Game_Engine SHALL deduct both the penalty and income tax before giving cash to the player
4. WHEN a player is age 59.5 or older, THE Game_Engine SHALL allow penalty-free withdrawals
5. IF a player has financial hardship (negative cash, high debt), THEN THE Game_Engine SHALL allow hardship withdrawals with reduced penalties

### Requirement 6: Contribution Limits and Compliance

**User Story:** As a player, I want the game to enforce IRS contribution limits, so that the simulation remains realistic.

#### Acceptance Criteria

1. WHEN the game year is 2024 or later, THE Game_Engine SHALL set the annual 401(k) Contribution_Limit to $23,000
2. WHEN a player is age 50 or older, THE Game_Engine SHALL increase the Contribution_Limit by $7,500 (catch-up contribution)
3. WHEN total contributions reach the limit, THE Game_Engine SHALL display a notification and prevent further contributions
4. WHEN employer match contributions are added, THE Game_Engine SHALL not count them toward the employee Contribution_Limit
5. WHEN a new year begins, THE Game_Engine SHALL notify the player if contribution limits have increased

### Requirement 7: Traditional IRA Support

**User Story:** As a player, I want to open a Traditional IRA, so that I can save for retirement even without employer-sponsored plans.

#### Acceptance Criteria

1. WHEN a player chooses to open an IRA, THE Game_Engine SHALL create a Retirement_Account with type "traditional_ira"
2. WHEN a player contributes to a Traditional IRA, THE Game_Engine SHALL deduct the contribution from taxable income
3. WHEN the game year is 2024 or later, THE Game_Engine SHALL set the annual IRA contribution limit to $7,000
4. WHEN a player has both a 401(k) and IRA, THE Game_Engine SHALL track contribution limits separately
5. WHEN a player withdraws from a Traditional IRA, THE Game_Engine SHALL apply the same rules as 401(k) withdrawals

### Requirement 8: Roth IRA Support

**User Story:** As a player, I want to open a Roth IRA, so that I can save for retirement with tax-free growth.

#### Acceptance Criteria

1. WHEN a player chooses to open a Roth IRA, THE Game_Engine SHALL create a Retirement_Account with type "roth_ira"
2. WHEN a player contributes to a Roth IRA, THE Game_Engine SHALL use after-tax dollars (no tax deduction)
3. WHEN a player withdraws contributions from a Roth IRA, THE Game_Engine SHALL allow penalty-free and tax-free withdrawal at any time
4. WHEN a player withdraws earnings from a Roth IRA before age 59.5, THE Game_Engine SHALL apply penalties and taxes
5. WHEN a player withdraws from a Roth IRA after age 59.5 and 5 years of account age, THE Game_Engine SHALL allow completely tax-free withdrawals

### Requirement 9: Required Minimum Distributions

**User Story:** As a player, I want the game to enforce Required Minimum Distributions, so that the simulation reflects real retirement account rules.

#### Acceptance Criteria

1. WHEN a player reaches age 72, THE Game_Engine SHALL calculate the Required_Minimum_Distribution for each Traditional retirement account
2. WHEN an RMD is due, THE Game_Engine SHALL notify the player and provide the required withdrawal amount
3. IF a player fails to take the RMD by year end, THEN THE Game_Engine SHALL apply a 50% penalty on the amount not withdrawn
4. WHEN calculating RMD, THE Game_Engine SHALL use the IRS Uniform Lifetime Table based on player age
5. WHEN a player has a Roth IRA, THE Game_Engine SHALL not require RMDs during the owner's lifetime

### Requirement 10: Career Integration

**User Story:** As a player, I want retirement benefits to vary by employer, so that job choices have meaningful financial implications.

#### Acceptance Criteria

1. WHEN a player views job opportunities, THE Game_Engine SHALL display whether the job offers 401(k) benefits
2. WHEN displaying job details, THE Game_Engine SHALL show the employer match formula (e.g., "100% match up to 6%")
3. WHEN a player accepts a job, THE Game_Engine SHALL apply the employer's 401(k) benefits to the Player_State
4. WHEN a player is self-employed, THE Game_Engine SHALL allow access to IRA accounts but not 401(k)
5. WHEN a player starts a business, THE Game_Engine SHALL allow setting up a Solo 401(k) with higher contribution limits

### Requirement 11: Financial Dashboard Integration

**User Story:** As a player, I want to see my retirement accounts in the financial dashboard, so that I can track my overall financial health.

#### Acceptance Criteria

1. WHEN displaying net worth, THE Game_Engine SHALL include all Retirement_Account balances
2. WHEN showing account details, THE Game_Engine SHALL display each retirement account separately with type, balance, and contribution rate
3. WHEN calculating liquid net worth, THE Game_Engine SHALL exclude retirement account balances (due to penalties)
4. WHEN displaying monthly cash flow, THE Game_Engine SHALL show 401(k) contributions as a deduction from gross income
5. WHEN showing investment portfolio, THE Game_Engine SHALL include retirement accounts with a visual indicator of tax status

### Requirement 12: Tutorial and Guidance

**User Story:** As a player, I want to receive guidance about retirement accounts, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN a player first becomes eligible for a 401(k), THE Game_Engine SHALL display a tutorial explaining the benefits
2. WHEN a player sets a contribution rate below the employer match threshold, THE Game_Engine SHALL warn about leaving free money on the table
3. WHEN a player considers early withdrawal, THE Game_Engine SHALL display a calculator showing penalties and taxes
4. WHEN a player reaches age 50, THE Game_Engine SHALL notify them about catch-up contributions
5. WHEN a player approaches retirement age, THE Game_Engine SHALL provide guidance on withdrawal strategies
