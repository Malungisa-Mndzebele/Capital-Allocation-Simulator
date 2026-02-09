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

**Business Focus:**
1. Choose Tech for high growth potential
2. Or Service for immediate profit
3. Reinvest profits into marketing
4. Start investing surplus cash

### Late Game (Age 30-65)

**Wealth Building:**
1. Scale business to $20k+/month profit
2. Diversify into all three asset types
3. Use loans strategically for leverage
4. Maintain high happiness for productivity bonus
5. Pay off all loans before retirement

**Target Net Worth by Age:**
- Age 30: $100,000
- Age 40: $500,000
- Age 50: $1,000,000
- Age 65: $2,000,000+

---

## 💡 Pro Tips

### Financial Management
1. **Emergency fund:** Always keep 3 months expenses in cash
2. **Debt strategy:** Pay off high-interest loans first
3. **Investment timing:** Buy stocks during recessions
4. **Lifestyle creep:** Don't upgrade lifestyle too fast

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

### Advanced Pitfalls
1. ❌ Over-leveraging with loans
2. ❌ Ignoring happiness stat
3. ❌ Poor market timing
4. ❌ Neglecting business decisions
5. ❌ Letting energy drop too low

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

- Education (15 points max)
  - Master's: 15 points
  - Bachelor's: 10 points
  - Associate: 5 points

- Business Success (15 points max)
  - $50k+/mo profit: 15 points
  - $20k+/mo profit: 10 points
  - $10k+/mo profit: 5 points

- Family (10 points max)
  - Married: 5 points
  - Children: 5 points

- Achievements (10 points max)
  - 1 point per achievement unlocked

- Debt-Free (10 points max)
  - No loans: 10 points
  - 1 loan: 5 points

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
6. **Target:** $1M by age 30

### Safe Play (Highest Retirement Score)
1. Complete Master's degree
2. Director salary ($95k/year)
3. Start Service business (stable)
4. Diversified investments
5. Pay off all loans
6. **Target:** 90+ retirement score

### Challenge Mode (Hard Difficulty)
1. Warehouse job (better than Fast Food)
2. Study to Associate ASAP
3. Frugal lifestyle always
4. Start Retail business (most stable)
5. Conservative investments
6. **Target:** Survive to retirement

---

*Good luck building your empire!*
