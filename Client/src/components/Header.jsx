import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, ChevronDown, CreditCard, HelpCircle, LogOut, Home as HomeIcon, BarChart2, Code, Database } from 'lucide-react';

const Header = () => {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (token && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      // Assurez-vous que l'avatar est bien présent dans l'objet utilisateur
      if (parsedUser.avatar) {
        setUser(parsedUser);
      } else {
        // Si l'avatar n'existe pas, créez un objet utilisateur avec les autres propriétés
        setUser({
          ...parsedUser,
          avatar: null
        });
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
    }
  }
}, []);

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/');
  }, [navigate]);

  const navItems = [
    { icon: HomeIcon, label: 'Accueil', path: '/' },
    { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: Code, label: 'API Explorer', path: '/api-explorer' },
    { icon: Database, label: 'Documentation', path: '/docs' }
  ];

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
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
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
                    className={`px-3 py-2 rounded-md flex items-center ${location.pathname === item.path ? 'text-blue-400 bg-gray-800' : 'text-gray-300 hover:text-white'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
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
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="User Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {user.name.split(' ')[0]}
                  </span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
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
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>

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
                            onClick={() => {
                              navigate(item.path);
                              setIsDropdownOpen(false);
                            }}
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