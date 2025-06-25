import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

const AuthModal = ({ show, onClose }) => {
  const [authType, setAuthType] = useState('login');

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-gray-800/90 backdrop-blur-lg rounded-xl max-w-md w-full p-8 relative border border-gray-700"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>

            {authType === 'login' ? (
              <LoginForm 
                switchToRegister={() => setAuthType('register')} 
                switchToForgotPassword={() => setAuthType('forgot-password')}
              />
            ) : authType === 'register' ? (
              <RegisterForm switchToLogin={() => setAuthType('login')} />
            ) : (
              <ForgotPasswordForm onBackToLogin={() => setAuthType('login')} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;