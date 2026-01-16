import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { GameEngine } from './engine/GameEngine';
import { GameState } from './engine/types';

const app = express();
let prisma: PrismaClient | null = null;

// Initialize Prisma and run migrations
async function initializeDatabase() {
    try {
        console.log('Initializing database client...');
        prisma = new PrismaClient();
        
        // Test connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection successful');
        
        // Try to ensure the schema exists by running a query on GameSession
        try {
            const count = await prisma.gameSession.count();
            console.log(`✅ GameSession table ready (${count} sessions)`);
        } catch (tableError) {
            console.error('❌ GameSession table not found, but server will return 503 for database operations');
            // Don't throw - just warn
        }
    } catch (error) {
        console.error('❌ Database initialization failed:', error instanceof Error ? error.message : String(error));
        console.warn('⚠️ Server will start but database operations will fail');
        prisma = null;
    }
}

// Start server after initializing database
async function startServer() {
    // Initialize database first
    await initializeDatabase();
    
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
        console.log(`✅ Server fully initialized and ready to accept requests`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down gracefully...');
        server.close(async () => {
            if (prisma) {
                await prisma.$disconnect();
            }
            process.exit(0);
        });
    });

    process.on('SIGTERM', async () => {
        console.log('Shutting down gracefully...');
        server.close(async () => {
            if (prisma) {
                await prisma.$disconnect();
            }
            process.exit(0);
        });
    });
}

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

app.use(cors());
app.use(express.json());

// Helper to ensure state matches Expected Type (Prisma Json is basic object)
const castState = (json: any): GameState => json as unknown as GameState;

// Root endpoint for testing
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Capital Allocation Simulator Backend', version: '1.0.0', status: 'running', prismaReady: prisma !== null });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    console.log('⭐ Health check requested');
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(), 
        message: 'Server is running',
        database: prisma ? 'available' : 'unavailable',
        version: 'v2.0-2026-01-15'
    });
});

app.post('/api/game/start', async (req: Request, res: Response) => {
    try {
        if (!prisma) {
            return res.status(503).json({ error: 'Database not available', details: 'Prisma client failed to initialize' });
        }
        const userId = req.body.userId || 'default';
        const initialState = GameEngine.getInitialState();

        // Upsert session
        const session = await prisma.gameSession.upsert({
            where: { userId },
            update: { gameState: initialState as any },
            create: { userId, gameState: initialState as any }
        });

        res.json(session.gameState);
    } catch (error) {
        console.error('Error in /api/game/start:', error);
        res.status(500).json({ error: 'Failed to start game', details: error instanceof Error ? error.message : String(error) });
    }
});

app.get('/api/game/state/:userId', async (req: Request, res: Response) => {
    try {
        if (!prisma) {
            return res.status(503).json({ error: 'Database not available', details: 'Prisma client failed to initialize' });
        }
        const userId = req.params.userId as string;

        let session = await prisma.gameSession.findUnique({ where: { userId } });

        if (!session) {
            const initialState = GameEngine.getInitialState();
            session = await prisma.gameSession.create({
                data: { userId, gameState: initialState as any }
            });
        }

        res.json(session.gameState);
    } catch (error) {
        console.error('Error in /api/game/state:', error);
        res.status(500).json({ error: 'Failed to get game state', details: error instanceof Error ? error.message : String(error) });
    }
});

app.post('/api/game/turn', async (req: Request, res: Response) => {
    try {
        if (!prisma) {
            return res.status(503).json({ error: 'Database not available', details: 'Prisma client failed to initialize' });
        }
        const userId = req.body.userId;
        const session = await prisma.gameSession.findUnique({ where: { userId } });

        if (!session) {
            res.status(404).json({ error: "Game not found" });
            return;
        }

        const currentState = castState(session.gameState);
        const newState = GameEngine.processTurn(currentState);

        const updatedSession = await prisma.gameSession.update({
            where: { userId },
            data: { gameState: newState as any }
        });

        res.json(updatedSession.gameState);
    } catch (error) {
        console.error('Error in /api/game/turn:', error);
        res.status(500).json({ error: 'Failed to process turn', details: error instanceof Error ? error.message : String(error) });
    }
});

app.post('/api/game/action', async (req: Request, res: Response) => {
    try {
        if (!prisma) {
            return res.status(503).json({ error: 'Database not available', details: 'Prisma client failed to initialize' });
        }
        const { userId, action, payload } = req.body;
        const session = await prisma.gameSession.findUnique({ where: { userId } });

        if (!session) return res.status(404).json({ error: "No game" });

        const state = castState(session.gameState);

        // --- PLAYER ACTIONS ---
        if (action === 'RESET') {
            const newState = GameEngine.getInitialState();
            const updated = await prisma.gameSession.update({
                where: { userId },
                data: { gameState: newState as any }
            });
            return res.json(updated.gameState);
        }

        if (action === 'UPDATE_LIFESTYLE') {
            const { tier } = payload;
            if (tier === 'Frugal') {
                state.lifestyle = { ...state.lifestyle, tier: 'Frugal', rent: 800, food: 300, transport: 100, entertainment: 0 };
            } else if (tier === 'Moderate') {
                state.lifestyle = { ...state.lifestyle, tier: 'Moderate', rent: 1500, food: 600, transport: 300, entertainment: 200 };
            } else if (tier === 'Luxury') {
                state.lifestyle = { ...state.lifestyle, tier: 'Luxury', rent: 3000, food: 1200, transport: 500, entertainment: 1000 };
            }
        }

        if (action === 'MAKE_DECISION') {
            const { decisionId, optionId } = payload;

            // Check Career Pending Decisions
            // Ensure pendingDecisions exists
            if (!state.career.pendingDecisions) state.career.pendingDecisions = [];

            const decisionIndex = state.career.pendingDecisions.findIndex((d: any) => d.id === decisionId);
            if (decisionIndex !== -1) {
                const decision = state.career.pendingDecisions[decisionIndex];
                const option = decision.options.find((o: any) => o.id === optionId);

                if (option) {
                    // Apply Cost
                    state.cash -= option.cost;
                    state.netWorth -= option.cost;

                    // Parse Effects
                    if (option.effect) {
                        const effects = option.effect.split(',');
                        effects.forEach((eff: string) => {
                            const [stat, val] = eff.split(':');
                            const value = parseInt(val);

                            // Special Action Effects
                            if (stat === 'relationship') {
                                state.player.relationshipStatus = val as any;
                                state.events.push({ month: state.month, description: "Relationship Status Changed", impact: `You are now ${val}` });
                            }
                            else if (stat === 'pregnancy') {
                                if (val === 'start') {
                                    state.player.isPregnant = true;
                                    state.events.push({ month: state.month, description: "Pregnancy Started", impact: "Expecting a baby in 9 months!" });
                                }
                            }
                            // Standard Stats
                            else if (stat === 'happiness') state.player.happiness = Math.min(100, Math.max(0, state.player.happiness + value));
                            else if (stat === 'energy') state.player.energy = Math.min(100, Math.max(0, state.player.energy + value));
                            else if (stat === 'strength') state.player.strength = Math.min(100, Math.max(0, state.player.strength + value));
                            else if (stat === 'intelligence') state.player.intelligence = Math.min(100, Math.max(0, state.player.intelligence + value));
                            else if (stat === 'wisdom') state.player.wisdom = Math.min(100, Math.max(0, state.player.wisdom + value));
                            else if (stat === 'stress') state.player.happiness = Math.max(0, state.player.happiness - value);
                        });
                    }

                    // Remove decision
                    state.career.pendingDecisions.splice(decisionIndex, 1);
                }
            }
        }

        // --- LEVEL 1 ACTIONS ---
        if (action === 'TOGGLE_STUDY') {
            state.career.isStudying = !state.career.isStudying;
        }

        if (action === 'SELECT_JOB') {
            const { jobTitle } = payload;
            const salaries: Record<string, number> = {
                'Fast Food': 18000,
                'Warehouse': 24000,
                'Sales': 30000
            };

            state.career.jobTitle = jobTitle;
            state.career.salary = salaries[jobTitle] || 18000;

            state.events.push({
                month: state.month,
                description: "CAREER STARTED",
                impact: `Hired as ${jobTitle} ($${state.career.salary}/yr)`
            });
        }

        if (action === 'START_BUSINESS') {
            if (state.cash >= state.career.savingsGoal) {
                const { businessType } = payload;
                state.level = 'Business';
                state.cash -= 10000; // Capital Injection cost

                state.business.type = businessType || 'Retail';
                if (state.business.type === 'Retail') {
                    state.business.inventory = 2000;
                    state.business.capacity = 2500;
                    state.business.prices = 4;
                } else if (state.business.type === 'Tech') {
                    state.business.inventory = 0;
                    state.business.capacity = 10000;
                    state.business.prices = 29;
                } else if (state.business.type === 'Service') {
                    state.business.inventory = 0;
                    state.business.capacity = 200;
                    state.business.prices = 150;
                }

                state.events.push({
                    month: state.month,
                    description: "BUSINESS LAUNCHED",
                    impact: `You have resigned to start a ${state.business.type} business.`
                });
            }
        }

        // --- LEVEL 2+ ACTIONS ---
        if (action === 'BUY_ASSET') {
            const { assetType, amount } = payload;
            if (state.cash >= amount) {
                state.cash -= amount;
                if (assetType === 'STOCK') state.portfolio.stocksValue += amount;
                if (assetType === 'BOND') state.portfolio.bondsValue += amount;
                if (assetType === 'REAL_ESTATE') state.portfolio.realEstateValue += amount;
            }
        }

        if (action === 'UPDATE_BUSINESS') {
            if (payload.prices) state.business.prices = payload.prices;
            if (payload.staff) state.business.staff = payload.staff;
        }

        // Save back to DB
        const updatedSession = await prisma.gameSession.update({
            where: { userId },
            data: { gameState: state as any }
        });

        res.json(updatedSession.gameState);
    } catch (error) {
        console.error('Error in /api/game/action:', error);
        res.status(500).json({ error: 'Failed to process action', details: error instanceof Error ? error.message : String(error) });
    }
});

const PORT = process.env.PORT || 3000;

// Global error handler middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'production' ? 'Unknown error' : err.message 
    });
});

// Catch 404 and forward to error handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});
