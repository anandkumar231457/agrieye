import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HeroCard from './HeroCard';
import StatusBadge from './StatusBadge';
import InfoSection from './InfoSection';

export default function DiseaseStatusCard({ disease, confidence, category, severity, recommendedActions, symptoms }) {
    const { t } = useTranslation();

    const getStatusConfig = () => {
        if (!disease || disease === 'Healthy') {
            return {
                variant: 'success',
                text: t('analysis.healthy_title'),
                icon: CheckCircle
            };
        }

        if (severity === 'High' || severity === 'Critical') {
            return {
                variant: 'warning',
                text: t('analysis.warning_title'),
                icon: AlertTriangle
            };
        }

        return {
            variant: 'info',
            text: t('analysis.info_title'),
            icon: Activity
        };
    };

    const status = getStatusConfig();
    const isHealthy = disease === 'Healthy';

    // Diagnosis overview data
    const overviewData = [
        { label: t('analysis.category'), value: category || 'N/A' },
        { label: t('analysis.severity'), value: severity ? String(severity).toUpperCase() : 'N/A' },
        { label: t('analysis.confidence'), value: confidence ? `${Math.round(confidence * 100)}%` : 'N/A' },
        { label: t('analysis.time'), value: '2.3s' },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Hero Card */}
            <HeroCard
                title={disease || t('common.unknown')}
                subtitle={`${t('analysis.confidence')}: ${confidence ? Math.round(confidence * 100) : 0}%`}
                badge={category}
            >
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-400' :
                            severity === 'High' ? 'bg-red-400' :
                                'bg-yellow-400'
                            } shadow-lg`} />
                        <span className="text-white/90 text-sm font-medium">
                            {severity || t('analysis.category')} {t('analysis.severity').replace('Level', '')}
                        </span>
                    </div>
                </div>
            </HeroCard>

            {/* Status Badge */}
            <StatusBadge
                text={status.text}
                icon={status.icon}
                variant={status.variant}
            />

            {/* Diagnosis Overview */}
            <InfoSection
                title={t('analysis.result_title')}
                data={overviewData}
            />

            {/* Additional Info for Diseased Crops */}
            {!isHealthy && symptoms && symptoms.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-md"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('analysis.symptoms')}</h3>
                    <ul className="space-y-2">
                        {symptoms.map((symptom, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>{symptom}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Additional Info for Diseased Crops */}
            {!isHealthy && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-md"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {t('analysis.actions')}
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                        {recommendedActions && recommendedActions.length > 0 ? (
                            recommendedActions.map((action, index) => (
                                <p key={index} className="flex items-start gap-2">
                                    <span className="text-brand-main font-bold">{index + 1}.</span>
                                    <span className="leading-relaxed">{action}</span>
                                </p>
                            ))
                        ) : (
                            <>
                                <p className="flex items-start gap-2">
                                    <span className="text-brand-main font-bold">1.</span>
                                    <span>{t('analysis.info_title')}</span>
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
