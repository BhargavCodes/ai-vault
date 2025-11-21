import { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { Sparkles, LogOut, User, ShieldAlert, Moon, Sun, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    // 1. Universal Background
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      
      {/* 2. Universal Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo - Points to Dashboard now */}
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg text-white shadow-lg">
                    <Sparkles size={20} fill="white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400">
                    AI Vault
                </h1>
            </Link>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition" title="Toggle Theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition group dark:hover:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200 group-hover:border-blue-400 transition dark:bg-gray-600 dark:border-gray-500">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} className="text-blue-600 dark:text-blue-300" />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 hidden sm:block group-hover:text-blue-700 transition dark:text-gray-200 dark:group-hover:text-blue-400">
                            {user?.name}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 dark:bg-gray-800 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Signed in as</p>
                                <p className="text-sm font-bold text-gray-800 truncate dark:text-white">{user?.name}</p>
                            </div>

                            <Link 
                                to="/dashboard" 
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <LayoutDashboard size={16} /> Dashboard
                            </Link>

                            <Link 
                                to="/profile" 
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <User size={16} /> Profile
                            </Link>

                            <Link 
                                to="/settings" 
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <Settings size={16} /> Settings
                            </Link>

                            {user?.role === 'admin' && (
                                <Link 
                                    to="/admin" 
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition dark:text-purple-400 dark:hover:bg-purple-900/20"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <ShieldAlert size={16} /> Admin Console
                                </Link>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                            <button 
                                onClick={() => { logout(); setIsDropdownOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Content Injection */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;