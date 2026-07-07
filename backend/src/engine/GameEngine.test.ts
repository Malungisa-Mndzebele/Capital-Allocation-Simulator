import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEngine } from './GameEngine';
import { ScenarioMode, SCENARIOS } from './systems/ScenarioMode';
import { SkillTreeLogic } from './systems/SkillTreeLogic';
import { LoanLogic } from './systems/LoanLogic';
import { GameState } from './types';

// Math.random is mocked to a fixed value so processTurn is deterministic
// (no random promotions, life events, or business events fire at 0.99).
describe('GameEngine bug fixes', () => {
    beforeEach(() => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Workaholic skill reduces energy drain', () => {
        const make = (skills: string[]): GameState => {
            const s = GameEngine.getInitialState('Normal');
            s.career.jobTitle = 'Warehouse';
            s.career.educationLevel = 'Master'; // avoids random promotion path
            s.player.energy = 50; // below cap so the drain difference is observable
            s.player.happiness = 50; // neutral productivity multiplier
            s.skills.unlockedSkills = skills;
            return s;
        };

        const base = GameEngine.processTurn(make([]));
        const workaholic = GameEngine.processTurn(make(['negotiator', 'workaholic']));

        expect(workaholic.player.energy).toBeGreaterThan(base.player.energy);
    });

    it("taxable income uses this month's pre-tax contribution, not YTD/12", () => {
        const s = GameEngine.getInitialState('Normal');
        s.career.jobTitle = 'Director of Operations'; // excluded from random promotion
        s.career.educationLevel = 'Master';
        s.career.salary = 120000; // $10,000 / mo gross
        s.player.happiness = 50; // productivity multiplier = 1.0
        s.lifestyle.tier = 'Frugal';
        Object.assign(s.lifestyle, { rent: 800, food: 300, transport: 100, entertainment: 0 });
        s.retirement.accounts.push({
            id: 'ira1', type: 'traditional_ira', balance: 0, contributionRate: 20,
            employerMatch: 0, employerMatchLimit: 0,
            vestingSchedule: { totalYears: 0, vestedPercentage: 100 },
            annualContributions: 0, accountAge: 0, unvestedBalance: 0, isActive: true,
        });

        const before = s.cash;
        const next = GameEngine.processTurn(s);
        const contribution = next.retirement.accounts[0].balance; // ~$2,000

        const gross = 10000;
        const expenses = 1200;
        const taxFixed = (gross - contribution) * 0.20;      // full monthly pre-tax deducted
        const taxBuggy = (gross - contribution / 12) * 0.20; // old YTD/12 behaviour
        const netFixed = gross - taxFixed - expenses - contribution;
        const netBuggy = gross - taxBuggy - expenses - contribution;
        const delta = next.cash - before;

        expect(contribution).toBeCloseTo(2000, 0);
        expect(delta).toBeCloseTo(netFixed, 0);
        expect(Math.abs(delta - netBuggy)).toBeGreaterThan(50); // demonstrably different from the bug
    });

    it('retires at age 65 even in Business level', () => {
        let s = GameEngine.getInitialState('Normal');
        s.level = 'Business';
        s.business.type = 'Service';
        s.cash = 100000; // avoid hitting bankruptcy before 65
        s.player.age = 64;
        s.month = (64 - 17) * 12 + 1;

        for (let i = 0; i < 24 && !s.gameOver; i++) {
            s = GameEngine.processTurn(s);
        }

        expect(s.gameOver).toBe(true);
        expect(s.gameOverReason).toMatch(/Retirement at age 65/);
    });

    it('wires the Workaholic and Entrepreneur skill bonuses', () => {
        expect(SkillTreeLogic.getSkillBonus({ unlockedSkills: ['negotiator', 'workaholic'], skillPoints: 0 }, 'energy_drain'))
            .toBeCloseTo(-0.5, 9);
        expect(SkillTreeLogic.getSkillBonus({ unlockedSkills: ['entrepreneur'], skillPoints: 0 }, 'business_startup'))
            .toBeCloseTo(-0.2, 9);
    });
});

describe('Scenario mode', () => {
    beforeEach(() => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('applies every scenario into a valid, crash-free state with the correct age', () => {
        for (const scenario of SCENARIOS) {
            let state = ScenarioMode.applyScenario(scenario, GameEngine.getInitialState('Normal'));
            state.activeScenario = scenario.id;

            const derivedAge = 17 + Math.floor((state.month - 1) / 12);
            expect(derivedAge).toBe(scenario.startingConditions.age);
            expect(state.loans.length).toBe(scenario.startingConditions.loans.length);

            // Three turns should not throw.
            expect(() => {
                for (let i = 0; i < 3; i++) state = GameEngine.processTurn(state);
            }).not.toThrow();
        }
    });

    it('reports completion and age-deadline failure', () => {
        const lateBloomer = SCENARIOS.find(s => s.id === 'late_bloomer')!;
        const studentDebt = SCENARIOS.find(s => s.id === 'student_debt_crisis')!;

        expect(ScenarioMode.checkScenarioCompletion(lateBloomer, {
            netWorth: 600000, loans: [], player: { age: 60 },
        } as unknown as GameState)).toEqual({ completed: true });

        expect(ScenarioMode.checkScenarioCompletion(lateBloomer, {
            netWorth: 100000, loans: [], player: { age: 66 },
        } as unknown as GameState).reason).toMatch(/did not reach the goal by age 65/);

        // Goal net worth met but debt remains -> not complete (requireDebtFree).
        expect(ScenarioMode.checkScenarioCompletion(studentDebt, {
            netWorth: 150000, loans: [{ balance: 1 }], player: { age: 30 },
        } as unknown as GameState).completed).toBe(false);
    });
});

describe('LoanLogic', () => {
    it('does not overcharge on the final payment', () => {
        const loan = {
            id: 'l1', type: 'student' as const, principal: 50, balance: 50,
            interestRate: 0.045, monthlyPayment: 500, remainingMonths: 1, originationMonth: 1,
        };
        const interest = 50 * (0.045 / 12);
        const { totalPayment, updatedLoans, paidOffLoans } = LoanLogic.processMonthlyPayments([loan]);

        // Only balance + that month's interest is charged, not the full $500 schedule.
        expect(totalPayment).toBeCloseTo(50 + interest, 6);
        expect(paidOffLoans).toContain('l1');
        expect(updatedLoans.length).toBe(0); // loan fully paid and removed
    });
});
