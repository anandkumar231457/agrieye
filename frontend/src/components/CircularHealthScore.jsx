import React from 'react';
import { motion } from 'framer-motion';

const CircularHealthScore = ({ score, label = "Health Score" }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (val) => {
        if (val > 80) return "#1E7F43"; // Success
        if (val > 50) return "#f59e0b"; // Warning
        return "#ef4444"; // Error
    };

    const color = getColor(score);

    return (
        <div className="relative flex flex-col items-center justify-center p-6">
            <svg width="160" height="160" className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-50"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={color}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${color}33)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl font-black text-gray-900 tracking-tighter"
                >
                    {score}%
                </motion.span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                    {label}
                </span>
            </div>
        </div>
    );
};

export default CircularHealthScore;
