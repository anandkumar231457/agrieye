import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Cpu, Database, SignalHigh, Server, Globe } from 'lucide-react';

const ActivityInfo = ({ timestamp, deviceId }) => {
    const getTimeAgo = (isoString) => {
        if (!isoString) return 'Uplink Pending';
        const then = new Date(isoString);
        return then.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[4rem] shadow-organic border border-gray-100/50 p-20 hover:shadow-organic-heavy transition-all duration-1000 overflow-hidden relative group"
        >
            {/* Background Texture/Decor */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-mint rounded-full -mr-80 -mt-80 blur-[150px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 relative z-10">
                {/* Node Identity */}
                <div className="flex flex-col gap-10 group/item">
                    <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-[2.5rem] flex items-center justify-center border border-gray-100/50 shadow-sm group-hover/item:text-brand-deep group-hover/item:bg-brand-mint transition-all duration-700">
                        <Cpu className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Server size={14} className="text-brand-deep opacity-40" />
                            <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] leading-none mb-1">Commercial Node</p>
                        </div>
                        <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none font-mono uppercase">{deviceId || 'NONE'}</p>
                    </div>
                </div>

                {/* Last Sync */}
                <div className="flex flex-col gap-10 group/item">
                    <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-[2.5rem] flex items-center justify-center border border-gray-100/50 shadow-sm group-hover/item:text-brand-deep group-hover/item:bg-brand-mint transition-all duration-700">
                        <Clock className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Globe size={14} className="text-brand-deep opacity-40" />
                            <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] leading-none mb-1">Global Cloud Sync</p>
                        </div>
                        <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{getTimeAgo(timestamp)}</p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col gap-10 group/item">
                    <motion.div
                        animate={{ backgroundColor: ['rgba(240, 253, 244, 0.5)', 'rgba(240, 253, 244, 1)', 'rgba(240, 253, 244, 0.5)'] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="w-20 h-20 text-brand-deep rounded-[2.5rem] flex items-center justify-center border border-brand-deep/20 shadow-organic-heavy shadow-brand-deep/10"
                    >
                        <SignalHigh className="w-10 h-10" />
                    </motion.div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-brand-deep rounded-full shadow-[0_0_10px_rgba(22,163,74,0.6)] pulse-green" />
                            <p className="text-[10px] font-black uppercase text-brand-deep tracking-[0.4em] leading-none mb-1">Protocol Integrity</p>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase italic">Secure</p>
                            <span className="text-[10px] font-black text-brand-sage uppercase tracking-widest mb-1 opacity-60">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20 pt-12 border-t border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-10 opacity-40 relative z-10">
                <div className="flex items-center gap-6 text-[10px] font-black tracking-[0.5em] text-gray-400 group-hover:text-brand-deep transition-colors">
                    <Database size={18} />
                    AES-256 ENCRYPTED FIELD CHANNEL v2.5
                </div>
                <div className="text-[10px] font-black font-mono tracking-[0.3em] bg-gray-50 border border-gray-100 px-8 py-4 rounded-3xl group-hover:bg-brand-mint group-hover:text-brand-deep transition-all">
                    SYSTEM_STABLE_UPLINK_PRO
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityInfo;
