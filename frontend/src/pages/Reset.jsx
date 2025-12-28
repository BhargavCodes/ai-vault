import { useState } from 'react';
import api from '../api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Eye, EyeOff, XCircle } from 'lucide-react'; // Added XCircle for error
import toast from 'react-hot-toast';

const Reset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. Get token directly from URL
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // The user doesn't see the token, but we send it secretly here 👇
      await api.post('/auth/reset-password', { 
        token: token, 
        new_password: newPassword 
      });
      
      toast.success("Password reset successfully! Please login.");
      navigate('/login');
      
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  // 🚨 EDGE CASE: If someone tries to open this page without a link
  if (!token) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200 dark:border-gray-700">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid or Missing Link</h2>
                <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">
                    We couldn't find a reset token. Please request a new password reset link.
                </p>
                <Link to="/forgot-password" className="block w-full py-2.5 rounded-lg text-white font-semibold shadow-md bg-amber-600 hover:bg-amber-700 transition-all">
                    Go to Forgot Password
                </Link>
            </div>
        </div>
    );
  }

  // ✅ NORMAL STATE: Token exists, show Password Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition">
            <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400 mt-2">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Token input is GONE. Logic handles it silently. */}

          {/* New Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">New Password</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    placeholder="Enter strong password"
                    minLength={6}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-all bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Confirm New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reset;