import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Droplets, Clock, Leaf, Shield, CheckCircle2, Zap, Target, DollarSign, Scale, ArrowRight, Activity } from 'lucide-react';
import HeroCard from './HeroCard';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

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
                <Icon className={`w-5 h-5 ${config.color}`} />
            </div>

            <h4 className={`font-black text-lg mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {config.title}
            </h4>
            <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed">
                {config.desc}
            </p>

            {metrics && (
                <div className="mt-auto space-y-2 w-full pt-3 border-t border-black/5">
                    <MetricBar
                        label="Effectiveness"
                        value={metrics.effectiveness}
                        colorClass={metrics.effectiveness > 0.7 ? "bg-green-500" : "bg-blue-500"}
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
    const { t } = useTranslation();
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
            // Prepare payload (Simulated object creation for non-optimized view)
            // Prepare payload
            const treatments = [];
            // Add Medicines
            if (medicines) {
                medicines.forEach((m, idx) => {
                    treatments.push({
                        id: `CHEM_${idx}`,
                        name: m.name,
                        type: 'chemical',
                        effectiveness: 0.9 - (idx * 0.1),
                        cost: 0.5 + (idx * 0.1),
                        side_effects: 0.3 + (idx * 0.1)
                    });
                });
            }

            // Add Natural
            if (naturalTreatments) {
                naturalTreatments.forEach((n, idx) => {
                    treatments.push({
                        id: `NAT_${idx}`,
                        name: n,
                        type: 'natural',
                        effectiveness: 0.6,
                        cost: 0.2,
                        side_effects: 0.0,
                        prevention_value: 0.5
                    });
                });
            }

            // Add Prevention
            if (preventiveMeasures) {
                preventiveMeasures.forEach((p, idx) => {
                    treatments.push({
                        id: `PREV_${idx}`,
                        name: p,
                        type: 'prevention',
                        effectiveness: 0.4,
                        cost: 0.1,
                        side_effects: 0.0,
                        prevention_value: 0.8
                    });
                });
            }

            // Map Severity
            let sevValue = 0.5;
            if (severity?.toUpperCase() === 'HIGH') sevValue = 0.8;
            if (severity?.toUpperCase() === 'LOW') sevValue = 0.2;

            const response = await api.post('/optimize', { treatments, severity: sevValue });
            const result = response.data;
            if (result.error) throw new Error(result.error);

            // UX Delay
            setTimeout(() => {
                setOptimizedPlan(result);
                setOptimizing(false);
            }, 800);

        } catch (err) {
            console.error("Optimization Error:", err);
            setError(err.message);
            setOptimizing(false);
        }
    };

    if (isHealthy) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 shadow-sm border border-green-100 text-center max-w-4xl mx-auto"
            >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">All Clear!</h3>
                <p className="text-gray-500 text-lg">Your crop looks healthy. Keep up the good work!</p>
            </motion.div>
        );
    }

    const getCurrentStrategyData = () => {
        if (!optimizedPlan || !optimizedPlan.strategies) return null;
        return optimizedPlan.strategies[selectedStrategy];
    };

    const getDisplayedItems = (type) => {
        const strategyData = getCurrentStrategyData();
        if (!strategyData) {
            if (type === 'chemical') return medicines || [];
            if (type === 'natural') return naturalTreatments || [];
            if (type === 'prevention') return preventiveMeasures || [];
            return [];
        }
        return strategyData.details.filter(t => t.type === type);
    };

    const STRATEGY_CONFIG = {
        balanced: {
            title: t('analysis.strategy_balanced'), // 'Balanced'
            icon: Scale,
            color: 'text-blue-600',
            bg: 'bg-blue-50/50',
            border: 'border-blue-200',
            desc: t('analysis.desc_balanced') // 'Optimal balance of cost & efficacy.'
        },
        high_effectiveness: {
            title: t('analysis.strategy_high_effective'), // 'High Effective'
            icon: Zap,
            color: 'text-purple-600',
            bg: 'bg-purple-50/50',
            border: 'border-purple-200',
            desc: t('analysis.desc_high') // 'Maximum strength for control.'
        },
        low_cost: {
            title: t('analysis.strategy_low_cost'), // 'Budget Friendly'
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-50/50',
            border: 'border-green-200',
            desc: t('analysis.desc_low') // 'Cost-effective solutions.'
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Header Section (Using HeroCard to match left side) */}
            <HeroCard
                title={t('analysis.info_title')} // Correct title
                subtitle={`Comprehensive plan for ${disease}`}
                className="relative"
            >
                {/* Severity Badge integrated like HeroCard expects maybe? 
                  HeroCard puts children below title. 
                  We can also use the 'badge' prop for severity if mapped correctly.
                */}
                <div className="absolute top-8 right-8">
                    {severity && (
                        <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                            <span className="text-sm font-bold uppercase tracking-wider">{t('analysis.severity')}: {severity}</span>
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

            {/* AI Optimization Trigger - Only show if disease is identified */}
            {!isUnknown && (
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
            )}

            {/* Loading State */}
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
            {!isUnknown && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedStrategy}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white rounded-2xl p-8 shadow-md space-y-10"
                    >
                        {/* Medicines Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Pill className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{t('analysis.medicines')}</h3>
                            </div>

                            <div className="space-y-4">
                                {getDisplayedItems('chemical').length > 0 ? (
                                    getDisplayedItems('chemical').map((item, idx) => (
                                        <div key={idx} className="group relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h4>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    )}
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                    <Zap className="w-3 h-3" />
                                                    {t('analysis.recommended')}
                                                </div>
                                            </div>

                                            {/* Dosage & Frequency Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('analysis.dosage')}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">{item.dosage || t('analysis.as_recommended')}</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('analysis.frequency')}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">{item.frequency || t('analysis.as_needed')}</p>
                                                </div>
                                            </div>

                                            {/* Hover Effect Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-pink-500/0 group-hover:from-red-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500 italic font-medium">No chemical treatments recommended for this strategy.</p>
                                        <p className="text-xs text-gray-400 mt-1">Try selecting a different optimization strategy above.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* Natural Treatments Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Leaf className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{t('analysis.organic')}</h3>
                            </div>
                            <div className="space-y-3">
                                {getDisplayedItems('natural').length > 0 ? (
                                    getDisplayedItems('natural').map((item, idx) => (
                                        <div key={idx} className="group relative flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/30 border border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-300">
                                            <div className="mt-0.5 bg-green-500 text-white rounded-full p-2 flex-shrink-0 shadow-sm">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 leading-relaxed flex-1">
                                                {typeof item === 'string' ? item : item.name}
                                            </span>
                                            {/* Hover Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500 italic font-medium">No natural treatments recommended for this strategy.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* Prevention Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{t('analysis.prevention')}</h3>
                            </div>
                            <div className="space-y-3">
                                {getDisplayedItems('prevention').length > 0 ? (
                                    getDisplayedItems('prevention').map((item, idx) => (
                                        <div key={idx} className="group relative flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                            <div className="mt-0.5 bg-blue-500 text-white rounded-full p-2 flex-shrink-0 shadow-sm">
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 leading-relaxed flex-1">
                                                {typeof item === 'string' ? item : item.name}
                                            </span>
                                            {/* Hover Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500 italic font-medium">No prevention measures recommended for this strategy.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full bg-brand-main hover:bg-brand-deep text-white font-bold py-4 rounded-xl shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2"
                                onClick={() => {
                                    const planData = {
                                        disease,
                                        severity_level: severity,
                                        medicines: getDisplayedItems('chemical'),
                                        natural_treatments: getDisplayedItems('natural').map(t => typeof t === 'string' ? t : t.name),
                                        preventive_measures: getDisplayedItems('prevention').map(t => typeof t === 'string' ? t : t.name)
                                    };
                                    console.log('Navigating to schedule with data:', planData);
                                    navigate('/schedule', { state: planData });
                                }}
                            >
                                {t('common.save')}
                            </motion.button>
                        </div>

                    </motion.div>
                </AnimatePresence>
            )}

        </div>
    );
}
