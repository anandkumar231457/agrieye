import { useState, useEffect } from 'react';
import { Upload, Camera, Leaf, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamCapture from './WebcamCapture';

export default function UploadSection({ onImageSelect, selectedCrop, setSelectedCrop, previewImages = [] }) {
    const [mode, setMode] = useState('upload');
    const crops = ['Tomato', 'Potato', 'Pepper Bell', 'Corn', 'Grape', 'Apple', 'Peach', 'Strawberry'];

    // Ensure we work with an array even if parent passes single (backward compat)
    const images = Array.isArray(previewImages) ? previewImages : (previewImages ? [previewImages] : []);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = [];
            let processed = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push(reader.result);
                    processed++;
                    if (processed === files.length) {
                        // Append new images to existing ones
                        onImageSelect([...images, ...newImages]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleCameraCapture = (imgSrc) => {
        onImageSelect([...images, imgSrc]);
        setMode('upload'); // Switch back after capture
    };

    const removeImage = (indexToRemove) => {
        const updated = images.filter((_, index) => index !== indexToRemove);
        onImageSelect(updated);
    };

    return (
        <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-brand-gradient p-6 text-white shadow-card">
                <div className="flex items-center gap-3">
                    <Leaf className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Crop Diagnosis</h2>
                </div>
                <p className="text-white/90 mt-1">Upload multiple images for comprehensive AI analysis</p>
            </div>

            <div className="p-8">
                {/* Mode Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-gray-100 rounded-full p-1.5 shadow-sm">
                        <button
                            onClick={() => setMode('upload')}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase transition-all duration-300 ${mode === 'upload'
                                ? 'bg-white text-brand-main shadow-md'
                                : 'text-gray-500 hover:text-brand-main'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload
                        </button>
                        <button
                            onClick={() => setMode('camera')}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase transition-all duration-300 ${mode === 'camera'
                                ? 'bg-white text-brand-main shadow-md'
                                : 'text-gray-500 hover:text-brand-main'
                                }`}
                        >
                            <Camera className="w-4 h-4 inline mr-2" />
                            Camera
                        </button>
                    </div>
                </div>

                {/* Crop Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                        Select Crop Type
                    </label>
                    <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full bg-white border-2 border-gray-300 rounded-xl py-3 px-4 font-semibold text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-main/40 focus:border-brand-main shadow-sm transition-all duration-300"
                    >
                        {crops.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Upload/Camera Area */}
                <AnimatePresence mode="wait">
                    {mode === 'camera' ? (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <WebcamCapture onCapture={handleCameraCapture} />
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {/* Grid of Images */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {images.map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className="relative aspect-square rounded-xl overflow-hidden border-2 border-brand-mint shadow-sm group"
                                            >
                                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Add More Button (Mini Upload) */}
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer aspect-square">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            multiple
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Plus className="w-8 h-8 mb-1" />
                                            <span className="text-xs font-bold uppercase">Add More</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Dropzone (only if empty) */}
                            {images.length === 0 && (
                                <motion.div
                                    key="upload-empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 h-56 flex flex-col items-center justify-center relative group hover:bg-gray-100 hover:border-brand-main transition-all cursor-pointer"
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8 text-brand-main" />
                                    </div>
                                    <p className="text-gray-900 font-bold text-lg mb-1">
                                        Click to upload multiple images
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        PNG, JPG or JPEG (MAX. 10MB)
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
