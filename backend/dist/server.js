"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const GameEngine_1 = require("./engine/GameEngine");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// In-Memory Store (Prototype only)
const sessions = {};
app.post('/api/game/start', (req, res) => {
    const userId = req.body.userId || 'default';
    const initialState = GameEngine_1.GameEngine.getInitialState();
    sessions[userId] = initialState;
    res.json(initialState);
});
app.get('/api/game/state/:userId', (req, res) => {
    const userId = req.params.userId;
    const state = sessions[userId];
    if (!state) {
        // middleware handles 404 or just start new one
        const newState = GameEngine_1.GameEngine.getInitialState();
        sessions[userId] = newState;
        return res.json(newState);
    }
    res.json(state);
});
app.post('/api/game/turn', (req, res) => {
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
    const newState = GameEngine_1.GameEngine.processTurn(currentState);
    sessions[userId] = newState;
    res.json(newState);
});
// Admin/Debug endpoint to inject state changes (e.g. buying stocks)
app.post('/api/game/action', (req, res) => {
    const { userId, action, payload } = req.body;
    const state = sessions[userId];
    if (!state)
        return res.status(404).json({ error: "No game" });
    if (action === 'BUY_ASSET') {
        const { type, amount } = payload;
        if (state.cash >= amount) {
            state.cash -= amount;
            if (type === 'STOCK')
                state.portfolio.stocksValue += amount;
            if (type === 'BOND')
                state.portfolio.bondsValue += amount;
            if (type === 'REAL_ESTATE')
                state.portfolio.realEstateValue += amount;
        }
    }
    // Simple business updates
    if (action === 'UPDATE_BUSINESS') {
        if (payload.prices)
            state.business.prices = payload.prices;
        if (payload.staff)
            state.business.staff = payload.staff; // Logic for hiring cost needed?
    }
    sessions[userId] = state;
    res.json(state);
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
