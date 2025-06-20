import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const PlanModal = ({ selectedPlan, onClose, onSubscribe }) => {
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
            className="bg-gray-800 rounded-xl max-w-md w-full p-8 relative"
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
            </div>
            
            <ul className="space-y-2 mb-8">
              {selectedPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="text-green-400 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <motion.button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSubscribe}
            >
              Souscrire maintenant
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanModal;