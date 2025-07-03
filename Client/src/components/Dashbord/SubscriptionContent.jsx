import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SubscriptionContent = ({ subscription, fetchData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [localSubscription, setLocalSubscription] = useState(subscription);

  // Mettre à jour localSubscription quand la prop subscription change
  useEffect(() => {
    setLocalSubscription(subscription);
  }, [subscription]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const cancelSubscription = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour immédiatement l'état local
      setLocalSubscription({ error: 'No subscription', data: null });
      
      toast.success('Abonnement annulé avec succès');
      fetchData(); // Recharger les données pour synchroniser avec le serveur
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  const hasNoSubscription = !localSubscription || !localSubscription.data || localSubscription.error;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">Votre Abonnement</h2>
      
      {hasNoSubscription ? (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-600 backdrop-blur-sm">
          <div className="p-8 text-center">
            <div className="bg-gray-600/20 backdrop-blur-sm p-4 rounded-lg mb-6 inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">Aucun abonnement actif</h3>
            <p className="text-gray-400 text-lg mb-6">
              Vous n'avez actuellement aucun plan d'abonnement actif.
            </p>
            <div className="bg-gray-700/30 p-6 rounded-lg">
              <p className="text-sm text-gray-400 mb-4">Souscrivez à un plan pour accéder à toutes nos fonctionnalités premium.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Voir les plans disponibles
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-700 backdrop-blur-sm">
            <div className="p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Plan Actuel
                  </span>
                  <h3 className="text-4xl font-bold mb-2">{localSubscription?.data?.plan}</h3>
                  <p className="text-2xl font-light opacity-90">
                    {localSubscription?.data?.price ? `${localSubscription.data.price} DH` : '0 DH'}<span className="text-lg">/mois</span>
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <CreditCard className="w-12 h-12 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Date d'expiration</h4>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-white">
                      {localSubscription?.data?.expires_at ? formatDate(localSubscription.data.expires_at) : 'Date inconnue'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Statut</h4>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-lg font-medium text-white">
                      {localSubscription?.data?.autoRenew ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {localSubscription?.data?.autoRenew && (
            <div className="text-center">
              {isConfirming ? (
                <div className="space-y-4">
                  <p className="text-lg text-gray-300 mb-4">Êtes-vous sûr de vouloir annuler votre abonnement?</p>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      onClick={() => setIsConfirming(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      onClick={cancelSubscription}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Confirmer l'annulation
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => setIsConfirming(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-red-400 hover:text-red-300 font-medium rounded-lg border border-red-400/30 hover:border-red-300/50 transition-colors flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Annuler l'abonnement
                </motion.button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionContent;