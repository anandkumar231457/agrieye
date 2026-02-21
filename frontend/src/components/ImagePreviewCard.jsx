import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

export default function ImagePreviewCard({ image }) {
    if (!image) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 max-w-4xl mx-auto"
        >
            <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-5 h-5 text-brand-main" />
                <h3 className="text-lg font-bold text-gray-900">Uploaded Image</h3>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt="Uploaded crop"
                    className="w-full h-auto object-contain max-h-96"
                />
            </div>
        </motion.div>
    );
}
