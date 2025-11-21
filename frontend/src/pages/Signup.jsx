import { useState } from 'react';
import api from '../api'; // We use direct API call here, then redirect
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Call Backend Signup
      await api.post('/auth/signup', { 
        name, 
        age: parseInt(age), // Ensure age is a number
        password 
      });
      
      toast.success("Account created! Please log in.");
      
      // 2. Redirect to Login Page
      navigate('/login');
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        
        <div className="text-center mb-8">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400">Join AI Vault today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Username</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-purple-400"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Age</label>
            <input
              type="number"
              required
              min="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-purple-400"
              placeholder="Your age"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-purple-400"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-all 
              ${isSubmitting ? 'bg-purple-400 cursor-not-allowed dark:bg-purple-600/50' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg dark:bg-purple-600 dark:hover:bg-purple-500'}`}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:underline font-medium dark:text-purple-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;