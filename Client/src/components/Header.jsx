import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, ChevronDown, CreditCard, HelpCircle, LogOut, Home as HomeIcon, BarChart2, Code, Database } from 'lucide-react';

const Header = ({ user, onLogout }) => { // Recevoir user et onLogout comme props
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsHeaderHidden(true);
        } else if (currentScrollY < lastScrollY.current) {
          setIsHeaderHidden(false);
        }
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout(); // Utiliser la fonction onLogout passée en props
    } else {
      // Fallback si onLogout n'est pas fourni
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsDropdownOpen(false);
      navigate('/');
    }
  }, [navigate, onLogout]);

  const handleAvatarError = useCallback((e) => {
    console.error('Error loading avatar:', e);
    console.error('Avatar URL was:', user?.avatar);
    setAvatarError(true);
  }, [user?.avatar]);

  const handleAvatarLoad = useCallback(() => {
    console.log('Avatar loaded successfully for:', user?.name);
    console.log('Avatar URL:', user?.avatar);
  }, [user?.name, user?.avatar]);

  // Navigation items basés sur le rôle de l'utilisateur
  const navItems = user?.role === 'admin' ? [
    { icon: HomeIcon, label: 'Accueil', path: '/' },
    { icon: BarChart2, label: 'Admin Dashboard', path: '/admin' },
    { icon: Code, label: 'API Explorer', path: '/api-explorer' },
    { icon: Database, label: 'Documentation', path: '/docs' }
  ] : [
    { icon: HomeIcon, label: 'Accueil', path: '/' },
    { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: Code, label: 'API Explorer', path: '/api-explorer' },
    { icon: Database, label: 'Documentation', path: '/docs' }
  ];

  const shouldShowAvatar = user?.avatar && !avatarError;

  // Debug logs
  useEffect(() => {
    if (user) {
      console.log('User avatar URL:', user.avatar);
      console.log('Should show avatar:', shouldShowAvatar);
      console.log('Avatar error state:', avatarError);
    }
  }, [user, shouldShowAvatar, avatarError]);

  const handleNavigation = (path) => {
    console.log('Navigating to:', path); // Debug log
    navigate(path);
    setIsDropdownOpen(false); // Fermer le dropdown après navigation
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800"
      initial={false}
      animate={{
        y: isHeaderHidden ? -100 : 0,
        opacity: isHeaderHidden ? 0 : 1
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate('/')}
        >
          <img src="/ID&A TECH .png" alt="Logo" className="w-50" />
        </motion.div>

        <motion.div 
          className="flex space-x-4 items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user ? (
            <>
              <div className="hidden md:flex space-x-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    className={`px-3 py-2 rounded-md flex items-center transition-colors ${
                      location.pathname === item.path 
                        ? 'text-blue-400 bg-gray-800' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon size={16} className="mr-2" />
                    {item.label}
                  </motion.button>
                ))}
              </div>
              
              <div className="relative">
                <motion.button
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {shouldShowAvatar ? (
                    <img 
                      src={user.avatar} 
                      alt="User Avatar" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/30"
                      onError={handleAvatarError}
                      onLoad={handleAvatarLoad}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {user.name ? user.name.split(' ')[0] : 'User'}
                  </span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-gray-300" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-700">
                          <div className="flex items-center space-x-3">
                            {shouldShowAvatar ? (
                              <img 
                                src={user.avatar} 
                                alt="User Avatar" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/30"
                                onError={handleAvatarError}
                                onLoad={handleAvatarLoad}
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                <User size={20} className="text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">{user.name || 'Utilisateur'}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email || ''}</p>
                              {user.role && (
                                <p className="text-xs text-blue-400 capitalize">{user.role}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Navigation mobile */}
                        <div className="md:hidden border-b border-gray-700">
                          {navItems.map((item, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                                location.pathname === item.path 
                                  ? 'text-blue-400 bg-gray-700' 
                                  : 'text-gray-300 hover:bg-gray-700'
                              }`}
                              onClick={() => handleNavigation(item.path)}
                            >
                              <item.icon size={16} className="mr-3" />
                              {item.label}
                            </motion.button>
                          ))}
                        </div>

                        {/* Menu utilisateur */}
                        {[
                          { icon: User, label: 'Profil', path: '/profile' },
                          { icon: Settings, label: 'Paramètres', path: '/settings' },
                          { icon: CreditCard, label: 'Facturation', path: '/billing' },
                          { icon: HelpCircle, label: 'Aide', path: '/help' },
                        ].map((item, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                            onClick={() => handleNavigation(item.path)}
                          >
                            <item.icon size={16} className="mr-3" />
                            {item.label}
                          </motion.button>
                        ))}

                        <div className="border-t border-gray-700"></div>

                        <motion.button
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-3" />
                          Déconnexion
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <motion.button
                className="px-4 py-2 text-blue-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/?auth=login')}
              >
                Connexion
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/?auth=register')}
              >
                Inscription
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;