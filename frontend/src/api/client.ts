import axios from 'axios';
import type { GameState } from '../types';

// Use environment variable for API URL in production
const API_URL = 'http://localhost:3000/api';

export const api = {
    async start(userId: string): Promise<GameState> {
        const res = await axios.post(`${API_URL}/game/start`, { userId });
        return res.data;
    },

    async getState(userId: string): Promise<GameState> {
        const res = await axios.get(`${API_URL}/game/state/${userId}`);
        return res.data;
    },

    async nextTurn(userId: string): Promise<GameState> {
        const res = await axios.post(`${API_URL}/game/turn`, { userId });
        return res.data;
    },

    async buyAsset(userId: string, type: 'STOCK' | 'BOND' | 'REAL_ESTATE', amount: number): Promise<GameState> {
        const res = await axios.post(`${API_URL}/game/action`, {
            userId,
            action: 'BUY_ASSET',
            payload: { type, amount }
        });
        return res.data;
    }
};
