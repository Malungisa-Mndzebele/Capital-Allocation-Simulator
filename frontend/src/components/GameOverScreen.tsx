import React, { useState } from 'react';
import { Skull, Trophy, RotateCcw } from 'lucide-react';
import type { GameState } from '../types';
import { formatCurrency, Stat } from './ui';
import { NewGameModal } from './NewGameModal';
import { NetWorthChart } from './NetWorthChart';

interface GameOverScreenProps {
    gameState: GameState;
    onNewGame: (difficulty: 'Easy' | 'Normal' | 'Hard') => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, onNewGame }) => {
    const [showNewGame, setShowNewGame] = useState(false);

    const reason = gameState.gameOverReason || 'Your journey has ended.';
    // Reaching retirement age or completing a scenario is a victory, not a defeat.
    const isVictory = reason.includes('Retirement at age 65') || reason.startsWith('Victory');
    const unlockedAchievements = gameState.achievements.filter(a => a.unlocked);
    const retirementBalance = gameState.retirement.accounts.reduce((s, a) => s + a.balance, 0);
    const yearsPlayed = Math.floor((gameState.month - 1) / 12);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="max-w-3xl w-full space-y-6 animate-in zoom-in-95 fade-in duration-700">
                <div className="text-center">
                    {isVictory
                        ? <Trophy size={80} className="text-amber-400 mx-auto mb-4" />
                        : <Skull size={80} className="text-red-500 mx-auto mb-4" />}
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
                        {isVictory ? 'RUN COMPLETE' : 'GAME OVER'}
                    </h1>
                    <p className={`text-lg font-mono ${isVictory ? 'text-amber-300' : 'text-red-400'}`}>{reason}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Final Net Worth" value={formatCurrency(gameState.netWorth)} tone={gameState.netWorth >= 0 ? 'good' : 'bad'} />
                    <Stat label="Final Age" value={gameState.player.age} sub={`${yearsPlayed} year${yearsPlayed === 1 ? '' : 's'} played`} />
                    <Stat label="Retirement Savings" value={formatCurrency(retirementBalance)} tone="accent" />
                    <Stat label="Achievements" value={`${unlockedAchievements.length} / ${gameState.achievements.length || 19}`} />
                </div>

                {gameState.netWorthHistory.length > 2 && (
                    <div className="panel-raised p-4">
                        <NetWorthChart
                            netWorthHistory={gameState.netWorthHistory}
                            currentNetWorth={gameState.netWorth}
                            currentMonth={gameState.month}
                        />
                    </div>
                )}

                {unlockedAchievements.length > 0 && (
                    <div className="panel p-4">
                        <div className="label mb-3">Achievements earned</div>
                        <div className="flex flex-wrap gap-2">
                            {unlockedAchievements.map(a => (
                                <span key={a.id} className="chip bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                    🏆 {a.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={() => setShowNewGame(true)} className="btn-primary w-full py-4 text-lg">
                    <RotateCcw size={20} /> START A NEW RUN
                </button>
            </div>

            {showNewGame && (
                <NewGameModal
                    onStart={onNewGame}
                    onClose={() => setShowNewGame(false)}
                />
            )}
        </div>
    );
};
