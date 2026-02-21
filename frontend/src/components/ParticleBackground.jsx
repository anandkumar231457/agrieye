import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let time = 0;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Particle class
        class Particle {
            constructor(index, total) {
                // Create orbital structure
                const ring = Math.floor(index / 40); // 40 particles per ring
                const angleStep = (Math.PI * 2) / 40;
                const angle = (index % 40) * angleStep;

                // Base radius for each ring
                this.baseRadius = 150 + (ring * 80);
                this.angle = angle;
                this.angleSpeed = 0.00006 + (ring * 0.00002); // Much slower, calmer rotation

                // Particle properties
                this.size = 3; // Sharp, constant size
                this.color = '#14532D'; // Dark green
                this.alpha = 1; // No alpha fade

                // Small orbital variation for visual interest
                this.orbitOffset = Math.sin(angle * 3) * 10;
            }

            update(centerX, centerY, deltaTime) {
                // Slow orbital rotation
                this.angle += this.angleSpeed * deltaTime;
            }

            draw(ctx, centerX, centerY) {
                const radius = this.baseRadius + this.orbitOffset;
                const x = centerX + Math.cos(this.angle) * radius;
                const y = centerY + Math.sin(this.angle) * radius;

                // Draw sharp, crisp dot
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Initialize particles with orbital structure
        const initParticles = () => {
            particles = [];
            const totalParticles = 200; // Medium density

            for (let i = 0; i < totalParticles; i++) {
                particles.push(new Particle(i, totalParticles));
            }
        };

        // Animation loop
        let lastTime = performance.now();
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Clear canvas with clean background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Center point
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Update and draw particles
            particles.forEach(particle => {
                particle.update(centerX, centerY, deltaTime);
                particle.draw(ctx, centerX, centerY);
            });

            time += 0.01;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate(performance.now());

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="particle-background-canvas"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                background: 'transparent',
            }}
        />
    );
};

export default ParticleBackground;
