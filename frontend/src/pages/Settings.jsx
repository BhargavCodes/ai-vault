import { useState } from 'react';
import api from '../api';
import { Lock, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Updating password...");

    try {
      await api.put('/auth/change-password', { 
        old_password: oldPassword, 
        new_password: newPassword 
      });
      toast.success("Password updated successfully!", { id: loadingToast });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition dark:text-gray-300 dark:hover:bg-gray-700">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 dark:bg-gray-800 dark:border-gray-700">
            
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Lock size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Change Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your password to keep your account secure</p>
                </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Current Password</label>
                    <input 
                        type="password" 
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">New Password</label>
                    <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                    >
                        {loading ? "Saving..." : "Update Password"} <Save size={18} />
                    </button>
                </div>
            </form>

        </div>
      </main>
    </div>
  );
};

export default Settings;