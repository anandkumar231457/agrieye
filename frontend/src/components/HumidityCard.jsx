import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Leaf, Activity } from 'lucide-react';
import NodeTrendChart from './NodeTrendChart';

const HumidityCard = ({ humidity, temperature }) => {
    // Mock minor trend for pro feel
    const miniTrend = [
        { time: '1', val: 24 }, { time: '2', val: 25 }, { time: '3', val: 24 },
        { time: '4', val: 26 }, { time: '5', val: 24 }, { time: '6', val: 25 }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3.5rem] shadow-organic border border-gray-100/50 p-16 h-full flex flex-col justify-between group hover:shadow-organic-heavy transition-all duration-700"
        >
            <div className="flex items-center justify-between mb-10 opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-brand-deep" />
                    <span className="text-[10px] uppercase font-black tracking-[0.5em] text-brand-leaf">Telemetry Stream</span>
                </div>
                <Activity className="w-4 h-4 text-brand-deep animate-pulse" />
            </div>

            <div className="space-y-12">
                <div className="flex items-center gap-10">
                    <div className="p-6 bg-gray-50 text-gray-300 rounded-[2rem] group-hover:bg-brand-mint group-hover:text-brand-deep transition-all duration-700 shadow-sm border border-gray-100/50">
                        <Thermometer size={40} />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] opacity-60">Field Temp</p>
                                <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{temperature || '---'}<span className="text-xl ml-1 opacity-20">°C</span></p>
                            </div>
                            <div className="w-24 h-10 opacity-20 group-hover:opacity-100 transition-opacity">
                                <NodeTrendChart data={miniTrend} color="#16a34a" height={40} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="p-6 bg-gray-50 text-gray-300 rounded-[2rem] group-hover:bg-brand-mint group-hover:text-brand-deep transition-all duration-700 shadow-sm border border-gray-100/50">
                        <Droplets size={40} />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] opacity-60">Humid Control</p>
                                <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{humidity || '---'}<span className="text-xl ml-1 opacity-20">%</span></p>
                            </div>
                            <div className="w-24 h-10 opacity-20 group-hover:opacity-100 transition-opacity">
                                <NodeTrendChart data={miniTrend} color="#166534" height={40} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-50">
                <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.5em] italic text-center">Node Link Verified v2.5</p>
            </div>
        </motion.div>
    );
};

export default HumidityCard;
