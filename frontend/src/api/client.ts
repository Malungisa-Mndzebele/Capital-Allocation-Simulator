import axios from 'axios';
import type { GameState } from '../types';

const API_URL = import.meta.env.PROD
    ? 'https://capital-allocation-backend.onrender.com/api'
    : 'http://localhost:3000/api';

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

export const performAction = async (userId: string, action: any): Promise<GameState> => {
    // Wrapper to handle generic actions.
    // Construct payload based on action type if needed, or pass through.
    // For the server implementation I made:
    // { userId, action: 'ACTION_NAME', payload: { ... } }

    // So we adapt the frontend call signature to match:
    const actionName = action.type;
    const payload = { ...action };
    delete payload.type; // Remove type from payload as it goes to actionName

    const res = await axios.post(`${API_URL}/game/action`, {
        userId,
        action: actionName,
        payload: payload
    });
    return res.data;
};

// Backwards compatibility if needed, or just standard export
export const api = {
    start,
    getState: getGameState,
    nextTurn,
    performAction
};
