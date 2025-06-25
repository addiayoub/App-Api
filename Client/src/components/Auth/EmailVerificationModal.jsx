import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EmailVerificationModal = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('missing-token');
    }
  }, [token]);

const verifyEmail = async () => {
  try { 
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, { 
      token: token 
    });
    
    if (res.data.success) {
      toast.success(res.data.message || 'Email vérifié avec succès!');
      setStatus('success');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else {
      toast.error(res.data.message || 'Erreur lors de la vérification');
      setStatus('error');
    }
  } catch (err) {
    console.error('Verification error:', err);
    if (err.response) {
      toast.error(err.response.data.message || 'Erreur lors de la vérification');
    } else {
      toast.error('Erreur de connexion au serveur');
    }
    setStatus('error');
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
          {status === 'verifying' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6"
              >
                <Loader2 className="text-blue-400" size={48} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Vérification en cours</h3>
              <p className="text-gray-400">Nous vérifions votre adresse email...</p>
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
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Email vérifié!</h3>
              <p className="text-gray-400">Redirection vers votre tableau de bord...</p>
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
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Erreur de vérification</h3>
              <p className="text-gray-400 mb-4">Le lien de vérification est invalide ou a expiré.</p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Retour à l'accueil
              </button>
            </>
          )}

          {status === 'missing-token' && (
            <>
              <XCircle className="text-red-500 mx-auto mb-6" size={48} />
              <h3 className="text-2xl font-bold text-gray-100 mb-2">Token manquant</h3>
              <p className="text-gray-400 mb-4">Le lien de vérification semble incomplet.</p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal;