import React from 'react';
import { BookOpen, TrendingUp } from 'lucide-react';

interface ScenarioProgressProps {
    scenarioId: string;
    gameState: any;
}

const SCENARIO_INFO: Record<string, { name: string; goal: string; targetNetWorth?: number; targetAge?: number }> = {
    student_debt_crisis: { name: 'Student Debt Crisis', goal: 'Pay off loans + $100k', targetNetWorth: 100000 },
    single_parent: { name: 'Single Parent Struggle', goal: '$50k net worth', targetNetWorth: 50000 },
    business_bankruptcy: { name: 'Business Bankruptcy', goal: '$200k before age 50', targetNetWorth: 200000, targetAge: 50 },
    golden_handcuffs: { name: 'Golden Handcuffs', goal: 'Debt-free + $250k', targetNetWorth: 250000 },
    late_bloomer: { name: 'Late Bloomer', goal: '$500k before 65', targetNetWorth: 500000, targetAge: 65 },
    inheritance_windfall: { name: 'Inheritance Windfall', goal: '$1M before age 40', targetNetWorth: 1000000, targetAge: 40 },
    market_crash_survivor: { name: 'Market Crash Survivor', goal: '$500k before 65', targetNetWorth: 500000, targetAge: 65 },
    immigrant_dream: { name: 'Immigrant Dream', goal: '$1M net worth', targetNetWorth: 1000000 }
};

export const ScenarioProgress: React.FC<ScenarioProgressProps> = ({ scenarioId, gameState }) => {
    const scenario = SCENARIO_INFO[scenarioId];
    if (!scenario) return null;
    
    const netWorthProgress = scenario.targetNetWorth 
        ? (gameState.netWorth / scenario.targetNetWorth * 100).toFixed(1)
        : 0;
    
    const ageProgress = scenario.targetAge
        ? `Age ${gameState.player.age} / ${scenario.targetAge}`
        : null;
    
    const debtFree = gameState.loans.length === 0;
    const needsDebtFree = scenarioId === 'student_debt_crisis' || scenarioId === 'golden_handcuffs';
    
    const isComplete = 
        (!scenario.targetNetWorth || gameState.netWorth >= scenario.targetNetWorth) &&
        (!scenario.targetAge || gameState.player.age <= scenario.targetAge) &&
        (!needsDebtFree || debtFree);
    
    const isFailed = scenario.targetAge && gameState.player.age > scenario.targetAge;
    
    return (
        <div className={`border rounded-lg p-4 ${
            isComplete ? 'bg-green-500/10 border-green-500/30' :
            isFailed ? 'bg-red-500/10 border-red-500/30' :
            'bg-purple-500/10 border-purple-500/30'
        }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BookOpen size={20} className={isComplete ? 'text-green-400' : 'text-purple-400'} />
                    <span className="font-bold text-white">{scenario.name}</span>
                </div>
                {isComplete && (
                    <span className="text-green-400 font-bold text-sm">✓ Complete!</span>
                )}
                {isFailed && (
                    <span className="text-red-400 font-bold text-sm">✗ Failed</span>
                )}
            </div>
            
            <div className="space-y-3">
                {scenario.targetNetWorth && (
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Net Worth Goal</span>
                            <span className={gameState.netWorth >= scenario.targetNetWorth ? 'text-green-400 font-bold' : 'text-white'}>
                                ${gameState.netWorth.toLocaleString()} / ${scenario.targetNetWorth.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    gameState.netWorth >= scenario.targetNetWorth ? 'bg-green-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${Math.min(Number(netWorthProgress), 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">{netWorthProgress}%</div>
                    </div>
                )}
                
                {ageProgress && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Age Limit</span>
                        <span className={isFailed ? 'text-red-400' : 'text-white'}>{ageProgress}</span>
                    </div>
                )}
                
                {needsDebtFree && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Debt Status</span>
                        <span className={debtFree ? 'text-green-400' : 'text-yellow-400'}>
                            {debtFree ? '✓ Debt Free' : `$${gameState.loans.reduce((sum: number, l: any) => sum + l.balance, 0).toLocaleString()} remaining`}
                        </span>
                    </div>
                )}
            </div>
            
            {isComplete && (
                <div className="mt-3 pt-3 border-t border-green-500/30 text-center">
                    <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
                        <TrendingUp size={16} /> Scenario Complete! Well done!
                    </span>
                </div>
            )}
        </div>
    );
};
