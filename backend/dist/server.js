"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const GameEngine_1 = require("./engine/GameEngine");
const config_1 = require("./engine/config");
const LoanLogic_1 = require("./engine/systems/LoanLogic");
const CareerLogic_1 = require("./engine/systems/CareerLogic");
const PersonalityLogic_1 = require("./engine/systems/PersonalityLogic");
const SkillTreeLogic_1 = require("./engine/systems/SkillTreeLogic");
const ChallengeMode_1 = require("./engine/systems/ChallengeMode");
const ScenarioMode_1 = require("./engine/systems/ScenarioMode");
const RetirementLogic_1 = require("./engine/systems/RetirementLogic");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
let prisma = null;
// --- Middleware MUST be registered before routes ---
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- Validation helpers ---
function isString(val) {
    return typeof val === 'string' && val.length > 0;
}
function isPositiveNumber(val) {
    return typeof val === 'number' && val > 0 && Number.isFinite(val);
}
function requirePrisma(res) {
    if (!prisma) {
        res.status(503).json({ error: 'Database not available', details: 'Prisma client failed to initialize' });
        return false;
    }
    return true;
}
// Runtime cast with basic shape check
function castState(json) {
    const obj = json;
    if (!obj || typeof obj !== 'object' || !('level' in obj) || !('month' in obj) || !('cash' in obj)) {
        throw new Error('Invalid game state shape in database');
    }
    return obj;
}
// --- Database initialization with retry ---
async function initializeDatabase() {
    const MAX_RETRIES = 10;
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            console.log(`🔄 Initializing database client (attempt ${retries + 1}/${MAX_RETRIES})...`);
            prisma = new client_1.PrismaClient();
            await prisma.$queryRaw `SELECT 1`;
            console.log('✅ Database connection successful!');
            try {
                const count = await prisma.gameSession.count();
                console.log(`✅ GameSession table ready (${count} sessions)`);
            }
            catch (tableError) {
                console.error('⚠️  GameSession table may not exist yet. Retrying...');
                throw tableError;
            }
            return;
        }
        catch (error) {
            retries++;
            console.error(`❌ Database connection attempt ${retries} failed:`, error instanceof Error ? error.message : String(error));
            if (retries < MAX_RETRIES) {
                const waitTime = 1000 * retries;
                console.log(`⏳ Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            else {
                console.error('❌ All database initialization attempts failed');
                console.warn('⚠️ Server will start but database operations will fail with 503');
                prisma = null;
                return;
            }
        }
    }
}
// --- Routes ---
app.get('/', (_req, res) => {
    res.json({ message: 'Capital Allocation Simulator Backend', version: '1.0.0', status: 'running', prismaReady: prisma !== null });
});
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Server is running',
        database: prisma ? 'available' : 'unavailable',
        version: 'v2.0-2026-01-15'
    });
});
app.post('/api/game/start', async (req, res) => {
    try {
        if (!requirePrisma(res))
            return;
        const userId = req.body.userId || 'default';
        const difficulty = req.body.difficulty || 'Normal';
        if (!['Easy', 'Normal', 'Hard'].includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty. Must be Easy, Normal, or Hard' });
        }
        const initialState = GameEngine_1.GameEngine.getInitialState(difficulty);
        res.json((await prisma.gameSession.upsert({
            where: { userId },
            update: { gameState: initialState },
            create: { userId, gameState: initialState }
        })).gameState);
    }
    catch (error) {
        console.error('Error in /api/game/start:', error);
        res.status(500).json({ error: 'Failed to start game', details: error instanceof Error ? error.message : String(error) });
    }
});
app.get('/api/game/state/:userId', async (req, res) => {
    try {
        if (!requirePrisma(res))
            return;
        const userId = req.params.userId;
        let session = await prisma.gameSession.findUnique({ where: { userId } });
        if (!session) {
            const initialState = GameEngine_1.GameEngine.getInitialState();
            session = await prisma.gameSession.create({ data: { userId, gameState: initialState } });
        }
        res.json(session.gameState);
    }
    catch (error) {
        console.error('Error in /api/game/state:', error);
        res.status(500).json({ error: 'Failed to get game state', details: error instanceof Error ? error.message : String(error) });
    }
});
app.post('/api/game/turn', async (req, res) => {
    try {
        if (!requirePrisma(res))
            return;
        const userId = req.body.userId;
        if (!isString(userId)) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const session = await prisma.gameSession.findUnique({ where: { userId } });
        if (!session) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        const currentState = castState(session.gameState);
        const newState = GameEngine_1.GameEngine.processTurn(currentState);
        const updated = await prisma.gameSession.update({
            where: { userId },
            data: { gameState: newState }
        });
        res.json(updated.gameState);
    }
    catch (error) {
        console.error('Error in /api/game/turn:', error);
        res.status(500).json({ error: 'Failed to process turn', details: error instanceof Error ? error.message : String(error) });
    }
});
app.post('/api/game/action', async (req, res) => {
    try {
        if (!requirePrisma(res))
            return;
        const { userId, action, payload } = req.body;
        // --- Input validation ---
        if (!isString(userId)) {
            return res.status(400).json({ error: 'userId is required' });
        }
        if (!isString(action) || !config_1.VALID_ACTIONS.includes(action)) {
            return res.status(400).json({ error: `Invalid action. Must be one of: ${config_1.VALID_ACTIONS.join(', ')}` });
        }
        const session = await prisma.gameSession.findUnique({ where: { userId } });
        if (!session)
            return res.status(404).json({ error: 'No game' });
        const state = castState(session.gameState);
        // --- Challenge Mode Validation ---
        if (state.activeChallenge && action !== 'RESET' && action !== 'START_CHALLENGE' && action !== 'START_SCENARIO') {
            const challenge = ChallengeMode_1.CHALLENGES.find(c => c.id === state.activeChallenge);
            if (challenge) {
                const validation = ChallengeMode_1.ChallengeMode.validateAction(challenge, action, payload, state);
                if (!validation.valid) {
                    return res.status(400).json({ error: validation.reason });
                }
            }
        }
        // --- RESET ---
        if (action === 'RESET') {
            const difficulty = payload?.difficulty || 'Normal';
            if (!['Easy', 'Normal', 'Hard'].includes(difficulty)) {
                return res.status(400).json({ error: 'Invalid difficulty' });
            }
            const newState = GameEngine_1.GameEngine.getInitialState(difficulty);
            const updated = await prisma.gameSession.update({ where: { userId }, data: { gameState: newState } });
            return res.json(updated.gameState);
        }
        // --- UPDATE_LIFESTYLE ---
        if (action === 'UPDATE_LIFESTYLE') {
            const tier = payload?.tier;
            if (!isString(tier) || !config_1.VALID_LIFESTYLE_TIERS.includes(tier)) {
                return res.status(400).json({ error: `Invalid tier. Must be one of: ${config_1.VALID_LIFESTYLE_TIERS.join(', ')}` });
            }
            const costs = config_1.LIFESTYLE_TIERS[tier];
            state.lifestyle = { ...state.lifestyle, tier: tier, ...costs };
        }
        // --- MAKE_DECISION ---
        if (action === 'MAKE_DECISION') {
            const decisionId = payload?.decisionId;
            const optionId = payload?.optionId;
            if (!isString(decisionId) || !isString(optionId)) {
                return res.status(400).json({ error: 'decisionId and optionId are required' });
            }
            if (!state.career.pendingDecisions)
                state.career.pendingDecisions = [];
            // Search career decisions first, then business decisions
            let decisionIndex = state.career.pendingDecisions.findIndex((d) => d.id === decisionId);
            let decisionSource = 'career';
            if (decisionIndex === -1 && state.business.pendingDecisions) {
                decisionIndex = state.business.pendingDecisions.findIndex((d) => d.id === decisionId);
                decisionSource = 'business';
            }
            const decisions = decisionSource === 'career' ? state.career.pendingDecisions : state.business.pendingDecisions;
            if (decisionIndex !== -1 && decisions) {
                const decision = decisions[decisionIndex];
                const option = decision.options.find((o) => o.id === optionId);
                if (option) {
                    // Validate player can afford the decision
                    if (option.cost > 0 && state.cash < option.cost) {
                        return res.status(400).json({ error: 'Insufficient cash for this decision' });
                    }
                    state.cash -= option.cost;
                    if (option.effect) {
                        const effects = option.effect.split(',');
                        effects.forEach((eff) => {
                            const [stat, val] = eff.split(':');
                            const value = parseInt(val);
                            if (stat === 'relationship') {
                                state.player.relationshipStatus = val;
                                state.events.push({ month: state.month, description: 'Relationship Status Changed', impact: `You are now ${val}` });
                            }
                            else if (stat === 'pregnancy') {
                                if (val === 'start') {
                                    state.player.isPregnant = true;
                                    state.events.push({ month: state.month, description: 'Pregnancy Started', impact: 'Expecting a baby in 9 months!' });
                                }
                            }
                            else if (stat === 'happiness') {
                                state.player.happiness = Math.min(100, Math.max(0, state.player.happiness + value));
                            }
                            else if (stat === 'energy') {
                                state.player.energy = Math.min(100, Math.max(0, state.player.energy + value));
                            }
                            else if (stat === 'strength') {
                                state.player.strength = Math.min(100, Math.max(0, state.player.strength + value));
                            }
                            else if (stat === 'intelligence') {
                                state.player.intelligence = Math.min(100, Math.max(0, state.player.intelligence + value));
                            }
                            else if (stat === 'wisdom') {
                                state.player.wisdom = Math.min(100, Math.max(0, state.player.wisdom + value));
                            }
                            else if (stat === 'stress') {
                                state.player.happiness = Math.max(0, state.player.happiness - value);
                            }
                            // Business-specific effects
                            else if (stat === 'demand') {
                                // parseFloat stops at %, so "+15%" becomes 15, then /100 = 0.15
                                const pct = parseFloat(val) / 100;
                                state.business.demand = Math.round(state.business.demand * (1 + pct));
                            }
                            else if (stat === 'capacity') {
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
            state.career.tuitionCost = state.career.isStudying ? config_1.TUITION_COST : 0;
            // Update personality
            state.player = PersonalityLogic_1.PersonalityLogic.updatePersonality(state.player, 'TOGGLE_STUDY', { isStudying: state.career.isStudying });
        }
        // --- SELECT_JOB ---
        if (action === 'SELECT_JOB') {
            const jobTitle = payload?.jobTitle;
            if (!isString(jobTitle) || !config_1.VALID_JOB_TITLES.includes(jobTitle)) {
                return res.status(400).json({ error: `Invalid job. Must be one of: ${config_1.VALID_JOB_TITLES.join(', ')}` });
            }
            state.career.jobTitle = jobTitle;
            state.career.salary = config_1.SALARIES[jobTitle];
            // Apply 401(k) benefits for the selected job
            state.career = CareerLogic_1.CareerLogic.apply401kBenefits(state.career);
            state.events.push({ month: state.month, description: 'CAREER STARTED', impact: `Hired as ${jobTitle} (${state.career.salary}/yr)` });
        }
        // --- START_BUSINESS ---
        if (action === 'START_BUSINESS') {
            const businessType = payload?.businessType;
            if (!isString(businessType) || !config_1.VALID_BUSINESS_TYPES.includes(businessType)) {
                return res.status(400).json({ error: `Invalid business type. Must be one of: ${config_1.VALID_BUSINESS_TYPES.join(', ')}` });
            }
            if (state.cash < state.career.savingsGoal) {
                return res.status(400).json({ error: 'Insufficient savings to start a business' });
            }
            state.level = 'Business';
            // Entrepreneur skill reduces startup cost (business_startup bonus is negative, e.g. -0.2).
            const startupReduction = SkillTreeLogic_1.SkillTreeLogic.getSkillBonus(state.skills, 'business_startup');
            const startupCost = Math.round(config_1.BUSINESS_STARTUP_COST * (1 + startupReduction));
            state.cash -= startupCost;
            const defaults = config_1.BUSINESS_DEFAULTS[businessType];
            state.business.type = businessType;
            state.business.inventory = defaults.inventory;
            state.business.capacity = defaults.capacity;
            state.business.prices = defaults.prices;
            state.business.demand = defaults.demand;
            state.events.push({ month: state.month, description: 'BUSINESS LAUNCHED', impact: `You have resigned to start a ${businessType} business. Startup cost: $${startupCost}.` });
            // Update personality
            state.player = PersonalityLogic_1.PersonalityLogic.updatePersonality(state.player, 'START_BUSINESS', { businessType });
        }
        // --- BUY_ASSET ---
        if (action === 'BUY_ASSET') {
            const assetType = payload?.assetType;
            const amount = payload?.amount;
            if (!isString(assetType) || !config_1.VALID_ASSET_TYPES.includes(assetType)) {
                return res.status(400).json({ error: `Invalid asset type. Must be one of: ${config_1.VALID_ASSET_TYPES.join(', ')}` });
            }
            if (!isPositiveNumber(amount)) {
                return res.status(400).json({ error: 'amount must be a positive number' });
            }
            if (state.cash < amount) {
                return res.status(400).json({ error: 'Insufficient cash' });
            }
            state.cash -= amount;
            if (assetType === 'STOCK')
                state.portfolio.stocksValue += amount;
            if (assetType === 'BOND')
                state.portfolio.bondsValue += amount;
            if (assetType === 'REAL_ESTATE')
                state.portfolio.realEstateValue += amount;
            // Update personality
            state.player = PersonalityLogic_1.PersonalityLogic.updatePersonality(state.player, 'BUY_ASSET', { assetType });
        }
        // --- SELL_ASSET ---
        if (action === 'SELL_ASSET') {
            const assetType = payload?.assetType;
            const amount = payload?.amount;
            if (!isString(assetType) || !config_1.VALID_ASSET_TYPES.includes(assetType)) {
                return res.status(400).json({ error: `Invalid asset type. Must be one of: ${config_1.VALID_ASSET_TYPES.join(', ')}` });
            }
            if (!isPositiveNumber(amount)) {
                return res.status(400).json({ error: 'amount must be a positive number' });
            }
            // Check if player has enough of the asset
            let currentValue = 0;
            if (assetType === 'STOCK')
                currentValue = state.portfolio.stocksValue;
            if (assetType === 'BOND')
                currentValue = state.portfolio.bondsValue;
            if (assetType === 'REAL_ESTATE')
                currentValue = state.portfolio.realEstateValue;
            if (currentValue < amount) {
                return res.status(400).json({ error: 'Insufficient assets to sell' });
            }
            // Sell with 2% transaction fee
            const saleProceeds = amount * 0.98;
            state.cash += saleProceeds;
            if (assetType === 'STOCK')
                state.portfolio.stocksValue -= amount;
            if (assetType === 'BOND')
                state.portfolio.bondsValue -= amount;
            if (assetType === 'REAL_ESTATE')
                state.portfolio.realEstateValue -= amount;
            state.events.push({
                month: state.month,
                description: 'Asset Sold',
                impact: `Sold ${assetType} for $${saleProceeds.toFixed(0)} (2% fee)`
            });
        }
        // --- UPDATE_BUSINESS ---
        if (action === 'UPDATE_BUSINESS') {
            if (payload?.prices !== undefined) {
                if (!isPositiveNumber(payload.prices))
                    return res.status(400).json({ error: 'prices must be a positive number' });
                state.business.prices = payload.prices;
            }
            if (payload?.staff !== undefined) {
                if (!isPositiveNumber(payload.staff) || !Number.isInteger(payload.staff))
                    return res.status(400).json({ error: 'staff must be a positive integer' });
                state.business.staff = payload.staff;
            }
        }
        // --- TAKE_LOAN ---
        if (action === 'TAKE_LOAN') {
            const loanType = payload?.loanType;
            const amount = payload?.amount;
            if (!isString(loanType) || !config_1.VALID_LOAN_TYPES.includes(loanType)) {
                return res.status(400).json({ error: `Invalid loan type. Must be one of: ${config_1.VALID_LOAN_TYPES.join(', ')}` });
            }
            if (!isPositiveNumber(amount)) {
                return res.status(400).json({ error: 'amount must be a positive number' });
            }
            const maxAmount = config_1.MAX_LOAN_AMOUNTS[loanType];
            if (amount > maxAmount) {
                return res.status(400).json({ error: `Maximum ${loanType} loan is $${maxAmount}` });
            }
            // Credit score check
            if (state.creditScore < 600) {
                return res.status(400).json({ error: 'Credit score too low for loan approval' });
            }
            const loan = LoanLogic_1.LoanLogic.createLoan(loanType, amount, state.month, state.creditScore);
            state.loans.push(loan);
            state.cash += amount;
            state.events.push({
                month: state.month,
                description: 'Loan Approved',
                impact: `${loanType} loan of $${amount.toFixed(0)} at ${(loan.interestRate * 100).toFixed(2)}% APR. Payment: $${loan.monthlyPayment.toFixed(0)}/mo`
            });
            // Update personality
            state.player = PersonalityLogic_1.PersonalityLogic.updatePersonality(state.player, 'TAKE_LOAN', { loanType });
        }
        // --- PAY_LOAN ---
        if (action === 'PAY_LOAN') {
            const loanId = payload?.loanId;
            const amount = payload?.amount;
            if (!isString(loanId)) {
                return res.status(400).json({ error: 'loanId is required' });
            }
            if (!isPositiveNumber(amount)) {
                return res.status(400).json({ error: 'amount must be a positive number' });
            }
            const loan = state.loans.find(l => l.id === loanId);
            if (!loan) {
                return res.status(400).json({ error: 'Loan not found' });
            }
            if (state.cash < amount) {
                return res.status(400).json({ error: 'Insufficient cash' });
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
                state.player = PersonalityLogic_1.PersonalityLogic.updatePersonality(state.player, 'PAY_LOAN', { extraPayment: true });
            }
            else {
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
                return res.status(400).json({ error: 'skillId is required' });
            }
            const skill = SkillTreeLogic_1.SKILL_TREE.find(s => s.id === skillId);
            if (!skill) {
                return res.status(400).json({ error: 'Invalid skill ID' });
            }
            try {
                state.skills = SkillTreeLogic_1.SkillTreeLogic.unlockSkill(skill, state.skills);
                state.events.push({
                    month: state.month,
                    description: `🌟 Skill Unlocked: ${skill.name}`,
                    impact: skill.description
                });
            }
            catch (error) {
                return res.status(400).json({ error: error instanceof Error ? error.message : 'Cannot unlock skill' });
            }
        }
        // --- START_CHALLENGE ---
        if (action === 'START_CHALLENGE') {
            const challengeId = payload?.challengeId;
            if (!isString(challengeId)) {
                return res.status(400).json({ error: 'challengeId is required' });
            }
            const challenge = ChallengeMode_1.CHALLENGES.find(c => c.id === challengeId);
            if (!challenge) {
                return res.status(400).json({ error: 'Invalid challenge ID' });
            }
            // Reset game with challenge active
            const difficulty = payload?.difficulty || 'Normal';
            const newState = GameEngine_1.GameEngine.getInitialState(difficulty);
            newState.activeChallenge = challengeId;
            newState.events.push({
                month: 1,
                description: `🎯 Challenge Started: ${challenge.name}`,
                impact: challenge.description
            });
            const updated = await prisma.gameSession.update({ where: { userId }, data: { gameState: newState } });
            return res.json(updated.gameState);
        }
        // --- START_SCENARIO ---
        if (action === 'START_SCENARIO') {
            const scenarioId = payload?.scenarioId;
            if (!isString(scenarioId)) {
                return res.status(400).json({ error: 'scenarioId is required' });
            }
            const scenario = ScenarioMode_1.SCENARIOS.find(s => s.id === scenarioId);
            if (!scenario) {
                return res.status(400).json({ error: 'Invalid scenario ID' });
            }
            // Create base state and apply scenario starting conditions
            const baseState = GameEngine_1.GameEngine.getInitialState('Normal');
            const newState = ScenarioMode_1.ScenarioMode.applyScenario(scenario, baseState);
            newState.activeScenario = scenarioId;
            newState.events.push({
                month: newState.month,
                description: `📖 Scenario Started: ${scenario.name}`,
                impact: scenario.goal.description
            });
            const updated = await prisma.gameSession.update({ where: { userId }, data: { gameState: newState } });
            return res.json(updated.gameState);
        }
        // --- OPEN_RETIREMENT_ACCOUNT ---
        if (action === 'OPEN_RETIREMENT_ACCOUNT') {
            const accountType = payload?.accountType;
            const contributionRate = payload?.contributionRate || 0;
            if (!isString(accountType)) {
                return res.status(400).json({ error: 'accountType is required' });
            }
            const validAccountTypes = ['401k', 'traditional_ira', 'roth_ira', 'solo_401k'];
            if (!validAccountTypes.includes(accountType)) {
                return res.status(400).json({ error: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}` });
            }
            if (typeof contributionRate !== 'number' || contributionRate < 0 || contributionRate > 100) {
                return res.status(400).json({ error: 'contributionRate must be between 0 and 100' });
            }
            // Check eligibility
            const eligibility = RetirementLogic_1.RetirementLogic.checkAccountEligibility(state.level, state.career.has401k);
            if (accountType === '401k' && !eligibility.canOpen401k) {
                return res.status(400).json({ error: 'Current employer does not offer 401(k) benefits' });
            }
            if (accountType === 'solo_401k' && !eligibility.canOpenSolo401k) {
                return res.status(400).json({ error: 'Solo 401(k) is only available for business owners' });
            }
            // Check if account type already exists
            const existingAccount = state.retirement.accounts.find(acc => acc.type === accountType && acc.isActive);
            if (existingAccount) {
                return res.status(400).json({ error: `You already have an active ${accountType} account` });
            }
            // Create new retirement account
            const newAccount = {
                id: `${accountType}_${Date.now()}`,
                type: accountType,
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
                return res.status(400).json({ error: 'accountId is required' });
            }
            if (typeof contributionRate !== 'number' || contributionRate < 0 || contributionRate > 100) {
                return res.status(400).json({ error: 'contributionRate must be between 0 and 100' });
            }
            const accountIndex = state.retirement.accounts.findIndex(acc => acc.id === accountId);
            if (accountIndex === -1) {
                return res.status(400).json({ error: 'Retirement account not found' });
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
                return res.status(400).json({ error: 'accountId is required' });
            }
            if (!isPositiveNumber(amount)) {
                return res.status(400).json({ error: 'amount must be a positive number' });
            }
            const accountIndex = state.retirement.accounts.findIndex(acc => acc.id === accountId);
            if (accountIndex === -1) {
                return res.status(400).json({ error: 'Retirement account not found' });
            }
            const account = state.retirement.accounts[accountIndex];
            if (amount > account.balance) {
                return res.status(400).json({ error: 'Insufficient balance in retirement account' });
            }
            // Player age, consistent with GameEngine's month basis (month 1 = age 17).
            // Kept fractional here so the 59.5 penalty-free threshold is evaluated precisely.
            const playerAge = 17 + (state.month - 1) / 12;
            // Process withdrawal with penalties and taxes
            const withdrawalResult = RetirementLogic_1.RetirementLogic.processWithdrawal(account, amount, playerAge, 0.20 // Using standard tax rate from config
            );
            if (!withdrawalResult.success) {
                return res.status(400).json({ error: withdrawalResult.message || 'Withdrawal failed' });
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
        // Save back to DB
        const updatedSession = await prisma.gameSession.update({
            where: { userId },
            data: { gameState: state }
        });
        res.json(updatedSession.gameState);
    }
    catch (error) {
        console.error('Error in /api/game/action:', error);
        res.status(500).json({ error: 'Failed to process action', details: error instanceof Error ? error.message : String(error) });
    }
});
// --- Error handlers (must be last) ---
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'production' ? 'Unknown error' : err.message
    });
});
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found', path: _req.path });
});
// --- Start server ---
async function startServer() {
    await initializeDatabase();
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
        console.log(`✅ Server fully initialized and ready to accept requests`);
    });
    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        server.close(async () => {
            if (prisma)
                await prisma.$disconnect();
            process.exit(0);
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
