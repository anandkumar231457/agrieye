import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        onCapture(imageSrc); // Pass base64 back to parent
    }, [webcamRef, onCapture]);

    const retake = () => {
        setImgSrc(null);
        onCapture(null);
    };

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "environment" // Use back camera on mobile
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-elevated border-4 border-white">
                {imgSrc ? (
                    <img src={imgSrc} alt="Captured specimen" className="w-full h-full object-cover" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Overlay UI */}
                {!imgSrc && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white/50 rounded-lg border-dashed opacity-50" />
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                {imgSrc ? (
                    <button
                        onClick={retake}
                        className="px-8 py-3 rounded-full flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold shadow-card hover:shadow-elevated transition-all duration-300"
                    >
                        <RefreshCw size={18} /> Retake
                    </button>
                ) : (
                    <button
                        onClick={capture}
                        className="px-12 py-4 rounded-full flex items-center gap-3 text-lg bg-brand-gradient text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <Camera size={24} /> Capture Specimen
                    </button>
                )}
            </div>
        </div>
    );
};

export default WebcamCapture;
