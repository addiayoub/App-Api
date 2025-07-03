import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  UserCog,
  Shield,
  Lock,
  Settings, 
  CreditCard, 
  Ticket as TicketIcon,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Archive,
  Tag,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  Star,
  Mail,
  Paperclip, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Database,
  Server,
  Terminal,
  Bell,
  Zap,
  Rocket,
  Sparkles,
  X, 
  Code,  
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Play,  
  RefreshCw, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Calendar,
  DollarSign, 
  Globe, 
  BarChart, 
  Activity, 
  Menu, 
  Download,
  FileText,
  PieChart,
  Cpu,
  Network,
  HardDrive,
  ShieldCheck,
  ActivityIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminUsersContent from './AdminUsersContent';
import AdminStatsContent from './AdminStatsContent';
import AdminSystemContent from './AdminSystemContent';
import AdminSettingsContent from './AdminSettingsContent';
import AdminLogsContent from './AdminLogsContent';
import AdminSubscriptionsContent from './AdminSubscriptionsContent';
import AdminTicketsContent from './AdminTicketsContent';
import useNotifications from './useNotifications';

const AdminDashboard = ({ user: propUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [systemStats, setSystemStats] = useState({});
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const fetchUserInfo = () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (propUser) {
        setUser(propUser);
        setAvatarError(false);
      } else if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'admin') {
          navigate('/dashboard');
          toast.error('Accès non autorisé');
        }
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

  const fetchAllData = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const [usersResponse] = 
      await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers }),

      ]);

    // Correction : Extraire les données depuis la propriété 'data' de la réponse API
    setUsers(usersResponse.data.data || usersResponse.data); // Gérer les deux formats
 
    
    
    
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    toast.error(error.response?.data?.message || 'Erreur de chargement');
  }
};

  useEffect(() => {
    fetchUserInfo();
    fetchAllData();
  }, [propUser]);

const adminMenuItems = [
  { name: 'Tableau de bord', icon: LayoutDashboard, key: 'dashboard', color: 'text-blue-400' },
  { name: 'Utilisateurs', icon: Users, key: 'users', color: 'text-purple-400' },
  { name: 'Tickets', icon: TicketIcon, key: 'tickets', color: 'text-green-400' },
  { name: 'Abonnements', icon: CreditCard, key: 'subscriptions', color: 'text-amber-400' },
  { name: 'Paramètres', icon: Settings, key: 'settings', color: 'text-gray-400' },
];

  const handleLogout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Réinitialiser les states locaux
   
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
          alt="Admin Avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
          onError={() => setAvatarError(true)}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      );
    } else {
      const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center border-2 border-blue-400">
          <span className="text-white font-semibold">{initial}</span>
        </div>
      );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement de votre profil admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background animé pour admin */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-500/10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 30 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          >
            <ShieldCheck size={24} />
          </motion.div>
        ))}
      </div>

      {/* Menu mobile */}
      <button 
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-700"
      >
        {isMobileMenuOpen ? <X className="text-purple-400" /> : <Menu className="text-purple-400" />}
      </button>

      {/* Sidebar Admin */}
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
                    <p className="text-sm font-medium text-white">Admin Panel</p>
                    <p className="text-xs text-purple-300">Accès sécurisé</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Profil admin */}
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
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-purple-300 truncate">
                      {user?.email || 'admin@example.com'}
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
                      <Globe className="w-5 h-5 text-blue-400" />
                      {(!isCollapsed || isHovered) && (
                        <span className="ml-3">Home</span>
                      )}
                    </button>
                  </motion.li>
                  
                  {adminMenuItems.map((item) => (
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
                            ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-white border border-purple-500/30' 
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
                          {isCollapsed ? 'Développer' : 'Réduire'}
                        </motion.span>
                      )}
                    </button>
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
            <motion.button 
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className="p-2 rounded-full hover:bg-gray-700/50 relative text-gray-300"
  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
>
  <Bell className="w-5 h-5" />
  {unreadCount > 0 && (
    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
  )}
</motion.button>



<motion.button 
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className="p-2 rounded-full hover:bg-gray-700/50 relative text-gray-300"
  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
>
  <Bell className="w-5 h-5" />
  {unreadCount > 0 && (
    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
  )}
</motion.button>


              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-full cursor-pointer"
              >
                <div className="relative">
                  {getUserAvatar()}
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
                </div>
                <span className="hidden md:inline text-sm font-medium text-white">
                  {user?.name || 'Admin'}
                </span>
                <ChevronDown className="hidden md:inline w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-gray-900">
        {isNotificationsOpen && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
  >
    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
      <h3 className="font-medium">Notifications</h3>
      <button 
        onClick={markAllAsRead}
        className="text-xs text-blue-400 hover:text-blue-300"
      >
        Tout marquer comme lu
      </button>
    </div>
    <div className="max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-400">
          Aucune notification
        </div>
      ) : (
        notifications.map(notification => (
          <div
            key={notification._id}
            onClick={() => markAsRead(notification._id)}
            className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 ${
              notification.isUnread ? 'bg-gray-700/30' : ''
            }`}
          >
            <div className="flex items-start">
              {notification.type === 'ticket' ? (
                <TicketIcon className="mt-0.5 mr-2 text-blue-400" size={16} />
              ) : (
                <User className="mt-0.5 mr-2 text-purple-400" size={16} />
              )}
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{notification.title}</p>
                  {notification.isUnread && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-300">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
    <div className="p-2 border-t border-gray-700 text-center">
      <button className="text-sm text-blue-400 hover:text-blue-300">
        Voir toutes les notifications
      </button>
    </div>
  </motion.div>
)}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-sm rounded-xl shadow-lg p-6 h-full border border-gray-700"
          >
            
            {/* Contenu des différents onglets */}
            {activeTab === 'dashboard' && (
              <AdminStatsContent 
                users={users} 
                systemStats={systemStats} 
                subscriptions={subscriptions} 
                logs={adminLogs} 
              />
            )}
            {activeTab === 'users' && (
              <AdminUsersContent 
                users={users} 
                fetchData={fetchAllData} 
              />
            )}
            {activeTab === 'subscriptions' && (
              <AdminSubscriptionsContent 
                subscriptions={subscriptions} 
                fetchData={fetchAllData} 
              />
            )}
          
            
            {activeTab === 'settings' && (
              <AdminSettingsContent 
                user={user} 
              />
            )}
             {activeTab === 'tickets' && (
              <AdminTicketsContent 
                user={user} 
              />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;