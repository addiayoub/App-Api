import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Zap, X, Shield, Settings, CreditCard, HelpCircle, LogOut, Code, Database, Server, Globe, Cpu, ChevronDown, Terminal, Wifi, User, Rocket, Sparkles } from 'lucide-react';
import apiAnimation from '../components/animations/Animation - 1750437312038.json';
import developersAnimation from '../components/animations/Animation - 1750437373065.json';
import PricingSection from './Pricing/PricingSection';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import PlanModal from './Pricing/PlanModal';
import ForgotPasswordForm from './Auth/ForgotPasswordForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from './Header';

const Home = ({ user, setUser, onLogout }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const authTypeParam = urlParams.get('auth');
    
    if (authTypeParam === 'login' || authTypeParam === 'register') {
      setShowAuthModal(true);
      setAuthType(authTypeParam);
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('auth');
      window.history.replaceState({}, document.title, newUrl.pathname);
    }
  }, [location.search]);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');
      
      if (token) {
        try {
          localStorage.setItem('token', token);
          
          let userData;
          if (userParam) {
            userData = JSON.parse(decodeURIComponent(userParam));
            console.log('User data from URL:', userData);
          } else {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data && res.data.success) {
              userData = res.data.data;
              console.log('User data from API after Google auth:', userData);
            } else {
              throw new Error('Failed to get user data from API');
            }
          }
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('user');
          window.history.replaceState({}, document.title, newUrl.pathname);
          
          toast.success('Connexion réussie!');
          setShowAuthModal(false);
        } catch (err) {
          console.error('Failed to process Google auth:', err);
          localStorage.removeItem('token');
          toast.error('Erreur lors de la connexion');
        }
      }
    };

    handleGoogleAuth();
  }, [location.search, setUser]);

  const handleLoginSuccess = useCallback((userData) => {
    console.log('Login success with user data:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthModal(false);
    toast.success('Connexion réussie!');
  }, [setUser]);

  const handleAuthModal = useCallback((type) => {
    setShowAuthModal(true);
    setAuthType(type);
  }, []);

  const handlePlanSelect = useCallback((plan) => {
    setSelectedPlan(plan);
  }, []);

  const scrollToPricing = useCallback(() => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    const newUrl = new URL(window.location);
    if (newUrl.searchParams.has('auth')) {
      newUrl.searchParams.delete('auth');
      window.history.replaceState({}, document.title, newUrl.pathname);
    }
  }, []);

  const handleNavigateToDashboard = useCallback(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      handleAuthModal('register');
    }
  }, [user, navigate, handleAuthModal]);

  const features = useMemo(() => [
    {
      icon: Zap,
      title: "Performant",
      description: "API optimisées pour des temps de réponse ultra-rapides"
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Authentification robuste et chiffrement des données"
    },
    {
      icon: Code,
      title: "Facile à intégrer",
      description: "Documentation claire et librairies client"
    }
  ], []);

  const plans = useMemo(() => [
    {
      name: "Starter",  
      price: "0",
      description: "Parfait pour tester et développer",
      features: ["100 requêtes/mois", "Données de base", "Support communautaire"],
      popular: false
    },
    {
      name: "Pro",
      price: "29",
      description: "Pour applications en production",
      features: ["10 000 requêtes/mois", "Données premium", "Support prioritaire"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personnalisé",
      description: "Solution sur mesure",
      features: ["Volume illimité", "Toutes les données", "Support dédié 24/7"],
      popular: false
    }
  ], []);

  const FloatingDataNodes = useMemo(() => {
    if (prefersReducedMotion) return null;
    
    return () => {
      const nodes = Array.from({ length: 8 }, (_, i) => i);
      const icons = [Database, Server, Globe, Cpu];
      
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {nodes.map((node) => {
            const Icon = icons[node % icons.length];
            return (
              <motion.div
                key={node}
                className="absolute text-blue-500/10"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                }}
                animate={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                }}
                transition={{
                  duration: 30 + Math.random() * 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
              >
                <Icon size={20} />
              </motion.div>
            );
          })}
        </div>
      );
    };
  }, [prefersReducedMotion]);

  const CodeRain = useMemo(() => {
    if (prefersReducedMotion) return null;
    
    return () => {
      const codeSnippets = [
        'GET /api/v1/data',
        'POST /api/auth',
        '{ "status": 200 }',
        'fetch("/api")',
        'Authorization: Bearer'
      ];
      
      const drops = Array.from({ length: 6 }, (_, i) => i);
      
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {drops.map((drop) => (
            <motion.div
              key={drop}
              className="absolute text-green-500/10 font-mono text-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
              }}
              animate={{
                y: ['-20px', '100vh'],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            >
              {codeSnippets[Math.floor(Math.random() * codeSnippets.length)]}
            </motion.div>
          ))}
        </div>
      );
    };
  }, [prefersReducedMotion]);

  const NetworkGrid = useMemo(() => () => (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#3b82f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {!prefersReducedMotion && Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
          style={{
            left: `${25 + (i % 2) * 50}%`,
            top: `${25 + Math.floor(i / 2) * 50}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  ), [prefersReducedMotion]);

  const FloatingNodes = useMemo(() => FloatingDataNodes && <FloatingDataNodes />, [FloatingDataNodes]);
  const CodeRainComponent = useMemo(() => CodeRain && <CodeRain />, [CodeRain]);
  const NetworkGridComponent = useMemo(() => <NetworkGrid />, [NetworkGrid]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <Header user={user} onLogout={onLogout} />
      
      {FloatingNodes}
      {CodeRainComponent}

      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeAuthModal();
              }
            }}
          >
            <motion.div 
              className="bg-gray-800/90 backdrop-blur-lg rounded-xl max-w-md w-full p-8 relative border border-gray-700"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeAuthModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
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

      <PlanModal
        selectedPlan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSubscribe={() => {
          setSelectedPlan(null);
          handleAuthModal('register');
        }}
        user={user}
      />

      <section className="relative overflow-hidden pt-5">
        {NetworkGridComponent}
        <div className="container mx-auto px-6 py-24 flex flex-col md:flex-row items-center relative z-10">
          <motion.div 
            className="md:w-1/2 mb-12 md:mb-0 flex flex-col justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-start mb-8">
              <motion.h1 
                className="text-5xl font-bold mb-4"
                animate={!prefersReducedMotion ? { 
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.3)"
                  ]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-blue-400">InsightOne</span> API
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8">
                Des API puissantes pour intégrer des données financières directement dans vos applications.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-medium cursor-pointer relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigateToDashboard}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  {user ? (user.role === 'admin' ? 'Admin Dashboard' : 'Accéder au Dashboard') : 'Commencer maintenant'}
                </span>
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
                <Sparkles className="absolute -right-2 -top-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              
              <motion.button 
                className="border border-blue-600 text-blue-400 hover:bg-blue-900/30 px-8 py-3 rounded-lg font-medium cursor-pointer flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToPricing}
              >
                <Terminal className="w-5 h-5" />
                Explorer les API
              </motion.button>
            </div>
          </motion.div>
                
          <motion.div 
            className="md:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <Lottie 
                animationData={apiAnimation} 
                loop={true} 
                className="w-full"
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice'
                }}
              />
              
              {!prefersReducedMotion && (
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute inset-0 border-2 border-blue-500/10 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-4 border border-blue-400/15 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-900/50 relative">
        <div className="container mx-auto px-6 relative z-10">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Pourquoi choisir <span className="text-blue-400">InsightOne</span> ?
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div 
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all relative overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  />
                  
                  <div className="text-blue-400 mb-4 relative">
                    <motion.div
                      animate={!prefersReducedMotion ? { 
                        boxShadow: [
                          "0 0 0px rgba(59, 130, 246, 0.5)",
                          "0 0 15px rgba(59, 130, 246, 0.8)",
                          "0 0 0px rgba(59, 130, 246, 0.5)"
                        ]
                      } : {}}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      className="inline-block rounded-full p-2"
                    >
                      <IconComponent size={40} />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <PricingSection
        plans={plans} 
        onPlanSelect={handlePlanSelect}
      />

      <section className="py-20 relative">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center relative z-10">
          <motion.div 
            className="md:w-1/2 mb-12 md:mb-0 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <Lottie 
                animationData={developersAnimation} 
                loop={true} 
                className="w-full"
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice'
                }}
              />
              
              {!prefersReducedMotion && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 4 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-green-500/30 rounded-full"
                      style={{
                        left: `${25 + (i % 2) * 50}%`,
                        top: `${25 + Math.floor(i / 2) * 50}%`,
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 md:pl-12"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8">
              {user ? 'Accédez à votre dashboard pour gérer vos API' : 'Créez votre compte gratuitement et obtenez votre clé API dès maintenant.'}
            </p>
            <motion.button 
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-medium cursor-pointer relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNavigateToDashboard}
            >
              <span className="relative z-10 flex items-center gap-2">
                {user ? <User className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                {user ? (user.role === 'admin' ? 'Admin Panel' : 'Mon Espace') : 'S\'inscrire gratuitement'}
              </span>
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
              <Sparkles className="absolute -right-2 -top-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;