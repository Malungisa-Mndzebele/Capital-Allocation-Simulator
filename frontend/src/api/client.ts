import axios from 'axios';
import type { GameState } from '../types';

const API_URL = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD
        ? 'https://capital-allocation-backend.onrender.com/api'
        : 'http://localhost:3000/api');

export const start = async (userId: string): Promise<GameState> => {
    const res = await axios.post(`${API_URL}/game/start`, { userId });
    return res.data;
};

export const getGameState = async (userId: string): Promise<GameState> => {
    const res = await axios.get(`${API_URL}/game/state/${userId}`);
    return res.data;
};

export const nextTurn = async (userId: string): Promise<GameState> => {
    const res = await axios.post(`${API_URL}/game/turn`, { userId });
    return res.data;
};

export const performAction = async (
    userId: string,
    action: string,
    payload?: Record<string, unknown>
): Promise<GameState> => {
    const res = await axios.post(`${API_URL}/game/action`, {
        userId,
        action,
        payload: payload ?? {}
    });
    return res.data;
};

export const sellAsset = async (
    userId: string,
    assetType: 'STOCK' | 'BOND' | 'REAL_ESTATE',
    amount: number
): Promise<GameState> => {
    const res = await axios.post(`${API_URL}/game/action`, {
        userId,
        action: 'SELL_ASSET',
        payload: { assetType, amount }
    });
    return res.data;
};

export const api = {
    start,
    getState: getGameState,
    nextTurn,
    performAction,
    sellAsset
};
