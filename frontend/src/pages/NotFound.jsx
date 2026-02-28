import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0f] px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-glow-indigo pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/8 dark:bg-indigo-500/8 border border-indigo-500/15 dark:border-indigo-500/15 flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={28} className="text-indigo-400" />
        </div>

        {/* Code */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-3">
          Error 404
        </p>

        {/* Headline */}
        <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white mb-3">
          Page not found
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTA */}
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-indigo-600 hover:bg-indigo-500 text-white
              border border-indigo-500 shadow-glow-sm hover:shadow-glow-md
              transition-all"
          >
            <ArrowLeft size={14} />
            Back to home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
