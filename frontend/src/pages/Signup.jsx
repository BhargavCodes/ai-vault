import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight, User, Mail, Calendar, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/signup', {
        full_name: fullName,
        email,
        dob,
        password,
      });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
      id: 'name', label: 'Full Name', type: 'text', icon: User,
      value: fullName, onChange: (e) => setFullName(e.target.value),
      placeholder: 'John Doe', required: true,
    },
    {
      id: 'email', label: 'Email', type: 'email', icon: Mail,
      value: email, onChange: (e) => setEmail(e.target.value),
      placeholder: 'you@example.com', required: true,
    },
    {
      id: 'dob', label: 'Date of Birth', type: 'date', icon: Calendar,
      value: dob, onChange: (e) => setDob(e.target.value),
      placeholder: '', required: true,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0f] px-4 relative overflow-hidden py-10">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-glow-violet pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-glass p-8">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-sm mb-4">
              <Sparkles size={18} fill="white" className="text-white" />
            </div>
            <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-1">Create account</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">Join AI Vault today — free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Standard fields */}
            {fields.map(({ id, label, type, icon: Icon, value, onChange, placeholder, required }) => (
              <div key={id}>
                <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  {label}
                </label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none z-10" />
                  <input
                    type={type}
                    required={required}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl
                      bg-zinc-100/80 dark:bg-white/[0.05]
                      border border-zinc-200/80 dark:border-white/[0.08]
                      text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
                      focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/50 dark:focus:border-violet-500/40
                      transition-all"
                  />
                </div>
              </div>
            ))}

            {/* Password field */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
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
                    focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/50 dark:focus:border-violet-500/40
                    transition-all"
                  placeholder="Min. 8 characters"
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

            {/* Password strength indicator */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = Math.min(Math.floor(password.length / 3), 4);
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
                  {password.length < 6 ? 'Too short' : password.length < 9 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-violet-600 hover:bg-violet-500 text-white
                border border-violet-500 shadow-glow-sm hover:shadow-glow-md
                disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>Create account <ArrowRight size={14} /></>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-500 dark:text-violet-400 hover:text-violet-400 dark:hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
