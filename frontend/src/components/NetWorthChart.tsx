import React from 'react';
import type { NetWorthDataPoint } from '../types';

interface NetWorthChartProps {
    netWorthHistory: NetWorthDataPoint[];
    currentNetWorth: number;
    currentMonth: number;
}

export const NetWorthChart: React.FC<NetWorthChartProps> = ({ netWorthHistory, currentNetWorth, currentMonth }) => {
    if (netWorthHistory.length === 0) return null;
    
    const dataPoints = netWorthHistory;
    const maxValue = Math.max(...dataPoints.map(d => d.value), currentNetWorth);
    const minValue = Math.min(...dataPoints.map(d => d.value), 0);
    const range = maxValue - minValue || 1;
    
    const width = 600;
    const height = 200;
    const padding = 40;
    
    const xScale = (month: number) => padding + ((month - 1) / (dataPoints.length - 1 || 1)) * (width - 2 * padding);
    const yScale = (value: number) => height - padding - ((value - minValue) / range) * (height - 2 * padding);
    
    const pathData = dataPoints.map((d, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(d.month)} ${yScale(d.value)}`
    ).join(' ');
    
    return (
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Net Worth Over Time</h3>
            <svg width={width} height={height} className="w-full">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const y = height - padding - pct * (height - 2 * padding);
                    const value = minValue + pct * range;
                    return (
                        <g key={pct}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />
                            <text
                                x={padding - 10}
                                y={y + 4}
                                fill="rgba(255,255,255,0.5)"
                                fontSize="10"
                                textAnchor="end"
                            >
                                ${(value / 1000).toFixed(0)}k
                            </text>
                        </g>
                    );
                })}
                
                {/* Area under curve */}
                <path
                    d={`${pathData} L ${xScale(dataPoints[dataPoints.length - 1].month)} ${height - padding} L ${padding} ${height - padding} Z`}
                    fill="url(#gradient)"
                    opacity="0.3"
                />
                
                {/* Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Axes */}
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                />
                
                {/* Current value indicator */}
                <circle
                    cx={xScale(currentMonth)}
                    cy={yScale(currentNetWorth)}
                    r="5"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                />
            </svg>
            
            <div className="mt-4 flex justify-between text-sm text-gray-400">
                <span>Month 1</span>
                <span className="text-blue-400 font-bold">Current: ${currentNetWorth.toLocaleString()}</span>
                <span>Month {currentMonth}</span>
            </div>
        </div>
    );
};
