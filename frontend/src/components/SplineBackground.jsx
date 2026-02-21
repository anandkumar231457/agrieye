import React, { useEffect, useRef } from 'react';

const SplineBackground = () => {
    const viewerRef = useRef(null);

    useEffect(() => {
        // Load Spline viewer script
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.12.39/build/spline-viewer.js';
        document.head.appendChild(script);

        return () => {
            // Cleanup script on unmount
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    return (
        <div className="spline-background-container">
            <spline-viewer
                ref={viewerRef}
                url="https://prod.spline.design/hDUFzFKVe9hcvUub/scene.splinecode"
            />
        </div>
    );
};

export default SplineBackground;
