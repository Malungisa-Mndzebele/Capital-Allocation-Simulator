// Frontend-only game client.
// Formerly an HTTP client for the Express backend; now delegates to the local
// game service (engine + localStorage). Signatures are kept async so callers
// are unchanged.

import type { GameState } from '../types';
import * as localGame from '../game/localGame';

export const start = async (userId: string): Promise<GameState> => {
    return localGame.startGame(userId);
};

export const getGameState = async (userId: string): Promise<GameState> => {
    return localGame.getState(userId);
};

export const nextTurn = async (userId: string): Promise<GameState> => {
    return localGame.processTurn(userId);
};

export const performAction = async (
    userId: string,
    action: string,
    payload?: Record<string, unknown>
): Promise<GameState> => {
    return localGame.performAction(userId, action, payload ?? {});
};

export const sellAsset = async (
    userId: string,
    assetType: 'STOCK' | 'BOND' | 'REAL_ESTATE',
    amount: number
): Promise<GameState> => {
    return localGame.performAction(userId, 'SELL_ASSET', { assetType, amount });
};

export const resetGame = async (
    userId: string,
    difficulty: 'Easy' | 'Normal' | 'Hard'
): Promise<GameState> => {
    return localGame.performAction(userId, 'RESET', { difficulty });
};

export const api = {
    start,
    getState: getGameState,
    nextTurn,
    performAction,
    sellAsset
};
