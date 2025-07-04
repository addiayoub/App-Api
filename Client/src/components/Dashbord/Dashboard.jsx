import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  CreditCard, 
  Key, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Database,
  Server,
  Terminal,
  Bell,
  Mail,
  Lock,
  Zap,
  Shield,
  Rocket,
  Sparkles,
   X, Code,  ChevronDown, ChevronUp, Copy, Play,  
  RefreshCw, Plus, Trash2, Eye, EyeOff, TrendingUp, Calendar,
  DollarSign, Globe, BarChart, Activity, Menu, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import DashboardContent from './DashboardContent';
import APIContent from './APIContent';
import StatsContent from './StatsContent';
import SecurityContent from './SecurityContent';
import SubscriptionContent from './SubscriptionContent';
import SettingsContent from './SettingsContent.JSX';
import DocsContent from './DocsContent';
import TicketsContent from './TicketsContent';

const Dashboard = ({ user: propUser, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [stats, setStats] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [userSettings, setUserSettings] = useState({});
  const [user, setUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const fetchUserInfo = () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (propUser) {
        setUser(propUser);
        setAvatarError(false);
      } else if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Dashboard - Parsed user from localStorage:', parsedUser);
        setUser(parsedUser);
        setAvatarError(false);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      navigate('/');
    }
  };

  const handleAvatarError = useCallback((e) => {
    console.error('Dashboard - Error loading avatar:', e);
    console.error('Dashboard - Avatar URL was:', user?.avatar);
    setAvatarError(true);
  }, [user?.avatar]);

  const handleAvatarLoad = useCallback(() => {
    console.log('Dashboard - Avatar loaded successfully for:', user?.name);
    console.log('Dashboard - Avatar URL:', user?.avatar);
  }, [user?.name, user?.avatar]);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [apisResponse, statsResponse, subscriptionResponse, securityResponse, settingsResponse] = 
        await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/apis/keys`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/stats`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/subscription`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/security/logs`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/settings`, { headers })
        ]);

      setApiKeys(apisResponse.data);
      setStats(statsResponse.data);
      setSubscription(subscriptionResponse.data);
      setSecurityLogs(securityResponse.data);
      setUserSettings(settingsResponse.data);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de chargement');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchAllData();
  }, [propUser]);

  // Debug logs pour l'avatar
  useEffect(() => {
    if (user) {
      console.log('Dashboard - User avatar URL:', user.avatar);
      console.log('Dashboard - Avatar error state:', avatarError);
      console.log('Dashboard - Should show avatar:', user?.avatar && !avatarError);
    }
  }, [user, avatarError]);

  const menuItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, key: 'dashboard', color: 'text-blue-400' },
    { name: 'Mes API', icon: Terminal, key: 'apis', color: 'text-green-400' },
    { name: 'Tickets', icon: Mail, key: 'tickets', color: 'text-orange-400' },
    { name: 'Documents', icon: FileText, key: 'docs', color: 'text-yellow-400' },
    { name: 'Abonnement', icon: CreditCard, key: 'subscription', color: 'text-cyan-400' },
  ];

  const handleLogout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Réinitialiser les states locaux
    setUser(null);
    setApiKeys([]);
    setStats({});
    setSubscription(null);
    setSecurityLogs([]);
    setUserSettings({});
    
    // Appeler la fonction de déconnexion du parent si elle existe
    if (onLogout) {
      onLogout();
    }
    
    // Afficher le message de succès
    toast.success('Déconnexion réussie');
    
    // Rediriger vers la page d'accueil
    navigate('/');
    
    // Forcer le rechargement de la page pour s'assurer que tout est réinitialisé
    window.location.reload();
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getUserAvatar = () => {
    const shouldShowAvatar = user?.avatar && !avatarError;
    
    if (shouldShowAvatar) {
      return (
        <img 
          src={user.avatar} 
          alt="User Avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
          onError={handleAvatarError}
          onLoad={handleAvatarLoad}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      );
    } else {
      const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
      return (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400">
          <span className="text-white font-semibold">{initial}</span>
        </div>
      );
    }
  };

  const getUserAvatarSmall = () => {
    const shouldShowAvatar = user?.avatar && !avatarError;
    
    if (shouldShowAvatar) {
      return (
        <img 
          src={user.avatar} 
          alt="User Avatar" 
          className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
          onError={handleAvatarError}
          onLoad={handleAvatarLoad}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      );
    } else {
      const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400">
          <span className="text-white text-sm font-semibold">{initial}</span>
        </div>
      );
    }
  };

  const getUserAvatarLarge = () => {
    const shouldShowAvatar = user?.avatar && !avatarError;
    
    if (shouldShowAvatar) {
      return (
        <img 
          src={user.avatar} 
          alt="User Avatar" 
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
          onError={handleAvatarError}
          onLoad={handleAvatarLoad}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      );
    } else {
      const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
      return (
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400">
          <span className="text-white text-xl font-semibold">{initial}</span>
        </div>
      );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

return (
  <div className="flex h-screen bg-gray-900 text-white relative overflow-hidden">
    {/* Zone de déclenchement du hover */}
    <div 
      className={`fixed left-0 top-0 h-full z-20 ${isCollapsed ? 'w-4' : 'w-0'}`}
      onMouseEnter={() => {
        if (isCollapsed && window.innerWidth >= 768) {
          setIsHovered(true);
        }
      }}
    />

    {/* Background animé */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-blue-500/10"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: 30 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        >
          <Database size={20} />
        </motion.div>
      ))}
    </div>

    {/* Menu mobile */}
    <button 
      onClick={toggleMobileMenu}
      className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-700"
    >
      {isMobileMenuOpen ? <X className="text-blue-400" /> : <Menu className="text-blue-400" />}
    </button>

    {/* Sidebar */}
    <AnimatePresence>
      {(isMobileMenuOpen || !isCollapsed || isHovered) && (
        <motion.div
          key="sidebar"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed md:relative z-40 h-full bg-gray-800/90 backdrop-blur-md ${
            (isCollapsed && !isHovered) ? 'w-20' : 'w-64'
          } shadow-lg border-r border-gray-700`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            if (window.innerWidth >= 768) {
              setIsHovered(false);
              if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            }
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header du sidebar */}
            <motion.div 
              className="p-4 border-b border-gray-700 flex items-center" 
              whileHover={{ scale: 1.02 }}
            >
             <motion.div 
                key="logo-open"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <img src="/ID&A TECH1 .png" alt="Logo" className="w-10" />
              </motion.div>
              {(!isCollapsed || isHovered) && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="ml-3 overflow-hidden"
                >
                  <p className="text-sm font-medium text-white">InsightOne API</p>
                  <p className="text-xs text-gray-400">Dashboard</p>
                </motion.div>
              )}
            </motion.div>

            {/* Profil utilisateur */}
            <motion.div 
              className="p-4 flex items-center border-b border-gray-700" 
              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
            >
              <div className="relative">
                {getUserAvatar()}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              {(!isCollapsed || isHovered) && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="ml-3 overflow-hidden"
                >
                  <p className="text-sm font-medium truncate text-white">
                    {user?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || 'email@example.com'}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Menu principal */}
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              <ul className="space-y-1 px-2">
                <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center p-3 rounded-lg transition-colors hover:bg-gray-700/50 text-gray-300"
                  >
                    <Globe className="w-5 h-5 text-purple-400" />
                    {(!isCollapsed || isHovered) && (
                      <span className="ml-3">Retour à l'accueil</span>
                    )}
                  </button>
                </motion.li>
                
                {menuItems.map((item) => (
                  <motion.li 
                    key={item.key} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => {
                        setActiveTab(item.key);
                        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === item.key 
                          ? 'bg-blue-900/30 text-white border border-blue-500/30' 
                          : 'hover:bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      {(!isCollapsed || isHovered) && (
                        <span className="ml-3">{item.name}</span>
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Menu footer */}
            <div className="p-4 border-t border-gray-700">
              <ul className="space-y-2">
                <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div 
                    className="relative"
                  >
                    <button 
                      onClick={toggleSidebar} 
                      className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700/50 text-gray-300"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                      ) : (
                        <ChevronLeft className="w-5 h-5" />
                      )}
                      {(!isCollapsed || isHovered) && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          className="ml-3"
                        >
                          FIXER
                        </motion.span>
                      )}
                    </button>
                  </div>
                </motion.li>
                <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700/50 text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    {(!isCollapsed || isHovered) && (
                      <span className="ml-3">Déconnexion</span>
                    )}
                  </button>
                </motion.li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Contenu principal */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="mr-4 md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-700/50 relative text-gray-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              {getUserAvatarSmall()}
              <span className="hidden md:inline text-sm font-medium text-white">
                {user?.name || 'Utilisateur'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-gray-900">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-sm rounded-xl shadow-lg p-6 h-full"
        >
          {/* Contenu des différents onglets */}
          {activeTab === 'dashboard' && <DashboardContent user={user} stats={stats} subscription={subscription} apiKeys={apiKeys} securityLogs={securityLogs} />}
          {activeTab === 'apis' && <APIContent apiKeys={apiKeys} fetchData={fetchAllData} subscription={subscription} />}
          {activeTab === 'tickets' && <TicketsContent user={user} />}
          {activeTab === 'stats' && <StatsContent stats={stats} />}
          {activeTab === 'docs' && <DocsContent />}
          {activeTab === 'security' && <SecurityContent securityLogs={securityLogs} />}
          {activeTab === 'subscription' && <SubscriptionContent subscription={subscription} fetchData={fetchAllData} />}
          {activeTab === 'settings' && <SettingsContent userSettings={userSettings} fetchData={fetchAllData} user={user} getUserAvatarLarge={getUserAvatarLarge} />}
        </motion.div>
      </main>
    </div>
  </div>
);
}

export default Dashboard;