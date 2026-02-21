import React, { useRef, useEffect, useState } from 'react';

// Simple 2D dot background inspired by Antigravity
const Abstract3DBackground = ({ isActive = false, mouseX = 0.5, mouseY = 0.5 }) => {
    const canvasRef = useRef(null);
    const dotsRef = useRef([]);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const animationFrameRef = useRef(null);

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // Initialize dots
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log('Canvas ref not found');
            return;
        }

        const updateCanvasSize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            console.log('Canvas size:', canvas.width, 'x', canvas.height);

            // Create dots (only if not already created or on resize)
            if (dotsRef.current.length === 0) {
                const dots = [];

                // Green color variations (darker shades)
                const greenColors = [
                    '#059669', // darker green
                    '#047857', // even darker
                    '#065F46', // forest green
                    '#10B981', // brand-main
                    '#0D9488', // teal-green
                ];

                // Create clustered groups instead of random scatter
                const clusterCount = Math.floor(Math.random() * 5) + 8; // 8-12 clusters

                for (let c = 0; c < clusterCount; c++) {
                    // Random cluster center
                    const clusterX = Math.random() * canvas.width;
                    const clusterY = Math.random() * canvas.height;
                    const dotsInCluster = Math.floor(Math.random() * 20) + 30; // 30-50 dots per cluster
                    const clusterSpread = Math.random() * 100 + 80; // 80-180px spread

                    for (let i = 0; i < dotsInCluster; i++) {
                        // Position dots around cluster center
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * clusterSpread;
                        const x = clusterX + Math.cos(angle) * distance;
                        const y = clusterY + Math.sin(angle) * distance;

                        dots.push({
                            x: x,
                            y: y,
                            baseX: x,
                            baseY: y,
                            size: Math.random() * 2 + 2, // 2-4px dots
                            color: greenColors[Math.floor(Math.random() * greenColors.length)],
                            depth: Math.random(), // 0-1, for parallax strength
                        });
                    }
                }

                dotsRef.current = dots;
                console.log('Created', dots.length, 'dots in', clusterCount, 'clusters');
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    // Smooth mouse tracking
    useEffect(() => {
        mouseRef.current.x = mouseX;
        mouseRef.current.y = mouseY;
    }, [mouseX, mouseY]);

    // Animation loop
    useEffect(() => {
        if (prefersReducedMotion) return;
        // Removed isActive check - always show dots
        console.log('Starting animation loop, isActive:', isActive);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let time = 0;

        const animate = () => {
            time += 0.01;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mouse position in pixels
            const mouseXPx = mouseRef.current.x * canvas.width;
            const mouseYPx = mouseRef.current.y * canvas.height;

            // Draw dots
            dotsRef.current.forEach((dot) => {
                // Mouse parallax effect ONLY - VERY STRONG for noticeable movement
                const parallaxStrength = dot.depth * 150; // Max 150px movement (much stronger!)
                const dx = mouseXPx - canvas.width / 2;
                const dy = mouseYPx - canvas.height / 2;
                const parallaxX = (dx / canvas.width) * parallaxStrength;
                const parallaxY = (dy / canvas.height) * parallaxStrength;

                // Static position + mouse parallax only
                const finalX = dot.baseX + parallaxX;
                const finalY = dot.baseY + parallaxY;

                // Draw dot
                ctx.beginPath();
                ctx.arc(finalX, finalY, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = dot.color;
                ctx.globalAlpha = 0.7 + dot.depth * 0.2; // 0.7-0.9 opacity (darker, more visible)
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, prefersReducedMotion]);

    // Removed isActive check - always render canvas
    // if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-[1] pointer-events-none">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                    opacity: 0.8, // Increased from 0.6 for darker appearance
                }}
            />
        </div>
    );
};

export default Abstract3DBackground;
