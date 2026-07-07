import React from 'react';
import { Calendar, Inbox } from 'lucide-react';
import type { EventLog } from '../types';

/**
 * Persistent activity feed. The engine clears `state.events` every turn, so the
 * App accumulates a history client-side and passes it down here (newest first).
 */
export const EventFeed: React.FC<{ history: EventLog[]; compact?: boolean }> = ({ history, compact = false }) => (
    <div className="panel-raised flex flex-col overflow-hidden h-full">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 shrink-0">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Activity Log</span>
        </div>
        <div className={`flex-1 overflow-y-auto p-3 space-y-2 ${compact ? 'max-h-72' : ''}`}>
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
                    <Inbox size={28} />
                    <span className="text-sm">Nothing has happened yet.</span>
                </div>
            )}
            {history.map((evt, idx) => (
                <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                    <div className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider mb-0.5">
                        Month {evt.month}
                    </div>
                    <div className="text-sm text-slate-200 leading-tight">{evt.description}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{evt.impact}</div>
                </div>
            ))}
        </div>
    </div>
);
