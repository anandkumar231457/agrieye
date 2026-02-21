import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLatestData, getWeather } from '../services/api';
import { Thermometer, Droplets, Activity } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import Skeleton from '../components/Skeleton';
import TreatmentPlan from '../components/TreatmentPlan';
import DiseaseStatusCard from '../components/DiseaseStatusCard';
import FarmerQA from '../components/FarmerQA';
import { useAuth } from '../context/AuthContext';

const FieldNode = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch crop data
                const cropData = await getLatestData();
                setData(cropData);

                // Fetch weather if location exists
                if (user?.location) {
                    const weatherData = await getWeather(user.location);
                    setWeather(weatherData);
                }
            } catch (err) {
                console.error("Error fetching monitoring data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user?.location]);

    const premiumEase = [0.22, 1, 0.36, 1];

    if (loading) return <Skeleton />;

    const formatValue = (val) => (val === null || val === undefined) ? '--' : val;

    return (
        <div className="space-y-10 pb-20">
            <Breadcrumbs />

            {/* Header Section (Left Aligned with Status Pill) */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: premiumEase }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6"
            >
                <div>
                    <h1 className="text-4xl font-medium text-brand-deep tracking-tight mb-2">
                        Field Node: {data?.crop || 'General'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Real-time Environmental & Risk Telemetry
                    </p>
                </div>
                <div className="bg-brand-main text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-main/20">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Online • Stable
                </div>
            </motion.div>

            {/* Wide Metric Cards Row */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                {/* Temperature */}
                <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative bg-gradient-to-br from-orange-50 via-white to-red-50/30 p-6 rounded-3xl shadow-md hover:shadow-xl border border-orange-100 hover:border-orange-200 transition-all duration-300 flex items-center gap-6 overflow-hidden"
                >
                    {/* Icon */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                        <Thermometer className="w-8 h-8" />
                    </div>
                    {/* Content */}
                    <div className="relative z-10 flex-1">
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Temperature</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {formatValue(weather?.temperature)}°C
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Field ambient</p>
                    </div>
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-300 pointer-events-none"></div>
                </motion.div>

                {/* Humidity */}
                <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative bg-gradient-to-br from-blue-50 via-white to-cyan-50/30 p-6 rounded-3xl shadow-md hover:shadow-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 flex items-center gap-6 overflow-hidden"
                >
                    {/* Icon */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Droplets className="w-8 h-8" />
                    </div>
                    {/* Content */}
                    <div className="relative z-10 flex-1">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Humidity</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {formatValue(weather?.humidity)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Moisture level</p>
                    </div>
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
                </motion.div>

                {/* Confidence */}
                <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative bg-gradient-to-br from-purple-50 via-white to-pink-50/30 p-6 rounded-3xl shadow-md hover:shadow-xl border border-purple-100 hover:border-purple-200 transition-all duration-300 flex items-center gap-6 overflow-hidden"
                >
                    {/* Icon */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                        <Activity className="w-8 h-8" />
                    </div>
                    {/* Content */}
                    <div className="relative z-10 flex-1">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">AI Confidence</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {data?.confidence ? Math.round(data.confidence * 100) + '%' : '--%'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Detection accuracy</p>
                    </div>
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                </motion.div>
            </motion.div>

            {/* Main Content Stack (Vertical) */}
            <div className="flex flex-col gap-8 pt-4">

                {/* Left Column: Disease Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                >
                    <DiseaseStatusCard
                        disease={data?.disease || data?.disease_name}
                        confidence={data?.confidence}
                        category={data?.crop || 'Analysis'}
                        severity={data?.severity || data?.severity_level}
                        recommendedActions={data?.recommended_actions}
                        symptoms={data?.symptoms}
                    />
                    <div className="mt-4 text-center">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            Source: {data?.analyzed_by || 'Unknown'}
                        </span>
                    </div>
                </motion.div>

                {/* Right Column: Treatment Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: premiumEase, delay: 0.2 }}
                    className="space-y-6"
                >
                    <TreatmentPlan
                        disease={data?.disease || data?.disease_name}
                        severity={data?.severity_level || data?.severity}
                        medicines={data?.medicines}
                        naturalTreatments={data?.natural_treatments}
                        preventiveMeasures={data?.preventive_measures}
                        fullData={data}
                    />
                </motion.div>
            </div>

            {/* Floating Chatbot */}
            <FarmerQA contextData={data} />
        </div>
    );
}

export default FieldNode;
