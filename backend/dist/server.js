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
const PersonalityLogic_1 = require("./engine/systems/PersonalityLogic");
const SkillTreeLogic_1 = require("./engine/systems/SkillTreeLogic");
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
            state.cash -= config_1.BUSINESS_STARTUP_COST;
            const defaults = config_1.BUSINESS_DEFAULTS[businessType];
            state.business.type = businessType;
            state.business.inventory = defaults.inventory;
            state.business.capacity = defaults.capacity;
            state.business.prices = defaults.prices;
            state.business.demand = defaults.demand;
            state.events.push({ month: state.month, description: 'BUSINESS LAUNCHED', impact: `You have resigned to start a ${businessType} business.` });
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
