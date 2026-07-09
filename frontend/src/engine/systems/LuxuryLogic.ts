import type { LuxuryState, MarketState } from '../types';
import { LUXURY_CATALOG, LUXURY_SUBSCRIPTIONS } from '../config';

// Monthly value drift for owned toys.
const DEPRECIATION_PER_MONTH = 0.015; // depreciating assets lose 1.5% of current value
const APPRECIATION_BONUS = 0.002; // appreciating assets gain inflation/12 + this

export interface LuxuryMonthResult {
    luxury: LuxuryState;
    monthlyCost: number; // upkeep + subscription fees to deduct this month
    happiness: number; // stat deltas to apply (already summed across subscriptions)
    energy: number;
    strength: number;
}

export class LuxuryLogic {
    // Existing saves predate this feature, so tolerate a missing luxury field.
    static normalize(luxury: LuxuryState | undefined | null): LuxuryState {
        if (!luxury) return { ownedAssets: [], subscriptions: [] };
        return {
            ownedAssets: luxury.ownedAssets ?? [],
            subscriptions: luxury.subscriptions ?? [],
        };
    }

    // Advance owned assets one month (value drift) and total up all recurring
    // costs plus the stat boosts from active subscriptions.
    static processMonth(luxuryIn: LuxuryState | undefined, market: MarketState): LuxuryMonthResult {
        const luxury = this.normalize(luxuryIn);
        let monthlyCost = 0;
        let happiness = 0;
        let energy = 0;
        let strength = 0;

        const ownedAssets = luxury.ownedAssets.map(asset => {
            const def = LUXURY_CATALOG.find(l => l.id === asset.type);
            if (!def) return asset;
            monthlyCost += def.upkeep;

            let currentValue = asset.currentValue;
            if (def.kind === 'appreciating') {
                currentValue = Math.round(currentValue * (1 + market.inflationRate / 12 + APPRECIATION_BONUS));
            } else if (def.kind === 'depreciating') {
                currentValue = Math.round(currentValue * (1 - DEPRECIATION_PER_MONTH));
            }
            return { ...asset, currentValue };
        });

        for (const subId of luxury.subscriptions) {
            const sub = LUXURY_SUBSCRIPTIONS.find(s => s.id === subId);
            if (!sub) continue;
            monthlyCost += sub.monthlyCost;
            happiness += sub.happiness ?? 0;
            energy += sub.energy ?? 0;
            strength += sub.strength ?? 0;
        }

        return { luxury: { ...luxury, ownedAssets }, monthlyCost, happiness, energy, strength };
    }

    // Current resale-agnostic market value of the collection (for net worth).
    static totalValue(luxury: LuxuryState | undefined): number {
        return this.normalize(luxury).ownedAssets.reduce((sum, a) => sum + a.currentValue, 0);
    }

    static totalMonthlyBurn(luxury: LuxuryState | undefined): number {
        const l = this.normalize(luxury);
        const upkeep = l.ownedAssets.reduce((sum, a) => {
            const def = LUXURY_CATALOG.find(d => d.id === a.type);
            return sum + (def?.upkeep ?? 0);
        }, 0);
        const subs = l.subscriptions.reduce((sum, id) => {
            const sub = LUXURY_SUBSCRIPTIONS.find(s => s.id === id);
            return sum + (sub?.monthlyCost ?? 0);
        }, 0);
        return upkeep + subs;
    }
}
