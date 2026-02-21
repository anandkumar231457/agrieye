import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Check, ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CROP_OPTIONS = [
    'Tomato', 'Potato', 'Wheat', 'Rice', 'Corn', 'Cotton',
    'Soybean', 'Sugarcane', 'Apple', 'Grape', 'Banana', 'Mango',
    'Onion', 'Garlic', 'Pepper', 'Cucumber', 'Lettuce', 'Cabbage'
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedCrops, setSelectedCrops] = useState([]);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleCrop = (crop) => {
        setSelectedCrops(prev =>
            prev.includes(crop)
                ? prev.filter(c => c !== crop)
                : [...prev, crop]
        );
    };

    const handleSubmit = async () => {
        if (selectedCrops.length === 0) {
            setError('Please select at least one crop type');
            return;
        }

        if (!location.trim()) {
            setError('Please enter your location');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/user/onboarding', {
                crops: selectedCrops,
                location: location.trim()
            });

            const userData = response.data;
            updateUser(userData);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to save your information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <Leaf className="w-8 h-8 text-brand-main" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Let's personalize your AgriEye experience
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-main' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-main text-white' : 'bg-gray-200'
                            }`}>
                            {step > 1 ? <Check size={18} /> : '1'}
                        </div>
                        <span className="text-sm font-semibold">Crops</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-main' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-main text-white' : 'bg-gray-200'
                            }`}>
                            2
                        </div>
                        <span className="text-sm font-semibold">Location</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Crop Selection */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                What crops do you grow?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Select all the crops you're currently growing (you can change this later)
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                {CROP_OPTIONS.map(crop => (
                                    <button
                                        key={crop}
                                        onClick={() => toggleCrop(crop)}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedCrops.includes(crop)
                                            ? 'border-green-500 bg-green-50 text-green-900'
                                            : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{crop}</span>
                                            {selectedCrops.includes(crop) && (
                                                <Check className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    {selectedCrops.length} crop{selectedCrops.length !== 1 ? 's' : ''} selected
                                </p>
                                <button
                                    onClick={() => {
                                        if (selectedCrops.length > 0) {
                                            setStep(2);
                                            setError('');
                                        } else {
                                            setError('Please select at least one crop');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Next
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Where are you located?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                This helps us provide region-specific recommendations
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g., Punjab, India"
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-main focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Selected Crops Summary */}
                            <div className="mb-6 p-4 bg-green-50 rounded-xl">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Selected Crops:</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCrops.map(crop => (
                                        <span
                                            key={crop}
                                            className="px-3 py-1 bg-white border border-green-200 rounded-lg text-sm text-green-900"
                                        >
                                            {crop}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Complete Setup'}
                                    {!loading && <Check size={18} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
