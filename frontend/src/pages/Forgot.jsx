import { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEmailSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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

          <AnimatePresence mode="wait">
            {!emailSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                    <Key size={18} className="text-amber-500" />
                  </div>
                  <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-1">Forgot password?</h1>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono leading-relaxed">
                    Enter your email and we'll send a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Email address
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
                          focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/50
                          transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                      bg-amber-500 hover:bg-amber-400 text-white
                      border border-amber-400/80
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : 'Send reset link'}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-2">Check your inbox</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
                    If an account exists for
                  </p>
                  <p className="font-mono text-sm text-indigo-500 dark:text-indigo-400 mb-5">{email}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                    you'll receive a password reset link shortly.
                  </p>
                  <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                    Didn't receive it?{' '}
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Forgot;
