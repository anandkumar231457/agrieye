import { motion } from 'framer-motion';

export default function HeroCard({ title, subtitle, badge, children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-brand-gradient rounded-2xl p-8 text-white shadow-floating ${className}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2 leading-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-white/90 text-lg font-medium">{subtitle}</p>
                    )}
                </div>
                {badge && (
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold shadow-card">
                        {badge}
                    </span>
                )}
            </div>
            {children}
        </motion.div>
    );
}
