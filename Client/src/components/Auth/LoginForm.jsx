import { motion } from 'framer-motion';
import { Mail, Lock, Key, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginForm = ({ switchToRegister, switchToForgotPassword, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
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
    // Effacer les erreurs quand l'utilisateur tape
    if (errors[e.target.name] || errors.general) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData, {
      withCredentials: true
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    toast.success('Connexion réussie!');
    
    // Appeler onLoginSuccess avant la navigation
    onLoginSuccess(res.data.user);
    
    // Naviguer vers la page d'accueil
    navigate('/');
    
    // Forcer un re-render si nécessaire
    window.location.reload();
    
  }catch (err) {
      console.error('Login error:', err);
      console.log('Full error object:', err);
      console.log('Error response:', err.response);
      
      // Récupérer le message d'erreur depuis la réponse du backend
      const errorMsg = err.response?.data?.message || 'Erreur de connexion';
      const statusCode = err.response?.status;
      
      console.log('Error details:', {
        status: statusCode,
        message: errorMsg,
        data: err.response?.data,
        fullResponse: err.response
      });

      // TOUJOURS afficher l'erreur du backend
      setErrors({
        general: errorMsg
      });
      
      // Vérifier si c'est un problème de vérification d'email
      if (errorMsg.includes('vérifier votre email')) {
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
            email: formData.email
          });
          toast.info('Un nouvel email de vérification a été envoyé');
        } catch (resendError) {
          console.error('Resend verification error:', resendError);
        }
      }

      // Afficher le toast d'erreur avec le message du backend
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark"
      });

    } finally {
      setLoading(false);
    }
  };
// Dans LoginForm.jsx, remplacez la fonction handleGoogleLogin :

// Remplacez la fonction handleGoogleLogin dans votre LoginForm

const handleGoogleLogin = () => {
  console.log('=== GOOGLE LOGIN INITIATED ===');
  console.log('Current URL:', window.location.href);
  console.log('API URL:', import.meta.env.VITE_API_URL);
  
  // Fermer le modal avant la redirection
  if (window.closeAuthModal) {
    console.log('✅ Closing auth modal');
    window.closeAuthModal();
  }
  
  // Sauvegarder le chemin actuel pour rediriger après connexion
  const currentPath = window.location.pathname;
  console.log('💾 Saving current path:', currentPath);
  localStorage.setItem('preAuthPath', currentPath);
  
  // Construire l'URL de redirection Google
  const googleAuthUrl = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  console.log('🔄 Redirecting to Google auth:', googleAuthUrl);
  
  // Rediriger vers l'authentification Google
  window.location.href = googleAuthUrl;
};

// Et ajoutez ceci dans le composant LoginForm (avant le return) :
// Permettre au composant parent de fermer le modal
window.closeAuthModal = () => {
  // Cette fonction sera disponible globalement
  // Le composant Home pourra l'utiliser
};
  return (
    <>
      <div className="text-center mb-8">
        <Key className="text-blue-400 mx-auto mb-4" size={40} />
        <h3 className="text-2xl font-bold text-gray-100">Connexion</h3>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.email || errors.general ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors`}
              placeholder="email@exemple.com"
              value={formData.email}
              onChange={handleChange}
            />
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
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <input
              name="password"
              type="password"
              required
              className={`w-full px-4 py-3 bg-gray-700/50 border ${errors.password || errors.general ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
          </div>
          {errors.password && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center mt-1 text-red-400 text-sm"
            >
              <AlertCircle size={14} className="mr-1" />
              {errors.password}
            </motion.div>
          )}
        </div>
        
        <div className="text-right">
          <button
            type="button"
            onClick={switchToForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Mot de passe oublié?
          </button>
        </div>
        
        {/* Affichage de l'erreur générale */}
        {errors.general && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center"
          >
            <AlertCircle className="text-red-400 mr-2 flex-shrink-0" size={18} />
            <span className="text-red-200 text-sm">{errors.general}</span>
          </motion.div>
        )}
        
        <motion.button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
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
              Connexion...
            </span>
          ) : 'Se connecter'}
        </motion.button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 border-t border-gray-600"></div>
          <div className="relative px-4 bg-gray-800 text-sm text-gray-400">Ou continuer avec</div>
        </div>

        <motion.button
        type="button"
        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        disabled={loading}
        onClick={handleGoogleLogin}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Google
      </motion.button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Nouveau chez nous? {' '}
          <button 
            onClick={switchToRegister}
            className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;