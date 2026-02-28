import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import {
  User, Camera, Clock, ArrowLeft, Shield, Upload, LogOut,
  Mail, Calendar, Activity, Hash,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const StatPill = ({ label, value }) => (
  <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/[0.06]">
    <span className="font-display font-bold text-lg text-zinc-900 dark:text-white leading-none mb-1">{value}</span>
    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>
  </div>
);

const Profile = () => {
  const { user: authUser, refreshUser, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imgKey, setImgKey] = useState(Date.now());
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [authUser, imgKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/files/history');
        setHistory(res.data.history);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setImgError(false);
    const formData = new FormData();
    formData.append('image', file);
    const loadingToast = toast.loading('Updating profile picture…');
    try {
      await api.post('/files/upload/profile', formData);
      await refreshUser();
      setImgKey(Date.now());
      toast.success('Profile picture updated!', { id: loadingToast });
    } catch {
      toast.error('Failed to update image', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const initials = authUser?.full_name
    ? authUser.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-[80vh]">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white leading-none">Profile</h1>
            <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Manage your account</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
            text-rose-500 dark:text-rose-400
            bg-rose-500/8 dark:bg-rose-500/8
            border border-rose-500/15 dark:border-rose-500/15
            hover:bg-rose-500/15 transition-all"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left: User Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-1"
        >
          <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-card p-6 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative group mb-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 dark:border-white/[0.08] flex items-center justify-center relative shadow-glow-sm">
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 rounded-2xl">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  </div>
                )}
                {authUser?.profile_picture && !imgError ? (
                  <img
                    key={imgKey}
                    src={authUser.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="font-display font-bold text-2xl text-indigo-400">{initials}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer shadow-glow-sm transition-all group-hover:scale-110 z-30 border border-indigo-500">
                <Camera size={12} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
              </label>
            </div>

            {/* Name */}
            <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-white mb-1 text-center">
              {authUser?.full_name || 'User'}
            </h2>

            {/* Email */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mb-4">
              <Mail size={11} />
              {authUser?.email}
            </div>

            {/* Role badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
              authUser?.role === 'admin'
                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <Shield size={10} />
              {authUser?.role || 'User'}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 w-full mt-6">
              <StatPill label="Files" value={history.length || '0'} />
              <StatPill label="Actions" value={history.length || '0'} />
            </div>

            {/* Details */}
            <div className="w-full mt-5 pt-5 border-t border-zinc-100 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-mono">
                  <Calendar size={12} /> Date of Birth
                </span>
                <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300 text-[11px]">
                  {authUser?.dob || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-mono">
                  <Clock size={12} /> Joined
                </span>
                <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300 text-[11px]">
                  Dec 2025
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Right: Activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2"
        >
          <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-card p-6 h-full">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                <Activity size={14} className="text-indigo-400" />
              </div>
              <h3 className="font-display font-semibold text-zinc-900 dark:text-white">Recent Activity</h3>
              {!loading && (
                <span className="ml-auto font-mono text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] px-2 py-0.5 rounded">
                  {history.length} events
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] flex items-center justify-center">
                  <Activity size={20} className="text-zinc-300 dark:text-zinc-700" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">No activity yet</p>
                  <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">Upload and analyze files to see activity here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {history.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-4 p-4 rounded-xl
                        bg-zinc-50 dark:bg-white/[0.02]
                        border border-zinc-100/80 dark:border-white/[0.05]
                        hover:border-indigo-300/40 dark:hover:border-indigo-500/20
                        transition-all group"
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center
                        bg-indigo-500/8 dark:bg-indigo-500/8 border border-indigo-500/15
                        group-hover:bg-indigo-500/15 transition-colors"
                      >
                        {log.action.toLowerCase().includes('upload') ? (
                          <Upload size={13} className="text-indigo-400" />
                        ) : (
                          <Activity size={13} className="text-indigo-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{log.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Hash size={9} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                          <code className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 truncate">{log.route}</code>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <time className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 shrink-0">
                        {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </time>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
