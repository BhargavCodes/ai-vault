import { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Forgot = () => {
  const [name, setName] = useState('');
  const [token, setToken] = useState(''); // To show the token for demo purposes
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToken(''); // Clear previous token
    
    try {
      const res = await api.post('/auth/forgot-password', { name });
      
      // In a real app, this goes to email.
      // For this DEMO, we grab it from response to show the user.
      const demoToken = res.data.reset_token;
      setToken(demoToken);
      
      toast.success("Reset token generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "User not found");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("Token copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition">
            <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-fit mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400 mt-2">Enter your username to receive a reset token.</p>
        </div>

        {!token ? (
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Username</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter username"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-all bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
            >
                {loading ? 'Generating Token...' : 'Request Reset Token'}
            </button>
            </form>
        ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center dark:bg-green-900/20 dark:border-green-800">
                <p className="text-green-800 font-bold text-sm mb-2 dark:text-green-300">Token Generated Successfully!</p>
                <p className="text-xs text-gray-600 mb-3 dark:text-gray-400">Copy this token and proceed to Reset Password.</p>
                
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2 mb-4 overflow-hidden dark:bg-gray-800 dark:border-gray-600">
                    <code className="text-xs text-gray-600 truncate flex-1 dark:text-gray-300">{token}</code>
                    <button onClick={copyToken} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                        {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                    </button>
                </div>

                <Link to="/reset-password" className="block w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-all bg-green-600 hover:bg-green-700">
                    Go to Reset Page
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Forgot;