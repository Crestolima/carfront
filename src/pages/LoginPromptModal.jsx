import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPromptModal = ({ 
  isOpen, 
  onClose, 
  message = "Unlock full access by logging in or creating an account.",
  redirectLogin = '/login',
  redirectRegister = '/register'
}) => {
  const navigate = useNavigate();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 350, 
        damping: 20 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.15 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-5">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Access Restricted
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate(redirectLogin)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
                <button
                  onClick={() => navigate(redirectRegister)}
                  className="flex items-center justify-center gap-2 border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Register
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;