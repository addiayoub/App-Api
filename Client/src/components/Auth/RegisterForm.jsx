import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error when typing
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
    if (errors.general) {
      setErrors({...errors, general: ''});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
      
      setSuccess(true);
      
      // Show elegant success notification
      toast.success(
        <div className="flex items-start">
          <CheckCircle className="text-green-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium">Inscription réussie!</p>
            <p className="text-sm text-gray-300">Un email de vérification a été envoyé à {formData.email}.</p>
            <p className="text-xs mt-1 text-gray-400">Veuillez vérifier votre boîte de réception.</p>
          </div>
        </div>, 
        {
          position: "top-center",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          icon: false,
          className: "bg-gray-800 border border-gray-700"
        }
      );
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: ''
        });
        setSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      const errorResponse = err.response?.data;
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (errorResponse) {
        if (errorResponse.field) {
          setErrors({
            [errorResponse.field]: errorResponse.message
          });
          errorMessage = errorResponse.message;
        } 
        else if (errorResponse.message) {
          setErrors({
            general: errorResponse.message
          });
          errorMessage = errorResponse.message;
        }
        else if (errorResponse.error) {
          setErrors({
            general: errorResponse.error
          });
          errorMessage = errorResponse.error;
        }
      } else {
        setErrors({
          general: err.message || 'Erreur serveur. Veuillez réessayer plus tard.'
        });
        errorMessage = err.message || 'Erreur serveur. Veuillez réessayer plus tard.';
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {success ? (
        <motion.div 
          key="success-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.8 }}
          >
            <CheckCircle className="text-green-400 mx-auto mb-4" size={60} />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">Inscription réussie!</h3>
          <p className="text-gray-300 mb-4">
            Nous avons envoyé un email de vérification à <span className="text-blue-300">{formData.email}</span>.
          </p>
          <p className="text-sm text-gray-400">
            Veuillez vérifier votre boîte de réception et suivre les instructions pour activer votre compte.
          </p>
          
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retour à l'accueil
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="register-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Key className="text-blue-400 mx-auto mb-4" size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-100">Inscription</h3>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center"
              >
                <AlertCircle className="text-red-400 mr-2" size={18} />
                <span className="text-red-200">{errors.general}</span>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom complet</label>
              <div className="relative">
                <input
                  name="name"
                  type="text"
                  required
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={handleChange}
                />
                <User className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-red-400 text-sm flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.name}
                </motion.p>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-red-400 text-sm flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-1 text-red-400 text-sm flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </motion.div>
            
            <motion.button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                  Inscription...
                </span>
              ) : (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  S'inscrire
                </motion.span>
              )}
            </motion.button>
          </form>
          
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-400">
              Vous avez déjà un compte? {' '}
              <button 
                onClick={switchToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
              >
                Se connecter
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterForm;