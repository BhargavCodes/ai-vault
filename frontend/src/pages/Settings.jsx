import { useState } from 'react';
import api from '../api';
import { Lock, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const loadingToast = toast.loading('Updating password…');
    try {
      await api.put('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success('Password updated!', { id: loadingToast });
      setOldPassword('');
      setNewPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div>
      <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={onChange}
          className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl
            bg-zinc-100/80 dark:bg-white/[0.05]
            border border-zinc-200/80 dark:border-white/[0.08]
            text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/50 dark:focus:border-indigo-500/40
            transition-all"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] max-w-xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 mb-8"
      >
        <Link
          to="/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white leading-none">Settings</h1>
          <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Account preferences</p>
        </div>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-card p-6"
      >
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-zinc-100 dark:border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
            <Lock size={16} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-zinc-900 dark:text-white text-sm">Change Password</h2>
            <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">Keep your account secure with a strong password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            show={showOld}
            onToggle={() => setShowOld(!showOld)}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="Choose a strong password"
          />

          {/* Strength bar */}
          {newPassword.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => {
                  const strength = Math.min(Math.floor(newPassword.length / 3), 4);
                  const colors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500'];
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < strength ? colors[strength - 1] : 'bg-zinc-200 dark:bg-white/[0.06]'
                      }`}
                    />
                  );
                })}
              </div>
              <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                {newPassword.length < 6 ? 'Too short' : newPassword.length < 9 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
              </p>
            </motion.div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-500 text-white
                border border-indigo-500 shadow-glow-sm hover:shadow-glow-md
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : 'Update password'}
            </motion.button>

            {/* Success indicator */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-500 dark:text-emerald-400"
                >
                  <ShieldCheck size={14} />
                  Password updated!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>

      {/* Security tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.05] p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-3">Security tips</p>
        <div className="space-y-2">
          {[
            'Use at least 12 characters',
            'Mix uppercase, lowercase, numbers, and symbols',
            'Avoid reusing passwords from other services',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/40 mt-1.5 shrink-0" />
              <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
