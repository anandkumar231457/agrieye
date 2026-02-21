import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const AnimatedCounter = ({ value, suffix = '', decimals = 0 }) => {
    const count = useSpring(0, {
        stiffness: 50,
        damping: 15,
        restDelta: 0.001
    });

    const rounded = useTransform(count, (latest) =>
        Number(latest).toFixed(decimals)
    );

    useEffect(() => {
        count.set(value);
    }, [value, count]);

    return (
        <>
            <motion.span>{rounded}</motion.span>
            <span>{suffix}</span>
        </>
    );
};

export default AnimatedCounter;
