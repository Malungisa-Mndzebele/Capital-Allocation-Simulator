import express, { Request, Response } from 'express';
import cors from 'cors';
import { GameEngine } from './engine/GameEngine';
import { GameState } from './engine/types';

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Store (Prototype only)
const sessions: Record<string, GameState> = {};

app.post('/api/game/start', (req: Request, res: Response) => {
    const userId = req.body.userId || 'default';
    const initialState = GameEngine.getInitialState();
    sessions[userId] = initialState;
    res.json(initialState);
});

app.get('/api/game/state/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const state = sessions[userId];
    if (!state) {
        // middleware handles 404 or just start new one
        const newState = GameEngine.getInitialState();
        sessions[userId] = newState;
        return res.json(newState);
    }
    res.json(state);
});

app.post('/api/game/turn', (req: Request, res: Response) => {
    const userId = req.body.userId;
    const currentState = sessions[userId];

    if (!currentState) {
        res.status(404).json({ error: "Game not found" });
        return;
    }

    // Apply User Inputs (Mocked for now, just taking direct state overrides if any)
    // In real app, we'd accept "actions" (e.g., { action: "BUY_STOCK", amount: 5000 })
    // For now, let's assume the client sends the *desired* changes to business settings/investments *before* the turn?
    // Actually, typically the turn processes the *current* state.
    // Let's accept 'actions' in the body later. For now, simulate turn.

    // Process Turn
    const newState = GameEngine.processTurn(currentState);
    sessions[userId] = newState;

    res.json(newState);
});

// Admin/Debug endpoint to inject state changes (e.g. buying stocks)
app.post('/api/game/action', (req: Request, res: Response) => {
    const { userId, action, payload } = req.body;
    const state = sessions[userId];
    if (!state) return res.status(404).json({ error: "No game" });

    if (action === 'BUY_ASSET') {
        const { type, amount } = payload;
        if (state.cash >= amount) {
            state.cash -= amount;
            if (type === 'STOCK') state.portfolio.stocksValue += amount;
            if (type === 'BOND') state.portfolio.bondsValue += amount;
            if (type === 'REAL_ESTATE') state.portfolio.realEstateValue += amount;
        }
    }
    // Simple business updates
    if (action === 'UPDATE_BUSINESS') {
        if (payload.prices) state.business.prices = payload.prices;
        if (payload.staff) state.business.staff = payload.staff; // Logic for hiring cost needed?
    }

    sessions[userId] = state;
    res.json(state);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
