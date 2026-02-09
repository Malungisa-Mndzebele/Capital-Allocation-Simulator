import React from 'react';
import { Home, Briefcase, Car } from 'lucide-react';

interface VisualProgressionProps {
    netWorth: number;
    lifestyle: string;
    level: string;
}

export const VisualProgression: React.FC<VisualProgressionProps> = ({ netWorth, lifestyle, level }) => {
    // Determine visual tier based on net worth and lifestyle
    const getHomeTier = () => {
        if (lifestyle === 'Parents') return { name: 'Parents House', icon: '🏠', color: 'text-gray-400' };
        if (lifestyle === 'Homeless') return { name: 'Homeless', icon: '⛺', color: 'text-red-400' };
        if (lifestyle === 'Frugal') return { name: 'Studio Apartment', icon: '🏢', color: 'text-blue-400' };
        if (lifestyle === 'Moderate') return { name: 'Nice Apartment', icon: '🏘️', color: 'text-green-400' };
        if (lifestyle === 'Luxury') return { name: 'Penthouse', icon: '🏰', color: 'text-purple-400' };
        return { name: 'Unknown', icon: '❓', color: 'text-gray-400' };
    };
    
    const getOfficeTier = () => {
        if (level === 'Career') {
            if (netWorth < 5000) return { name: 'Cubicle', icon: '🪑', color: 'text-gray-400' };
            if (netWorth < 20000) return { name: 'Office', icon: '🖥️', color: 'text-blue-400' };
            return { name: 'Corner Office', icon: '🏢', color: 'text-green-400' };
        }
        if (level === 'Business') {
            if (netWorth < 50000) return { name: 'Small Shop', icon: '🏪', color: 'text-blue-400' };
            if (netWorth < 200000) return { name: 'Storefront', icon: '🏬', color: 'text-green-400' };
            return { name: 'Corporate HQ', icon: '🏢', color: 'text-purple-400' };
        }
        if (level === 'Investor') {
            if (netWorth < 500000) return { name: 'Home Office', icon: '💼', color: 'text-blue-400' };
            if (netWorth < 2000000) return { name: 'Private Office', icon: '🏛️', color: 'text-green-400' };
            return { name: 'Penthouse Office', icon: '🌆', color: 'text-purple-400' };
        }
        return { name: 'Unknown', icon: '❓', color: 'text-gray-400' };
    };
    
    const getVehicleTier = () => {
        if (netWorth < 1000) return { name: 'Walking', icon: '🚶', color: 'text-gray-400' };
        if (netWorth < 5000) return { name: 'Bus Pass', icon: '🚌', color: 'text-gray-400' };
        if (netWorth < 20000) return { name: 'Used Car', icon: '🚗', color: 'text-blue-400' };
        if (netWorth < 100000) return { name: 'New Car', icon: '🚙', color: 'text-green-400' };
        if (netWorth < 500000) return { name: 'Luxury Car', icon: '🚘', color: 'text-purple-400' };
        return { name: 'Sports Car', icon: '🏎️', color: 'text-yellow-400' };
    };
    
    const home = getHomeTier();
    const office = getOfficeTier();
    const vehicle = getVehicleTier();
    
    return (
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Your Lifestyle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Home size={20} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase">Home</span>
                    </div>
                    <div className={`text-4xl mb-2`}>{home.icon}</div>
                    <div className={`text-sm font-bold ${home.color}`}>{home.name}</div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Briefcase size={20} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase">Workspace</span>
                    </div>
                    <div className={`text-4xl mb-2`}>{office.icon}</div>
                    <div className={`text-sm font-bold ${office.color}`}>{office.name}</div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Car size={20} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase">Transport</span>
                    </div>
                    <div className={`text-4xl mb-2`}>{vehicle.icon}</div>
                    <div className={`text-sm font-bold ${vehicle.color}`}>{vehicle.name}</div>
                </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-400 text-center">
                Your lifestyle improves as your net worth grows
            </div>
        </div>
    );
};
