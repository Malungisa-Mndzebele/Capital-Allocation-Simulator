import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import type { Achievement } from '../types';
import { ACHIEVEMENTS } from '../engine/achievements';
import { Section } from './ui';

/**
 * Full achievement board. `gameState.achievements` is only populated after the
 * first processed month, so merge with the engine's definition list to always
 * show the complete board.
 */
export const AchievementsPanel: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
    const board = ACHIEVEMENTS.map(def => {
        const earned = achievements.find(a => a.id === def.id);
        return {
            id: def.id,
            title: def.title,
            description: def.description,
            unlocked: earned?.unlocked ?? false,
            unlockedAt: earned?.unlockedAt,
        };
    });
    const unlockedCount = board.filter(a => a.unlocked).length;

    return (
        <Section
            icon={<Trophy size={16} className="text-amber-400" />}
            title="Achievements"
            right={<span className="chip bg-amber-500/10 border border-amber-500/30 text-amber-300">{unlockedCount} / {board.length}</span>}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {board.map(a => (
                    <div
                        key={a.id}
                        className={`rounded-xl border p-3 transition-colors ${a.unlocked
                            ? 'bg-amber-500/[0.07] border-amber-500/30'
                            : 'bg-white/[0.02] border-white/5 opacity-60'}`}
                    >
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <span className={`font-bold text-sm ${a.unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                                {a.title}
                            </span>
                            {a.unlocked
                                ? <Trophy size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                : <Lock size={14} className="text-slate-600 shrink-0 mt-0.5" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{a.description}</p>
                        {a.unlocked && a.unlockedAt !== undefined && (
                            <p className="text-[10px] text-slate-500 font-mono mt-1.5">Unlocked month {a.unlockedAt}</p>
                        )}
                    </div>
                ))}
            </div>
        </Section>
    );
};
