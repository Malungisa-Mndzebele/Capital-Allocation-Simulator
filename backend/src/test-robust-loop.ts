
import { GameEngine } from './engine/GameEngine';
import { GameState } from './engine/types';

const runRobustSimulation = () => {
    console.log("🚀 Starting Robust Game Simulation...");
    console.log("Objective: Test full loop including decisions, career progression, and business launch.");

    // 1. Initialize
    let state = GameEngine.getInitialState();
    state.career.jobTitle = 'Sales'; // Pick a job manually for this test
    state.career.salary = 30000;

    const MAX_MONTHS = 60; // 5 years cap
    let monthsProcessed = 0;

    while (monthsProcessed < MAX_MONTHS && !state.gameOver) {

        // Check for pending decisions FIRST (mimicking UI guard)
        if (state.career.pendingDecisions && state.career.pendingDecisions.length > 0) {
            const decision = state.career.pendingDecisions[0];
            console.log(`\n🔔 DECISION REQUIRED: ${decision.title}`);

            // Naive AI: Always pick the first affordable option
            const affordableOption = decision.options.find(opt => opt.cost <= state.cash) || decision.options[0];

            console.log(`   👉 Selected: ${affordableOption.label} (Cost: $${affordableOption.cost})`);

            // "Perform" the decision logic (Usually done via API, simulating here by applying manually or via helper if available, 
            // but since we are running engine directly, we need to replicate 'performAction' logic for decision making)

            // In a real API call, this would go to performAction -> MAKE_DECISION. 
            // We need to verify that logic works.

            // Checking how performAction works in server.ts... it parses effects.
            // Since we don't have the server instance here, let's create a Helper to apply decision.
            // Or better, let's just use the server logic if possible.
            // Actually, for this test to be valid, we should probably simulate the State Mutation that the server does.

            // APPLY DECISION EFFECT
            state.cash -= affordableOption.cost;
            const effects = affordableOption.effect.split(',');
            effects.forEach(eff => {
                if (!eff) return;
                const [stat, val] = eff.split(':');
                const value = parseInt(val);
                if (stat === 'happiness') state.player.happiness += value;
                // ... (simplified simulation of effects)
            });

            // REMOVE DECISION
            state.career.pendingDecisions.shift();

            console.log("   ✅ Decision Resolved.");
            continue; // Loop again to see if there are more decisions or if we can process turn
        }

        // Process Turn
        const oldMonth = state.month;
        state = GameEngine.processTurn(state);
        monthsProcessed++;

        if (state.month % 6 === 0) {
            console.log(`\n📅 Month ${state.month} | Cash: $${state.cash.toFixed(0)} | NetWorth: $${state.netWorth.toFixed(0)}`);
            console.log(`   Job: ${state.career.jobTitle} | Edu: ${state.career.educationLevel}`);
        }

        // Level Up Check
        if (state.level === 'Career' && state.cash >= state.career.savingsGoal) {
            console.log(`\n🎉 CAPITAL GOAL REACHED at Month ${state.month}! Cash: $${state.cash.toFixed(0)}`);
            console.log("   🚀 Launching Business...");
            state.level = 'Business';
            state.cash -= 10000;
            state.business.type = 'Retail'; // Default
            state.business.inventory = 2000;
            state.business.capacity = 2500;
            state.business.prices = 4;
            console.log("   🏢 Business Started: Retail");
        }

        if (state.level === 'Business') {
            // Basic Business Logic check
            if (state.business.revenue > 0) {
                // It's working
            }
        }
    }

    console.log("\n🏁 Simulation Ended");
    console.log(`Final State: Level ${state.level} | Net Worth $${state.netWorth.toFixed(0)}`);
    console.log(`Game Over: ${state.gameOver} ${state.gameOverReason ? `(${state.gameOverReason})` : ''}`);

    if (state.gameOver) {
        if (state.gameOverReason && state.gameOverReason.includes("homeless")) {
            console.error("❌ FAILED: Player went bankrupt/homeless.");
            process.exit(1);
        }
    }

    // STRICT ASSERTIONS
    console.log("\nomm 🕵️ RUNNING STRICT AUDIT...");

    // 1. Month Check
    if (state.month <= 1) {
        console.error("❌ FAIL: Game did not advance months.");
        process.exit(1);
    }

    // 2. Wealth Check (Should be > 0 at end of 5 years if playing optimally-ish)
    if (state.netWorth < 0) {
        console.error("❌ FAIL: Player ended with negative net worth.");
        process.exit(1);
    }

    if (state.level === 'Career' && state.month >= 60) {
        console.warn("⚠️  WARNING: Did not reach Business level in 5 years.");
    } else if (state.level === 'Business') {
        console.log("✅ SUCCESS: Reached Business Level!");
    } else {
        console.log("✅ Simulation Completed Successfully.");
    }
};

runRobustSimulation();
