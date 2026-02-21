import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeatureList({ title, features, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-card border border-gray-200 p-6 ${className}`}
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
            <ul className="space-y-3">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-brand-main" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
