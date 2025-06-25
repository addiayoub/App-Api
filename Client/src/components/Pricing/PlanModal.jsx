import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const PlanModal = ({ selectedPlan, onClose, onSubscribe, user }) => {
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);

  const toggleEndpoint = (index) => {
    setExpandedEndpoint(expandedEndpoint === index ? null : index);
  };

  const handleSubscribe = async () => {
    if (!user) {
      onSubscribe();
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscribe`,
        {
          planId: selectedPlan.id,
          billingType: 'monthly'
        },
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
          }
        }
      );
      
      if (response.data.success) {
        alert('Souscription réussie!');
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la souscription');
    }
  };

  return (
    <AnimatePresence>
      {selectedPlan && (
        <motion.div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-gray-800 rounded-xl max-w-2xl w-full p-8 relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-2">{selectedPlan.name}</h3>
            <p className="text-gray-300 mb-6">{selectedPlan.description}</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold">
                {selectedPlan.price === "0" ? "Gratuit" : `$${selectedPlan.price}`}
              </span>
              {selectedPlan.price !== "0" && selectedPlan.price !== "Personnalisé" && (
                <span className="text-gray-400 ml-2">/mois</span>
              )}
              {selectedPlan.annualPrice && selectedPlan.annualPrice !== "0" && (
                <p className="text-gray-400 text-sm mt-2">
                  ou ${selectedPlan.annualPrice}/an (économie de {(selectedPlan.price * 12 - selectedPlan.annualPrice).toFixed(2)}$)
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Fonctionnalités incluses</h4>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="text-green-400 mr-2" size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Endpoints disponibles ({selectedPlan.endpoints.length})</h4>
              
              <div className="space-y-3">
                {selectedPlan.endpoints.map((endpoint, i) => (
                  <div key={i} className="border border-gray-700 rounded-lg overflow-hidden">
                    <button 
                      className="w-full flex justify-between items-center p-3 bg-gray-700/50 hover:bg-gray-700 transition-colors"
                      onClick={() => toggleEndpoint(i)}
                    >
                      <span className="font-medium text-left">{endpoint.name}</span>
                      {expandedEndpoint === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedEndpoint === i && (
                      <div className="p-4 bg-gray-900/50">
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">Path:</span>
                          <code className="block bg-gray-800 p-2 rounded mt-1 text-sm overflow-x-auto">
                            {endpoint.path}
                          </code>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">Méthodes:</span>
                          <div className="flex gap-2 mt-1">
                            {endpoint.methods.map((method, j) => (
                              <span key={j} className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded text-sm">
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-400">Paramètres:</span>
                            <div className="mt-1 space-y-2">
                              {endpoint.parameters.map((param, k) => (
                                <div key={k} className="flex justify-between text-sm">
                                  <span className="text-gray-300">{param.name}</span>
                                  <div className="text-gray-400 text-right">
                                    <div>Type: {param.type.replace(/typing\.Literal\[(.*?)\]/, '$1').replace(/<class '(.*?)'>/, '$1')}</div>
                                    {param.default && <div>Default: {param.default}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <motion.button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubscribe}
            >
              {user ? "Souscrire maintenant" : "Se connecter pour souscrire"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanModal;////