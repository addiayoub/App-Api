import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Zap, X, Shield, Code, Database, Server, Globe, Cpu, Terminal, Wifi } from 'lucide-react';
import apiAnimation from '../components/animations/Animation - 1750437312038.json';
import developersAnimation from '../components/animations/Animation - 1750437373065.json';
import PricingSection from './Pricing/PricingSection';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import PlanModal from './Pricing/PlanModal';

const Home = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
 useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

 useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY) {
      // Scroll vers le bas -> montrer le header
      setIsHeaderHidden(false);
    } else if (currentScrollY < lastScrollY && currentScrollY > 100) {
      // Scroll vers le haut et pas en haut de page -> cacher le header
      setIsHeaderHidden(true);
    }
    
    setLastScrollY(currentScrollY);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollY]);

  const features = [
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
  ];

  const plans = [
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
  ];

  // Animated Background Components
  const FloatingDataNodes = () => {
    const nodes = Array.from({ length: 15 }, (_, i) => i);
    const icons = [Database, Server, Globe, Cpu, Terminal, Wifi];
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {nodes.map((node) => {
          const Icon = icons[node % icons.length];
          return (
            <motion.div
              key={node}
              className="absolute text-blue-500/20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Icon size={24 + Math.random() * 16} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const DataStreamLines = () => {
    const lines = Array.from({ length: 20 }, (_, i) => i);
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {lines.map((line) => (
          <motion.div
            key={line}
            className="absolute bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
            style={{
              width: '200px',
              height: '2px',
              top: `${Math.random() * 100}%`,
              left: '-200px',
            }}
            animate={{
              x: ['-200px', `${window.innerWidth + 200}px`],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>
    );
  };

  const CodeRain = () => {
    const codeSnippets = [
      'GET /api/v1/data',
      'POST /api/auth',
      '{ "status": 200 }',
      'fetch("/api")',
      'Authorization: Bearer',
      'Content-Type: json',
      'HTTP/1.1 200 OK',
      'X-API-Key',
      'rate_limit: 1000',
      'endpoint: active'
    ];
    
    const drops = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {drops.map((drop) => (
          <motion.div
            key={drop}
            className="absolute text-green-500/20 font-mono text-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
            }}
            animate={{
              y: ['-20px', `${window.innerHeight + 20}px`],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          >
            {codeSnippets[Math.floor(Math.random() * codeSnippets.length)]}
          </motion.div>
        ))}
      </div>
    );
  };

  const NetworkGrid = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3b82f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Animated grid pulses */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/50 rounded-full"
            style={{
              left: `${20 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 40}%`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    );
  };

  const PulsingCircles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute border border-blue-500/20 rounded-full"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    );
  };

  // Mock Auth Components (simplified for demo)
 




 
   return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Header animé */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800"
        initial={false}
        animate={{
          y: isHeaderHidden ? -100 : 0,
          opacity: isHeaderHidden ? 0 : 1
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/ID&A TECH .png" alt="Logo" className="w-50" />
          </motion.div>

          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              className="px-4 py-2 text-blue-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAuthModal(true);
                setAuthType('login');
              }}
            >
              Connexion
            </motion.button>
            <motion.button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAuthModal(true);
                setAuthType('register');
              }}
            >
              Inscription
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      <FloatingDataNodes />
      <CodeRain />
      <PulsingCircles />

      {/* Custom cursor */}
      <motion.div 
        className="fixed w-8 h-8 bg-blue-600 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{ x: cursorPosition.x - 16, y: cursorPosition.y - 16 }}
        transition={{ type: 'spring', damping: 20 }}
      />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-800/90 backdrop-blur-lg rounded-xl max-w-md w-full p-8 relative border border-gray-700"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={24} />
              </button>

              {authType === 'login' ? (
                <LoginForm switchToRegister={() => setAuthType('register')} />
              ) : (
                <RegisterForm switchToLogin={() => setAuthType('login')} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Details Modal */}
      <PlanModal
        selectedPlan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSubscribe={() => {
          setSelectedPlan(null);
          setShowAuthModal(true);
          setAuthType('register');
        }}
      />
{/* Hero Section */}
<section className="relative overflow-hidden">
  <NetworkGrid />
  <div className="container mx-auto px-6 py-24 flex flex-col md:flex-row items-center relative z-10">
    <motion.div 
      className="md:w-1/2 mb-12 md:mb-0 flex flex-col justify-center"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-start mb-8">
        {/* <img 
          src="/ID&A TECH .png" 
          alt="Logo" 
          className="w-130   mb-6"  // Ajustez cette valeur pour la taille du logo
        /> */}
        <motion.h1 
          className="text-5xl font-bold mb-4"
          animate={{ 
            textShadow: [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 30px rgba(59, 130, 246, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-blue-400">InsightOne</span> API
        </motion.h1>
        <p className="text-xl text-gray-300 mb-8">
          Des API puissantes pour intégrer des données financières directement dans vos applications.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium cursor-pointer relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowAuthModal(true);
            setAuthType('register');
          }}
        >
          <span className="relative z-10">Commencer gratuitement</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600"
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
        
        <motion.button 
          className="border border-blue-600 text-blue-400 hover:bg-blue-900/30 px-8 py-3 rounded-lg font-medium cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const pricingSection = document.getElementById('pricing');
            pricingSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Explorer les API
        </motion.button>
      </div>
    </motion.div>
          
          <motion.div 
            className="md:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Lottie Animation with overlay effects */}
            <div className="relative">
              <Lottie animationData={apiAnimation} loop={true} className="w-full" />
              
              {/* Overlay animated elements */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="absolute inset-0 border-2 border-blue-500/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 border border-blue-400/30 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50 relative">
        <FloatingDataNodes />
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
                  className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all relative overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                  
                  <div className="text-blue-400 mb-4 relative">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          "0 0 0px rgba(59, 130, 246, 0.5)",
                          "0 0 20px rgba(59, 130, 246, 0.8)",
                          "0 0 0px rgba(59, 130, 246, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      className="inline-block rounded-full p-2"
                    >
                      <IconComponent size={40} />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection
        plans={plans} 
        onPlanSelect={setSelectedPlan}
      />

      {/* Developer Community Section */}
      <section className="py-20 relative">
        <CodeRain />
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center relative z-10">
          <motion.div 
            className="md:w-1/2 mb-12 md:mb-0 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Lottie Animation with overlay effects */}
            <div className="relative">
              <Lottie animationData={developersAnimation} loop={true} className="w-full" />
              
              {/* Overlay animated elements */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-green-500/50 rounded-full"
                    style={{
                      left: `${20 + (i % 3) * 30}%`,
                      top: `${20 + Math.floor(i / 3) * 30}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 md:pl-12"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8">
              Créez votre compte gratuitement et obtenez votre clé API dès maintenant.
            </p>
            <motion.button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium cursor-pointer relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAuthModal(true);
                setAuthType('register');
              }}
            >
              <span className="relative z-10">S'inscrire gratuitement</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;