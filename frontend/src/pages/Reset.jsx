import { useState } from 'react';
import api from '../api';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Eye, EyeOff, XCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Reset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  // No token state
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0f] px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm z-10 text-center"
        >
          <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-glass p-8">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
              <XCircle size={24} className="text-rose-500" />
            </div>
            <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-2">Invalid link</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed mb-6">
              This reset link is missing or invalid. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold
                bg-amber-500 hover:bg-amber-400 text-white border border-amber-400/80 transition-all"
            >
              Request new link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0f] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-glow-indigo pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-glass p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-8"
          >
            <ArrowLeft size={12} /> Back to sign in
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-1">Set new password</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl
                    bg-zinc-100/80 dark:bg-white/[0.05]
                    border border-zinc-200/80 dark:border-white/[0.08]
                    text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400/50
                    transition-all"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1">
                {[...Array(4)].map((_, i) => {
                  const strength = Math.min(Math.floor(newPassword.length / 3), 4);
                  const colors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < strength ? colors[strength - 1] : 'bg-zinc-200 dark:bg-white/[0.06]'
                      }`}
                    />
                  );
                })}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-emerald-600 hover:bg-emerald-500 text-white
                border border-emerald-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : 'Confirm new password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Reset;
