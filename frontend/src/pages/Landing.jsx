import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Leaf, ArrowRight, ShieldCheck, Activity, Zap } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const Landing = () => {
    // 1. Mouse Parallax (Inertial sub-10px)
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const handleMouseMove = ({ clientX, clientY }) => {
        const { innerWidth, innerHeight } = window;
        mouseX.set(clientX / innerWidth);
        mouseY.set(clientY / innerHeight);
    };

    // Smooth inertial springs
    const xSmooth = useSpring(mouseX, { stiffness: 40, damping: 25 });
    const ySmooth = useSpring(mouseY, { stiffness: 40, damping: 25 });

    // Precise Offsets: BG (±4px), Text (±1.5px) - Text moves less for depth
    const bgParallaxX = useTransform(xSmooth, [0, 1], ["-4px", "4px"]);
    const bgParallaxY = useTransform(ySmooth, [0, 1], ["-4px", "4px"]);
    const textParallaxX = useTransform(xSmooth, [0, 1], ["-1.5px", "1.5px"]);
    const textParallaxY = useTransform(ySmooth, [0, 1], ["-1.5px", "1.5px"]);

    // 2. Animation Timing Sequence
    const [isHeroFinished, setIsHeroFinished] = useState(false);
    const [showCTAs, setShowCTAs] = useState(false);
    const [show3DBackground, setShow3DBackground] = useState(false);

    // Premium Easing
    const premiumEase = [0.22, 1, 0.36, 1];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.5,
                onComplete: () => {
                    setTimeout(() => setIsHeroFinished(true), 1200);
                    setTimeout(() => setShowCTAs(true), 400);
                    // Activate 3D background 1.5s after hero text finishes
                    setTimeout(() => setShow3DBackground(true), 1500);
                }
            }
        }
    };

    const charVariants = {
        hidden: {
            opacity: 0,
            y: 15,
            filter: "blur(12px)"
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.9,
                ease: premiumEase
            }
        }
    };

    // Helper to split text for character-level reveal with word protection
    const splitCharacters = (text) => {
        return text.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.2em]">
                {word.split("").map((char, charIndex) => (
                    <motion.span
                        key={charIndex}
                        variants={charVariants}
                        className="inline-block"
                    >
                        {char}
                    </motion.span>
                ))}
            </span>
        ));
    };

    return (
        <div
            className="min-h-screen relative font-inter selection:bg-brand-leaf/20"
            style={{ background: 'linear-gradient(180deg, #FAFFFE 0%, #F0FDF4 100%)' }}
            onMouseMove={handleMouseMove}
        >
            {/* NAVIGATION - Outside hero section */}
            <nav className="relative z-50 px-6 py-6 md:px-12">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.2, ease: premiumEase }}
                        className="flex items-center gap-2"
                    >
                        <div className="p-1.5 bg-white shadow-sm rounded-xl border border-brand-leaf/10">
                            <Leaf className="w-5 h-5 text-brand-main" />
                        </div>
                        <span className="text-xl font-bold text-brand-deep tracking-tight">AgriEye</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.8, ease: premiumEase }}
                    >
                        <Link to="/dashboard" className="px-6 py-2 rounded-full border border-brand-leaf/15 text-brand-deep font-semibold text-sm hover:bg-brand-mint/50 hover:shadow-sm transition-all duration-300">
                            Sign In
                        </Link>
                    </motion.div>
                </div>
            </nav>

            {/* HERO SECTION - With particle background */}
            <main className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-6 overflow-hidden">
                {/* CUSTOM PARTICLE BACKGROUND - Only in hero */}
                <ParticleBackground />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ x: textParallaxX, y: textParallaxY }}
                    className="relative z-10 max-w-5xl space-y-12"
                >
                    {/* Badge */}
                    <div className="flex justify-center">
                        <motion.div
                            variants={charVariants}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-brand-leaf/10 backdrop-blur-sm shadow-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-main animate-pulse" />
                            <span className="text-[10px] font-bold text-brand-deep/60 tracking-widest uppercase">Intelligent Biosystem Active</span>
                        </motion.div>
                    </div>

                    {/* Heading (Word-protected Character-by-Character) */}
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-brand-deep leading-[0.9] flex flex-wrap justify-center overflow-visible py-2">
                            {splitCharacters("Precision Agriculture.")}
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <div className="max-w-2xl mx-auto">
                        <motion.p
                            variants={charVariants}
                            className="text-lg md:text-xl text-brand-deep/50 font-medium leading-relaxed"
                        >
                            Protect crop yield with AI vision.
                        </motion.p>
                    </div>

                    {/* Actions (Delayed Fade In) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={showCTAs ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: premiumEase }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
                    >
                        <Link
                            to="/dashboard"
                            className="px-10 py-5 rounded-full bg-brand-gradient text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            Enter Dashboard
                        </Link>

                        <button className="px-10 py-5 rounded-full bg-white text-brand-main font-bold text-lg border-2 border-brand-main shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                            <Zap size={18} className="text-brand-main" />
                            Start Scanning
                        </button>
                    </motion.div>
                </motion.div>
            </main>

            {/* PREVIEW CARDS */}
            <div className="relative z-40 max-w-7xl mx-auto px-6 pb-40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Real-time ID", desc: "Identify 50+ crop diseases in milliseconds.", icon: Zap },
                        { title: "AI Treatment", desc: "Computer-generated organic recovery plans.", icon: ShieldCheck },
                        { title: "Smart Alerts", desc: "Get notified before the outbreak spreads.", icon: Activity }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: i * 0.12 + 1.2, duration: 1, ease: premiumEase }}
                            className="p-10 rounded-4xl bg-white backdrop-blur-xl border border-gray-200 shadow-elevated hover:shadow-floating transition-all duration-500 group"
                        >
                            <div className="w-14 h-14 bg-brand-mint/50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <item.icon className="w-7 h-7 text-brand-main" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-deep mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-brand-deep/50 font-medium leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Landing;
