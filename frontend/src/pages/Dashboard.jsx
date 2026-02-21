import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLatestData } from '../services/api';
import { analyzeImage } from '../services/api'; // Ensure named import
import { useTranslation } from 'react-i18next';
import UploadSection from '../components/UploadSection';
import DiseaseDiagnosisCard from '../components/DiseaseStatusCard';
import TreatmentPlan from '../components/TreatmentPlan';
import FarmerQA from '../components/FarmerQA';
import Skeleton from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';

const Dashboard = () => {
    // Core data state
    const { i18n } = useTranslation();
    const [data, setData] = useState(null); // Will be Array of results
    const [loading, setLoading] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState('Tomato');

    // UI State for workflow
    const [previewImages, setPreviewImages] = useState([]);
    const [hasResult, setHasResult] = useState(false);

    // 1. Handle selection (Accepts Array)
    const handleImageSelect = (images) => {
        setPreviewImages(images || []);
        setHasResult(false);
        setData(null);
    }

    // 2. Trigger Analysis (Multi-Image)
    const handleAnalyze = async () => {
        if (!previewImages || previewImages.length === 0) return;

        try {
            setLoading(true);

            // Helper to convert Base64 to Blob
            const base64ToBlob = (base64) => {
                const parts = base64.split(';base64,');
                const contentType = parts[0].split(':')[1];
                const raw = window.atob(parts[1]);
                const rawLength = raw.length;
                const uInt8Array = new Uint8Array(rawLength);
                for (let i = 0; i < rawLength; ++i) {
                    uInt8Array[i] = raw.charCodeAt(i);
                }
                return new Blob([uInt8Array], { type: contentType });
            };

            // Convert all images
            const imageFiles = previewImages.map((b64, idx) => {
                const blob = base64ToBlob(b64);
                return new File([blob], `upload_${idx}.jpg`, { type: "image/jpeg" });
            });

            // Call Analysis API (Returns Array)
            const results = await analyzeImage(selectedCrop, imageFiles, i18n.language);

            setData(results);
            setHasResult(true);
            setLoading(false);

        } catch (err) {
            console.error("Analysis failed", err);
            setLoading(false);
            // Fallback for demo if API fails
            setHasResult(true);
            setData([{
                disease: 'Error Analysis',
                confidence: 0.0,
                severity_level: 'Unknown',
                treatment_protocol: ['Please try again'],
                category: 'Unknown'
            }]);
        }
    };

    const isHeathy = (item) => item?.severity_level === 'Healthy' || item?.disease === 'Healthy';

    const premiumEase = [0.22, 1, 0.36, 1];

    return (
        <div className="space-y-12 pb-20">
            <Breadcrumbs />

            <header className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-mint border border-brand-leaf/20 text-brand-deep text-[10px] font-bold uppercase tracking-widest"
                >
                    <span className="w-2 h-2 rounded-full bg-brand-main animate-pulse-green" />
                    Disease Intelligence Unit
                </motion.div>
                <div className="flex justify-between items-end">
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: premiumEase, delay: 0.1 }}
                        className="text-5xl font-black text-brand-deep tracking-tight"
                    >
                        Diagnose & Treat
                    </motion.h1>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Visual Diagnosis Column */}
                <div className="lg:col-span-8 space-y-12">

                    {/* 1. Diagnostic Input (Always Visible) */}
                    <div className="relative z-20 space-y-6">
                        <UploadSection
                            onImageSelect={handleImageSelect}
                            selectedCrop={selectedCrop}
                            setSelectedCrop={setSelectedCrop}
                            previewImages={previewImages}
                        />

                        {/* Analysis Action Area */}
                        <AnimatePresence>
                            {previewImages.length > 0 && !loading && !hasResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex justify-center"
                                >
                                    <button
                                        onClick={handleAnalyze}
                                        className="btn-primary flex items-center gap-3 text-lg px-12 py-4 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                                    >
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                        </span>
                                        Run Multi-Scan Analysis
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading State */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white rounded-2xl shadow-elevated border border-gray-100 p-8 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-brand-main border-t-transparent rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-2xl">🌱</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Scanning Specimens</h3>
                                            <p className="text-gray-500"> analyzing batch ({previewImages.length} images)...</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Detected Disease Results (List) */}
                    {/* 2. Detected Disease Results */}
                    {hasResult && data && (
                        <div className="space-y-8">
                            {/* Header - Only show for multiple items */}
                            {Array.isArray(data) && data.length > 1 && (
                                <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
                                    <span className="bg-brand-mint text-brand-deep px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {data.length} Detected
                                    </span>
                                </div>
                            )}

                            {/* Results Display */}
                            {Array.isArray(data) && data.length > 1 ? (
                                // Multi-result list view
                                data.map((result, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        transition={{ duration: 0.8, ease: premiumEase, delay: idx * 0.1 }}
                                    >
                                        <div className="mb-2">
                                            {result.image_path && (
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-4">
                                                    Image: {result.image_path}
                                                </span>
                                            )}
                                        </div>
                                        <DiseaseDiagnosisCard
                                            disease={result.disease}
                                            confidence={result.confidence}
                                            category={result.category}
                                            severity={result.severity_level}
                                            recommendedActions={result.recommended_actions}
                                            symptoms={result.symptoms}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                // Single Result View (Restored "Previous" State)
                                <motion.div
                                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{ duration: 0.8, ease: premiumEase }}
                                >
                                    <DiseaseDiagnosisCard
                                        disease={Array.isArray(data) ? data[0].disease : data.disease}
                                        confidence={Array.isArray(data) ? data[0].confidence : data.confidence}
                                        category={Array.isArray(data) ? data[0].category : data.category}
                                        severity={Array.isArray(data) ? data[0].severity_level : data.severity_level}
                                        recommendedActions={Array.isArray(data) ? data[0].recommended_actions : data.recommended_actions}
                                        symptoms={Array.isArray(data) ? data[0].symptoms : data.symptoms}
                                    />
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* 3 & 4. Treatment Protocol (Below Diagnosis) */}
                    {hasResult && data && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, ease: premiumEase, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setHasResult(false);
                                        setData(null);
                                        setPreviewImages([]);
                                    }}
                                    className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <span>↺</span> Start New Analysis
                                </button>
                            </div>

                            <TreatmentPlan
                                disease={Array.isArray(data) ? data[0].disease : data.disease}
                                severity={Array.isArray(data) ? data[0].severity_level : data.severity_level}
                                medicines={Array.isArray(data) ? data[0].medicines : data.medicines}
                                naturalTreatments={Array.isArray(data) ? data[0].natural_treatments : data.natural_treatments}
                                preventiveMeasures={Array.isArray(data) ? data[0].preventive_measures : data.preventive_measures}
                                fullData={Array.isArray(data) ? data[0] : data}
                            />
                        </motion.div>
                    )}
                </div>

                {/* Empty Side Column Removed */}
            </div>

            {/* Floating Chatbot Widget (Outside Grid) */}
            <FarmerQA contextData={Array.isArray(data) ? data[0] : data} />
        </div >
    );
};

export default Dashboard;
