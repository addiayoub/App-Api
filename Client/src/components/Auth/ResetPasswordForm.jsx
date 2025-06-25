import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPasswordForm = ({ onBackToLogin }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Token de réinitialisation manquant');
      setStatus('error');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { 
        token, 
        password 
      });
      
      toast.success('Mot de passe réinitialisé avec succès!');
      setStatus('success');
      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          navigate('/');
        }
      }, 3000);
    } catch (err) {
      console.error('Reset error:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la réinitialisation');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-gray-800 rounded-xl max-w-md w-full p-8 relative border border-gray-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="text-center">
          {status === 'pending' && (
            <>
              <h3 className="text-2xl font-bold text-gray-100 mb-6">
                Réinitialiser votre mot de passe
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </motion.button>
              </form>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="mx-auto mb-6"
              >
                <CheckCircle className="text-green-500" size={48} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Mot de passe réinitialisé!</h3>
              <p className="text-gray-400">Redirection vers la page de connexion...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="mx-auto mb-6"
              >
                <XCircle className="text-red-500" size={48} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Erreur de réinitialisation</h3>
              <p className="text-gray-400 mb-4">
                {!token 
                  ? 'Le lien de réinitialisation est incomplet.' 
                  : 'Le lien est invalide ou a expiré.'}
              </p>
              
              <div className="space-y-3">
                {token && (
                  <motion.button
                    onClick={() => setStatus('pending')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Réessayer
                  </motion.button>
                )}
                
                <motion.button
                  onClick={() => {
                    if (onBackToLogin) {
                      onBackToLogin();
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="w-full py-2.5 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Retour à la connexion
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordForm;