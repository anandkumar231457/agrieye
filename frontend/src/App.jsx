import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Severity from './pages/Severity';
import TreatmentSchedule from './pages/TreatmentSchedule';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/" element={
                    <PageTransition>
                        <Landing />
                    </PageTransition>
                } />

                <Route path="/login" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />

                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <PageTransition>
                            <Onboarding />
                        </PageTransition>
                    </ProtectedRoute>
                } />

                {/* Protected routes with Layout */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Layout>
                            <PageTransition>
                                <Dashboard />
                            </PageTransition>
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/monitoring" element={
                    <ProtectedRoute>
                        <Layout>
                            <PageTransition>
                                <Monitoring />
                            </PageTransition>
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/severity" element={
                    <ProtectedRoute>
                        <Layout>
                            <PageTransition>
                                <Severity />
                            </PageTransition>
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/schedule" element={
                    <ProtectedRoute>
                        <Layout>
                            <PageTransition>
                                <TreatmentSchedule />
                            </PageTransition>
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Layout>
                            <PageTransition>
                                <Profile />
                            </PageTransition>
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <Router>
                    <AnimatedRoutes />
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
// Cache buster v2.0 - 20260212151423
