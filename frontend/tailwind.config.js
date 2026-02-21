import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    deep: '#0A3D29',    // Dark Forest
                    main: '#0F8B4F',    // Rich Emerald (deeper than pastel)
                    leaf: '#10B981',    // Vibrant Green (more saturated)
                    light: '#D1FAE5',   // Soft Mint Background
                    mint: '#F0FDF4',    // Very Light Mint
                    warning: '#F59E0B', // Warm Amber (for alerts)
                    critical: '#EA580C',// Warm Orange (for critical)
                    success: '#10B981', // Match leaf color
                },
                gray: {
                    50: '#F9FAFB',      // Card backgrounds
                    100: '#F3F4F6',     // Secondary backgrounds
                    200: '#E5E7EB',     // Borders
                    700: '#374151',     // Secondary text
                    800: '#1F2937',     // Primary text
                    900: '#111827',     // Headings
                }
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #10B981 0%, #0F8B4F 100%)',
                'brand-gradient-hover': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                'page-gradient': 'linear-gradient(180deg, #F5F7FA 0%, #E5E7EB 100%)',
            },
            boxShadow: {
                // Medium, Defined Shadows - Single Direction
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                'floating': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                'button': '0 4px 6px -1px rgba(15, 139, 79, 0.2), 0 2px 4px -2px rgba(15, 139, 79, 0.1)',
                'button-hover': '0 10px 15px -3px rgba(15, 139, 79, 0.25), 0 4px 6px -4px rgba(15, 139, 79, 0.15)',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            transitionDuration: {
                '400': '400ms',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            }
        },
    },
    plugins: [daisyui],
    daisyui: {
        themes: [
            {
                agrieye: {
                    "primary": "#16A34A",
                    "secondary": "#14532D",
                    "accent": "#4ADE80",
                    "neutral": "#1F2937",
                    "base-100": "#FFFFFF",
                    "base-200": "#F0FDF4",
                    "base-300": "#DCFCE7",
                    "info": "#16A34A",
                    "success": "#22C55E",
                    "warning": "#F59E0B",
                    "error": "#EF4444",
                },
            },
        ],
        darkTheme: "agrieye", // Force light mode
    },
}
