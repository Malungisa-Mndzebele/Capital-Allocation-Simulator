import { CareerState } from '../types';

export class CareerLogic {
    static processMonth(state: CareerState): CareerState {
        const newState = { ...state };

        // 1. Study Progress
        if (newState.isStudying) {
            newState.studyProgress += 1;

            // Promotion Checks
            if (newState.educationLevel === 'High School' && newState.studyProgress >= 12) {
                newState.educationLevel = 'Associate';
                newState.jobTitle = 'Shift Manager';
                newState.salary = 35000;
                newState.studyProgress = 0;
            } else if (newState.educationLevel === 'Associate' && newState.studyProgress >= 24) {
                newState.educationLevel = 'Bachelor';
                newState.jobTitle = 'Regional Manager';
                newState.salary = 55000;
                newState.studyProgress = 0;
            } else if (newState.educationLevel === 'Bachelor' && newState.studyProgress >= 36) { // Master's
                newState.educationLevel = 'Master';
                newState.jobTitle = 'Director of Operations';
                newState.salary = 95000;
                newState.isStudying = false; // Cap
            }
        }

        // Generate Random Decisions (Life/Social)
        newState.pendingDecisions = [];

        // 30% chance of a random event per month
        if (Math.random() > 0.3) {
            const scenarios = [
                {
                    title: "Friday Night Out",
                    description: "Friends are going to a club.",
                    options: [
                        { id: "go", label: "Go Out ($100)", cost: 100, effect: "happiness:+10,energy:-10" },
                        { id: "stay", label: "Stay Home", cost: 0, effect: "energy:+5,happiness:-2" }
                    ]
                },
                {
                    title: "Extra Shift",
                    description: "Boss offers overtime this weekend.",
                    options: [
                        { id: "work", label: "Take Shift (+$200)", cost: -200, effect: "energy:-20,stress:+10" },
                        { id: "relax", label: "Decline", cost: 0, effect: "happiness:+5" }
                    ]
                },
                {
                    title: "Gym Membership",
                    description: "Sign up for specific training?",
                    options: [
                        { id: "join", label: "Join ($50)", cost: 50, effect: "strength:+2,health:+2" },
                        { id: "skip", label: "Skip", cost: 0, effect: "health:-1" }
                    ]
                },
                {
                    title: "Charity Drive",
                    description: "Local shelter asking for donations.",
                    options: [
                        { id: "donate", label: "Donate ($50)", cost: 50, effect: "happiness:+10,wisdom:+2" },
                        { id: "volunteer", label: "Volunteer", cost: 0, effect: "energy:-15,happiness:+15" },
                        { id: "ignore", label: "Ignore", cost: 0, effect: "happiness:-2" }
                    ]
                },
                {
                    title: "Relationship",
                    description: "You met someone interesting at a coffee shop.",
                    options: [
                        { id: "date", label: "Ask for Date ($50)", cost: 50, effect: "relationship:Dating,happiness:+20" },
                        { id: "pass", label: "Not Ready", cost: 0, effect: "" }
                    ]
                },
                {
                    title: "Family Planning",
                    description: "Partner suggests trying for a baby.",
                    options: [
                        { id: "try", label: "Agree", cost: 0, effect: "pregnancy:start" },
                        { id: "wait", label: "Wait", cost: 0, effect: "happiness:-5" }
                    ]
                },
                {
                    title: "Direct Help",
                    description: "Homeless person asks for food.",
                    options: [
                        { id: "buy_food", label: "Buy Meal ($15)", cost: 15, effect: "happiness:+5,wisdom:+1" },
                        { id: "ignore", label: "Walk Away", cost: 0, effect: "happiness:-1" }
                    ]
                },
                {
                    title: "Online Course",
                    description: "Flash sale on a coding bootcamp module.",
                    options: [
                        { id: "buy", label: "Buy ($150)", cost: 150, effect: "intelligence:+3" },
                        { id: "ignore", label: "Ignore", cost: 0, effect: "" }
                    ]
                },
                {
                    title: "Side Hustle Opportunity",
                    description: "Neighbor needs help moving furniture.",
                    options: [
                        { id: "help", label: "Help Out (+$50)", cost: -50, effect: "energy:-15,strength:+2" },
                        { id: "ignore", label: "Pass", cost: 0, effect: "" }
                    ]
                }
            ];
            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

            newState.pendingDecisions.push({
                id: `life_${Date.now()}`,
                title: scenario.title,
                description: scenario.description,
                options: scenario.options,
                resolved: false
            });
        }

        return newState;
    }

    static getMonthlyNetIncome(state: CareerState): number {
        const monthlySalary = state.salary / 12;
        const taxRate = 0.20; // Simplified flat tax
        const netSalary = monthlySalary * (1 - taxRate);
        const tuition = state.isStudying ? state.tuitionCost : 0;

        // Income = Net Salary - Living Expenses - Tuition
        return netSalary - state.expensesLiving - tuition;
    }
}
