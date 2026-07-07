import React from 'react';
import { Sprout, Scale, Flame } from 'lucide-react';
import { Modal } from './ui';

interface NewGameModalProps {
    onStart: (difficulty: 'Easy' | 'Normal' | 'Hard') => void;
    onClose: () => void;
    title?: string;
}

const DIFFICULTIES = [
    {
        id: 'Easy' as const, icon: Sprout, color: 'emerald',
        cash: '$2,000', goal: '$7,500', blurb: 'A head start and a +20% productivity bonus.',
    },
    {
        id: 'Normal' as const, icon: Scale, color: 'blue',
        cash: '$500', goal: '$10,000', blurb: 'The intended experience. Balanced odds.',
    },
    {
        id: 'Hard' as const, icon: Flame, color: 'red',
        cash: '$100', goal: '$15,000', blurb: 'Broke, hungry, and -20% productivity.',
    },
];

const colorClasses: Record<string, { border: string; text: string }> = {
    emerald: { border: 'hover:border-emerald-500/60', text: 'text-emerald-400' },
    blue: { border: 'hover:border-blue-500/60', text: 'text-blue-400' },
    red: { border: 'hover:border-red-500/60', text: 'text-red-400' },
};

export const NewGameModal: React.FC<NewGameModalProps> = ({ onStart, onClose, title = 'Start a New Run' }) => (
    <Modal onClose={onClose} wide>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-slate-400 mb-6 text-sm">
            You begin at 17, living with your parents. Retire at 65 — how much can you build in 48 years?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {DIFFICULTIES.map(d => {
                const c = colorClasses[d.color];
                return (
                    <button
                        key={d.id}
                        onClick={() => onStart(d.id)}
                        className={`text-left p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all ${c.border}`}
                    >
                        <d.icon size={24} className={`${c.text} mb-3`} />
                        <div className="font-bold text-lg text-white mb-1">{d.id}</div>
                        <div className="text-xs text-slate-400 leading-relaxed mb-3">{d.blurb}</div>
                        <div className="text-xs font-mono space-y-1">
                            <div className="flex justify-between"><span className="text-slate-500">Starting cash</span><span className="text-white">{d.cash}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Business goal</span><span className="text-white">{d.goal}</span></div>
                        </div>
                    </button>
                );
            })}
        </div>

        <button onClick={onClose} className="w-full py-2.5 text-slate-500 hover:text-white font-medium transition-colors text-sm">
            Keep current game
        </button>
    </Modal>
);
