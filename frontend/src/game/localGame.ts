// Local, browser-only game service.
// This is the former backend action handler (Express + Prisma) ported to run
// entirely in the frontend, with localStorage as the persistence layer.

import { GameEngine } from '../engine/GameEngine';
import type { GameState } from '../engine/types';
import {
    SALARIES, LIFESTYLE_TIERS, BUSINESS_STARTUP_COST, BUSINESS_DEFAULTS, TUITION_COST,
    VALID_ACTIONS, VALID_ASSET_TYPES, VALID_LIFESTYLE_TIERS, VALID_JOB_TITLES, VALID_BUSINESS_TYPES,
    VALID_LOAN_TYPES, MAX_LOAN_AMOUNTS, LUXURY_CATALOG, LUXURY_SUBSCRIPTIONS,
} from '../engine/config';
import { LoanLogic } from '../engine/systems/LoanLogic';
import { CareerLogic } from '../engine/systems/CareerLogic';
import { PersonalityLogic } from '../engine/systems/PersonalityLogic';
import { SkillTreeLogic, SKILL_TREE } from '../engine/systems/SkillTreeLogic';
import { LuxuryLogic } from '../engine/systems/LuxuryLogic';
import { ChallengeMode, CHALLENGES } from '../engine/systems/ChallengeMode';
import { ScenarioMode, SCENARIOS } from '../engine/systems/ScenarioMode';
import { RetirementLogic } from '../engine/systems/RetirementLogic';

type Difficulty = 'Easy' | 'Normal' | 'Hard';

const STORAGE_PREFIX = 'capital-allocation-sim:';

// --- Persistence (localStorage replaces the old Postgres/Prisma session table) ---

function storageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId}`;
}

export function saveState(userId: string, state: GameState): GameState {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
    return state;
}

export function loadState(userId: string): GameState | null {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    try {
        return castState(JSON.parse(raw));
    } catch (error) {
        console.error('Corrupt saved game, starting fresh:', error);
        localStorage.removeItem(storageKey(userId));
        return null;
    }
}

// --- Validation helpers (ported from the backend server) ---

function isString(val: unknown): val is string {
    return typeof val === 'string' && val.length > 0;
}

function isPositiveNumber(val: unknown): val is number {
    return typeof val === 'number' && val > 0 && Number.isFinite(val);
}

function castState(json: unknown): GameState {
    const obj = json as Record<string, unknown>;
    if (!obj || typeof obj !== 'object' || !('level' in obj) || !('month' in obj) || !('cash' in obj)) {
        throw new Error('Invalid game state shape in storage');
    }
    return obj as unknown as GameState;
}

// --- Public API (mirrors the former REST endpoints) ---

export function startGame(userId: string, difficulty: Difficulty = 'Normal'): GameState {
    if (!['Easy', 'Normal', 'Hard'].includes(difficulty)) {
        throw new Error('Invalid difficulty. Must be Easy, Normal, or Hard');
    }
    return saveState(userId, GameEngine.getInitialState(difficulty));
}

export function getState(userId: string): GameState {
    const existing = loadState(userId);
    if (existing) return existing;
    return saveState(userId, GameEngine.getInitialState());
}

export function processTurn(userId: string): GameState {
    const current = loadState(userId);
    if (!current) throw new Error('Game not found');
    return saveState(userId, GameEngine.processTurn(current));
}

export function performAction(userId: string, action: string, payload?: Record<string, any>): GameState {
    if (!isString(action) || !(VALID_ACTIONS as readonly string[]).includes(action)) {
        throw new Error(`Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`);
    }

    const state = loadState(userId) ?? GameEngine.getInitialState();

    // --- Challenge Mode Validation ---
    if (state.activeChallenge && action !== 'RESET' && action !== 'START_CHALLENGE' && action !== 'START_SCENARIO') {
        const challenge = CHALLENGES.find(c => c.id === state.activeChallenge);
        if (challenge) {
            const validation = ChallengeMode.validateAction(challenge, action, payload, state);
            if (!validation.valid) {
                throw new Error(validation.reason);
            }
        }
    }

    // --- RESET ---
    if (action === 'RESET') {
        const difficulty = payload?.difficulty || 'Normal';
        if (!['Easy', 'Normal', 'Hard'].includes(difficulty)) {
            throw new Error('Invalid difficulty');
        }
        return saveState(userId, GameEngine.getInitialState(difficulty));
    }

    // --- UPDATE_LIFESTYLE ---
    if (action === 'UPDATE_LIFESTYLE') {
        const tier = payload?.tier;
        if (!isString(tier) || !(VALID_LIFESTYLE_TIERS as readonly string[]).includes(tier)) {
            throw new Error(`Invalid tier. Must be one of: ${VALID_LIFESTYLE_TIERS.join(', ')}`);
        }
        const costs = LIFESTYLE_TIERS[tier];
        state.lifestyle = { ...state.lifestyle, tier: tier as any, ...costs };
    }

    // --- MAKE_DECISION ---
    if (action === 'MAKE_DECISION') {
        const decisionId = payload?.decisionId;
        const optionId = payload?.optionId;
        if (!isString(decisionId) || !isString(optionId)) {
            throw new Error('decisionId and optionId are required');
        }

        if (!state.career.pendingDecisions) state.career.pendingDecisions = [];

        // Search career decisions first, then business decisions
        let decisionIndex = state.career.pendingDecisions.findIndex((d: any) => d.id === decisionId);
        let decisionSource: 'career' | 'business' = 'career';

        if (decisionIndex === -1 && state.business.pendingDecisions) {
            decisionIndex = state.business.pendingDecisions.findIndex((d: any) => d.id === decisionId);
            decisionSource = 'business';
        }

        const decisions = decisionSource === 'career' ? state.career.pendingDecisions : state.business.pendingDecisions;

        if (decisionIndex !== -1 && decisions) {
            const decision = decisions[decisionIndex];
            const option = decision.options.find((o: any) => o.id === optionId);

            if (option) {
                // Validate player can afford the decision
                if (option.cost > 0 && state.cash < option.cost) {
                    throw new Error('Insufficient cash for this decision');
                }
                state.cash -= option.cost;

                if (option.effect) {
                    const effects = option.effect.split(',');
                    effects.forEach((eff: string) => {
                        const [stat, val] = eff.split(':');
                        const value = parseInt(val);

                        if (stat === 'relationship') {
                            state.player.relationshipStatus = val as any;
                            state.events.push({ month: state.month, description: 'Relationship Status Changed', impact: `You are now ${val}` });
                        } else if (stat === 'pregnancy') {
                            if (val === 'start') {
                                state.player.isPregnant = true;
                                state.events.push({ month: state.month, description: 'Pregnancy Started', impact: 'Expecting a baby in 9 months!' });
                            }
                        } else if (stat === 'happiness') {
                            state.player.happiness = Math.min(100, Math.max(0, state.player.happiness + value));
                        } else if (stat === 'energy') {
                            state.player.energy = Math.min(100, Math.max(0, state.player.energy + value));
                        } else if (stat === 'strength') {
                            state.player.strength = Math.min(100, Math.max(0, state.player.strength + value));
                        } else if (stat === 'intelligence') {
                            state.player.intelligence = Math.min(100, Math.max(0, state.player.intelligence + value));
                        } else if (stat === 'wisdom') {
                            state.player.wisdom = Math.min(100, Math.max(0, state.player.wisdom + value));
                        } else if (stat === 'stress') {
                            state.player.happiness = Math.max(0, state.player.happiness - value);
                        }
                        // Business-specific effects
                        else if (stat === 'demand') {
                            // parseFloat stops at %, so "+15%" becomes 15, then /100 = 0.15
                            const pct = parseFloat(val) / 100;
                            state.business.demand = Math.round(state.business.demand * (1 + pct));
                        } else if (stat === 'capacity') {
                            const pct = parseFloat(val) / 100;
                            state.business.capacity = Math.round(state.business.capacity * (1 + pct));
                        }
                    });
                }

                decisions.splice(decisionIndex, 1);
            }
        }
    }

    // --- TOGGLE_STUDY ---
    if (action === 'TOGGLE_STUDY') {
        state.career.isStudying = !state.career.isStudying;
        state.career.tuitionCost = state.career.isStudying ? TUITION_COST : 0;

        // Update personality
        state.player = PersonalityLogic.updatePersonality(state.player, 'TOGGLE_STUDY', { isStudying: state.career.isStudying });
    }

    // --- SELECT_JOB ---
    if (action === 'SELECT_JOB') {
        const jobTitle = payload?.jobTitle;
        if (!isString(jobTitle) || !(VALID_JOB_TITLES as readonly string[]).includes(jobTitle)) {
            throw new Error(`Invalid job. Must be one of: ${VALID_JOB_TITLES.join(', ')}`);
        }
        state.career.jobTitle = jobTitle;
        state.career.salary = SALARIES[jobTitle];
        // Apply 401(k) benefits for the selected job
        state.career = CareerLogic.apply401kBenefits(state.career);
        state.events.push({ month: state.month, description: 'CAREER STARTED', impact: `Hired as ${jobTitle} (${state.career.salary}/yr)` });
    }

    // --- START_BUSINESS ---
    if (action === 'START_BUSINESS') {
        const businessType = payload?.businessType;
        if (!isString(businessType) || !(VALID_BUSINESS_TYPES as readonly string[]).includes(businessType)) {
            throw new Error(`Invalid business type. Must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`);
        }
        if (state.cash < state.career.savingsGoal) {
            throw new Error('Insufficient savings to start a business');
        }
        state.level = 'Business';
        // Entrepreneur skill reduces startup cost (business_startup bonus is negative, e.g. -0.2).
        const startupReduction = SkillTreeLogic.getSkillBonus(state.skills, 'business_startup');
        const startupCost = Math.round(BUSINESS_STARTUP_COST * (1 + startupReduction));
        state.cash -= startupCost;
        const defaults = BUSINESS_DEFAULTS[businessType];
        state.business.type = businessType as any;
        state.business.inventory = defaults.inventory;
        state.business.capacity = defaults.capacity;
        state.business.prices = defaults.prices;
        state.business.demand = defaults.demand;
        state.events.push({ month: state.month, description: 'BUSINESS LAUNCHED', impact: `You have resigned to start a ${businessType} business. Startup cost: $${startupCost}.` });

        // Update personality
        state.player = PersonalityLogic.updatePersonality(state.player, 'START_BUSINESS', { businessType });
    }

    // --- BUY_ASSET ---
    if (action === 'BUY_ASSET') {
        const assetType = payload?.assetType;
        const amount = payload?.amount;
        if (!isString(assetType) || !(VALID_ASSET_TYPES as readonly string[]).includes(assetType)) {
            throw new Error(`Invalid asset type. Must be one of: ${VALID_ASSET_TYPES.join(', ')}`);
        }
        if (!isPositiveNumber(amount)) {
            throw new Error('amount must be a positive number');
        }
        if (state.cash < amount) {
            throw new Error('Insufficient cash');
        }
        state.cash -= amount;
        if (assetType === 'STOCK') state.portfolio.stocksValue += amount;
        if (assetType === 'BOND') state.portfolio.bondsValue += amount;
        if (assetType === 'REAL_ESTATE') state.portfolio.realEstateValue += amount;

        // Update personality
        state.player = PersonalityLogic.updatePersonality(state.player, 'BUY_ASSET', { assetType });
    }

    // --- SELL_ASSET ---
    if (action === 'SELL_ASSET') {
        const assetType = payload?.assetType;
        const amount = payload?.amount;
        if (!isString(assetType) || !(VALID_ASSET_TYPES as readonly string[]).includes(assetType)) {
            throw new Error(`Invalid asset type. Must be one of: ${VALID_ASSET_TYPES.join(', ')}`);
        }
        if (!isPositiveNumber(amount)) {
            throw new Error('amount must be a positive number');
        }

        // Check if player has enough of the asset
        let currentValue = 0;
        if (assetType === 'STOCK') currentValue = state.portfolio.stocksValue;
        if (assetType === 'BOND') currentValue = state.portfolio.bondsValue;
        if (assetType === 'REAL_ESTATE') currentValue = state.portfolio.realEstateValue;

        if (currentValue < amount) {
            throw new Error('Insufficient assets to sell');
        }

        // Sell with 2% transaction fee
        const saleProceeds = amount * 0.98;
        state.cash += saleProceeds;

        if (assetType === 'STOCK') state.portfolio.stocksValue -= amount;
        if (assetType === 'BOND') state.portfolio.bondsValue -= amount;
        if (assetType === 'REAL_ESTATE') state.portfolio.realEstateValue -= amount;

        state.events.push({
            month: state.month,
            description: 'Asset Sold',
            impact: `Sold ${assetType} for $${saleProceeds.toFixed(0)} (2% fee)`
        });
    }

    // --- UPDATE_BUSINESS ---
    if (action === 'UPDATE_BUSINESS') {
        if (payload?.prices !== undefined) {
            if (!isPositiveNumber(payload.prices)) throw new Error('prices must be a positive number');
            state.business.prices = payload.prices;
        }
        if (payload?.staff !== undefined) {
            if (!isPositiveNumber(payload.staff) || !Number.isInteger(payload.staff)) throw new Error('staff must be a positive integer');
            state.business.staff = payload.staff;
        }
    }

    // --- TAKE_LOAN ---
    if (action === 'TAKE_LOAN') {
        const loanType = payload?.loanType;
        const amount = payload?.amount;

        if (!isString(loanType) || !(VALID_LOAN_TYPES as readonly string[]).includes(loanType)) {
            throw new Error(`Invalid loan type. Must be one of: ${VALID_LOAN_TYPES.join(', ')}`);
        }
        if (!isPositiveNumber(amount)) {
            throw new Error('amount must be a positive number');
        }

        const maxAmount = MAX_LOAN_AMOUNTS[loanType];
        if (amount > maxAmount) {
            throw new Error(`Maximum ${loanType} loan is $${maxAmount}`);
        }

        // Credit score check
        if (state.creditScore < 600) {
            throw new Error('Credit score too low for loan approval');
        }

        const loan = LoanLogic.createLoan(loanType as any, amount, state.month, state.creditScore);
        state.loans.push(loan);
        state.cash += amount;

        state.events.push({
            month: state.month,
            description: 'Loan Approved',
            impact: `${loanType} loan of $${amount.toFixed(0)} at ${(loan.interestRate * 100).toFixed(2)}% APR. Payment: $${loan.monthlyPayment.toFixed(0)}/mo`
        });

        // Update personality
        state.player = PersonalityLogic.updatePersonality(state.player, 'TAKE_LOAN', { loanType });
    }

    // --- PAY_LOAN ---
    if (action === 'PAY_LOAN') {
        const loanId = payload?.loanId;
        const amount = payload?.amount;

        if (!isString(loanId)) {
            throw new Error('loanId is required');
        }
        if (!isPositiveNumber(amount)) {
            throw new Error('amount must be a positive number');
        }

        const loan = state.loans.find(l => l.id === loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }

        if (state.cash < amount) {
            throw new Error('Insufficient cash');
        }

        const paymentAmount = Math.min(amount, loan.balance);
        state.cash -= paymentAmount;
        loan.balance -= paymentAmount;

        if (loan.balance <= 0) {
            state.loans = state.loans.filter(l => l.id !== loanId);
            state.events.push({
                month: state.month,
                description: 'Loan Paid Off!',
                impact: `${loan.type} loan fully repaid early. Credit score improved.`
            });

            // Update personality
            state.player = PersonalityLogic.updatePersonality(state.player, 'PAY_LOAN', { extraPayment: true });
        } else {
            state.events.push({
                month: state.month,
                description: 'Extra Loan Payment',
                impact: `Paid $${paymentAmount.toFixed(0)} toward ${loan.type} loan. Remaining: $${loan.balance.toFixed(0)}`
            });
        }
    }

    // --- UNLOCK_SKILL ---
    if (action === 'UNLOCK_SKILL') {
        const skillId = payload?.skillId;
        if (!isString(skillId)) {
            throw new Error('skillId is required');
        }

        const skill = SKILL_TREE.find(s => s.id === skillId);
        if (!skill) {
            throw new Error('Invalid skill ID');
        }

        // SkillTreeLogic.unlockSkill throws with a descriptive message on failure
        state.skills = SkillTreeLogic.unlockSkill(skill, state.skills);
        state.events.push({
            month: state.month,
            description: `🌟 Skill Unlocked: ${skill.name}`,
            impact: skill.description
        });
    }

    // --- START_CHALLENGE ---
    if (action === 'START_CHALLENGE') {
        const challengeId = payload?.challengeId;
        if (!isString(challengeId)) {
            throw new Error('challengeId is required');
        }

        const challenge = CHALLENGES.find(c => c.id === challengeId);
        if (!challenge) {
            throw new Error('Invalid challenge ID');
        }

        // Reset game with challenge active
        const difficulty = payload?.difficulty || 'Normal';
        const newState = GameEngine.getInitialState(difficulty);
        newState.activeChallenge = challengeId;
        newState.events.push({
            month: 1,
            description: `🎯 Challenge Started: ${challenge.name}`,
            impact: challenge.description
        });

        return saveState(userId, newState);
    }

    // --- START_SCENARIO ---
    if (action === 'START_SCENARIO') {
        const scenarioId = payload?.scenarioId;
        if (!isString(scenarioId)) {
            throw new Error('scenarioId is required');
        }

        const scenario = SCENARIOS.find(s => s.id === scenarioId);
        if (!scenario) {
            throw new Error('Invalid scenario ID');
        }

        // Create base state and apply scenario starting conditions
        const baseState = GameEngine.getInitialState('Normal');
        const newState = ScenarioMode.applyScenario(scenario, baseState);
        newState.activeScenario = scenarioId;
        newState.events.push({
            month: newState.month,
            description: `📖 Scenario Started: ${scenario.name}`,
            impact: scenario.goal.description
        });

        return saveState(userId, newState);
    }

    // --- OPEN_RETIREMENT_ACCOUNT ---
    if (action === 'OPEN_RETIREMENT_ACCOUNT') {
        const accountType = payload?.accountType;
        const contributionRate = payload?.contributionRate || 0;

        if (!isString(accountType)) {
            throw new Error('accountType is required');
        }

        const validAccountTypes = ['401k', 'traditional_ira', 'roth_ira', 'solo_401k'];
        if (!validAccountTypes.includes(accountType)) {
            throw new Error(`Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`);
        }

        if (typeof contributionRate !== 'number' || contributionRate < 0 || contributionRate > 100) {
            throw new Error('contributionRate must be between 0 and 100');
        }

        // Check eligibility
        const eligibility = RetirementLogic.checkAccountEligibility(state.level, state.career.has401k);

        if (accountType === '401k' && !eligibility.canOpen401k) {
            throw new Error('Current employer does not offer 401(k) benefits');
        }

        if (accountType === 'solo_401k' && !eligibility.canOpenSolo401k) {
            throw new Error('Solo 401(k) is only available for business owners');
        }

        // Check if account type already exists
        const existingAccount = state.retirement.accounts.find(acc => acc.type === accountType && acc.isActive);
        if (existingAccount) {
            throw new Error(`You already have an active ${accountType} account`);
        }

        // Create new retirement account
        const newAccount = {
            id: `${accountType}_${Date.now()}`,
            type: accountType as any,
            balance: 0,
            contributionRate,
            employerMatch: accountType === '401k' ? state.career.matchPercentage : 0,
            employerMatchLimit: accountType === '401k' ? state.career.matchLimit : 0,
            vestingSchedule: accountType === '401k'
                ? { totalYears: state.career.vestingYears, vestedPercentage: 0 }
                : { totalYears: 0, vestedPercentage: 100 },
            annualContributions: 0,
            accountAge: 0,
            unvestedBalance: 0,
            isActive: true
        };

        state.retirement.accounts.push(newAccount);

        state.events.push({
            month: state.month,
            description: `Retirement Account Opened`,
            impact: `Opened ${accountType.toUpperCase()} with ${contributionRate}% contribution rate`
        });
    }

    // --- SET_CONTRIBUTION_RATE ---
    if (action === 'SET_CONTRIBUTION_RATE') {
        const accountId = payload?.accountId;
        const contributionRate = payload?.contributionRate;

        if (!isString(accountId)) {
            throw new Error('accountId is required');
        }

        if (typeof contributionRate !== 'number' || contributionRate < 0 || contributionRate > 100) {
            throw new Error('contributionRate must be between 0 and 100');
        }

        const accountIndex = state.retirement.accounts.findIndex(acc => acc.id === accountId);
        if (accountIndex === -1) {
            throw new Error('Retirement account not found');
        }

        const oldRate = state.retirement.accounts[accountIndex].contributionRate;
        state.retirement.accounts[accountIndex].contributionRate = contributionRate;

        state.events.push({
            month: state.month,
            description: 'Contribution Rate Updated',
            impact: `Changed ${state.retirement.accounts[accountIndex].type.toUpperCase()} contribution from ${oldRate}% to ${contributionRate}%`
        });
    }

    // --- WITHDRAW_RETIREMENT ---
    if (action === 'WITHDRAW_RETIREMENT') {
        const accountId = payload?.accountId;
        const amount = payload?.amount;

        if (!isString(accountId)) {
            throw new Error('accountId is required');
        }

        if (!isPositiveNumber(amount)) {
            throw new Error('amount must be a positive number');
        }

        const accountIndex = state.retirement.accounts.findIndex(acc => acc.id === accountId);
        if (accountIndex === -1) {
            throw new Error('Retirement account not found');
        }

        const account = state.retirement.accounts[accountIndex];

        if (amount > account.balance) {
            throw new Error('Insufficient balance in retirement account');
        }

        // Player age, consistent with GameEngine's month basis (month 1 = age 17).
        // Kept fractional here so the 59.5 penalty-free threshold is evaluated precisely.
        const playerAge = 17 + (state.month - 1) / 12;

        // Process withdrawal with penalties and taxes
        const withdrawalResult = RetirementLogic.processWithdrawal(
            account,
            amount,
            playerAge,
            0.20 // Using standard tax rate from config
        );

        if (!withdrawalResult.success) {
            throw new Error(withdrawalResult.message || 'Withdrawal failed');
        }

        // Update account
        state.retirement.accounts[accountIndex] = withdrawalResult.account;

        // Add cash to player
        state.cash += withdrawalResult.cashReceived;

        // Create detailed event message
        let impactMessage = `Withdrew ${amount.toFixed(0)} from ${account.type.toUpperCase()}. `;
        if (withdrawalResult.penalty > 0) {
            impactMessage += `Penalty: ${withdrawalResult.penalty.toFixed(0)}. `;
        }
        if (withdrawalResult.taxes > 0) {
            impactMessage += `Taxes: ${withdrawalResult.taxes.toFixed(0)}. `;
        }
        impactMessage += `Net received: ${withdrawalResult.cashReceived.toFixed(0)}`;

        state.events.push({
            month: state.month,
            description: 'Retirement Withdrawal',
            impact: impactMessage
        });

        // Warn about early withdrawal if penalty was applied
        if (withdrawalResult.penalty > 0 && playerAge < 59.5) {
            state.events.push({
                month: state.month,
                description: '⚠️ Early Withdrawal Penalty',
                impact: 'Withdrawing before age 59.5 incurs a 10% penalty plus taxes'
            });
        }
    }

    // --- BUY_LUXURY ---
    if (action === 'BUY_LUXURY') {
        state.luxury = LuxuryLogic.normalize(state.luxury);
        const itemId = payload?.itemId;
        const def = LUXURY_CATALOG.find(l => l.id === itemId);
        if (!def) {
            throw new Error('Invalid luxury item');
        }
        if (state.cash < def.cost) {
            throw new Error('Insufficient cash for this purchase');
        }

        state.cash -= def.cost;
        state.player.happiness = Math.min(100, state.player.happiness + def.happiness);

        // Experiences are pure consumption — no owned asset, no resale.
        if (def.kind !== 'consumable') {
            state.luxury.ownedAssets.push({
                id: `lux_${def.id}_${Date.now()}`,
                type: def.id,
                name: def.name,
                purchasePrice: def.cost,
                currentValue: def.cost,
                purchaseMonth: state.month,
            });
        }

        state.events.push({
            month: state.month,
            description: `${def.icon} Purchased ${def.name}`,
            impact: def.kind === 'consumable'
                ? `-$${def.cost.toLocaleString()}. An experience of a lifetime!`
                : `-$${def.cost.toLocaleString()}. Upkeep $${def.upkeep.toLocaleString()}/mo.`
        });
    }

    // --- SELL_LUXURY ---
    if (action === 'SELL_LUXURY') {
        state.luxury = LuxuryLogic.normalize(state.luxury);
        const assetId = payload?.assetId;
        if (!isString(assetId)) {
            throw new Error('assetId is required');
        }
        const idx = state.luxury.ownedAssets.findIndex(a => a.id === assetId);
        if (idx === -1) {
            throw new Error('Luxury item not found');
        }
        const asset = state.luxury.ownedAssets[idx];
        const def = LUXURY_CATALOG.find(l => l.id === asset.type);
        // Real estate sells near value; toys take a resale haircut.
        const resaleFactor = def?.kind === 'appreciating' ? 0.95 : 0.85;
        const proceeds = Math.round(asset.currentValue * resaleFactor);

        state.cash += proceeds;
        state.luxury.ownedAssets.splice(idx, 1);

        state.events.push({
            month: state.month,
            description: `Sold ${asset.name}`,
            impact: `+$${proceeds.toLocaleString()} (${Math.round((1 - resaleFactor) * 100)}% resale cost)`
        });
    }

    // --- TOGGLE_SUBSCRIPTION ---
    if (action === 'TOGGLE_SUBSCRIPTION') {
        state.luxury = LuxuryLogic.normalize(state.luxury);
        const subId = payload?.subId;
        const sub = LUXURY_SUBSCRIPTIONS.find(s => s.id === subId);
        if (!sub) {
            throw new Error('Invalid subscription');
        }
        const existing = state.luxury.subscriptions.indexOf(sub.id);
        if (existing === -1) {
            state.luxury.subscriptions.push(sub.id);
            state.events.push({
                month: state.month,
                description: `${sub.icon} Subscribed: ${sub.name}`,
                impact: `-$${sub.monthlyCost.toLocaleString()}/mo`
            });
        } else {
            state.luxury.subscriptions.splice(existing, 1);
            state.events.push({
                month: state.month,
                description: `Cancelled: ${sub.name}`,
                impact: `Saving $${sub.monthlyCost.toLocaleString()}/mo`
            });
        }
    }

    return saveState(userId, state);
}
