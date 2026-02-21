import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatusBadge({ text, icon: Icon = CheckCircle, variant = 'success' }) {
    const variants = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        warning: 'bg-amber-50 border-amber-200 text-amber-900',
        critical: 'bg-orange-50 border-orange-200 text-orange-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${variants[variant]} border rounded-xl p-4 flex items-center gap-3 shadow-card`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{text}</span>
        </motion.div>
    );
}
