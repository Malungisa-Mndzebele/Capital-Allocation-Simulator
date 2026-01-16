"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLogic = void 0;
class BusinessLogic {
    static processMonth(state, market) {
        const newState = { ...state };
        const { type } = newState;
        // 1. Demand & Price Factor (Elasticity varies by type)
        let demandFactor = 1.0;
        if (market.cycleStage === 'Recession')
            demandFactor = type === 'Retail' ? 0.7 : 0.8; // Tech/Service slightly more resilient?
        if (market.cycleStage === 'Peak')
            demandFactor = 1.2;
        let basePrice = 10; // Retail baseline
        if (type === 'Tech')
            basePrice = 30; // SaaS baseline
        if (type === 'Service')
            basePrice = 150; // Hourly rate baseline
        const priceFactor = basePrice / newState.prices;
        const effectiveDemand = newState.demand * demandFactor * priceFactor;
        // 2. Sales Volume (capped by capacity)
        const salesVolume = Math.min(effectiveDemand, newState.capacity);
        // 3. Revenue
        newState.revenue = salesVolume * newState.prices;
        // 4. Expenses
        const marketingCost = 500;
        let laborCost = newState.staff * 3000;
        let materialCost = 0;
        if (type === 'Retail') {
            materialCost = salesVolume * 0.5; // COGS
        }
        else if (type === 'Tech') {
            materialCost = salesVolume * 0.05; // Server/Hosting costs (minimal)
            laborCost = newState.staff * 4000; // Engineers are expensive
        }
        else if (type === 'Service') {
            materialCost = 0; // Pure knowledge work
            laborCost = newState.staff * 5000; // Senior Consultants
        }
        newState.expensesTotal = laborCost + materialCost + marketingCost + 1000; // +Rent/Overhead
        // 5. Growth
        if (newState.revenue > newState.expensesTotal) {
            let growthRate = 1.02;
            if (type === 'Tech')
                growthRate = 1.05; // Tech grows faster
            newState.demand *= growthRate;
        }
        // 6. Generate Decisions (Limit to 2 per month as requested)
        // Clear previous decisions for now (or keep unresolved ones? let's clear for simplicity in this iteration)
        newState.pendingDecisions = [];
        // Example Decision 1: Marketing
        newState.pendingDecisions.push({
            id: `dec_${Date.now()}_1`,
            title: "Marketing Strategy",
            description: "How should we promote the business this month?",
            resolved: false,
            options: [
                { id: "opt1", label: "Aggressive ($2000)", cost: 2000, effect: "demand:+15%" },
                { id: "opt2", label: "Standard ($500)", cost: 500, effect: "demand:+5%" },
                { id: "opt3", label: "Word of Mouth ($0)", cost: 0, effect: "demand:+1%" }
            ]
        });
        // Example Decision 2: Operations
        newState.pendingDecisions.push({
            id: `dec_${Date.now()}_2`,
            title: "Operational Efficiency",
            description: "Staff are requesting better tools.",
            resolved: false,
            options: [
                { id: "optA", label: "Upgrade Tools ($1000)", cost: 1000, effect: "capacity:+10%" },
                { id: "optB", label: "Ignore", cost: 0, effect: "capacity:0%" }
            ]
        });
        return newState;
    }
}
exports.BusinessLogic = BusinessLogic;
