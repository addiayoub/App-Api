import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
  Activity as ActivityIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminUsersContent from './AdminUsersContent';
import AdminStatsContent from './AdminStatsContent';
import AdminSettingsContent from './AdminSettingsContent';
import AdminSubscriptionsContent from './AdminSubscriptionsContent';
import AdminTicketsContent from './AdminTicketsContent';
import Notifications from './Notifications';

const AdminDashboard = ({ user: propUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [systemStats, setSystemStats] = useState({});
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const controls = useAnimation();
  const [isMobileView, setIsMobileView] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);

  // Détection de la vue mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestion du survol du bord gauche
  const handleEdgeHover = (hovering) => {
    if (!isMobileView && isCollapsed) {
      setIsHoveringEdge(hovering);
    }
  };

  // Gestion du survol du sidebar
  const handleSidebarHover = (hovering) => {
    if (!isMobileView) {
      setIsHoveringSidebar(hovering);
    }
  };

  // Détermine si le sidebar doit être visible
  const shouldShowSidebar = (
    isMobileMenuOpen || 
    (!isCollapsed) || 
    (isHoveringSidebar) || 
    (isHoveringEdge)
  );

  const Particle = ({ index }) => {
    const size = Math.random() * 6 + 2;
    return (
      <motion.div
        className="absolute text-blue-500/20"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          rotate: Math.random() * 360,
          opacity: 0
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          rotate: Math.random() * 360,
          opacity: [0, 0.5, 0]
        }}
        transition={{
          duration: 30 + Math.random() * 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
          delay: index * 0.5
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'currentColor',
          borderRadius: '50%'
        }}
      />
    );
  };

  // Fetch data functions
  const fetchNotificationsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications count:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Error updating notifications');
    }
  };

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
          toast.error('Unauthorized access');
        }
        setUser(parsedUser);
        setAvatarError(false);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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

      setUsers(usersResponse.data.data || usersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Loading error');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchAllData();
    fetchNotificationsCount();
  }, [propUser]);

  const adminMenuItems = [
    { name: 'Users', icon: Users, key: 'users', color: 'text-purple-400' },
    { name: 'Tickets', icon: TicketIcon, key: 'tickets', color: 'text-green-400' },
    { name: 'Subscriptions', icon: CreditCard, key: 'subscriptions', color: 'text-amber-400' },
    { name: 'Settings', icon: Settings, key: 'settings', color: 'text-gray-400' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserAvatar = () => {
    const shouldShowAvatar = user?.avatar && !avatarError;
    
    if (shouldShowAvatar) {
      return (
        <motion.img 
          src={user.avatar} 
          alt="Admin Avatar" 
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
          onError={() => setAvatarError(true)}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        />
      );
    } else {
      const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
      return (
        <motion.div 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center border-2 border-blue-400"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <span className="text-white font-semibold">{initial}</span>
        </motion.div>
      );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg font-medium">Loading your admin profile...</p>
        </motion.div>
      </div>
    );
  }

return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Zone de détection de survol du bord gauche */}
      <div 
        className="fixed left-0 top-0 h-full w-4 z-30"
        onMouseEnter={() => handleEdgeHover(true)}
        onMouseLeave={() => handleEdgeHover(false)}
      />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Floating tech icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[Shield, Server, Cpu, Database, Network].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-500/10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
              scale: 0.8 + Math.random() * 0.7
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 40 + Math.random() * 40,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
              delay: i * 2
            }}
          >
            <Icon size={24 + Math.random() * 16} />
          </motion.div>
        ))}
      </div>

      {/* Mobile menu button */}
      <motion.button 
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMobileMenuOpen ? (
          <X className="text-purple-400" size={24} />
        ) : (
          <Menu className="text-purple-400" size={24} />
        )}
      </motion.button>

      {/* Sidebar - Toujours visible */}
      <motion.div
        initial={{ x: 0, opacity: 1 }}
        animate={{ 
          width: isMobileView ? (isMobileMenuOpen ? 256 : 0) : (isCollapsed && !isHoveringSidebar && !isHoveringEdge ? 80 : 256),
          opacity: isMobileView ? (isMobileMenuOpen ? 1 : 0) : 1
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`${isMobileView ? 'fixed' : 'relative'} z-40 h-full bg-gray-800/90 backdrop-blur-md shadow-xl border-r border-gray-700/50 overflow-hidden`}
        onMouseEnter={() => handleSidebarHover(true)}
        onMouseLeave={() => handleSidebarHover(false)}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <motion.div 
            className="p-4 border-b border-gray-700/50 flex items-center" 
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
              <motion.img 
                src="/ID&A TECH1 .png" 
                alt="Logo" 
                className="w-10"
                whileHover={{ rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </motion.div>
            {(!isCollapsed || isHoveringSidebar || isHoveringEdge || isMobileMenuOpen) && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-medium text-white">Admin Panel</p>
                <p className="text-xs text-purple-300/80">Secure Access</p>
              </motion.div>
            )}
          </motion.div>

          {/* User profile */}
          <motion.div 
            className="p-4 flex items-center border-b border-gray-700/50" 
            whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
          >
            <div className="relative">
              {getUserAvatar()}
              <motion.div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            {(!isCollapsed || isHoveringSidebar || isHoveringEdge || isMobileMenuOpen) && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-medium truncate text-white">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-purple-300/80 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <ul className="space-y-1 px-2">
              <motion.li 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center p-3 rounded-lg transition-all hover:bg-gray-700/50 text-gray-300 hover:text-white"
                >
                  <Globe className="w-5 h-5 text-blue-400" />
                  {(!isCollapsed || isHoveringSidebar || isHoveringEdge || isMobileMenuOpen) && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3"
                    >
                      Home
                    </motion.span>
                  )}
                </button>
              </motion.li>
              
              {adminMenuItems.map((item) => (
                <motion.li 
                  key={item.key} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <button
                    onClick={() => {
                      setActiveTab(item.key);
                      if (window.innerWidth < 768) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all ${
                      activeTab === item.key 
                        ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-white border-l-4 border-purple-500' 
                        : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    {(!isCollapsed || isHoveringSidebar || isHoveringEdge || isMobileMenuOpen) && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Footer menu */}
          <div className="p-4 border-t border-gray-700/50">
            <ul className="space-y-2">
              <motion.li 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <button 
                  onClick={toggleSidebar} 
                  className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700/50 text-gray-300 hover:text-white"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                  {(!isCollapsed || isHoveringSidebar || isHoveringEdge || isMobileMenuOpen) && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3"
                    >
                      {isCollapsed ? 'Expand' : 'Collapse'}
                    </motion.span>
                  )}
                </button>
              </motion.li>
              <motion.li 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center p-2 rounded-lg hover:bg-red-900/30 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                  {(!isCollapsed || isHoveringSidebar || isHoveringEdge || isMobileMenuOpen) && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3"
                    >
                      Logout
                    </motion.span>
                  )}
                </button>
              </motion.li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 z-30"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <motion.button 
                className="mr-4 md:hidden"
                onClick={toggleMobileMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              <motion.h1 
                className="text-xl font-semibold text-white capitalize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {activeTab.replace('-', ' ')}
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-700/50 relative text-gray-300 hover:text-white"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </motion.button>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-full cursor-pointer"
              >
                <div className="relative">
                  {getUserAvatar()}
                  <motion.div 
                    className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="hidden md:inline text-sm font-medium text-white">
                  {user?.name || 'Admin'}
                </span>
                <ChevronDown className="hidden md:inline w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-gray-900">
          {/* Notifications component */}
          <Notifications
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onMarkAllRead={markAllAsRead}
            onNotificationClick={(type) => {
              if (type === 'ticket') setActiveTab('tickets');
              setUnreadCount(prev => Math.max(0, prev - 1));
            }}
          />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-sm rounded-xl shadow-2xl p-6 h-full border border-gray-700/50 bg-gray-800/50"
          >
            {/* Tab content */}
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

export default AdminDashboard;////