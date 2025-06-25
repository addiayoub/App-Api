import { motion } from 'framer-motion';
import { User, Mail, Lock, Key, AlertCircle, Loader2 } from 'lucide-react';
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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur du champ lorsqu'on modifie
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
    
    toast.success('Inscription réussie! Un email de vérification a été envoyé.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    
    navigate('/');
  } catch (err) {
    // Extraction détaillée de l'erreur
    const errorResponse = err.response?.data;
    let errorMessage = 'Erreur lors de l\'inscription';
    
    if (errorResponse) {
      // Cas 1: Erreur avec un champ spécifique
      if (errorResponse.field) {
        setErrors({
          [errorResponse.field]: errorResponse.message
        });
        errorMessage = errorResponse.message;
      } 
      // Cas 2: Erreur générale
      else if (errorResponse.message) {
        setErrors({
          general: errorResponse.message
        });
        errorMessage = errorResponse.message;
      }
      // Cas 3: Erreur de validation (par exemple de Joi ou autre)
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
    <>
      <div className="text-center mb-8">
        <Key className="text-blue-400 mx-auto mb-4" size={40} />
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
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nom complet</label>
          <div className="relative">
            <input
              name="name"
              type="text"
              required
              className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400`}
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
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400`}
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
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400`}
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
        </div>
        
        <motion.button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
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
              Inscription...
            </span>
          ) : 'S\'inscrire'}
        </motion.button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Vous avez déjà un compte? {' '}
          <button 
            onClick={switchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;