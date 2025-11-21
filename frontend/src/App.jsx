import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { Toaster } from 'react-hot-toast'; 
import { AnimatePresence } from 'framer-motion'; 

// Layouts & Components
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';

// Pages
import Landing from './pages/Landing'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forgot from './pages/Forgot';     
import Reset from './pages/Reset';       
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings'; 
import AdminDashboard from './pages/AdminDashboard'; 
import NotFound from './pages/NotFound'; 

// 🛡️ Normal Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// 🛡️ Admin Protected Route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// 🎬 Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* --- Public Routes --- */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><Forgot /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><Reset /></PageTransition>} />
        
        {/* --- Protected Routes (Wrapped in Layout) --- */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            
            {/* Admin Only */}
            <Route path="/admin" element={
                <AdminRoute>
                    <PageTransition><AdminDashboard /></PageTransition>
                </AdminRoute>
            } />

        </Route>

        {/* --- 404 Catch All --- */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />

      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          {/* Global Toast Notifications */}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          
          {/* Main Routing Logic */}
          <AnimatedRoutes /> 
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;