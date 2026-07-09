import { describe, it, expect } from 'vitest';
import { LuxuryLogic } from './LuxuryLogic';
import type { LuxuryState, MarketState } from '../types';

const market: MarketState = {
    cycleStage: 'Recovery',
    interestRate: 0.03,
    stockMarketIndex: 1000,
    inflationRate: 0.024,
};

const asset = (type: string, currentValue: number, purchasePrice = currentValue) => ({
    id: `lux_${type}_1`,
    type,
    name: type,
    purchasePrice,
    currentValue,
    purchaseMonth: 1,
});

describe('LuxuryLogic', () => {
    describe('normalize', () => {
        it('returns empty structure for undefined/null', () => {
            expect(LuxuryLogic.normalize(undefined)).toEqual({ ownedAssets: [], subscriptions: [] });
            expect(LuxuryLogic.normalize(null)).toEqual({ ownedAssets: [], subscriptions: [] });
        });

        it('fills missing fields on a partial object', () => {
            const partial = {} as LuxuryState;
            expect(LuxuryLogic.normalize(partial)).toEqual({ ownedAssets: [], subscriptions: [] });
        });
    });

    describe('processMonth', () => {
        it('depreciates a depreciating asset and charges upkeep', () => {
            const state: LuxuryState = { ownedAssets: [asset('jet', 20_000_000)], subscriptions: [] };
            const r = LuxuryLogic.processMonth(state, market);
            // Private jet: 1.5% depreciation, $150k upkeep
            expect(r.luxury.ownedAssets[0].currentValue).toBe(Math.round(20_000_000 * 0.985));
            expect(r.monthlyCost).toBe(150_000);
        });

        it('appreciates real estate', () => {
            const state: LuxuryState = { ownedAssets: [asset('island', 75_000_000)], subscriptions: [] };
            const r = LuxuryLogic.processMonth(state, market);
            expect(r.luxury.ownedAssets[0].currentValue).toBeGreaterThan(75_000_000);
            expect(r.monthlyCost).toBe(100_000); // island upkeep
        });

        it('sums subscription costs and stat effects', () => {
            const state: LuxuryState = { ownedAssets: [], subscriptions: ['chef', 'trainer'] };
            const r = LuxuryLogic.processMonth(state, market);
            // chef $8k (+2 happy, +1 energy), trainer $4k (+2 str, +1 energy)
            expect(r.monthlyCost).toBe(12_000);
            expect(r.happiness).toBe(2);
            expect(r.energy).toBe(2);
            expect(r.strength).toBe(2);
        });

        it('ignores unknown asset/subscription ids gracefully', () => {
            const state: LuxuryState = { ownedAssets: [asset('bogus', 999)], subscriptions: ['nope'] };
            const r = LuxuryLogic.processMonth(state, market);
            expect(r.monthlyCost).toBe(0);
            expect(r.luxury.ownedAssets[0].currentValue).toBe(999); // unchanged
        });

        it('does not mutate the input state', () => {
            const state: LuxuryState = { ownedAssets: [asset('yacht', 5_000_000)], subscriptions: [] };
            const before = state.ownedAssets[0].currentValue;
            LuxuryLogic.processMonth(state, market);
            expect(state.ownedAssets[0].currentValue).toBe(before);
        });
    });

    describe('totalValue', () => {
        it('sums current values', () => {
            const state: LuxuryState = { ownedAssets: [asset('watch', 40_000), asset('yacht', 4_000_000)], subscriptions: [] };
            expect(LuxuryLogic.totalValue(state)).toBe(4_040_000);
        });
        it('is zero for empty/undefined', () => {
            expect(LuxuryLogic.totalValue(undefined)).toBe(0);
        });
    });

    describe('totalMonthlyBurn', () => {
        it('adds upkeep and subscription fees', () => {
            const state: LuxuryState = { ownedAssets: [asset('sports_car', 250_000)], subscriptions: ['travel'] };
            // car upkeep $1,500 + first-class travel $25,000
            expect(LuxuryLogic.totalMonthlyBurn(state)).toBe(26_500);
        });
    });
});
