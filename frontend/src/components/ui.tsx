import React from 'react';

export const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export const formatCompact = (val: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 1,
        notation: 'compact', compactDisplay: 'short'
    }).format(val);

export const Section = ({ icon, title, right, children }: {
    icon?: React.ReactNode; title: string; right?: React.ReactNode; children: React.ReactNode;
}) => (
    <section className="panel-raised p-5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-300">
                {icon}{title}
            </h2>
            {right}
        </div>
        {children}
    </section>
);

export const Stat = ({ label, value, tone = 'default', sub }: {
    label: string; value: React.ReactNode; tone?: 'default' | 'good' | 'bad' | 'accent'; sub?: React.ReactNode;
}) => {
    const toneClass = {
        default: 'text-white',
        good: 'text-emerald-400',
        bad: 'text-red-400',
        accent: 'text-blue-300',
    }[tone];
    return (
        <div className="bg-black/20 border border-white/5 rounded-xl p-3">
            <div className="label mb-1">{label}</div>
            <div className={`money text-xl ${toneClass}`}>{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
        </div>
    );
};

export const Bar = ({ value, max = 100, color = 'bg-blue-500' }: { value: number; max?: number; color?: string }) => (
    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
        />
    </div>
);

export const Modal = ({ onClose, children, wide = false }: {
    onClose?: () => void; children: React.ReactNode; wide?: boolean;
}) => (
    <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
    >
        <div
            className={`bg-[#12141f] border border-white/10 rounded-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto`}
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);

export interface ToastMessage {
    id: number;
    text: string;
    kind: 'error' | 'info';
}

export const ToastStack = ({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) => (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
            <button
                key={t.id}
                onClick={() => onDismiss(t.id)}
                className={`toast-in text-left px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl ${t.kind === 'error'
                    ? 'bg-red-950/90 border-red-500/40 text-red-200'
                    : 'bg-slate-900/90 border-white/10 text-slate-200'}`}
            >
                {t.text}
            </button>
        ))}
    </div>
);
