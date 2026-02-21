import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Droplets, Clock, Leaf, Shield, CheckCircle2, Zap, Target, DollarSign, Scale, ArrowRight, Activity } from 'lucide-react';
import HeroCard from './HeroCard';

// --- Sub-Components ---

const MetricBar = ({ label, value, colorClass, delay = 0 }) => (
    <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-500">
            <span>{label}</span>
            <span>{Math.round(value * 10)}/10</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 1, delay, ease: "easeOut" }}
                className={`h-full rounded-full ${colorClass}`}
            />
        </div>
    </div>
);

const StrategyCard = ({ id, config, isSelected, onClick, metrics }) => {
    const Icon = config.icon;

    return (
        <motion.button
            layout
            onClick={onClick}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 w-full h-full flex flex-col
                ${isSelected
                    ? `${config.bg} ${config.border} ring-2 ring-offset-2 ring-brand-main shadow-lg`
                    : 'bg-white border-gray-100 hover:border-brand-main/30 hover:shadow-md'
                }`}
        >
            {isSelected && (
                <motion.div
                    layoutId="activeStrategyCheck"
                    className="absolute top-2 right-2 text-brand-main"
                >
                    <CheckCircle2 className="w-5 h-5 fill-white" />
                </motion.div>
            )}

            <div className={`w-10 h-10 rounded-xl ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'} flex items-center justify-center mb-3 transition-colors`}>
                <Icon className={`w-5 h-5 ${isSelected ? config.iconColor : 'text-gray-400'}`} />
            </div>

            <h4 className={`font-bold mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {config.title}
            </h4>
            <p className="text-xs text-gray-500 mb-4 flex-1">{config.description}</p>

            {metrics && (
                <div className="space-y-2 pt-3 border-t border-gray-200">
                    <MetricBar
                        label="Effectiveness"
                        value={metrics.effectiveness}
                        colorClass="bg-green-500"
                        delay={0}
                    />
                    <MetricBar
                        label="Safety"
                        value={metrics.safety}
                        colorClass="bg-blue-500"
                        delay={0.1}
                    />
                    <MetricBar
                        label="Cost Efficiency"
                        value={1 - metrics.cost} // Invert for "Efficiency"
                        colorClass="bg-purple-500"
                        delay={0.2}
                    />
                </div>
            )}
        </motion.button>
    );
};

// --- Main Component ---

export default function TreatmentPlan({ disease, severity, medicines, naturalTreatments, preventiveMeasures }) {
    const navigate = useNavigate();
    const isHealthy = disease === 'Healthy';
    const isUnknown = disease === 'Unknown' || disease === 'unknown' || !disease;

    // Optimization State
    const [optimizing, setOptimizing] = useState(false);
    const [optimizedPlan, setOptimizedPlan] = useState(null);
    const [error, setError] = useState(null);
    const [selectedStrategy, setSelectedStrategy] = useState('balanced'); // 'balanced', 'high_effectiveness', 'low_cost'

    const generateOptimizedTreatments = async () => {
        setOptimizing(true);
        setError(null);
        setOptimizedPlan(null);

        try {
            // Prepare payload
            const payload = {
                disease,
                severity,
                medicines: medicines || [],
                natural_treatments: naturalTreatments || [],
                preventive_measures: preventiveMeasures || []
            };

            console.log('[Frontend] Sending optimization request:', payload);

            const response = await fetch('/api/optimize-treatments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Optimization failed');
            }

            const data = await response.json();
            console.log('[Frontend] Received optimization result:', data);

            setOptimizedPlan(data);
        } catch (err) {
            console.error('[Frontend] Optimization error:', err);
            setError(err.message);
        } finally {
            setOptimizing(false);
        }
    };

    const STRATEGY_CONFIG = {
        balanced: {
            title: 'Balanced',
            description: 'Optimal trade-off between all factors',
            icon: Scale,
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            iconColor: 'text-purple-600'
        },
        high_effectiveness: {
            title: 'High Effectiveness',
            description: 'Maximum disease control priority',
            icon: Target,
            bg: 'bg-green-50',
            border: 'border-green-200',
            iconColor: 'text-green-600'
        },
        low_cost: {
            title: 'Low Cost',
            description: 'Budget-friendly approach',
            icon: DollarSign,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            iconColor: 'text-blue-600'
        }
    };

    const getDisplayedItems = (type) => {
        if (!optimizedPlan) {
            // Show original items if no optimization
            if (type === 'chemical') return medicines || [];
            if (type === 'natural') return naturalTreatments || [];
            if (type === 'prevention') return preventiveMeasures || [];
            return [];
        }

        // Show optimized items for selected strategy
        const strategy = optimizedPlan.strategies[selectedStrategy];
        if (!strategy) return [];

        if (type === 'chemical') return strategy.selected_treatments.chemical || [];
        if (type === 'natural') return strategy.selected_treatments.natural || [];
        if (type === 'prevention') return strategy.selected_treatments.prevention || [];
        return [];
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Card */}
            <HeroCard
                title="Treatment Plan"
                subtitle={`Comprehensive plan for ${disease}`}
                className="relative"
            >
                <div className="absolute top-8 right-8">
                    {severity && (
                        <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                            <span className="text-sm font-bold uppercase tracking-wider">Severity: {severity}</span>
                        </div>
                    )}
                </div>
            </HeroCard>

            {/* Show message if disease is Unknown */}
            {isUnknown && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Identify Disease</h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                The AI could not confidently identify a disease from the uploaded image.
                                Please ensure the image is clear, well-lit, and shows visible symptoms.
                                Try uploading a different image or consult an agricultural expert.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 px-6 py-3 bg-brand-main text-white rounded-xl font-semibold hover:bg-brand-main/90 transition-colors"
                        >
                            Upload New Image
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Only show treatments if disease is identified */}
            {!isUnknown && !isHealthy && (
                <>
                    {/* AI Optimization Trigger */}
                    <AnimatePresence>
                        {!optimizedPlan && !optimizing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group"
                            >
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Want a smarter plan?</h3>
                                        <p className="text-gray-400">AI can analyze chemical prices, environmental impact, and effectiveness to build the perfect strategy.</p>
                                    </div>
                                    <button
                                        onClick={generateOptimizedTreatments}
                                        className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Zap className="w-5 h-5 fill-brand-main text-brand-main" />
                                        Generate Optimized Strategies
                                    </button>
                                </div>
                                {/* Decorative BG */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-main/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-main/30 transition-colors" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Optimizing Spinner */}
                    {optimizing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-12 flex flex-col items-center justify-center space-y-4"
                        >
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-main rounded-full animate-spin" />
                            <p className="text-gray-400 font-medium animate-pulse">Running Fuzzy Logic Multi-Objective Optimization...</p>
                        </motion.div>
                    )}

                    {/* Strategy Cards */}
                    {optimizedPlan && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.keys(STRATEGY_CONFIG).map((strat) => (
                                <StrategyCard
                                    key={strat}
                                    id={strat}
                                    config={STRATEGY_CONFIG[strat]}
                                    isSelected={selectedStrategy === strat}
                                    onClick={() => setSelectedStrategy(strat)}
                                    metrics={optimizedPlan.strategies[strat].metrics}
                                />
                            ))}
                        </div>
                    )}

                    {/* Main Content Area (Unified White Card) */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedStrategy}
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-8 shadow-md space-y-10"
                        >
                            {/* Rest of treatment sections... */}
                        </motion.div>
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}
