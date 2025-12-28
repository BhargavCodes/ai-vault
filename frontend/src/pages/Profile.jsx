// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { User, Camera, Clock, ArrowLeft, Shield, Upload, LogOut, Mail, Calendar } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user: authUser, refreshUser, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imgKey, setImgKey] = useState(Date.now());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [authUser, imgKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/files/history');
        setHistory(res.data.history);
      } catch (err) {
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

    const loadingToast = toast.loading("Updating profile picture...");

    try {
      await api.post('/files/upload/profile', formData);
      await refreshUser();
      setImgKey(Date.now());
      toast.success("Profile picture updated!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to update image", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      
      {/* Page Header (Sub-nav) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition dark:text-gray-300 dark:hover:bg-gray-700">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">User Profile</h1>
            </div>
            
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900/20">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
            </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: User Card */}
        <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center dark:bg-gray-800 dark:border-gray-700">
                
                {/* Avatar Upload */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 mb-4 bg-gray-100 flex items-center justify-center relative dark:border-gray-600 dark:bg-gray-700">
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
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
                            <User size={48} className="text-gray-400 dark:text-gray-500" />
                        )}
                    </div>
                    <label className="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition group-hover:scale-110 z-30">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                    </label>
                </div>

                {/* ✅ Display Full Name */}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{authUser?.full_name || "User"}</h2>
                
                {/* ✅ Display Email */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Mail size={14} />
                    {authUser?.email || "No email"}
                </div>

                <div className="flex items-center gap-2 mt-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide dark:bg-blue-900/30 dark:text-blue-300">
                    <Shield size={12} />
                    {authUser?.role || "User"}
                </div>

                {/* ✅ Extra Details: DOB */}
                <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Calendar size={14}/> Date of Birth</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{authUser?.dob || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Clock size={14}/> Joined</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Dec 2025</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Activity History (Unchanged) */}
        <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No activity recorded yet.</div>
                ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-gray-600">
                        {history.map((log) => (
                            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-hover:bg-blue-500 transition shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white dark:border-gray-800 dark:bg-gray-600">
                                    {log.action.includes("Uploaded") ? <Upload size={16}/> : <Clock size={16}/>}
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition dark:bg-gray-700 dark:border-gray-600">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-gray-900 text-sm dark:text-white">{log.action}</div>
                                        <time className="font-caveat font-medium text-xs text-gray-400 dark:text-gray-500">
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </time>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        Route: <code className="bg-gray-200 px-1 rounded dark:bg-gray-600 dark:text-gray-300">{log.route}</code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </main>
    </div>
  );
};

export default Profile;