import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className, height }) => {
    return (
        <div
            className={`relative overflow-hidden bg-brand-mint/50 rounded-2xl ${className}`}
            style={{ height: height }}
        >
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
            />
        </div>
    );
};

export default Skeleton;
