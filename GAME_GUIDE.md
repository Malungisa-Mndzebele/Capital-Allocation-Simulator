# Capital Allocation Simulator - Complete Game Guide

## 🎮 Overview

A turn-based life simulation game where you progress from a 17-year-old with nothing to a successful entrepreneur. Make strategic decisions about education, career, business, and investments to build wealth and achieve your goals.

---

## 🎯 Game Objective

**Primary Goal:** Build wealth and reach retirement at age 65 with the highest possible net worth and retirement score.

**Victory Conditions:**
- Survive to age 65
- Maximize net worth
- Achieve high retirement score (0-100)

**Defeat Conditions:**
- Homeless for 2+ months with negative cash
- Business bankruptcy (debt exceeds -$50,000)

---

## 📊 Difficulty Levels

### Easy Mode
- Starting cash: $2,000
- Savings goal: $7,500
- Income bonus: +20%
- **Best for:** First-time players, casual experience

### Normal Mode
- Starting cash: $500
- Savings goal: $10,000
- Income: Standard
- **Best for:** Balanced challenge, intended experience

### Hard Mode
- Starting cash: $100
- Savings goal: $15,000
- Income penalty: -20%
- **Best for:** Experienced players, maximum challenge

---

## 🎓 Level 1: Career Phase

### Starting Conditions
- Age: 17 years old
- Living: With parents
- Goal: Save enough to start a business

### Job Options

**Fast Food Worker**
- Salary: $18,000/year
- Pros: Easy to get, low stress
- Cons: Low pay, limited growth
- Stat effects: +Strength, -Energy

**Warehouse Worker**
- Salary: $24,000/year
- Pros: Better pay, steady work
- Cons: Physical labor, tiring
- Stat effects: ++Strength, --Energy

**Door-to-Door Sales**
- Salary: $30,000/year
- Pros: Highest starting pay
- Cons: High stress, burnout risk
- Stat effects: +Wisdom, --Energy

### Education System

**Costs:** $400/month tuition

**Progression:**
1. High School → Associate (12 months)
   - Promotion: Shift Manager ($35,000/year)
   
2. Associate → Bachelor (24 months)
   - Promotion: Regional Manager ($55,000/year)
   
3. Bachelor → Master (36 months)
   - Promotion: Director of Operations ($95,000/year)

**Intelligence Bonus:** Higher intelligence = faster study (±20%)

### Lifestyle Choices

**Parents (Age 17-20)**
- Rent: $0
- Food: $300
- Transport: $150
- Entertainment: $100
- **Total: $550/month**
- **Forced to move out at age 21**

**Frugal**
- Rent: $800
- Food: $300
- Transport: $100
- Entertainment: $0
- **Total: $1,200/month**

**Moderate**
- Rent: $1,500
- Food: $600
- Transport: $300
- Entertainment: $200
- **Total: $2,600/month**

**Luxury**
- Rent: $3,000
- Food: $1,200
- Transport: $500
- Entertainment: $1,000
- **Total: $5,700/month**
- **Bonus: +10% productivity from happiness**

### Random Life Events

**Frequency:** 30% chance per month

**Event Types:**
- Friday Night Out (happiness vs energy)
- Extra Shift (money vs energy)
- Gym Membership (strength + energy)
- Charity Drive (happiness + wisdom)
- Relationship Opportunity (dating costs $200/mo)
- Family Planning (children cost $1,200/mo each)
- Direct Help (small charity)
- Online Course (intelligence boost)
- Side Hustle (extra income)

---

## 💼 Level 2: Business Phase

### Starting a Business

**Requirements:**
- Reach savings goal ($7,500-$15,000)
- Choose business type
- Pay $10,000 startup cost

### Business Types

**Retail Store**
- Starting demand: 2,000 customers
- Price: $4/unit
- Capacity: 2,500 units
- Inventory: 2,000 units (auto-restocks at 500)
- **Pros:** Steady, predictable
- **Cons:** Inventory management, moderate margins
- **Expected profit:** $1,250/month initially

**Tech SaaS**
- Starting demand: 450 users
- Price: $29/month
- Capacity: 10,000 users
- **Pros:** High scalability, 5% monthly growth
- **Cons:** High initial costs, slow start
- **Expected profit:** -$200/month initially, grows to $10k+

**Service Consulting**
- Starting demand: 350 clients
- Price: $150/hour
- Capacity: 200 hours
- **Pros:** Immediate profit, low overhead
- **Cons:** Time-limited, hard to scale
- **Expected profit:** $18,500/month initially

### Business Mechanics

**Revenue Formula:**
```
Effective Demand = Base Demand × Market Factor × Price Factor
Sales Volume = min(Effective Demand, Capacity, Inventory)
Revenue = Sales Volume × Price
```

**Expenses:**
- Labor: $3,000-$5,000 per employee
- Materials: Varies by type
- Marketing: $500/month
- Overhead: $1,000/month

**Growth:**
- Profitable businesses grow 2-5% per month
- Tech businesses grow even when unprofitable (VC model)
- Growth compounds over time

### Business Decisions

**Marketing Strategy (Monthly)**
- Aggressive ($2,000): +15% demand
- Standard ($500): +5% demand
- Word of Mouth ($0): +1% demand

**Operational Efficiency (Monthly)**
- Upgrade Tools ($1,000): +10% capacity
- Ignore ($0): No change

### Random Business Events

**Frequency:** 20% chance per month

**Event Types:**
- Major Client Signed (+$5,000)
- Equipment Breakdown (-$2,000)
- Viral Marketing (+15% demand)
- Employee Quit (-10% capacity)
- Tax Audit (Clean) (+10 credit score)
- Supplier Discount (+$1,500)
- Competitor Opened (-15% demand)
- Industry Award (+10% demand)

---

## 💰 Investment System

### Asset Types

**Stocks (S&P 500 Index Fund)**
- Returns: Tracks market (5-10% annually average)
- Risk: High volatility
- Liquidity: Instant (2% sell fee)
- **Best for:** Long-term growth

**Bonds (Government)**
- Returns: Base rate + 1% (4-6% annually)
- Risk: Low volatility
- Liquidity: Instant (2% sell fee)
- **Best for:** Stable income, risk-averse

**Real Estate**
- Returns: 2.4% appreciation + 5% rent - 1% tax = 6.4% net
- Risk: Medium
- Liquidity: Instant (2% sell fee)
- **Best for:** Balanced growth + income

---

## 🏦 Retirement Accounts System

### Account Types

**401(k) - Employer-Sponsored**
- **Availability:** Jobs with 401(k) benefits
- **Contribution Limit:** $23,000/year ($30,500 if age 50+)
- **Tax Treatment:** Pre-tax contributions (reduces taxable income)
- **Employer Match:** Varies by employer (e.g., "100% match up to 6%")
- **Vesting:** Employer contributions vest over time (typically 3-5 years)
- **Withdrawal Rules:**
  - Before age 59.5: 10% penalty + income tax
  - After age 59.5: Income tax only (no penalty)
  - Required Minimum Distributions (RMDs) start at age 72
- **Best for:** Maximizing employer match, tax-deferred growth

**Traditional IRA - Individual Account**
- **Availability:** Anyone with earned income
- **Contribution Limit:** $7,000/year ($8,000 if age 50+)
- **Tax Treatment:** Pre-tax contributions (tax deduction)
- **Employer Match:** None (individual account)
- **Withdrawal Rules:**
  - Before age 59.5: 10% penalty + income tax
  - After age 59.5: Income tax only (no penalty)
  - Required Minimum Distributions (RMDs) start at age 72
- **Best for:** Self-employed, no employer 401(k), additional tax-deferred savings

**Roth IRA - Tax-Free Growth**
- **Availability:** Anyone with earned income
- **Contribution Limit:** $7,000/year ($8,000 if age 50+)
- **Tax Treatment:** After-tax contributions (no tax deduction)
- **Employer Match:** None (individual account)
- **Withdrawal Rules:**
  - Contributions: Withdraw anytime tax-free and penalty-free
  - Earnings before age 59.5: 10% penalty + income tax
  - Earnings after age 59.5 (and 5+ years): Completely tax-free
  - No Required Minimum Distributions (RMDs)
- **Best for:** Tax-free retirement income, flexibility, younger investors

### Retirement Account Benefits

**Tax Advantages**
- **401(k) & Traditional IRA:** Reduce current taxable income
  - Example: $60k income - $6k contribution = $54k taxable income
  - Tax savings: ~$1,320 (22% bracket)
- **Roth IRA:** Tax-free withdrawals in retirement
  - Pay taxes now, never again on growth
- **All accounts:** Tax-deferred investment growth (no capital gains tax)

**Employer Matching (401k only)**
- **Free money:** Employer contributes based on your contribution
- **Common formulas:**
  - "100% match up to 6%": Employer matches dollar-for-dollar up to 6% of salary
  - "50% match up to 8%": Employer contributes 50 cents per dollar up to 8% of salary
- **Example:** $60k salary, 6% contribution ($3,600), 100% match = $3,600 free money
- **Vesting:** Employer contributions become yours over time
  - Year 1: 0% vested (lose all if you quit)
  - Year 2: 25% vested
  - Year 3: 50% vested
  - Year 4: 75% vested
  - Year 5: 100% vested (fully yours)

**Compound Growth**
- Retirement accounts grow tax-free until withdrawal
- Same market returns as regular investments
- No capital gains tax on trades within the account
- Decades of compounding can turn thousands into millions

### Contribution Strategies

**Priority 1: Maximize Employer Match**
- **Always contribute enough to get full employer match**
- This is an instant 50-100% return on investment
- Example: If employer matches 6%, contribute at least 6%
- Missing the match is leaving free money on the table

**Priority 2: Emergency Fund**
- Keep 3-6 months expenses in regular savings
- Don't lock all money in retirement accounts
- Early withdrawal penalties are expensive (10% + taxes)

**Priority 3: Max Out Retirement Contributions**
- After getting match, increase contributions
- Target: 15-20% of gross income for retirement
- Use catch-up contributions at age 50+ ($7,500 extra for 401k)

**Priority 4: Roth vs Traditional Decision**
- **Choose Traditional (pre-tax) if:**
  - Currently in high tax bracket (22%+)
  - Expect lower income in retirement
  - Need immediate tax deduction
- **Choose Roth (after-tax) if:**
  - Currently in low tax bracket (12% or less)
  - Young with decades of growth ahead
  - Want tax-free retirement income
  - Expect higher income in retirement

**Aggressive Strategy (High Earners)**
1. Contribute 15-20% to 401(k) (max out if possible)
2. Max out IRA ($7,000/year)
3. Return to 401(k) to reach $23,000 limit
4. Invest additional funds in taxable accounts

**Balanced Strategy (Middle Income)**
1. Contribute enough for full employer match (typically 6%)
2. Build emergency fund
3. Gradually increase 401(k) to 10-15%
4. Open IRA when comfortable

**Conservative Strategy (Lower Income)**
1. Start with 3-5% to 401(k) (get some match)
2. Focus on building emergency fund
3. Increase contributions as income grows
4. Prioritize debt payoff alongside retirement

### Withdrawal Guidance

**Early Withdrawal (Before Age 59.5)**
- **Cost:** 10% penalty + income tax (typically 30-40% total)
- **Example:** Withdraw $10,000 → Keep only $6,000-$7,000
- **Avoid unless:** Severe financial hardship
- **Alternatives:**
  - Emergency fund
  - Personal loans
  - Reduce expenses
  - Side income

**Hardship Withdrawals**
- Reduced penalties for specific situations:
  - Medical emergencies
  - Preventing eviction/foreclosure
  - Disability
- Still owe income tax on withdrawal
- Last resort option only

**Retirement Withdrawals (Age 59.5+)**
- **401(k) & Traditional IRA:** Pay income tax (no penalty)
- **Roth IRA:** Completely tax-free (if account 5+ years old)
- **Strategy:** Withdraw from Traditional first (required anyway)
- **Preserve Roth:** Let it grow tax-free as long as possible

**Required Minimum Distributions (RMDs)**
- **Starts:** Age 72 for Traditional 401(k) and IRA
- **Amount:** Based on IRS Uniform Lifetime Table
  - Age 72: ~3.9% of account balance
  - Age 75: ~4.4% of account balance
  - Age 80: ~5.3% of account balance
- **Penalty:** 50% of amount not withdrawn (severe!)
- **Example:** $500k balance at age 72 → Must withdraw ~$19,500
- **Roth IRA:** No RMDs during owner's lifetime

**Optimal Withdrawal Strategy**
1. **Age 59.5-72:** Withdraw from Traditional accounts strategically
2. **Age 72+:** Take RMDs from Traditional accounts
3. **Throughout:** Preserve Roth IRA for tax-free income
4. **Consider:** Tax bracket management (don't withdraw too much in one year)

### Job Changes and Vesting

**When You Change Jobs:**
- Your 401(k) account remains yours
- Account becomes "inactive" (no new contributions)
- Vested balance is fully yours
- **Unvested employer contributions are forfeited**
  - Example: $10k employer match, 50% vested → Keep $5k, lose $5k

**Vesting Schedules:**
- **Cliff vesting:** 0% until year 3, then 100%
- **Graded vesting:** 20% per year over 5 years
- **Immediate vesting:** 100% from day one (rare)

**Options After Job Change:**
1. **Leave it:** Keep account with old employer (common)
2. **Rollover:** Move to new employer's 401(k) (if allowed)
3. **IRA Rollover:** Move to Traditional IRA (most flexible)
4. **Cash out:** Pay penalties and taxes (avoid!)

### Self-Employment and Business Owners

**Solo 401(k)**
- Available when you start a business
- **Higher limits:** $69,000/year (2024)
- Act as both employer and employee
- Best for high-income business owners

**SEP IRA**
- Simplified Employee Pension
- Employer contributions only
- Up to 25% of net self-employment income
- Good for variable income

**Traditional/Roth IRA**
- Always available to self-employed
- Standard $7,000 limit
- Easy to set up and manage

### Common Mistakes to Avoid

**Critical Errors:**
1. ❌ **Not contributing enough for employer match**
   - Leaving free money on the table
   - Missing 50-100% instant return

2. ❌ **Early withdrawals for non-emergencies**
   - Losing 30-40% to penalties and taxes
   - Sacrificing decades of compound growth

3. ❌ **Ignoring retirement accounts entirely**
   - Missing tax advantages
   - Starting too late (compound growth needs time)

4. ❌ **Cashing out 401(k) when changing jobs**
   - Huge tax hit
   - Retirement savings disappear

5. ❌ **Not increasing contributions with raises**
   - Lifestyle inflation eats raises
   - Retirement savings stagnate

**Optimization Mistakes:**
1. ⚠️ Choosing wrong account type (Roth vs Traditional)
2. ⚠️ Not taking advantage of catch-up contributions at 50+
3. ⚠️ Forgetting about RMDs at age 72
4. ⚠️ Over-contributing (exceeding annual limits)
5. ⚠️ Not diversifying investments within retirement accounts

### Retirement Account Achievements

**First Steps:**
- **Retirement Ready:** Open your first retirement account
- **Matching Master:** Contribute enough to get full employer match
- **Maxed Out:** Reach annual contribution limit

**Milestones:**
- **Six Figures Secured:** $100,000 in retirement accounts
- **Half Million Club:** $500,000 in retirement accounts
- **Retirement Millionaire:** $1,000,000 in retirement accounts

**Optimization:**
- **Tax Optimizer:** Use both Traditional and Roth accounts
- **Catch-Up King:** Use catch-up contributions at age 50+
- **Vested Veteran:** Reach 100% vesting in employer match

### Market Cycles

**Recovery**
- Stock returns: +2% to +5% per month
- Duration: ~7 months average

**Peak**
- Stock returns: +1% to +2% per month
- Duration: ~7 months average
- Interest rates rise

**Recession**
- Stock returns: -5% to -10% per month
- Duration: ~7 months average
- Interest rates fall

**Trough**
- Stock returns: -1% to +1% per month
- Duration: ~7 months average
- Transition to recovery

**Market Correction:** If index exceeds 3000, automatic 15% crash

---

## 💳 Loan System

### Loan Types

**Student Loans**
- Maximum: $50,000
- Interest Rate: 4.5% APR
- Term: 10 years (120 months)
- **Use for:** Education costs
- **Monthly payment:** ~$520

**Business Loans**
- Maximum: $100,000
- Interest Rate: 8% APR (credit-adjusted)
- Term: 5 years (60 months)
- **Use for:** Business expansion
- **Monthly payment:** ~$2,030

**Mortgages**
- Maximum: $500,000
- Interest Rate: 6.5% APR (credit-adjusted)
- Term: 30 years (360 months)
- **Use for:** Real estate investment
- **Monthly payment:** ~$3,160

### Credit Score System

**Range:** 300-850

**Factors:**
- Base score: 700
- Having loans: +20
- Cash reserves > $10k: +30
- Net worth > $100k: +50
- Negative cash: -100
- Homelessness: -150
- Game age: +1 per month (max +50)

**Minimum for approval:** 600

---

## 📈 Stats & Their Effects

### Intelligence (0-100)
- **Affects:** Study speed (±20%)
- **Increases from:** Studying, online courses
- **Strategy:** Prioritize if pursuing education

### Wisdom (0-100)
- **Affects:** Promotion chance (1.5-2.5% per month)
- **Increases from:** Sales job, charity, age
- **Strategy:** Can get promoted without degrees

### Strength (0-100)
- **Affects:** Currently cosmetic
- **Increases from:** Physical jobs, gym
- **Future:** May affect health/energy

### Energy (0-100)
- **Affects:** Happiness indirectly
- **Decreases from:** Work, studying, decisions
- **Recovers:** +2-5 per month (lifestyle-dependent)
- **Strategy:** Manage carefully, avoid burnout

### Happiness (0-100)
- **Affects:** Productivity (70-110%)
- **Ranges:**
  - 0-30: 70% productivity (major penalty)
  - 31-70: 100% productivity (normal)
  - 71-100: 110% productivity (bonus)
- **Increases from:** Relationships, entertainment, achievements
- **Strategy:** Maintain above 70 for bonus income

---

## 🏆 Achievement System

### Career Achievements
- **First Paycheck:** Get your first job
- **Lifelong Learner:** Enroll in education
- **Graduate:** Complete a degree
- **Master of Business:** Earn Master's degree

### Wealth Achievements
- **Five Figures:** Save $10,000
- **Six Figures:** Reach $100,000 net worth
- **Millionaire:** Reach $1,000,000 net worth

### Business Achievements
- **Entrepreneur:** Start a business
- **In the Black:** Run profitable business for 3 months

### Investment Achievements
- **Investor:** Buy first investment
- **Diversified Portfolio:** Own stocks, bonds, and real estate

### Life Achievements
- **Family Person:** Get married and have a child
- **Survivor:** Recover from homelessness
- **Decade of Growth:** Play for 10 years (120 months)
- **Living Large:** Maintain luxury lifestyle for 12 months

---

## 🎯 Strategy Guide

### Early Game (Age 17-21)

**Optimal Path:**
1. Take Sales job ($30k/year)
2. Stay with parents (save $550/mo)
3. Start studying immediately
4. Avoid relationships/children
5. Save aggressively

**Expected timeline:** Reach $10k by month 11-15

### Mid Game (Age 21-30)

**Career Focus:**
1. Complete Bachelor's degree
2. Reach Regional Manager ($55k/year)
3. Move to Frugal lifestyle
4. Consider taking student loan if needed
5. Start business around age 23-25

**Retirement Account Strategy:**
1. **Enroll in 401(k) immediately** if employer offers it
2. **Contribute at least enough for full employer match** (typically 6%)
3. Open Traditional or Roth IRA once stable
4. Target 10-15% total retirement contributions
5. Never withdraw early (penalties are brutal)

**Business Focus:**
1. Choose Tech for high growth potential
2. Or Service for immediate profit
3. Reinvest profits into marketing
4. Start investing surplus cash
5. Consider Solo 401(k) once business is profitable

### Late Game (Age 30-65)

**Wealth Building:**
1. Scale business to $20k+/month profit
2. Diversify into all three asset types
3. Use loans strategically for leverage
4. Maintain high happiness for productivity bonus
5. Pay off all loans before retirement

**Retirement Optimization:**
1. **Max out 401(k) contributions** ($23,000/year)
2. **Max out IRA contributions** ($7,000/year)
3. Use catch-up contributions at age 50+ (extra $7,500 for 401k)
4. Balance Traditional and Roth accounts for tax optimization
5. **Plan for RMDs at age 72** (Traditional accounts)
6. Target $1M+ in retirement accounts by age 65

**Target Net Worth by Age:**
- Age 30: $100,000 (including $20k+ in retirement)
- Age 40: $500,000 (including $200k+ in retirement)
- Age 50: $1,000,000 (including $500k+ in retirement)
- Age 65: $2,000,000+ (including $1M+ in retirement)

---

## 💡 Pro Tips

### Financial Management
1. **Emergency fund:** Always keep 3 months expenses in cash
2. **Debt strategy:** Pay off high-interest loans first
3. **Investment timing:** Buy stocks during recessions
4. **Lifestyle creep:** Don't upgrade lifestyle too fast
5. **Retirement priority:** Get full employer match before anything else
6. **Tax optimization:** Use retirement accounts to reduce taxable income
7. **Compound growth:** Start retirement contributions early (time is everything)

### Career Optimization
1. **Education ROI:** Bachelor's degree has best return
2. **Promotion timing:** Wisdom affects random promotions
3. **Job switching:** Sales job best for early wealth building
4. **Study speed:** High intelligence = faster degrees

### Business Success
1. **Type selection:** Tech for long-term, Service for short-term
2. **Marketing:** Invest in aggressive marketing early
3. **Timing:** Start business as soon as you hit goal
4. **Reinvestment:** Plow profits back into growth

### Stat Management
1. **Happiness:** Maintain 71+ for 10% income bonus
2. **Energy:** Don't let it drop below 20
3. **Intelligence:** Boost before starting education
4. **Wisdom:** Helps with promotions and decisions

### Risk Management
1. **Diversification:** Don't put all money in one asset
2. **Loan caution:** Only borrow what you can repay
3. **Business buffer:** Keep 6 months expenses saved
4. **Market timing:** Sell stocks before crashes

---

## 🚨 Common Mistakes

### Beginner Traps
1. ❌ Upgrading lifestyle too early
2. ❌ Having children before financial stability
3. ❌ Ignoring education
4. ❌ Starting business too late
5. ❌ Not diversifying investments
6. ❌ **Not enrolling in 401(k) with employer match**
7. ❌ **Early retirement account withdrawals**
8. ❌ **Ignoring retirement savings until too late**

### Advanced Pitfalls
1. ❌ Over-leveraging with loans
2. ❌ Ignoring happiness stat
3. ❌ Poor market timing
4. ❌ Neglecting business decisions
5. ❌ Letting energy drop too low
6. ❌ **Not maximizing retirement contributions**
7. ❌ **Cashing out 401(k) when changing jobs**
8. ❌ **Missing catch-up contributions at age 50+**
9. ❌ **Forgetting about RMDs at age 72**

---

## 📊 Retirement Scoring

**Maximum Score:** 100 points

**Breakdown:**
- Net Worth (40 points max)
  - $5M+: 40 points
  - $2M+: 35 points
  - $1M+: 30 points
  - $500k+: 25 points
  - $250k+: 20 points
  - $100k+: 15 points
  - $50k+: 10 points
  - $10k+: 5 points
  - **Note:** Includes retirement account balances

- Retirement Accounts (10 points max)
  - $1M+ in retirement: 10 points
  - $500k+ in retirement: 8 points
  - $250k+ in retirement: 6 points
  - $100k+ in retirement: 4 points
  - $50k+ in retirement: 2 points
  - **Bonus:** Extra weight for tax-advantaged savings

- Education (15 points max)
  - Master's: 15 points
  - Bachelor's: 10 points
  - Associate: 5 points

- Business Success (10 points max)
  - $50k+/mo profit: 10 points
  - $20k+/mo profit: 7 points
  - $10k+/mo profit: 4 points

- Family (10 points max)
  - Married: 5 points
  - Children: 5 points

- Achievements (10 points max)
  - 1 point per achievement unlocked

- Debt-Free (5 points max)
  - No loans: 5 points
  - 1 loan: 2 points

**Score Interpretation:**
- 90-100: Legendary Success
- 75-89: Excellent Retirement
- 60-74: Comfortable Retirement
- 45-59: Modest Retirement
- 30-44: Struggling Retirement
- 0-29: Difficult Retirement

---

## 🎮 Controls & Interface

### Actions
- **Next Month:** Process one month of game time
- **Make Decision:** Choose option for pending decisions
- **Toggle Study:** Start/stop education
- **Select Job:** Choose career path
- **Update Lifestyle:** Change living situation
- **Start Business:** Launch your company
- **Buy Asset:** Purchase investments
- **Sell Asset:** Liquidate investments (2% fee)
- **Take Loan:** Borrow money
- **Pay Loan:** Make extra payment
- **Reset:** Start new game

### Information Displays
- **Top Bar:** Cash, Net Worth, Month, Level
- **Sidebar:** Player stats, lifestyle, family
- **Main Area:** Current level dashboard
- **Event Log:** Recent events and notifications
- **Achievements:** Progress tracking

---

## 🏁 Winning Strategies

### Speed Run (Fastest to $1M)
1. Sales job + Parents lifestyle
2. No education (save time)
3. Start Tech business ASAP
4. Aggressive marketing every month
5. Reinvest all profits
6. Open IRA and contribute aggressively
7. **Target:** $1M by age 30 (including retirement accounts)

### Safe Play (Highest Retirement Score)
1. Complete Master's degree
2. Director salary ($95k/year)
3. **Max out 401(k) with employer match**
4. Start Service business (stable)
5. Diversified investments
6. **Max out IRA contributions**
7. Pay off all loans
8. **Use catch-up contributions at 50+**
9. **Target:** 90+ retirement score with $1M+ in retirement accounts

### Retirement Focused (Maximum Retirement Savings)
1. Get job with best 401(k) match
2. Contribute 15-20% to 401(k) from day one
3. Max out IRA every year
4. Start business for Solo 401(k) (higher limits)
5. Never withdraw early
6. Use catch-up contributions at 50+
7. **Target:** $2M+ in retirement accounts by age 65

### Challenge Mode (Hard Difficulty)
1. Warehouse job (better than Fast Food)
2. Study to Associate ASAP
3. Frugal lifestyle always
4. **Still contribute 3-5% to 401(k) for match**
5. Start Retail business (most stable)
6. Conservative investments
7. **Target:** Survive to retirement with $500k+ saved

---

*Good luck building your empire!*
