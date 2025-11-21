import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Reset = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { 
        token, 
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
          <p className="text-gray-500 text-sm dark:text-gray-400 mt-2">Paste your reset token below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Reset Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Paste token here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
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