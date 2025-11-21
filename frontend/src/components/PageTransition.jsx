import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(5px)', scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(5px)', scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;