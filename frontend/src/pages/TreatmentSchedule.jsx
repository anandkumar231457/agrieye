import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Check, Circle, Pill, Leaf, ArrowLeft,
    Loader2, AlertCircle, Trash2, ChevronLeft, ChevronRight,
    ShieldAlert
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const STORAGE_KEY = 'saved_treatment_plan';

export default function TreatmentSchedule() {
    const location = useLocation();
    const navigate = useNavigate();
    const newTreatmentData = location.state;

    const [treatmentType, setTreatmentType] = useState('medicine');
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [completedTasks, setCompletedTasks] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Load saved plan on mount
    useEffect(() => {
        console.log('[Schedule] Mount. State:', newTreatmentData);
        const savedPlan = localStorage.getItem(STORAGE_KEY);
        if (savedPlan) {
            try {
                const parsed = JSON.parse(savedPlan);
                console.log('[Schedule] Loaded from storage:', parsed);
                setSchedule(parsed);
                setTreatmentType(parsed.treatmentType || 'medicine');

                // Load completed tasks
                const savedTasks = localStorage.getItem(`${STORAGE_KEY}_tasks`);
                if (savedTasks) {
                    setCompletedTasks(JSON.parse(savedTasks));
                }

                // Auto-select first day
                if (parsed.schedule && parsed.schedule.length > 0) {
                    setSelectedDay(parsed.schedule[0]);
                    // Set current month to first treatment day
                    if (parsed.schedule[0].date) {
                        setCurrentMonth(new Date(parsed.schedule[0].date));
                    }
                }
            } catch (error) {
                console.error('[Schedule] Failed to load saved plan:', error);
            }
        } else if (newTreatmentData) {
            // New plan from dashboard - generate schedule
            console.log('[Schedule] Generating new schedule from state');
            generateSchedule(treatmentType);
        }
    }, [newTreatmentData]); // Re-run if state changes

    // Generate schedule only when treatment type changes
    const handleTreatmentTypeChange = (type) => {
        setTreatmentType(type);
        if (!schedule || schedule.treatmentType !== type) {
            generateSchedule(type);
        }
    };

    const generateSchedule = async (type) => {
        if (!newTreatmentData && !schedule) {
            console.warn('[Schedule] No data to generate schedule from');
            return;
        }

        const data = newTreatmentData || {
            disease: schedule.disease,
            severity_level: schedule.severity,
            medicines: schedule.medicines || [],
            natural_treatments: schedule.naturalTreatments || [],
            preventive_measures: schedule.preventiveMeasures || []
        };

        console.log('[Schedule] Requesting schedule with data:', data);

        setLoading(true);
        try {
            const response = await api.post('/generate-schedule', {
                disease: data.disease,
                severity: data.severity_level,
                treatmentType: type,
                medicines: data.medicines || [],
                naturalTreatments: data.natural_treatments || [],
                preventiveMeasures: data.preventive_measures || []
            });

            const scheduleData = response.data;
            console.log('[Schedule] Received response:', scheduleData);

            if (!scheduleData || !scheduleData.schedule) {
                throw new Error('Invalid schedule data received from server');
            }

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleData));
            setSchedule(scheduleData);

            // Auto-select first day and set month
            if (scheduleData.schedule && scheduleData.schedule.length > 0) {
                setSelectedDay(scheduleData.schedule[0]);
                if (scheduleData.schedule[0].date) {
                    setCurrentMonth(new Date(scheduleData.schedule[0].date));
                }
            }
        } catch (error) {
            console.error('[Schedule] Failed to generate schedule:', error);
            alert(`Failed to generate schedule: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (dayNum, taskIndex) => {
        const key = `${dayNum}-${taskIndex}`;
        const newCompleted = {
            ...completedTasks,
            [key]: !completedTasks[key]
        };
        setCompletedTasks(newCompleted);
        localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(newCompleted));
    };

    const handleDeletePlan = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_tasks`);
        setSchedule(null);
        setCompletedTasks({});
        setShowDeleteConfirm(false);
        navigate('/dashboard');
    };

    // Calendar functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getLocalDateString = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isScheduledDay = (date) => {
        if (!schedule || !schedule.schedule || !date) return false;
        const dateStr = getLocalDateString(date);
        return schedule.schedule.some(d => d.date === dateStr);
    };

    const getScheduleDay = (date) => {
        if (!schedule || !schedule.schedule || !date) return null;
        const dateStr = getLocalDateString(date);
        return schedule.schedule.find(d => d.date === dateStr);
    };

    const changeMonth = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentMonth(newDate);
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <Breadcrumbs />

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-brand-main mb-2"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Treatment Schedule
                        </h1>
                        {schedule && (
                            <p className="text-gray-600 mt-1">
                                {schedule.disease} - {schedule.severity} Severity
                            </p>
                        )}
                    </div>

                    {schedule && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={18} />
                            <span className="font-semibold">Delete Plan</span>
                        </button>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-6 max-w-md mx-4"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Treatment Plan?</h3>
                                <p className="text-gray-600 mb-6">
                                    This will permanently delete your saved treatment schedule and all progress.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeletePlan}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!schedule && !loading && (
                    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Treatment Plan</h3>
                        <p className="text-gray-600 mb-6">
                            Complete a disease analysis to create a treatment plan.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                {/* Treatment Type Selector */}
                {schedule && (
                    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Treatment Type</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleTreatmentTypeChange('medicine')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${treatmentType === 'medicine'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${treatmentType === 'medicine' ? 'bg-orange-500' : 'bg-gray-200'
                                        }`}>
                                        <Pill className={`w-6 h-6 ${treatmentType === 'medicine' ? 'text-white' : 'text-gray-600'
                                            }`} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900">Medicine</h3>
                                        <p className="text-sm text-gray-600">Chemical-based</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleTreatmentTypeChange('organic')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${treatmentType === 'organic'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${treatmentType === 'organic' ? 'bg-green-500' : 'bg-gray-200'
                                        }`}>
                                        <Leaf className={`w-6 h-6 ${treatmentType === 'organic' ? 'text-white' : 'text-gray-600'
                                            }`} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900">Organic</h3>
                                        <p className="text-sm text-gray-600">Natural-based</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Plan Summary Section */}
                {schedule && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Plan Summary</h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-brand-main/10 text-brand-main rounded-full text-sm font-bold">
                                <span>{schedule.severity} Severity</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Medicines */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <Pill size={16} className="text-orange-500" />
                                    <span>Recommended Medicines</span>
                                </h3>
                                {schedule.medicines?.length > 0 ? (
                                    <div className="space-y-2">
                                        {schedule.medicines.map((m, i) => (
                                            <div key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                                <p className="font-bold text-orange-900 text-sm">{m.name || m}</p>
                                                {m.dosage && <p className="text-xs text-orange-700">{m.dosage} • {m.frequency}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No chemical medicines recommended.</p>
                                )}
                            </div>

                            {/* Natural Treatments */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <Leaf size={16} className="text-green-500" />
                                    <span>Organic Treatments</span>
                                </h3>
                                {schedule.naturalTreatments?.length > 0 ? (
                                    <div className="space-y-2">
                                        {schedule.naturalTreatments.map((t, i) => (
                                            <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-100">
                                                <p className="text-sm text-green-900 font-medium">{t}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No organic treatments recommended.</p>
                                )}
                            </div>

                            {/* Preventive Measures */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <ShieldAlert size={16} className="text-blue-500" />
                                    <span>Prevention Tactics</span>
                                </h3>
                                {schedule.preventiveMeasures?.length > 0 ? (
                                    <div className="space-y-2">
                                        {schedule.preventiveMeasures.map((p, i) => (
                                            <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-sm text-blue-900 font-medium">{p}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No prevention measures provided.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-brand-main animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Generating your treatment schedule...</p>
                    </div>
                ) : schedule ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Full Calendar */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => changeMonth(-1)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => changeMonth(1)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Week day headers */}
                                {weekDays.map(day => (
                                    <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar days */}
                                {days.map((date, index) => {
                                    const scheduleDay = date ? getScheduleDay(date) : null;
                                    const isScheduled = date ? isScheduledDay(date) : false;
                                    const isSelected = selectedDay && date &&
                                        date.toISOString().split('T')[0] === selectedDay.date;

                                    // Calculate progress for scheduled days
                                    let progress = 0;
                                    if (scheduleDay) {
                                        const completedCount = scheduleDay.tasks.filter((_, i) =>
                                            completedTasks[`${scheduleDay.day}-${i}`]
                                        ).length;
                                        progress = (completedCount / scheduleDay.tasks.length) * 100;
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => scheduleDay && setSelectedDay(scheduleDay)}
                                            disabled={!date || !isScheduled}
                                            className={`aspect-square p-2 rounded-lg text-sm transition-all relative overflow-hidden ${!date
                                                ? 'invisible'
                                                : isSelected
                                                    ? 'bg-brand-main text-white font-bold shadow-lg scale-105'
                                                    : isScheduled
                                                        ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-900 font-semibold hover:shadow-md hover:scale-105 border-2 border-green-300'
                                                        : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="relative z-10">
                                                {date ? date.getDate() : ''}
                                            </div>
                                            {isScheduled && !isSelected && (
                                                <>
                                                    {/* Progress indicator */}
                                                    <div className="absolute bottom-1 left-1 right-1 h-1 bg-green-300 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-600 transition-all"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    {/* Day number badge */}
                                                    <div className="absolute top-1 right-1 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                        {scheduleDay.day}
                                                    </div>
                                                </>
                                            )}
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 w-5 h-5 bg-white text-brand-main rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    {scheduleDay.day}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded"></div>
                                    <span className="text-sm text-gray-600">Treatment Day</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-brand-main rounded"></div>
                                    <span className="text-sm text-gray-600">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-300 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-gray-600">Progress Bar</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Tasks */}
                        <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 lg:sticky lg:top-6 h-fit">
                            {selectedDay ? (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="w-5 h-5 text-brand-main" />
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Day {selectedDay.day}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-6">
                                        {new Date(selectedDay.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>

                                    <div className="space-y-3">
                                        {selectedDay.tasks.map((task, index) => {
                                            const taskKey = `${selectedDay.day}-${index}`;
                                            const isCompleted = completedTasks[taskKey];

                                            return (
                                                <motion.button
                                                    key={index}
                                                    onClick={() => toggleTask(selectedDay.day, index)}
                                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isCompleted
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-brand-main'
                                                        }`}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-gray-400'
                                                            }`}>
                                                            {isCompleted ? (
                                                                <Check size={20} />
                                                            ) : (
                                                                <Circle size={20} />
                                                            )}
                                                        </div>
                                                        <span className={`text-sm ${isCompleted
                                                            ? 'text-green-800 line-through'
                                                            : 'text-gray-700'
                                                            }`}>
                                                            {task}
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-bold text-brand-main">
                                                {selectedDay.tasks.filter((_, i) =>
                                                    completedTasks[`${selectedDay.day}-${i}`]
                                                ).length} / {selectedDay.tasks.length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-brand-main h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(selectedDay.tasks.filter((_, i) =>
                                                        completedTasks[`${selectedDay.day}-${i}`]
                                                    ).length / selectedDay.tasks.length) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Select a treatment day to view tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
