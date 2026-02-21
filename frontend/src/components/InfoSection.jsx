import { motion } from 'framer-motion';

export default function InfoSection({ title, data, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-card border border-gray-200 p-6 ${className}`}
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                {title}
            </h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex justify-between items-center gap-4">
                        <span className="text-gray-700 text-sm font-medium flex-shrink-0">{item.label}</span>
                        <span className="font-semibold text-gray-900 text-right">{item.value}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
