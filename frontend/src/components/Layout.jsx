import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { Sparkles, LogOut, User, ShieldAlert, Moon, Sun, LayoutDashboard, ChevronDown, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
        isActive
          ? 'text-white dark:text-white text-zinc-900'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg bg-zinc-900 dark:bg-white/10 border border-zinc-800 dark:border-white/10"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <Icon size={15} className="relative z-10 shrink-0" />
      <span className="relative z-10">{label}</span>
    </Link>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0f] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
      {/* Subtle top glow in dark mode */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-glow-indigo dark:block hidden pointer-events-none" />

      {/* ── Floating Glassmorphic Navbar ── */}
      <div className="sticky top-0 z-50 px-4 pt-3">
        <nav className="max-w-7xl mx-auto glass-light dark:glass-dark rounded-xl shadow-glass">
          <div className="px-4 h-12 flex items-center justify-between gap-4">

            {/* Left: Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
                <Sparkles size={14} fill="white" className="text-white" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                AI Vault
              </span>
            </Link>

            {/* Center: Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavLink to="/profile" icon={User} label="Profile" />
              <NavLink to="/settings" icon={Settings} label="Settings" />
              {user?.role === 'admin' && (
                <NavLink to="/admin" icon={ShieldAlert} label="Admin" />
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/6 transition-colors"
                title="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/6 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  {/* Avatar */}
                  <div className="relative w-6 h-6 rounded-md overflow-hidden bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    {user?.profile_picture ? (
                      <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-mono text-[9px] font-bold text-indigo-400">{initials}</span>
                    )}
                  </div>
                  <span className="hidden sm:block text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={13} className="text-zinc-400" />
                  </motion.div>
                </motion.button>

                {/* Premium Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2 w-60 glass-light dark:glass-dark rounded-xl shadow-glass overflow-hidden z-[100]"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-white/6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-glow-sm">
                            {user?.profile_picture ? (
                              <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-mono text-xs font-bold text-white">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate font-display">{user?.full_name}</p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">{user?.email}</p>
                          </div>
                        </div>
                        {user?.role === 'admin' && (
                          <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded-md w-fit">
                            <Zap size={10} className="text-violet-400" />
                            <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">Admin</span>
                          </div>
                        )}
                      </div>

                      {/* Nav Items — Bento style */}
                      <div className="p-2 space-y-0.5">
                        {[
                          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/profile', icon: User, label: 'Profile' },
                          { to: '/settings', icon: Settings, label: 'Settings' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all group"
                          >
                            <Icon size={14} className="group-hover:text-indigo-500 transition-colors" />
                            {label}
                          </Link>
                        ))}

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-500 dark:text-violet-400 hover:bg-violet-500/10 transition-all group"
                          >
                            <ShieldAlert size={14} />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-2 border-t border-zinc-200/60 dark:border-white/6">
                        <button
                          onClick={() => { logout(); setIsDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-all text-left"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
