import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, UserCog, Trash2, Edit, Eye, EyeOff, Search, 
  Filter, ChevronDown, ChevronUp, Shield, Lock, Check, X, 
  RefreshCw, Download, MoreVertical, Plus, UserCheck, UserX, 
  Mail, Key, Activity, Calendar, Star, Sliders, Crown, Zap, 
  Award, Gem, Briefcase, CreditCard, ShieldCheck, BadgeCheck,
  Rocket, Leaf, Diamond, Infinity as InfinityIcon, Layers, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import moment from 'moment';
import UserStats from './UserStats';
import UserFilters from './UserFilters';
import UserTable from './UserTable';

const MySwal = withReactContent(Swal);

// UserFilters Component


// UserTable Component


// UserStats Component


// Main AdminUsersContent Component
const AdminUsersContent = ({ users, fetchData }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    isVerified: '',
    active: '',
    plan: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [plansData, setPlansData] = useState([]); // Ajouter plansData
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    isVerified: false,
    plan: 'free'
  });
  const [avatarErrors, setAvatarErrors] = useState(new Set());
  const [plans, setPlans] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscriptions, setSubscriptions] = useState({});

  const planIcons = {
    'basique': <Rocket className="w-4 h-4 text-blue-400" />,
    'pro': <Diamond className="w-4 h-4 text-purple-400" />,
    'entreprise': <Layers className="w-4 h-4 text-emerald-400" />,
    'free': <Star className="w-4 h-4 text-yellow-400" />
  };

  const planColors = {
    'basique': 'bg-blue-500/10 text-blue-400 border-blue-400/30',
    'pro': 'bg-purple-500/10 text-purple-400 border-purple-400/30',
    'entreprise': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30',
    'free': 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30'
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const subs = response.data.data || response.data;
        const subsMap = subs.reduce((acc, sub) => {
          acc[sub.userId] = sub;
          return acc;
        }, {});
        setSubscriptions(subsMap);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };
    
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    console.log('Plans state updated:', plans);
  }, [plans]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const plansData = response.data.data || response.data;
        
        const formattedPlans = plansData.reduce((acc, plan) => {
          acc[plan.tag] = {
            name: plan.name,
            icon: planIcons[plan.tag] || planIcons['free'],
            color: planColors[plan.tag] || planColors['free'],
            features: plan.features,
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
            popular: plan.popular,
            active: plan.active
          };
          return acc;
        }, {});
        
        setPlans(formattedPlans);
        console.log('Plans chargés:', formattedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans({
          'free': { 
            name: 'Gratuit', 
            icon: planIcons['free'], 
            color: planColors['free'],
            features: ['Accès limité', 'Support de base'],
            monthlyPrice: 0,
            annualPrice: 0
          },
          'basique': { 
            name: 'Basique', 
            icon: planIcons['basique'], 
            color: planColors['basique'],
            features: ['Accès standard', 'Support prioritaire'],
            monthlyPrice: 99,
            annualPrice: 1000
          },
          'pro': { 
            name: 'Professionnel', 
            icon: planIcons['pro'], 
            color: planColors['pro'],
            features: ['Accès complet', 'Support 24/7'],
            monthlyPrice: 29,
            annualPrice: 290
          },
          'entreprise': { 
            name: 'Entreprise', 
            icon: planIcons['entreprise'], 
            color: planColors['entreprise'],
            features: ['Accès illimité', 'Support dédié'],
            monthlyPrice: 199,
            annualPrice: 990
          }
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchPlans();
  }, []);
// Récupération des plans depuis l'API
  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setPlansData(data.data);
          // Formater plans pour compatibilité avec l'existant
          const formattedPlans = data.data.reduce((acc, plan) => {
            acc[plan.tag] = {
              name: plan.name,
              icon: planIcons[plan.tag] || planIcons['free'],
              color: planColors[plan.tag] || planColors['free'],
              features: plan.features,
              monthlyPrice: plan.monthlyPrice,
              annualPrice: plan.annualPrice,
              popular: plan.popular,
              active: plan.active
            };
            return acc;
          }, {});
          setPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlansData();
  }, []);
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    if (filters.isVerified !== '') {
      result = result.filter(user => user.isVerified === (filters.isVerified === 'true'));
    }
    if (filters.active !== '') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      result = result.filter(user => 
        filters.active === 'active' 
          ? new Date(user.lastLogin) >= thirtyDaysAgo 
          : new Date(user.lastLogin) < thirtyDaysAgo
      );
    }
    if (filters.plan) {
      result = result.filter(user => user.plan === filters.plan);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, filters, sortConfig]);

  const getUserSubscription = (userId) => {
    return subscriptions[userId] || null;
  };

  const renderSubscriptionBadge = (userId) => {
    const sub = getUserSubscription(userId);
    
    if (!sub) {
      return (
        <motion.span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <X className="w-3 h-3 mr-1" />
          Sans abonnement
        </motion.span>
      );
    }
    
    return (
      <motion.span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-400/30' :
          sub.status === 'expired' ? 'bg-red-500/10 text-red-400 border-red-400/30' :
          'bg-gray-500/10 text-gray-400 border-gray-400/30'
        }`}
        whileHover={{ scale: 1.05 }}
      >
        {sub.status === 'active' ? (
          <Check className="w-3 h-3 mr-1" />
        ) : sub.status === 'expired' ? (
          <X className="w-3 h-3 mr-1" />
        ) : (
          <X className="w-3 h-3 mr-1" />
        )}
        {sub.status === 'active' ? 'Actif' : sub.status === 'expired' ? 'Expiré' : 'Annulé'}
      </motion.span>
    );
  };

  const renderSubscriptionDetails = (userId) => {
    const sub = getUserSubscription(userId);
    
    if (!sub) {
      return (
        <div className="mt-2 text-xs text-gray-400">
          Aucun abonnement actif
        </div>
      );
    }
    
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Abonnement:</span>
          {renderSubscriptionBadge(userId)}
        </div>
        
        <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
          <div className="text-gray-400">Plan:</div>
          <div className="text-gray-300 capitalize">{sub.planName}</div>
          
          <div className="text-gray-400">Type:</div>
          <div className="text-gray-300 capitalize">{sub.billingType}</div>
          
          <div className="text-gray-400">Prix:</div>
          <div className="text-gray-300">{sub.price} €</div>
          
          <div className="text-gray-400">Début:</div>
          <div className="text-gray-300">{moment(sub.startDate).format('DD/MM/YYYY')}</div>
          
          <div className="text-gray-400">Expire:</div>
          <div className="text-gray-300">{moment(sub.expiresAt).format('DD/MM/YYYY')}</div>
          
          <div className="text-gray-400">Renouv. auto:</div>
          <div className="text-gray-300">
            {sub.autoRenew ? (
              <span className="text-green-400 flex items-center">
                <Check className="w-3 h-3 mr-1" /> Oui
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <X className="w-3 h-3 mr-1" /> Non
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const showDeleteConfirmation = (userId, isBulk = false) => {
    MySwal.fire({
      title: <span className="text-white">Confirmation</span>,
      html: <p className="text-gray-300">
        {isBulk 
          ? `Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`
          : 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?'}
      </p>,
      icon: 'warning',
      background: '#1f2937',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'bg-gray-800 border border-gray-700 rounded-xl',
        title: 'text-xl font-bold',
        actions: 'mt-4',
        confirmButton: 'px-4 py-2 rounded-lg hover:bg-red-700 transition-colors',
        cancelButton: 'px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mr-2'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const token = localStorage.getItem('token');
          
          if (isBulk) {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/bulk`, {
              headers: { Authorization: `Bearer ${token}` },
              data: { userIds: selectedUsers }
            });
            
            MySwal.fire({
              title: <span className="text-white">Succès</span>,
              html: <p className="text-gray-300">
                {selectedUsers.length} utilisateur(s) supprimé(s) avec succès
              </p>,
              icon: 'success',
              background: '#1f2937',
              confirmButtonColor: '#10b981',
              customClass: {
                popup: 'bg-gray-800 border border-gray-700 rounded-xl',
                confirmButton: 'px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
              },
              showClass: {
                popup: 'animate__animated animate__bounceIn'
              }
            });
            
            setSelectedUsers([]);
          } else {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            MySwal.fire({
              title: <span className="text-white">Succès</span>,
              html: <p className="text-gray-300">
                Utilisateur supprimé avec succès
              </p>,
              icon: 'success',
              background: '#1f2937',
              confirmButtonColor: '#10b981',
              customClass: {
                popup: 'bg-gray-800 border border-gray-700 rounded-xl',
                confirmButton: 'px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
              },
              showClass: {
                popup: 'animate__animated animate__bounceIn'
              }
            });
          }
          
          fetchData();
        } catch (error) {
          MySwal.fire({
            title: <span className="text-white">Erreur</span>,
            html: <p className="text-gray-300">
              {error.response?.data?.message || 'Erreur lors de la suppression'}
            </p>,
            icon: 'error',
            background: '#1f2937',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'bg-gray-800 border border-gray-700 rounded-xl',
              confirmButton: 'px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
            },
            showClass: {
              popup: 'animate__animated animate__shakeX'
            }
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const showPasswordResetConfirmation = (userId) => {
    MySwal.fire({
      title: <span className="text-white">Réinitialisation</span>,
      html: <p className="text-gray-300">
        Générer un nouveau mot de passe pour cet utilisateur ?
      </p>,
      icon: 'question',
      background: '#1f2937',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Générer',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'bg-gray-800 border border-gray-700 rounded-xl',
        title: 'text-xl font-bold',
        actions: 'mt-4',
        confirmButton: 'px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors',
        cancelButton: 'px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mr-2'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/reset-password`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          MySwal.fire({
            title: <span className="text-white">Succès</span>,
            html: (
              <div className="text-left">
                <p className="text-gray-300 mb-2">Mot de passe réinitialisé avec succès</p>
                <div className="bg-gray-700 p-3 rounded-lg mt-3">
                  <p className="font-mono text-yellow-400 break-all">
                    {response.data.tempPassword}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    (À communiquer à l'utilisateur)
                  </p>
                </div>
              </div>
            ),
            icon: 'success',
            background: '#1f2937',
            confirmButtonColor: '#10b981',
            width: '32rem',
            customClass: {
              popup: 'bg-gray-800 border border-gray-700 rounded-xl',
              confirmButton: 'px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
            },
            showClass: {
              popup: 'animate__animated animate__bounceIn'
            }
          });
        } catch (error) {
          MySwal.fire({
            title: <span className="text-white">Erreur</span>,
            html: <p className="text-gray-300">
              {error.response?.data?.message || 'Erreur lors de la réinitialisation'}
            </p>,
            icon: 'error',
            background: '#1f2937',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'bg-gray-800 border border-gray-700 rounded-xl',
              confirmButton: 'px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
            },
            showClass: {
              popup: 'animate__animated animate__shakeX'
            }
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEditSubmit = async (userId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      MySwal.fire({
        title: <span className="text-white">Succès</span>,
        html: <p className="text-gray-300">
          Utilisateur mis à jour avec succès
        </p>,
        icon: 'success',
        background: '#1f2937',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'bg-gray-800 border border-gray-700 rounded-xl',
          confirmButton: 'px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
        },
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        }
      });
      
      setEditingUser(null);
      fetchData();
    } catch (error) {
      MySwal.fire({
        title: <span className="text-white">Erreur</span>,
        html: <p className="text-gray-300">
          {error.response?.data?.message || 'Erreur lors de la mise à jour'}
        </p>,
        icon: 'error',
        background: '#1f2937',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'bg-gray-800 border border-gray-700 rounded-xl',
          confirmButton: 'px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async (userId, verify) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        { isVerified: verify },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      MySwal.fire({
        title: <span className="text-white">Succès</span>,
        html: <p className="text-gray-300">
          Utilisateur {verify ? 'vérifié' : 'désactivé'} avec succès
        </p>,
        icon: 'success',
        background: '#1f2937',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'bg-gray-800 border border-gray-700 rounded-xl',
          confirmButton: 'px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
        },
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        }
      });
      
      fetchData();
    } catch (error) {
      MySwal.fire({
        title: <span className="text-white">Erreur</span>,
        html: <p className="text-gray-300">
          {error.response?.data?.message || 'Erreur lors de la mise à jour'}
        </p>,
        icon: 'error',
        background: '#1f2937',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'bg-gray-800 border border-gray-700 rounded-xl',
          confirmButton: 'px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAvatar = (user) => {
    const shouldShowAvatar = user?.avatar && !avatarErrors.has(user._id);
    
    if (shouldShowAvatar) {
      return (
        <motion.img 
          src={user.avatar} 
          alt={user.name} 
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
          onError={() => setAvatarErrors(prev => new Set([...prev, user._id]))}
          referrerPolicy="no-referrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      );
    } else {
      const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
      const bgColor = user?.role === 'admin' 
        ? 'bg-gradient-to-br from-purple-600 to-blue-500' 
        : 'bg-gradient-to-br from-gray-600 to-gray-500';
      
      return (
        <motion.div 
          className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center border-2 border-blue-400`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-white font-semibold">{initial}</span>
        </motion.div>
      );
    }
  };

  const getUserPlanBadge = (user) => {
    const plan = user.plan || 'free';
    const planInfo = plans[plan] || {
      name: 'Inconnu',
      icon: <Star className="w-4 h-4 text-gray-400" />,
      color: 'bg-gray-500/10 text-gray-400 border-gray-400/30'
    };
    
    return (
      <motion.span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.color} border`}
        whileHover={{ scale: 1.05 }}
      >
        {planInfo.icon}
        <span className="ml-1">{planInfo.name}</span>
      </motion.span>
    );
  };

  const renderPlanDetails = (user) => {
    const plan = user.plan || 'free';
    const planInfo = plans[plan] || {
      name: 'Inconnu',
      icon: <Star className="w-4 h-4 text-gray-400" />,
      color: 'bg-gray-500/10 text-gray-400 border-gray-400/30',
      features: ['Plan inconnu']
    };
    
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Plan:</span>
          {getUserPlanBadge(user)}
        </div>
        
        {planInfo.features && (
          <div className="mt-1">
            <div className="text-xs text-gray-400 mb-1">Fonctionnalités:</div>
            <ul className="space-y-1">
              {planInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-3 h-3 text-green-400 mt-0.5 mr-1 flex-shrink-0" />
                  <span className="text-xs text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderPlanSelector = () => {
    if (loadingPlans) {
      return (
        <div className="mt-2 flex justify-center">
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">Plan</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(plans).map(([key, plan]) => (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditForm({ ...editForm, plan: key })}
              className={`p-2 rounded-lg border ${editForm.plan === key ? 'ring-2 ring-purple-500' : ''} ${plan.color} flex flex-col items-center`}
            >
              <div className="flex items-center gap-1">
                {plan.icon}
                <span className="text-xs font-medium">{plan.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const getUserStatus = (user) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    if (!user.lastLogin) return 'inactive';
    return new Date(user.lastLogin) >= thirtyDaysAgo ? 'active' : 'inactive';
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-purple-400" size={24} />
            Gestion des Utilisateurs
          </h2>
          <p className="text-gray-400">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchData()}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Rafraîchir</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
          >
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </motion.button>
          
          {selectedUsers.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => showDeleteConfirmation(null, true)}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer ({selectedUsers.length})</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        plans={plans}
        loadingPlans={loadingPlans}
      />

      <UserTable
        filteredUsers={filteredUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        isLoading={isLoading}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        editForm={editForm}
        setEditForm={setEditForm}
        fetchData={fetchData}
        plans={plans}
        loadingPlans={loadingPlans}
        subscriptions={subscriptions}
        getUserAvatar={getUserAvatar}
        getUserPlanBadge={getUserPlanBadge}
        renderPlanDetails={renderPlanDetails}
        renderPlanSelector={renderPlanSelector}
        handleEditSubmit={handleEditSubmit}
        handleVerifyUser={handleVerifyUser}
        showDeleteConfirmation={showDeleteConfirmation}
        showPasswordResetConfirmation={showPasswordResetConfirmation}
        renderSubscriptionDetails={renderSubscriptionDetails}
      />

      <UserStats
        users={users}
        plans={plans}
        getUserStatus={getUserStatus}
        plansData={plansData} // Passer plansData
      />
    </div>
  );
};

export default AdminUsersContent;