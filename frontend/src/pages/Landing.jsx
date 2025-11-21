import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, FileText, MessageSquare, ArrowRight, LayoutDashboard, Moon, Sun, Search, User, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { motion, useScroll, useTransform } from 'framer-motion'; // <--- IMPORT ANIMATION LIBRARY

const Landing = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Parallax effect for hero image
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);

  // Scroll to Top Function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-x-hidden">
      
      {/* 1. Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800"
      >
        
        <button 
            onClick={scrollToTop} 
            className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none"
        >
            <motion.div 
                whileHover={{ rotate: 20 }}
                className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg"
            >
                <Sparkles size={20} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400">
                AI Vault
            </span>
        </button>
        
        <div className="flex items-center gap-4">
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme} 
                className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle Dark Mode"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            {user ? (
                <div className="relative" ref={dropdownRef}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition group dark:hover:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200 group-hover:border-blue-400 transition dark:bg-gray-700 dark:border-gray-600">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} className="text-blue-600 dark:text-blue-300" />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 hidden sm:block group-hover:text-blue-700 transition dark:text-gray-200 dark:group-hover:text-blue-400">
                            {user.name}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {isDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 dark:bg-gray-800 dark:border-gray-700"
                        >
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Signed in as</p>
                                <p className="text-sm font-bold text-gray-800 truncate dark:text-white">{user.name}</p>
                            </div>

                            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400" onClick={() => setIsDropdownOpen(false)}>
                                <LayoutDashboard size={16} /> Dashboard
                            </Link>

                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400" onClick={() => setIsDropdownOpen(false)}>
                                <User size={16} /> Profile
                            </Link>

                            {user.role === 'admin' && (
                                <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition dark:text-purple-400 dark:hover:bg-purple-900/20" onClick={() => setIsDropdownOpen(false)}>
                                    <ShieldAlert size={16} /> Admin Console
                                </Link>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                            <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left dark:text-red-400 dark:hover:bg-red-900/20">
                                <LogOut size={16} /> Logout
                            </button>
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Link to="/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 dark:text-gray-300 dark:hover:text-white">
                        Sign In
                    </Link>
                    <Link to="/signup">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                        >
                            Get Started
                        </motion.button>
                    </Link>
                </div>
            )}
        </div>
      </motion.nav>

      {/* 2. Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                New: Gemini 2.5 Flash Integration
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gray-900 dark:text-white">
                Your Files, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Supercharged</span> with AI.
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed dark:text-gray-400">
                Upload documents, images, and notes. Let our advanced AI analyze, summarize, and tag them instantly. Chat with your files like never before.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={user ? "/dashboard" : "/signup"}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                    >
                        {user ? "Go to Dashboard" : "Start for Free"} <ArrowRight size={20} />
                    </motion.button>
                </Link>
                <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
                    See Features
                </a>
            </motion.div>
        </motion.div>

        {/* 🎨 CSS-Based Dashboard Mockup */}
        <motion.div 
            style={{ y: yHero }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 relative group"
        >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-gray-50 rounded-xl border border-gray-200 shadow-2xl overflow-hidden dark:bg-gray-900 dark:border-gray-700">
                <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="h-8 bg-gray-100 rounded-lg w-64 mx-auto flex items-center px-3 gap-2 dark:bg-gray-700">
                            <Search size={14} className="text-gray-400" />
                            <div className="h-2 w-24 bg-gray-200 rounded dark:bg-gray-600"></div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700"></div>
                    </div>
                </div>
                <div className="flex h-96">
                    <div className="w-16 sm:w-48 border-r border-gray-200 bg-white hidden sm:block p-4 dark:bg-gray-800 dark:border-gray-700">
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-8 bg-gray-100 rounded-lg w-full dark:bg-gray-700"></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 dark:bg-gray-700 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                            <FileText size={32} />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
                                    <div className="h-3 bg-gray-50 rounded w-1/2 dark:bg-gray-800"></div>
                                    <div className="flex gap-2 mt-3">
                                        <div className="h-5 w-12 bg-blue-50 rounded-full dark:bg-blue-900/20"></div>
                                        <div className="h-5 w-16 bg-purple-50 rounded-full dark:bg-purple-900/20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="bg-white py-24 border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to manage assets</h2>
                <p className="text-gray-500 dark:text-gray-400">Powerful features to help you organize, analyze, and retrieve information.</p>
            </motion.div>

            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-8"
            >
                {[
                    { icon: <FileText className="text-blue-600" size={32} />, title: "Smart OCR & Parsing", desc: "Extract text from PDFs, Images, and Word docs automatically upon upload." },
                    { icon: <MessageSquare className="text-purple-600" size={32} />, title: "Chat with Data (RAG)", desc: "Ask questions about your files. \"What is the total in this invoice?\" and get instant answers." },
                    { icon: <Zap className="text-amber-500" size={32} />, title: "Instant Summaries", desc: "Get concise bullet-point summaries for long documents and reports in seconds." },
                    { icon: <ShieldCheck className="text-green-600" size={32} />, title: "Secure Cloud Storage", desc: "Your files are encrypted and stored safely in the cloud with enterprise-grade security." },
                    { icon: <Sparkles className="text-pink-500" size={32} />, title: "Auto-Tagging", desc: "AI automatically detects content and tags your files for easy searching." },
                    { icon: <LayoutDashboard className="text-indigo-600" size={32} />, title: "Modern Dashboard", desc: "A dark-mode enabled, responsive interface designed for productivity." },
                ].map((feature, i) => (
                    <motion.div 
                        key={i} 
                        variants={fadeInUp}
                        whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                        className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700"
                    >
                        <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm dark:bg-gray-700">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-white">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed dark:text-gray-400">
                            {feature.desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-gray-900 p-1.5 rounded-lg dark:bg-white">
                    <Sparkles size={16} className="text-white dark:text-gray-900" />
                </div>
                <span className="font-bold text-lg dark:text-white">AI Vault</span>
            </div>
            <p className="text-gray-500 text-sm">
                © 2025 AI Vault Inc. Built for the Future.
            </p>
            <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                <a href="#" className="hover:text-blue-600">Privacy</a>
                <a href="#" className="hover:text-blue-600">Terms</a>
                <a href="#" className="hover:text-blue-600">Contact</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;