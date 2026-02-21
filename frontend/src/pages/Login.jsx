import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Leaf, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = React.useState('');
    const [devMode, setDevMode] = React.useState(false);

    const handleSuccess = async (credentialResponse) => {
        const result = await login(credentialResponse.credential);

        if (result.success) {
            if (result.isNewUser) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error || 'Login failed. Please try again.');
        }
    };

    const handleError = () => {
        setError('Google Sign-In failed. Please try again.');
    };

    // Development mode bypass (remove in production)
    const handleDevLogin = async () => {
        const result = await login('dev_mode_bypass');
        if (result.success) {
            navigate(result.isNewUser ? '/onboarding' : '/dashboard');
        }
    };

    const hasGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
        import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-4">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl">
                            <Leaf className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome to AgriEye
                    </h1>
                    <p className="text-gray-600">
                        AI-Powered Crop Disease Detection & Treatment
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Sign In
                        </h2>
                        <p className="text-gray-600">
                            Continue with your Google account
                        </p>
                    </div>

                    {/* Google OAuth Not Configured Warning */}
                    {!hasGoogleClientId && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-900 mb-1">
                                        Google OAuth Not Configured
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                        Please set up Google OAuth credentials to enable login.
                                        See <code className="bg-yellow-100 px-1 rounded">google_oauth_setup.md</code> for instructions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    {hasGoogleClientId ? (
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleError}
                                useOneTap
                                theme="outline"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => setDevMode(!devMode)}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                {devMode ? 'Hide' : 'Show'} Development Options
                            </button>

                            {devMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <button
                                        onClick={handleDevLogin}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        🔧 Continue in Development Mode
                                    </button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        For testing only - Remove in production
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Features */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center mb-4">
                            What you'll get:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        AI Disease Detection
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Instant crop disease analysis using advanced AI
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Personalized Treatment Plans
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Custom 7-day schedules for your crops
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Track Your Progress
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Save and manage multiple treatment plans
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
}
