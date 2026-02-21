import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Activity } from 'lucide-react';

const ConfidenceBar = ({ confidence }) => {
    const percentage = (confidence || 0) * 100;

    const getStatus = () => {
        if (percentage >= 90) return { text: 'HIGH PRECISION', color: 'text-brand-deep' };
        if (percentage >= 70) return { text: 'STABLE MATCH', color: 'text-brand-deep opacity-40' };
        return { text: 'LOW CONFIDENCE', color: 'text-gray-300' };
    };

    const status = getStatus();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3.5rem] shadow-organic border border-gray-100/50 p-16 flex flex-col justify-between h-full group hover:shadow-organic-heavy transition-all duration-700"
        >
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 text-gray-200 rounded-[1.5rem] flex items-center justify-center group-hover:bg-brand-mint group-hover:text-brand-deep transition-all duration-700">
                        <Target className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">AI Accuracy</h4>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Detection Protocol v4.8</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-black tracking-[0.3em] ${status.color} mt-2`}>
                    <Activity className="w-4 h-4" />
                    {status.text}
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-end justify-between px-2">
                    <div className="flex items-end gap-3 text-brand-leaf">
                        <span className="text-6xl font-black tracking-tighter leading-none">{percentage.toFixed(1)}</span>
                        <span className="text-2xl font-black mb-1 opacity-20 text-gray-900">%</span>
                    </div>
                    <span className="text-[10px] uppercase font-black text-gray-300 tracking-[0.4em] mb-2 opacity-50">Model Correlation</span>
                </div>

                <div className="h-5 w-full bg-gray-50 rounded-full p-1.5 overflow-hidden shadow-inner border border-gray-100">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-brand-deep rounded-full shadow-[0_4px_15px_rgba(22,163,74,0.4)] relative"
                    >
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full opacity-30"
                        />
                    </motion.div>
                </div>

                <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] px-2 opacity-30">
                    <span>Base scan</span>
                    <span>Peak sync</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ConfidenceBar;
