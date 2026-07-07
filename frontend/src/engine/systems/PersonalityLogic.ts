// Personality system - traits develop based on player choices
import type { PlayerStats } from '../types';

export class PersonalityLogic {
    static updatePersonality(player: PlayerStats, action: string, context: Record<string, any>): PlayerStats {
        const updated = { ...player };
        
        // Risk Tolerance
        if (action === 'BUY_ASSET' && context.assetType === 'STOCK') {
            updated.riskTolerance = Math.min(100, updated.riskTolerance + 1);
        }
        if (action === 'BUY_ASSET' && context.assetType === 'BOND') {
            updated.riskTolerance = Math.max(0, updated.riskTolerance - 0.5);
        }
        if (action === 'TAKE_LOAN' && context.loanType === 'business') {
            updated.riskTolerance = Math.min(100, updated.riskTolerance + 2);
        }
        
        // Work Ethic
        if (action === 'TOGGLE_STUDY' && context.isStudying) {
            updated.workEthic = Math.min(100, updated.workEthic + 1);
        }
        if (player.energy < 30) {
            updated.workEthic = Math.min(100, updated.workEthic + 0.5); // Pushing through fatigue
        }
        
        // Social Skills
        if (action === 'MAKE_DECISION' && context.decisionType === 'social') {
            updated.socialSkills = Math.min(100, updated.socialSkills + 1);
        }
        if (context.relationshipStatus !== 'Single') {
            updated.socialSkills = Math.min(100, updated.socialSkills + 0.2);
        }
        
        // Creativity
        if (action === 'START_BUSINESS') {
            updated.creativity = Math.min(100, updated.creativity + 5);
        }
        if (context.businessType === 'Tech') {
            updated.creativity = Math.min(100, updated.creativity + 0.3);
        }
        
        // Discipline
        if (action === 'PAY_LOAN' && context.extraPayment) {
            updated.discipline = Math.min(100, updated.discipline + 2);
        }
        if (player.happiness < 50 && player.energy > 50) {
            updated.discipline = Math.min(100, updated.discipline + 0.5); // Maintaining routine despite unhappiness
        }
        
        return updated;
    }
    
    static getPersonalityBonus(player: PlayerStats, context: string): number {
        switch (context) {
            case 'investment_return':
                // High risk tolerance = better at timing markets
                return (player.riskTolerance - 50) / 500; // -0.1 to +0.1
                
            case 'promotion_chance':
                // High work ethic + social skills = better promotion odds
                return ((player.workEthic + player.socialSkills) / 2 - 50) / 200; // -0.25 to +0.25
                
            case 'business_innovation':
                // High creativity = better business opportunities
                return (player.creativity - 50) / 100; // -0.5 to +0.5
                
            case 'study_speed':
                // High discipline = faster learning
                return (player.discipline - 50) / 250; // -0.2 to +0.2
                
            case 'negotiation':
                // High social skills = better deals
                return (player.socialSkills - 50) / 500; // -0.1 to +0.1
                
            default:
                return 0;
        }
    }
    
    static getPersonalityDescription(player: PlayerStats): string[] {
        const descriptions: string[] = [];
        
        if (player.riskTolerance > 75) descriptions.push('Risk-Taker');
        else if (player.riskTolerance < 25) descriptions.push('Risk-Averse');
        
        if (player.workEthic > 75) descriptions.push('Workaholic');
        else if (player.workEthic < 25) descriptions.push('Laid-Back');
        
        if (player.socialSkills > 75) descriptions.push('Charismatic');
        else if (player.socialSkills < 25) descriptions.push('Introverted');
        
        if (player.creativity > 75) descriptions.push('Innovative');
        else if (player.creativity < 25) descriptions.push('Traditional');
        
        if (player.discipline > 75) descriptions.push('Disciplined');
        else if (player.discipline < 25) descriptions.push('Spontaneous');
        
        return descriptions.length > 0 ? descriptions : ['Balanced'];
    }
}
