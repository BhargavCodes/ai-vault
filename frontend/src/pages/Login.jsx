import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0f] px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-glow-indigo pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Card */}
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-glass p-8">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm mb-4">
              <Sparkles size={18} fill="white" className="text-white" />
            </div>
            <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-1">Welcome back</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">Sign in to your AI Vault</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-rose-500/8 dark:bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl
                    bg-zinc-100/80 dark:bg-white/[0.05]
                    border border-zinc-200/80 dark:border-white/[0.08]
                    text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/50 dark:focus:border-indigo-500/40
                    transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="font-mono text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl
                    bg-zinc-100/80 dark:bg-white/[0.05]
                    border border-zinc-200/80 dark:border-white/[0.08]
                    text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/50 dark:focus:border-indigo-500/40
                    transition-all"
                  placeholder="••••••••"
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

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-500 text-white
                border border-indigo-500 shadow-glow-sm hover:shadow-glow-md
                disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
            No account?{' '}
            <Link to="/signup" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
