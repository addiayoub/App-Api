import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingSection = ({ plans, onPlanSelect }) => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-3xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Nos <span className="text-blue-400">offres</span>
        </motion.h2>
        
        <motion.p 
          className="text-xl text-center mb-16 text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Choisissez le plan qui correspond à vos besoins
        </motion.p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative rounded-xl p-8 border ${plan.popular ? 'border-blue-500 bg-gray-800/50' : 'border-gray-700 bg-gray-900/50'} backdrop-blur-sm`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-medium">
                  Populaire
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-300 mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price === "0" ? "Gratuit" : `$${plan.price}`}</span>
                {plan.price !== "0" && plan.price !== "Personnalisé" && (
                  <span className="text-gray-400">/mois</span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="text-green-400 mr-2" size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <motion.button
                className={`w-full py-3 rounded-lg font-medium cursor-pointer ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlanSelect(plan)}
              >
                {plan.popular ? "Choisir ce plan" : "Détails"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;