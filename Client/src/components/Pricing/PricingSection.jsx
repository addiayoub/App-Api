import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp, Zap, Star, Rocket, Server, Cpu, Database, Code, Shield, CreditCard, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from '../Auth/LoginForm';
import RegisterForm from '../Auth/RegisterForm';
import ForgotPasswordForm from '../Auth/ForgotPasswordForm';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const PricingSection = ({ onPlanSelect }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');

  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (err) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/plans`,
          {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            }
          }
        );

        const fetchedPlans = [];
        const planTypes = ['basique', 'pro', 'entreprise'];

        for (const planType of planTypes) {
          const endpointsResponse = await axios.get(
            `https://apiservice.insightone.ma/api/tunnel/admin/available_endpoints/${planType}`,
            {
              headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
              }
            }
          );

          const matchingPlan = plansResponse.data.data.find(
            plan => plan.tag.toLowerCase() === planType
          );

          if (matchingPlan) {
            const transformedPlan = {
              name: matchingPlan.name,
              price: matchingPlan.monthlyPrice === 0 ? "0" : matchingPlan.monthlyPrice.toString(),
              annualPrice: matchingPlan.annualPrice.toString(),
              description: matchingPlan.description,
              features: [...matchingPlan.features, `${endpointsResponse.data.endpoints.length} endpoints disponibles`],
              popular: matchingPlan.popular,
              tag: matchingPlan.tag,
              endpoints: endpointsResponse.data.endpoints,
              id: matchingPlan._id
            };
            fetchedPlans.push(transformedPlan);
          }
        }

        setPlans(fetchedPlans);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthModal(false);
    toast.success('Connexion réussie!');
  };

const handleSubscribe = async (plan) => {
  if (!user) {
    setShowAuthModal(true);
    setAuthType('login');
    return;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/subscribe`,
      {
        planId: plan.id,
        billingType: billingCycle
      },
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    if (response.data.success) {
      await Swal.fire({
        title: 'Souscription réussie!',
        html: `
          <div class="text-left">
            <p class="mb-4">Votre abonnement <span class="font-bold text-blue-400">${plan.name}</span> a été activé avec succès.</p>
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p class="flex items-center mb-2">
                <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Un email contenant votre token API a été envoyé à <span class="font-semibold">${user.email}</span></span>
              </p>
              <p class="text-sm text-gray-400 mt-2">Ce token vous permettra d'accéder à toutes les fonctionnalités de l'API selon votre plan.</p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Compris',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#2563eb',
        customClass: {
          popup: 'border-2 border-blue-500 rounded-xl',
          title: 'text-blue-400 text-2xl',
          htmlContainer: 'text-gray-300',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg'
        },
        showCloseButton: true,
        timer: 5000
      });
      setSelectedPlan(null);
    }
  } catch (error) {
    await Swal.fire({
      title: 'Erreur de souscription',
      html: `
        <div class="text-left">
          <p class="mb-4">Une erreur est survenue lors de la souscription :</p>
          <div class="bg-gray-800 p-4 rounded-lg border border-red-500/50">
            <p class="text-red-400">${error.response?.data?.message || 'Erreur inconnue'}</p>
          </div>
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'OK',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#2563eb',
      customClass: {
        popup: 'border-2 border-red-500 rounded-xl',
        title: 'text-red-400 text-2xl',
        htmlContainer: 'text-gray-300',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg'
      }
    });
  }
};

  const toggleEndpoint = (index) => {
    setExpandedEndpoint(expandedEndpoint === index ? null : index);
  };

  const getIconForPlan = (tag) => {
    switch(tag) {
      case 'pro': return <Zap className="text-yellow-400" size={24} />;
      case 'entreprise': return <Rocket className="text-purple-400" size={24} />;
      default: return <Server className="text-blue-400" size={24} />;
    }
  };

  const getIconForFeature = (feature) => {
    if (feature.includes('endpoints')) return <Database className="text-blue-400 mr-2" size={18} />;
    if (feature.includes('requêtes')) return <Cpu className="text-green-400 mr-2" size={18} />;
    if (feature.includes('support')) return <Shield className="text-yellow-400 mr-2" size={18} />;
    if (feature.includes('analytique')) return <Code className="text-purple-400 mr-2" size={18} />;
    return <Check className="text-green-400 mr-2" size={18} />;
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6 text-center">
          <p>Chargement des plans...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="pricing" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6 text-center text-red-500">
          <p>Erreur lors du chargement des plans: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="pricing" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Offres</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-center mb-16 text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choisissez le plan parfait pour votre projet
          </motion.p>

          <div className="flex justify-center mb-12">
            <div className="bg-gray-800 rounded-full p-1 flex">
              <motion.button
                className={`px-6 py-2 rounded-full flex items-center ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                onClick={() => setBillingCycle('monthly')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar className="mr-2" size={16} /> Mensuel
              </motion.button>
              <motion.button
                className={`px-6 py-2 rounded-full flex items-center ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                onClick={() => setBillingCycle('annual')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CreditCard className="mr-2" size={16} /> Annuel
              </motion.button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`relative rounded-xl p-8 border-2 ${plan.popular ? 'border-blue-500 bg-gradient-to-b from-gray-800 to-gray-900' : 'border-gray-700 bg-gray-900'} backdrop-blur-sm`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-medium flex items-center"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Star size={16} className="mr-1" /> Populaire
                  </motion.div>
                )}
                
                <div className="flex items-center mb-4">
                  {getIconForPlan(plan.tag)}
                  <h3 className="text-2xl font-bold ml-2">{plan.name}</h3>
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>
                
                <div className="mb-8">
                  <motion.div 
                    className="text-4xl font-bold mb-1"
                    key={billingCycle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {billingCycle === 'monthly' ? (
                      plan.price === "0" ? "Gratuit" : `${plan.price} DH`
                    ) : (
                      plan.annualPrice === "0" ? "Gratuit" : `${plan.annualPrice} DH`
                    )}
                  </motion.div>
                  <span className="text-gray-400">
                    {billingCycle === 'monthly' ? '/mois' : '/an'}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {getIconForFeature(feature)}
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.button
                  className={`w-full py-3 rounded-lg font-medium cursor-pointer flex items-center justify-center ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Zap className="mr-2" size={16} />
                  {plan.popular ? "Choisir ce plan" : "Voir détails"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedPlan && (
            <motion.div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl max-w-2xl w-full p-8 relative border border-gray-700 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
              >
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center mb-4">
                  {getIconForPlan(selectedPlan.tag)}
                  <h3 className="text-2xl font-bold ml-2">{selectedPlan.name}</h3>
                </div>
                <p className="text-gray-300 mb-6">{selectedPlan.description}</p>
                
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <motion.div 
                      className="text-3xl font-bold mb-1"
                      key={`modal-${billingCycle}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {billingCycle === 'monthly' ? (
                        selectedPlan.price === "0" ? "Gratuit" : `${selectedPlan.price} DH`
                      ) : (
                        selectedPlan.annualPrice === "0" ? "Gratuit" : `${selectedPlan.annualPrice} DH`
                      )}
                    </motion.div>
                    <span className="text-gray-400">
                      {billingCycle === 'monthly' ? '/mois' : '/an'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-700 rounded-full p-1 flex">
                    <motion.button
                      className={`px-4 py-1 rounded-full text-sm flex items-center ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                      onClick={() => setBillingCycle('monthly')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Calendar className="mr-1" size={14} /> Mensuel
                    </motion.button>
                    <motion.button
                      className={`px-4 py-1 rounded-full text-sm flex items-center ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                      onClick={() => setBillingCycle('annual')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}  
                    >
                      <CreditCard className="mr-1" size={14} /> Annuel
                    </motion.button>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Database className="text-blue-400 mr-2" size={20} />
                    Fonctionnalités incluses
                  </h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {getIconForFeature(feature)}
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Code className="text-purple-400 mr-2" size={20} />
                    Endpoints disponibles ({selectedPlan.endpoints.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedPlan.endpoints.map((endpoint, i) => (
                      <motion.div 
                        key={i} 
                        className="border border-gray-700 rounded-lg overflow-hidden"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <button 
                          className="w-full flex justify-between items-center p-3 bg-gray-700/50 hover:bg-gray-700 transition-colors"
                          onClick={() => toggleEndpoint(i)}
                        >
                          <div className="flex items-center">
                            <Server className="text-blue-400 mr-2" size={18} />
                            <span className="font-medium text-left">{endpoint.name}</span>
                          </div>
                          {expandedEndpoint === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        
                        {expandedEndpoint === i && (
                          <div className="p-4 bg-gray-900/50">
                            <div className="mb-3">
                              <div className="text-sm text-gray-400 flex items-center mb-1">
                                <Code className="mr-2" size={16} /> Path:
                              </div>
                              <code className="block bg-gray-800 p-2 rounded mt-1 text-sm overflow-x-auto font-mono">
                                {endpoint.path}
                              </code>
                            </div>
                            
                            <div className="mb-3">
                              <div className="text-sm text-gray-400 flex items-center mb-1">
                                <Cpu className="mr-2" size={16} /> Méthodes:
                              </div>
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
                                <div className="text-sm text-gray-400 flex items-center mb-1">
                                  <Database className="mr-2" size={16} /> Paramètres:
                                </div>
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
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.button
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium cursor-pointer flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubscribe(selectedPlan)}
                >
                  {user ? (
                    <>
                      <Zap className="mr-2" size={18} />
                      Souscrire maintenant
                    </>
                  ) : (
                    "Se connecter pour souscrire"
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-xl max-w-md w-full p-8 relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              {authType === 'login' ? (
                <LoginForm 
                  switchToRegister={() => setAuthType('register')} 
                  switchToForgotPassword={() => setAuthType('forgot-password')}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : authType === 'register' ? (
                <RegisterForm 
                  switchToLogin={() => setAuthType('login')} 
                  onRegisterSuccess={() => {
                    setShowAuthModal(false);
                    toast.success('Inscription réussie!');
                  }}
                />
              ) : authType === 'forgot-password' ? (
                <ForgotPasswordForm onBackToLogin={() => setAuthType('login')} />
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PricingSection;