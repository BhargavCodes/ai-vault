import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, Zap, FileText, MessageSquare, ArrowRight,
  LayoutDashboard, Moon, Sun, Search, User, ShieldAlert, LogOut,
  ChevronDown, Settings, Tag, Hash, FileImage, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// ── Animated gradient orb ──
const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
);

// ── Feature card ──
const FeatureCard = ({ icon: Icon, iconColor, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4 }}
    className="group relative p-6 rounded-2xl
      bg-white dark:bg-white/[0.03]
      border border-zinc-200/80 dark:border-white/[0.07]
      hover:border-indigo-300/60 dark:hover:border-indigo-500/25
      shadow-light-card dark:shadow-card
      hover:shadow-light-card-hover dark:hover:shadow-card-hover
      transition-all duration-300 card-shine overflow-hidden"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${iconColor} bg-current/10`}>
      <Icon size={18} className={iconColor.split(' ')[0]} />
    </div>
    <h3 className="font-display font-semibold text-zinc-900 dark:text-white mb-2 text-base">{title}</h3>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </motion.div>
);

// ── Mock Dashboard Card ──
const MockCard = ({ tags, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/[0.08] p-4 shadow-light-card dark:shadow-card"
  >
    <div className="h-24 rounded-lg bg-zinc-100 dark:bg-white/[0.04] mb-3 flex items-center justify-center border border-zinc-200/40 dark:border-white/[0.05]">
      <FileText size={28} className="text-zinc-300 dark:text-zinc-700" />
    </div>
    <div className="h-2.5 bg-zinc-200 dark:bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-2 bg-zinc-100 dark:bg-white/[0.05] rounded w-1/2 mb-3" />
    <div className="flex gap-1.5">
      {tags.map((t, i) => (
        <span key={i} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${t}`}>
          #{i === 0 ? 'invoice' : i === 1 ? 'finance' : 'q4'}
        </span>
      ))}
    </div>
  </motion.div>
);

const Landing = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 600], [0, 80]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0.5]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const features = [
    { icon: FileText, iconColor: 'text-sky-400 border-sky-500/20', title: 'Smart OCR & Parsing', desc: 'Extract text from PDFs, images, and Word docs automatically on upload.', delay: 0 },
    { icon: MessageSquare, iconColor: 'text-violet-400 border-violet-500/20', title: 'Chat with Data (RAG)', desc: 'Ask questions about your files. Get instant, context-aware answers.', delay: 0.06 },
    { icon: Zap, iconColor: 'text-amber-400 border-amber-500/20', title: 'Instant Summaries', desc: 'Concise AI-generated summaries for long documents and reports in seconds.', delay: 0.12 },
    { icon: ShieldCheck, iconColor: 'text-emerald-400 border-emerald-500/20', title: 'Secure Cloud Storage', desc: 'Enterprise-grade encryption keeps your files safe in the cloud.', delay: 0.18 },
    { icon: Tag, iconColor: 'text-indigo-400 border-indigo-500/20', title: 'Auto-Tagging', desc: 'AI detects content and automatically tags files for frictionless search.', delay: 0.24 },
    { icon: LayoutDashboard, iconColor: 'text-rose-400 border-rose-500/20', title: 'Modern Dashboard', desc: 'A fluid, dark-mode-first interface designed for deep focus and productivity.', delay: 0.30 },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0f] text-zinc-900 dark:text-zinc-100 font-sans overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
      <Orb className="fixed top-[-15vh] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/8" />

      {/* ── Navbar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 px-4 pt-3"
      >
        <nav className="max-w-6xl mx-auto glass-light dark:glass-dark rounded-xl shadow-glass">
          <div className="px-4 h-12 flex items-center justify-between gap-4">
            {/* Brand */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
                <Sparkles size={14} fill="white" className="text-white" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                AI Vault
              </span>
            </button>

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-all">
                Features
              </a>
              <a href="#how-it-works" className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-all">
                How it works
              </a>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/6 transition-colors"
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

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/6 transition-colors group outline-none"
                  >
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      {user.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-mono text-[9px] font-bold text-indigo-400">{initials}</span>
                      )}
                    </div>
                    <span className="hidden sm:block text-xs font-medium text-zinc-600 dark:text-zinc-400">{user.full_name?.split(' ')[0]}</span>
                    <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={13} className="text-zinc-400" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-52 glass-light dark:glass-dark rounded-xl shadow-glass overflow-hidden z-[100]"
                      >
                        <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-white/6">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate font-display">{user.full_name}</p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">{user.email}</p>
                        </div>
                        <div className="p-2 space-y-0.5">
                          {[
                            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                            { to: '/profile', icon: User, label: 'Profile' },
                            { to: '/settings', icon: Settings, label: 'Settings' },
                          ].map(({ to, icon: Icon, label }) => (
                            <Link key={to} to={to} onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                            >
                              <Icon size={14} /> {label}
                            </Link>
                          ))}
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-500 dark:text-violet-400 hover:bg-violet-500/10 transition-all"
                            >
                              <ShieldAlert size={14} /> Admin Console
                            </Link>
                          )}
                        </div>
                        <div className="p-2 border-t border-zinc-200/60 dark:border-white/6">
                          <button onClick={() => { logout(); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-all text-left"
                          >
                            <LogOut size={14} /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="hidden sm:block px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Link to="/signup">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white
                        bg-indigo-600 hover:bg-indigo-500 border border-indigo-500
                        shadow-glow-sm hover:shadow-glow-md transition-all"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </motion.div>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8
            bg-indigo-500/8 dark:bg-indigo-500/10
            border border-indigo-500/20 dark:border-indigo-500/20
            text-indigo-600 dark:text-indigo-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
            Gemini 2.5 Flash · Now Live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-[1.04] mb-6 text-zinc-900 dark:text-white"
        >
          Your files,{' '}
          <span className="relative">
            <span className="text-gradient">supercharged</span>
          </span>
          <br />with AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Upload documents and images. Let AI analyze, summarize, and tag them instantly.
          Then chat with your files like never before.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to={user ? '/dashboard' : '/signup'}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white
                bg-indigo-600 hover:bg-indigo-500 border border-indigo-500
                shadow-glow-sm hover:shadow-glow-md transition-all duration-200"
            >
              {user ? 'Go to Dashboard' : 'Start for free'}
              <ArrowRight size={16} />
            </motion.button>
          </Link>
          <a href="#features">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                text-zinc-600 dark:text-zinc-300
                bg-zinc-100 dark:bg-white/[0.05]
                border border-zinc-200/80 dark:border-white/[0.08]
                hover:bg-zinc-200/80 dark:hover:bg-white/[0.08]
                transition-all duration-200"
            >
              See features
            </motion.button>
          </a>
        </motion.div>
      </section>

      {/* ── Hero Dashboard Mockup ── */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          style={{ y: yHero, opacity: opacityHero }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-indigo-500/15 via-violet-500/8 to-transparent dark:from-indigo-500/12 dark:via-violet-500/6 blur-2xl" />

          {/* Browser chrome */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl dark:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            {/* Title bar */}
            <div className="bg-zinc-100 dark:bg-[#0f0f17] border-b border-zinc-200/60 dark:border-white/[0.06] h-9 flex items-center px-4 gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 max-w-xs mx-auto">
                <div className="h-5 bg-zinc-200 dark:bg-white/[0.06] rounded-md w-full flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="h-1.5 w-24 bg-zinc-300 dark:bg-white/10 rounded" />
                </div>
              </div>
            </div>

            {/* App chrome */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0f] p-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-5 w-24 bg-zinc-200 dark:bg-white/10 rounded mb-1.5" />
                  <div className="h-3 w-16 bg-zinc-100 dark:bg-white/5 rounded" />
                </div>
                <div className="w-24 h-8 rounded-lg bg-indigo-600/80 dark:bg-indigo-600/60 border border-indigo-500/40" />
              </div>

              {/* File cards */}
              <div className="grid grid-cols-3 gap-4">
                <MockCard
                  delay={0.6}
                  tags={['bg-indigo-500/10 text-indigo-400 border-indigo-500/20', 'bg-violet-500/10 text-violet-400 border-violet-500/20']}
                />
                <MockCard
                  delay={0.7}
                  tags={['bg-sky-500/10 text-sky-400 border-sky-500/20', 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20']}
                />
                <MockCard
                  delay={0.8}
                  tags={['bg-rose-500/10 text-rose-400 border-rose-500/20', 'bg-amber-500/10 text-amber-400 border-amber-500/20']}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-200/60 dark:border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="font-mono text-[11px] uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-3">Features</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-zinc-900 dark:text-white mb-4">
            Everything you need to manage assets
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
            Powerful AI features to help you organize, analyze, and retrieve your information at the speed of thought.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-200/60 dark:border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="font-mono text-[11px] uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-3">Workflow</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-zinc-900 dark:text-white">Three steps to AI clarity</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {[
            { step: '01', icon: ArrowUpRight, title: 'Upload', desc: 'Drag & drop any file — PDFs, images, Word docs. Stored securely in the cloud instantly.' },
            { step: '02', icon: Sparkles, title: 'Analyze', desc: 'One click triggers AI processing: OCR, summarization, auto-tagging, and smart naming.' },
            { step: '03', icon: MessageSquare, title: 'Chat', desc: 'Ask questions in natural language. Get precise, context-aware answers from your own files.' },
          ].map(({ step, icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center
                bg-indigo-500/8 dark:bg-indigo-500/8
                border border-indigo-500/15 dark:border-indigo-500/15
                shadow-glow-sm"
              >
                <Icon size={22} className="text-indigo-400" />
              </div>
              <p className="font-mono text-[10px] text-indigo-400/60 dark:text-indigo-500/60 uppercase tracking-widest mb-2">{step}</p>
              <h3 className="font-display font-semibold text-zinc-900 dark:text-white mb-2 text-lg">{title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden p-10 text-center
            bg-gradient-to-br from-indigo-600 to-violet-700
            border border-indigo-500/30 shadow-glow-lg"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <Orb className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-white/10" />
          <div className="relative z-10">
            <p className="font-mono text-[11px] uppercase tracking-widest text-indigo-200/70 mb-3">Get started today</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Unlock the intelligence<br />inside your files
            </h2>
            <p className="text-indigo-200/80 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Transform how you work with documents. Free to start, forever.
            </p>
            <Link to={user ? '/dashboard' : '/signup'}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm
                  bg-white text-indigo-700 hover:bg-indigo-50
                  shadow-lg hover:shadow-xl transition-all"
              >
                {user ? 'Open Dashboard' : 'Create Free Account'}
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200/60 dark:border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
              <Sparkles size={14} fill="white" className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">AI Vault</span>
          </div>
          <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
            © 2026 AI Vault Inc. Built for the future.
          </p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a key={item} href="#" className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;