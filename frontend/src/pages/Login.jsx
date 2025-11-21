import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Call the login function from our AuthContext
      await login(name, password);
      // If successful, go to Dashboard
      navigate('/dashboard');
    } catch (err) {
      // Show error message from backend or a default one
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400">Sign in to access your AI files</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Username</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                    Forgot Password?
                </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-all 
              ${isSubmitting ? 'bg-blue-400 cursor-not-allowed dark:bg-blue-600/50' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-500'}`}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-medium dark:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;