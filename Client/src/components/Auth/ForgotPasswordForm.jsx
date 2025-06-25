import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      
      toast.success('Un email de réinitialisation a été envoyé!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              y: { stiffness: 1000, velocity: -100 }
            }
          },
          exit: {
            y: 50,
            opacity: 0,
            transition: {
              y: { stiffness: 1000 }
            }
          }
        }
      });
      
      setEmailSent(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      
      if (err.response?.status === 400 || err.response?.status === 404) {
        setErrors({
          general: errorMsg,
          email: errorMsg
        });
        
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                y: { stiffness: 1000, velocity: -100 }
              }
            },
            exit: {
              y: 50,
              opacity: 0,
              transition: {
                y: { stiffness: 1000 }
              }
            }
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-xl max-w-md w-full p-8 border border-gray-700"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-100">Mot de passe oublié</h3>
        <p className="text-gray-400 mt-2">
          {emailSent 
            ? 'Vérifiez votre boîte email pour le lien de réinitialisation' 
            : 'Entrez votre email pour réinitialiser votre mot de passe'}
        </p>
      </div>

      {!emailSent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center"
            >
              <AlertCircle className="text-red-400 mr-2" size={18} />
              <span className="text-red-200">{errors.general}</span>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <input
                  type="email"
                  required
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({...errors, email: ''});
                  }}
                />
              </motion.div>
              <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
            </div>
            {errors.email && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center mt-1 text-red-400 text-sm"
              >
                <AlertCircle size={14} className="mr-1" />
                {errors.email}
              </motion.div>
            )}
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
              <span className="flex items-center justify-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Loader2 size={18} />
                </motion.span>
                Envoi en cours...
              </span>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </motion.button>
        </form>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle className="text-green-500" size={48} />
          </motion.div>
          
          <div className="space-y-4">
            <motion.button
              onClick={() => setEmailSent(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Renvoyer l'email
            </motion.button>
            
            <motion.button
              onClick={onBackToLogin}
              className="w-full py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg font-medium"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Retour à la connexion
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ForgotPasswordForm;