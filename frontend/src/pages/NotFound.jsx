import { Link } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans p-4 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
        <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-6 dark:bg-purple-900/30">
            <Ghost size={48} className="text-purple-600 dark:text-purple-400" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 dark:text-white">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 dark:text-gray-300">Page Not Found</h2>
        
        <p className="text-gray-500 mb-8 dark:text-gray-400">
            Oops! The page you are looking for doesn't exist or has been moved.
        </p>

        <Link 
            to="/" 
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
        >
            <Home size={18} /> Go Home
        </Link>
      </div>

    </div>
  );
};

export default NotFound;