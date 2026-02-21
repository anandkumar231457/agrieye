import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type, message }) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ type, message, onClose }) => {
    const styles = {
        success: { bg: 'bg-brand-deep', icon: CheckCircle2 },
        error: { bg: 'bg-red-500', icon: AlertCircle },
        info: { bg: 'bg-gray-800', icon: Info },
    };

    const style = styles[type] || styles.info;
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${style.bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] border border-white/10 backdrop-blur-md`}
        >
            <Icon size={20} />
            <p className="text-sm font-bold tracking-wide flex-1">{message}</p>
            <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>
        </motion.div>
    );
};
