import { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail, CheckCircle } from 'lucide-react'; // Added Mail icon
import toast from 'react-hot-toast';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // New state to track success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Send Email to Backend
      await api.post('/auth/forgot-password', { email });
      
      // 2. Show Success State (Backend no longer returns the token)
      setEmailSent(true);
      toast.success("Reset link sent to your email!");
      
    } catch (err) {
      // Even if email doesn't exist, we usually don't want to tell the user that (security)
      // But if the backend sends a specific error, we show it.
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition">
            <ArrowLeft size={16} /> Back to Login
        </Link>

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-fit mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400 mt-2">
            {!emailSent ? "Enter your email to receive a reset link." : "Check your inbox!"}
          </p>
        </div>

        {/* STATE 1: FORM */}
        {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email Address</label>
                <div className="relative">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="john@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-all bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
            >
                {loading ? 'Sending Email...' : 'Send Reset Link'}
            </button>
            </form>
        ) : (
            /* STATE 2: SUCCESS MESSAGE */
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center dark:bg-green-900/20 dark:border-green-800">
                <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 dark:bg-green-800">
                    <CheckCircle className="text-green-600 dark:text-green-300" size={24} />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 dark:text-white">Email Sent!</h3>
                <p className="text-sm text-gray-600 mb-6 dark:text-gray-300">
                    If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Did not receive it? Check your spam folder or <button onClick={() => setEmailSent(false)} className="text-amber-600 hover:underline font-bold">try again</button>.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Forgot;