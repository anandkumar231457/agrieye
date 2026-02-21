import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import EnvironmentalChart from '../components/EnvironmentalChart';
import DiseaseDetectionChart from '../components/DiseaseDetectionChart';
import { Check, CloudSun, Calendar, TrendingUp, Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import FarmerQA from '../components/FarmerQA';
import { getWeather, getLatestData } from '../services/api';

const Monitor = () => {
    const { user } = useAuth();
    const [weather, setWeather] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [tasks, setTasks] = useState([
        { id: 1, text: "Inspect Zone 4 for yellowing leaves", done: false },
        { id: 2, text: "Calibrate nutrient mix for Tomatoes", done: true },
        { id: 3, text: "Verify irrigation pressure", done: false },
    ]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch AI Data
                const latestAi = await getLatestData();
                setAiData(latestAi);

                // 2. Fetch Weather
                const location = user?.field_location || user?.location;
                if (location) {
                    const data = await getWeather(location);
                    if (data) {
                        setWeather({
                            temperature: data.temperature,
                            humidity: data.humidity,
                            condition: data.description,
                            location: data.location,
                            country: 'IN',
                            windSpeed: 5,
                            feelsLike: data.temperature + 2
                        });
                    }
                }
            } catch (error) {
                console.error('Data fetch error:', error);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchAllData();
    }, [user]);

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const getWeatherIcon = (main) => {
        switch (main?.toLowerCase()) {
            case 'clear': return Sun;
            case 'clouds': return Cloud;
            case 'rain':
            case 'drizzle': return CloudRain;
            default: return CloudSun;
        }
    };

    const premiumEase = [0.22, 1, 0.36, 1];
    const WeatherIcon = weather ? getWeatherIcon(weather.condition) : CloudSun;

    return (
        <div className="space-y-12 pb-20">
            <Breadcrumbs />

            <motion.header
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: premiumEase }}
                className="flex items-center gap-4"
            >
                <div className="p-3 bg-brand-mint rounded-2xl border border-brand-leaf/20">
                    <TrendingUp className="w-8 h-8 text-brand-main" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-brand-deep tracking-tight">Farm Analytics</h1>
                    <p className="text-gray-500 font-medium">Trends & Daily Actions</p>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* 1. Global Env Chart (Temp/Hum) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Environmental Trends</h3>
                        </div>
                        <div className="h-[350px]">
                            <EnvironmentalChart currentData={weather} />
                        </div>
                    </div>

                    {/* 2. Unified Disease Detection Graph */}
                    <div className="h-[400px]">
                        <DiseaseDetectionChart latestAnalysis={aiData} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Weather */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.4, ease: premiumEase }}
                        className="bg-brand-gradient p-10 rounded-[3rem] text-white shadow-lg relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[50px] -mr-10 -mt-10" />
                        <div className="relative z-10">
                            {weatherLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
                                    <p className="text-white/70">Loading weather...</p>
                                </div>
                            ) : weather ? (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <WeatherIcon size={48} className="text-brand-light opacity-90" />
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Live</span>
                                    </div>
                                    <div className="text-6xl font-black tracking-tighter mb-4">{weather.temperature}°</div>
                                    <div className="space-y-1 opacity-90 font-medium">
                                        <p className="capitalize">{weather.description}</p>
                                        <p className="text-sm text-brand-light">{weather.location}, {weather.country}</p>
                                        <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Droplets className="w-4 h-4" />
                                                <span className="text-sm">Humidity: {weather.humidity}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Wind className="w-4 h-4" />
                                                <span className="text-sm">Wind: {weather.windSpeed} m/s</span>
                                            </div>
                                            <p className="text-xs text-brand-light">Feels like {weather.feelsLike}°</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <CloudSun size={48} className="text-brand-light opacity-50 mx-auto mb-4" />
                                    <p className="text-white/70 text-sm">
                                        {user?.location ? 'Weather unavailable' : 'Set location in profile to see weather'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Checkbox List */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-organic border border-brand-mint/50">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-5 h-5 text-brand-main" />
                            <h3 className="text-xl font-bold text-brand-deep">Daily Actions</h3>
                        </div>
                        <div className="space-y-3">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${task.done
                                        ? 'bg-brand-mint/50 border-transparent opacity-50'
                                        : 'bg-white border-brand-mint hover:border-brand-main/30 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${task.done ? 'bg-brand-main border-brand-main text-white' : 'border-gray-200'
                                        }`}>
                                        {task.done && <Check size={14} />}
                                    </div>
                                    <span className={`font-semibold text-sm leading-tight ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {task.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Dynamic Chatbot - Floating */}
            <FarmerQA contextData={aiData} />
        </div>
    );
};

export default Monitor;
