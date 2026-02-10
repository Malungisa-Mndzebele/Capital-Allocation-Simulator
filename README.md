# Capital Allocation Simulator

A professional-grade financial strategy game where players transition from small business management to high-stakes capital allocation.

![Premium UI](https://via.placeholder.com/800x450.png?text=Capital+Allocation+Simulator)

## 🎮 Game Overview

**Goal:** Achieve Financial Independence by growing your Net Worth through smart business operations and strategic investing.

**Core Mechanics:**
-   **Cash Engine (Business):** Manage your initial business (pricing, staff, inventory) to generate free cash flow.
-   **Capital Allocation (Investing):** Deploy profits into Stocks (S&P 500), Bonds, and Real Estate.
-   **Retirement Accounts:** Build tax-advantaged savings through 401(k), Traditional IRA, and Roth IRA accounts.
-   **Macro Cycles:** Navigate Economic Recessions, Recoveries, Peaks, and Troughs.

## 🏦 Retirement Accounts Feature

The game includes a comprehensive retirement accounts system with realistic tax treatment, contribution limits, and employer matching.

### Account Types

**401(k) - Employer-Sponsored**
- Pre-tax contributions reduce taxable income
- Employer matching (varies by job)
- Annual limit: $23,000 ($30,500 if age 50+)
- Vesting schedules for employer contributions
- 10% early withdrawal penalty before age 59.5

**Traditional IRA - Individual Account**
- Tax-deductible contributions
- Annual limit: $7,000 ($8,000 if age 50+)
- Available to anyone with earned income
- Same withdrawal rules as 401(k)

**Roth IRA - Tax-Free Growth**
- After-tax contributions (no deduction)
- Tax-free withdrawals in retirement
- Contributions can be withdrawn anytime
- No Required Minimum Distributions (RMDs)

### Example Scenarios

**Scenario 1: Maximizing Employer Match**
```
Player: Age 25, Salary $60,000/year
Employer: 100% match up to 6%

Action: Set 401(k) contribution to 6%
Result:
- Employee contribution: $3,600/year ($300/month)
- Employer match: $3,600/year (FREE MONEY!)
- Total retirement savings: $7,200/year
- Tax savings: ~$792/year (22% bracket)
- Take-home pay reduction: Only $2,808/year ($234/month)
```

**Scenario 2: Early Career Roth IRA Strategy**
```
Player: Age 22, Salary $35,000/year (12% tax bracket)
Strategy: Max out Roth IRA

Action: Contribute $7,000/year to Roth IRA
Result:
- Current tax cost: $840 (12% of $7,000)
- Growth over 43 years at 7%: $7,000 → $140,000
- Tax on withdrawal at age 65: $0 (completely tax-free!)
- Total tax savings: ~$31,000 (22% bracket in retirement)
```

**Scenario 3: High Earner Maximizing Contributions**
```
Player: Age 40, Salary $120,000/year, Business income $80,000/year
Strategy: Max out all retirement accounts

Actions:
1. Max 401(k): $23,000/year
2. Max Traditional IRA: $7,000/year
3. Solo 401(k) from business: $69,000/year
Total: $99,000/year in retirement savings

Result:
- Tax savings: ~$21,780/year (22% bracket)
- Compound growth over 25 years at 7%: $99,000/year → $6.2M
- Retirement readiness: Excellent
```

**Scenario 4: The Cost of Early Withdrawal**
```
Player: Age 35, 401(k) balance $50,000
Emergency: Needs $20,000 for unexpected expense

Withdrawal calculation:
- Gross withdrawal: $20,000
- Early withdrawal penalty (10%): -$2,000
- Income tax (22%): -$4,400
- Net received: $13,600

Cost of early withdrawal:
- Lost money: $6,400 (32% total)
- Lost future growth: $13,600 → $106,000 at age 65 (7% return)
- Total opportunity cost: ~$100,000

Better alternatives: Emergency fund, personal loan, reduce expenses
```

**Scenario 5: Catch-Up Contributions at Age 50**
```
Player: Age 50, Salary $90,000/year
Strategy: Use catch-up contributions

Standard limits:
- 401(k): $23,000/year
- IRA: $7,000/year
- Total: $30,000/year

With catch-up contributions:
- 401(k): $30,500/year (+$7,500)
- IRA: $8,000/year (+$1,000)
- Total: $38,500/year (+$8,500)

Result over 15 years to retirement:
- Extra contributions: $127,500
- Growth at 7%: $127,500 → $320,000
- Additional retirement security: Significant
```

## 🚀 Technology Stack

-   **Frontend:** React, Vite, Tailwind CSS (v4), Lightweight Charts.
-   **Backend:** Node.js, Express, TypeScript.
-   **Database:** PostgreSQL (via Prisma ORM).
-   **State Management:** Real-time turn-based engine.

## 🛠️ Setup & Installation

### Prerequisites
-   Node.js (v20+)
-   npm

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Malungisa-Mndzebele/Capital-Allocation-Simulator.git
    cd Capital-Allocation-Simulator
    ```

2.  **Start the Backend:**
    ```bash
    cd backend
    npm install
    npm run dev
    ```
    *Server runs on port 3000.*

3.  **Start the Frontend:**
    ```bash
    cd frontend
    # npm install (if not done)
    npm run dev
    ```
    *Client runs on port 5173.*

## 🔌 API Documentation

### Retirement Account Endpoints

All retirement actions use the main game action endpoint:

**POST** `/api/action`

#### Open Retirement Account

```json
{
  "action": "OPEN_RETIREMENT_ACCOUNT",
  "accountType": "401k" | "traditional_ira" | "roth_ira"
}
```

**Response:**
```json
{
  "success": true,
  "state": {
    "retirement": {
      "accounts": [
        {
          "id": "ret_001",
          "type": "401k",
          "balance": 0,
          "contributionRate": 0,
          "employerMatch": 0.06,
          "vestingSchedule": [0, 0.25, 0.5, 0.75, 1.0],
          "annualContributions": 0,
          "accountAge": 0
        }
      ]
    }
  }
}
```

**Validation:**
- 401(k) requires active job with 401(k) benefits
- IRA accounts available to anyone with earned income
- Cannot open duplicate account types
- Must have positive income

#### Set Contribution Rate

```json
{
  "action": "SET_CONTRIBUTION_RATE",
  "accountId": "ret_001",
  "contributionRate": 0.06
}
```

**Parameters:**
- `accountId`: Retirement account ID
- `contributionRate`: Percentage of gross income (0.0 to 1.0)

**Response:**
```json
{
  "success": true,
  "state": {
    "retirement": {
      "accounts": [
        {
          "id": "ret_001",
          "contributionRate": 0.06
        }
      ]
    }
  },
  "notification": "401(k) contribution rate set to 6%. You'll receive full employer match!"
}
```

**Validation:**
- Rate must be between 0% and 100%
- Cannot exceed annual contribution limits
- Warning if below employer match threshold

#### Withdraw from Retirement Account

```json
{
  "action": "WITHDRAW_RETIREMENT",
  "accountId": "ret_001",
  "amount": 10000
}
```

**Parameters:**
- `accountId`: Retirement account ID
- `amount`: Withdrawal amount in dollars

**Response:**
```json
{
  "success": true,
  "state": {
    "cash": 6800,
    "retirement": {
      "accounts": [
        {
          "id": "ret_001",
          "balance": 40000
        }
      ]
    }
  },
  "withdrawal": {
    "grossAmount": 10000,
    "penalty": 1000,
    "tax": 2200,
    "netAmount": 6800
  },
  "warning": "Early withdrawal penalty applied. Consider alternatives."
}
```

**Calculation (Age < 59.5):**
```
Gross Amount: $10,000
Early Withdrawal Penalty (10%): -$1,000
Income Tax (22% bracket): -$2,200
Net Amount Received: $6,800
```

**Calculation (Age >= 59.5):**
```
Gross Amount: $10,000
Early Withdrawal Penalty: $0
Income Tax (22% bracket): -$2,200
Net Amount Received: $7,800
```

**Roth IRA Special Rules:**
- Contributions: Withdraw anytime tax-free and penalty-free
- Earnings before 59.5: 10% penalty + tax
- Earnings after 59.5 (and 5+ years): Completely tax-free

**Validation:**
- Amount must not exceed account balance
- Minimum withdrawal: $100
- RMD enforcement at age 72 for Traditional accounts

### Game State Structure

```typescript
interface RetirementAccount {
  id: string;
  type: '401k' | 'traditional_ira' | 'roth_ira';
  balance: number;
  contributionRate: number;
  employerMatch: number;
  vestingSchedule: number[];
  annualContributions: number;
  accountAge: number;
  isActive: boolean;
  unvestedBalance: number;
  vestedBalance: number;
}

interface RetirementState {
  accounts: RetirementAccount[];
  totalBalance: number;
  annualContributionLimit401k: number;
  annualContributionLimitIRA: number;
  catchUpEligible: boolean;
}

interface GameState {
  // ... other fields
  retirement: RetirementState;
}
```

## 💻 Code Examples

### Backend: Retirement Logic Implementation

**Processing Monthly Contributions:**

```typescript
// From RetirementLogic.ts
processMonth(state: GameState): void {
  const { retirement, player, career } = state;
  
  // Calculate and process contributions
  for (const account of retirement.accounts) {
    if (!account.isActive) continue;
    
    // Calculate contribution amount
    const grossIncome = career.salary / 12;
    const contribution = grossIncome * account.contributionRate;
    
    // Check contribution limits
    if (this.canContribute(account, contribution)) {
      // Deduct from cash (pre-tax for 401k/Traditional, post-tax for Roth)
      const afterTaxCost = account.type === 'roth_ira' 
        ? contribution 
        : contribution * (1 - state.taxRate);
      
      state.cash -= afterTaxCost;
      
      // Add to account
      account.balance += contribution;
      account.annualContributions += contribution;
      
      // Process employer match (401k only)
      if (account.type === '401k' && account.employerMatch > 0) {
        const match = this.calculateEmployerMatch(
          contribution, 
          grossIncome, 
          account.employerMatch
        );
        account.balance += match;
        account.unvestedBalance += match;
      }
    }
  }
  
  // Apply investment returns (tax-deferred)
  this.applyInvestmentReturns(state);
  
  // Check for RMDs at age 72
  if (state.player.age >= 72) {
    this.enforceRMD(state);
  }
}
```

**Calculating Employer Match:**

```typescript
calculateEmployerMatch(
  employeeContribution: number,
  grossIncome: number,
  matchRate: number
): number {
  // Example: 100% match up to 6% of salary
  const matchCap = grossIncome * matchRate;
  return Math.min(employeeContribution, matchCap);
}
```

**Vesting Calculation:**

```typescript
applyVesting(account: RetirementAccount, yearsOfService: number): void {
  // Typical vesting schedule: [0%, 25%, 50%, 75%, 100%]
  const vestingPercentage = account.vestingSchedule[
    Math.min(yearsOfService, account.vestingSchedule.length - 1)
  ];
  
  account.vestedBalance = account.unvestedBalance * vestingPercentage;
}
```

**Early Withdrawal Penalty:**

```typescript
processWithdrawal(
  state: GameState,
  accountId: string,
  amount: number
): WithdrawalResult {
  const account = state.retirement.accounts.find(a => a.id === accountId);
  const age = state.player.age;
  
  // Calculate penalty
  const penalty = age < 59.5 ? amount * 0.10 : 0;
  
  // Calculate tax (except for Roth contributions)
  const taxableAmount = account.type === 'roth_ira' 
    ? this.calculateRothTaxableAmount(account, amount)
    : amount;
  const tax = taxableAmount * state.taxRate;
  
  // Net amount
  const netAmount = amount - penalty - tax;
  
  // Update balances
  account.balance -= amount;
  state.cash += netAmount;
  
  return {
    grossAmount: amount,
    penalty,
    tax,
    netAmount
  };
}
```

**Required Minimum Distribution (RMD):**

```typescript
calculateRMD(balance: number, age: number): number {
  // IRS Uniform Lifetime Table (simplified)
  const distributionPeriods: Record<number, number> = {
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6,
    80: 20.2, 85: 16.0, 90: 12.2, 95: 9.1
  };
  
  const period = distributionPeriods[age] || 27.4;
  return balance / period;
}

enforceRMD(state: GameState): void {
  for (const account of state.retirement.accounts) {
    // Roth IRA exempt from RMDs
    if (account.type === 'roth_ira') continue;
    
    const rmd = this.calculateRMD(account.balance, state.player.age);
    
    if (rmd > 0) {
      // Auto-withdraw RMD or apply 50% penalty
      this.processWithdrawal(state, account.id, rmd);
    }
  }
}
```

### Frontend: Retirement Dashboard Component

```typescript
// From RetirementDashboard.tsx
export function RetirementDashboard({ state }: Props) {
  const { retirement, player } = state;
  const totalBalance = retirement.accounts.reduce(
    (sum, acc) => sum + acc.balance, 
    0
  );
  
  return (
    <div className="retirement-dashboard">
      <h2>Retirement Accounts</h2>
      <div className="total-balance">
        Total: ${totalBalance.toLocaleString()}
      </div>
      
      {retirement.accounts.map(account => (
        <AccountCard 
          key={account.id}
          account={account}
          age={player.age}
        />
      ))}
      
      {retirement.catchUpEligible && (
        <CatchUpNotification />
      )}
      
      {player.age >= 72 && (
        <RMDWarning accounts={retirement.accounts} />
      )}
    </div>
  );
}
```

### Testing Example

```typescript
// From RetirementLogic.test.ts
describe('RetirementLogic', () => {
  test('employer match calculation', () => {
    const logic = new RetirementLogic();
    const state = createTestState({
      career: { salary: 60000 },
      retirement: {
        accounts: [{
          type: '401k',
          contributionRate: 0.06,
          employerMatch: 0.06
        }]
      }
    });
    
    logic.processMonth(state);
    
    const account = state.retirement.accounts[0];
    const expectedContribution = (60000 / 12) * 0.06; // $300
    const expectedMatch = expectedContribution; // 100% match
    
    expect(account.balance).toBe(expectedContribution + expectedMatch);
    expect(account.balance).toBe(600); // $300 + $300
  });
  
  test('early withdrawal penalty', () => {
    const logic = new RetirementLogic();
    const state = createTestState({
      player: { age: 35 },
      retirement: {
        accounts: [{ balance: 50000, type: '401k' }]
      }
    });
    
    const result = logic.processWithdrawal(state, 'ret_001', 10000);
    
    expect(result.penalty).toBe(1000); // 10%
    expect(result.tax).toBeGreaterThan(0);
    expect(result.netAmount).toBeLessThan(9000);
  });
});
```

## 📦 Deployment

-   **Frontend:** Ready for static hosting (Spaceship, Vercel, Netlify).
-   **Backend:** Ready for Node.js hosting (Render, Railway).

## 🎨 Design

The interface features a **"Cyber-Fintech"** aesthetic with:
-   Deep dark mode themes.
-   Glassmorphism effects.
-   Real-time data visualization.
