import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, UserCog, Trash2, Edit, Eye, EyeOff, Search, 
  Filter, ChevronDown, ChevronUp, Shield, Lock, Check, X, 
  RefreshCw, Download, MoreVertical, Plus, UserCheck, UserX, 
  Pause, Key, Activity, Calendar, Star, Sliders, Crown, Zap, 
  Award, Gem, Briefcase, CreditCard, ShieldCheck, BadgeCheck,
  Rocket, Leaf, Diamond, Infinity as InfinityIcon, Layers, Sparkles
} from 'lucide-react';
import moment from 'moment';
import Swal from 'sweetalert2';
import 'animate.css';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

const UserTable = ({
  filteredUsers, selectedUsers, setSelectedUsers, sortConfig, setSortConfig,
  isLoading, editingUser, setEditingUser, editForm, setEditForm,
  fetchData, plans, loadingPlans, subscriptions, getUserAvatar,
  getUserPlanBadge, renderPlanDetails, renderPlanSelector, handleEditSubmit,
  handleVerifyUser, showDeleteConfirmation, showPasswordResetConfirmation,
  renderSubscriptionDetails
}) => {
  const [plansData, setPlansData] = useState([]);
  const [loadingPlansData, setLoadingPlansData] = useState(true);

  // Icônes pour les plans
  const planIcons = {
    'basique': <Rocket className="w-4 h-4 text-blue-400" />,
    'pro': <Diamond className="w-4 h-4 text-purple-400" />,
    'entreprise': <Layers className="w-4 h-4 text-emerald-400" />,
    'free': <Star className="w-4 h-4 text-yellow-400" />
  };

  // Couleurs pour les plans
  const planColors = {
    'basique': 'bg-blue-500/10 text-blue-400 border-blue-400/30',
    'pro': 'bg-purple-500/10 text-purple-400 border-purple-400/30',
    'entreprise': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30',
    'free': 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30'
  };

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
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des plans:', error);
      } finally {
        setLoadingPlansData(false);
      }
    };

    fetchPlansData();
  }, []);
  
// Ajoutez cette fonction dans votre composant
const handleGenerateNewToken = async (userId) => {
  // Confirmation avec SweetAlert
  const confirmation = await Swal.fire({
    title: 'Générer un nouveau token ?',
    text: "L'ancien token ne sera plus valide.",
    icon: 'warning',
    iconColor: '#f8bb86',
    showCancelButton: true,
    confirmButtonText: 'Oui, générer',
    cancelButtonText: 'Annuler',
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#64748b',
    backdrop: `
      rgba(0,0,0,0.7)
      url("/images/nyan-cat.gif")
      left top
      no-repeat
    `,
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    }
  });

  if (!confirmation.isConfirmed) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/${userId}/generate-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      await Swal.fire({
        title: 'Succès !',
        text: 'Un nouveau token a été généré et envoyé à l\'utilisateur',
        icon: 'success',
        iconColor: '#a5dc86',
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
        showClass: {
          popup: 'animate__animated animate__zoomIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__zoomOut animate__faster'
        },
        timer: 3000,
        timerProgressBar: true
      });
      
      // Rafraîchir les données si nécessaire
      fetchData();
    } else {
      await Swal.fire({
        title: 'Erreur',
        text: data.message || "Une erreur s'est produite",
        icon: 'error',
        iconColor: '#f27474',
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1'
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    await Swal.fire({
      title: 'Erreur critique',
      text: "Erreur lors de la génération du nouveau token",
      icon: 'error',
      iconColor: '#f27474',
      background: '#1e293b',
      color: '#f1f5f9',
      confirmButtonColor: '#6366f1',
      showClass: {
        popup: 'animate__animated animate__shakeX'
      }
    });
  }
};
const handleSubscriptionAction = async (userId, action) => {
  try {
    const token = localStorage.getItem('token');
    const userPlan = getUserPlan(userId);
    
    // Vérification de l'abonnement avec SweetAlert
    if (!userPlan || !userPlan.userSubscription) {
      await Swal.fire({
        title: 'Abonnement introuvable',
        text: "L'utilisateur n'a pas d'abonnement actif",
        icon: 'info',
        iconColor: '#7dd3fc',
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
        showClass: {
          popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        }
      });
      return;
    }

    // Confirmation avant action
    const actionText = action === 'cancel' ? 'annuler' : 
                      action === 'pause' ? 'mettre en pause' : 
                      'modifier';
    
    const confirmation = await Swal.fire({
      title: `Confirmer l'action`,
      html: `Êtes-vous sûr de vouloir <b>${actionText}</b> cet abonnement ?`,
      icon: 'question',
      iconColor: '#a5b4fc',
      background: '#1e293b',
      color: '#f1f5f9',
      showCancelButton: true,
      confirmButtonText: `Oui, ${actionText}`,
      cancelButtonText: 'Non, annuler',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b',
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      backdrop: `
        rgba(0,0,0,0.6)
        url("/images/loading-bars.svg")
        center top
        no-repeat
      `
    });

    if (!confirmation.isConfirmed) return;

    // Exécution de la requête
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/${userId}/subscriptions/${userPlan.userSubscription.subscriptionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      }
    );

    const data = await response.json();

    if (data.success) {
      // Message de succès avec animation
      await Swal.fire({
        title: 'Succès !',
        html: `Abonnement <b>${actionText}</b> avec succès`,
        icon: 'success',
        iconColor: '#86efac',
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: '#10b981',
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        },
        timer: 2500,
        timerProgressBar: true,
        willClose: () => {
          fetchData(); // Rafraîchir les données après fermeture
        }
      });
    } else {
      // Message d'erreur
      await Swal.fire({
        title: 'Erreur',
        text: data.message || "Une erreur s'est produite",
        icon: 'error',
        iconColor: '#fca5a5',
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: '#ef4444',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    await Swal.fire({
      title: 'Erreur critique',
      text: "Une erreur s'est produite lors de la mise à jour de l'abonnement",
      icon: 'error',
      iconColor: '#fca5a5',
      background: '#1e293b',
      color: '#f1f5f9',
      confirmButtonColor: '#ef4444',
      showClass: {
        popup: 'animate__animated animate__wobble'
      }
    });
  }
};
  // Fonction pour trouver le plan d'un utilisateur
  const getUserPlan = (userId) => {
    for (const plan of plansData) {
      const userInPlan = plan.users.find(user => user.id === userId);
      if (userInPlan) {
        return {
          ...plan,
          userSubscription: userInPlan
        };
      }
    }
    return null;
  };

  // Fonction pour afficher le badge du plan
  const displayUserPlanBadge = (userId) => {
    const userPlan = getUserPlan(userId);
    
    if (!userPlan) {
      return (
        <motion.span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <Star className="w-4 h-4 mr-1" />
          Gratuit
        </motion.span>
      );
    }
    
    const planIcon = planIcons[userPlan.tag] || planIcons['free'];
    const planColor = planColors[userPlan.tag] || planColors['free'];
    
    return (
      <motion.span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColor} border`}
        whileHover={{ scale: 1.05 }}
        title={userPlan.description}
      >
        {planIcon}
        <span className="ml-1">{userPlan.name}</span>
        {userPlan.popular && (
          <span className="ml-1 text-xs">⭐</span>
        )}
      </motion.span>
    );
  };

  // Fonction pour afficher les détails du plan
  const displayPlanDetails = (userId) => {
    const userPlan = getUserPlan(userId);
    
    if (!userPlan) {
      return (
        <div className="mt-2 text-xs text-gray-400">
          Aucun plan assigné
        </div>
      );
    }
    
    const subscription = userPlan.userSubscription;
    
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-300">Plan:</span>
          {displayUserPlanBadge(userId)}
        </div>
        
        {/* Détails de l'abonnement */}
        <div className="bg-gray-700/30 p-2 rounded-lg border border-gray-600">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-gray-400">Type:</div>
            <div className="text-gray-300 capitalize">{subscription.billingType}</div>
            
            <div className="text-gray-400">Prix:</div>
            <div className="text-gray-300">{subscription.price} DH</div>
            
            <div className="text-gray-400">Début:</div>
            <div className="text-gray-300">{moment(subscription.startDate).format('DD/MM/YYYY')}</div>
            
            <div className="text-gray-400">Expire:</div>
            <div className="text-gray-300">{moment(subscription.expiresAt).format('DD/MM/YYYY')}</div>
            
            <div className="text-gray-400">Renouv. auto:</div>
            <div className="text-gray-300">
              {subscription.autoRenew ? (
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
          
          {/* Statut de l'abonnement */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Statut:</span>
              {new Date(subscription.expiresAt) > new Date() ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-400/30">
                  <Check className="w-3 h-3 mr-1" />
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-400/30">
                  <X className="w-3 h-3 mr-1" />
                  Expiré
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Fonctionnalités du plan */}
        {userPlan.features && userPlan.features.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-400 mb-1">Fonctionnalités:</div>
            <ul className="space-y-1">
              {userPlan.features.map((feature, index) => (
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

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-purple-400" /> 
      : <ChevronDown className="w-4 h-4 text-purple-400" />;
  };

  const getUserStatus = (user) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    if (!user.lastLogin) return 'inactive';
    return new Date(user.lastLogin) >= thirtyDaysAgo ? 'active' : 'inactive';
  };

  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      plan: user.plan || 'free'
    });
  };

  if (loadingPlansData) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-300">Chargement des plans...</span>
      </div>
    );
  }
  return (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="relative mx-4"
  >
    {/* Fond élégant */}
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/10 to-transparent"></div>
    </div>

    {/* Conteneur principal */}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl"
    >
      {/* En-tête */}
      <div className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-md">
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-3"
          >
            <Users className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Gestion des Utilisateurs</h2>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-purple-900/30 text-purple-300 text-xs font-medium border border-purple-700/50">
              {filteredUsers.length} utilisateurs
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex space-x-2 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 text-sm text-white flex items-center space-x-1 w-full sm:w-auto justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rafraîchir</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Conteneur du tableau avec scroll horizontal si nécessaire */}
      <div className="overflow-x-auto">
        <div className="min-w-[1024px]">
          <table className="w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-400 focus:ring-offset-gray-900"
                    />
                  </motion.div>
                </th>
                
                {[
                  { key: 'name', label: 'Utilisateur' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Rôle' },
                  { key: 'isVerified', label: 'Statut' },
                  { key: 'createdAt', label: 'Inscription' },
                  { label: 'Abonnement' }
                ].map((header, idx) => (
                  <th 
                    key={idx}
                    scope="col" 
                    className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${header.key ? 'cursor-pointer' : ''}`}
                    onClick={() => header.key && requestSort(header.key)}
                  >
                    <motion.div 
                      whileHover={{ color: '#a78bfa' }}
                      className="flex items-center space-x-1"
                    >
                      <span>{header.label}</span>
                      {header.key && getSortIcon(header.key)}
                    </motion.div>
                  </th>
                ))}
                
                <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700/30">
              {filteredUsers.length === 0 ? (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users className="w-12 h-12 text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-400">Aucun utilisateur trouvé</h3>
                      <p className="text-gray-500 max-w-md text-center">
                        Essayez de modifier vos critères de recherche ou ajoutez un nouvel utilisateur
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                    className="group"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-400 focus:ring-offset-gray-900"
                        />
                      </motion.div>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          className="flex-shrink-0"
                        >
                          {getUserAvatar(user)}
                        </motion.div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{user.name}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {displayUserPlanBadge(user._id)}
                            {user.role === 'admin' && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-900/30 to-purple-700/30 text-purple-300 border border-purple-700/50"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Admin
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-white truncate max-w-[180px]">{user.email}</div>
                      {user.googleId && (
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="text-xs mt-1"
                        >
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-900/20 text-amber-300 border border-amber-800/50">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
                            Google
                          </span>
                        </motion.div>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 w-full"
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      ) : (
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-900/30 to-purple-700/30 text-purple-300 border border-purple-700/50' 
                              : 'bg-gray-700/30 text-gray-300 border border-gray-600/50'
                          }`}
                        >
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </motion.span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      {editingUser === user._id ? (
                        <div className="flex items-center">
                          <label className="inline-flex items-center space-x-2">
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <input
                                type="checkbox"
                                checked={editForm.isVerified}
                                onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                                className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-400"
                              />
                            </motion.div>
                            <span className="text-sm text-gray-300">
                              {editForm.isVerified ? 'Vérifié' : 'Non vérifié'}
                            </span>
                          </label>
                        </div>
                      ) : (
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                            user.isVerified 
                              ? 'bg-gradient-to-r from-green-900/30 to-green-700/30 text-green-300 border border-green-700/50' 
                              : 'bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 text-yellow-300 border border-yellow-700/50'
                          }`}
                        >
                          {user.isVerified ? (
                            <>
                              <BadgeCheck className="w-3 h-3 mr-1" />
                              Vérifié
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 mr-1" />
                              Non vérifié
                            </>
                          )}
                        </motion.span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-white">
                        {moment(user.createdAt).format('DD/MM/YY')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {user.lastLogin ? `Dernière connexion: ${moment(user.lastLogin).fromNow()}` : 'Jamais connecté'}
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="inline-block"
                      >
                        {displayPlanDetails(user._id)}
                      </motion.div>
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex justify-end flex-wrap gap-1">
                        {editingUser === user._id ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditSubmit(user._id)}
                              className="p-1 sm:p-1.5 rounded-lg bg-green-900/20 text-green-400 border border-green-800/50 hover:bg-green-800/30"
                              title="Confirmer"
                            >
                              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: -10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingUser(null)}
                              className="p-1 sm:p-1.5 rounded-lg bg-gray-700/20 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30"
                              title="Annuler"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditUser(user)}
                              className="p-1 sm:p-1.5 rounded-lg bg-blue-900/20 text-blue-400 border border-blue-800/50 hover:bg-blue-800/30"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleVerifyUser(user._id, !user.isVerified)}
                              className={`p-1 sm:p-1.5 rounded-lg border ${
                                user.isVerified 
                                  ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50 hover:bg-yellow-800/30' 
                                  : 'bg-green-900/20 text-green-400 border-green-800/50 hover:bg-green-800/30'
                              }`}
                              title={user.isVerified ? "Désactiver" : "Vérifier"}
                            >
                              {user.isVerified ? <UserX className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => showPasswordResetConfirmation(user._id)}
                              className="p-1 sm:p-1.5 rounded-lg bg-purple-900/20 text-purple-400 border border-purple-800/50 hover:bg-purple-800/30"
                              title="Réinitialiser mot de passe"
                            >
                              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleGenerateNewToken(user._id)}
                              className="p-1 sm:p-1.5 rounded-lg bg-indigo-900/20 text-indigo-400 border border-indigo-800/50 hover:bg-indigo-800/30"
                              title="Générer nouveau token"
                            >
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSubscriptionAction(user._id, 'pause')}
                              className="p-1 sm:p-1.5 rounded-lg bg-amber-900/20 text-amber-400 border border-amber-800/50 hover:bg-amber-800/30"
                              title="Mettre en pause"
                            >
                              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => showDeleteConfirmation(user._id)}
                              className="p-1 sm:p-1.5 rounded-lg bg-red-900/20 text-red-400 border border-red-800/50 hover:bg-red-800/30"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pied de tableau */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-4 sm:px-6 py-3 border-t border-gray-700/50 bg-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div className="text-sm text-gray-400">
          {selectedUsers.length > 0 ? (
            <span>{selectedUsers.length} sélectionné(s)</span>
          ) : (
            <span>{filteredUsers.length} utilisateur(s) au total</span>
          )}
        </div>
       
      </motion.div>
    </motion.div>
  </motion.div>
);
//   return (
//   <motion.div 
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     transition={{ duration: 0.5 }}
//     className="relative"
//   >
//     <div className="absolute inset-0 -z-10 overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>
//       <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/10 to-transparent"></div>
//     </div>

//     <motion.div
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ delay: 0.2, duration: 0.6 }}
//       className="relative bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
//     >
//       <div className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-md">
//         <div className="px-6 py-4 flex items-center justify-between">
//           <motion.div 
//             initial={{ x: -20 }}
//             animate={{ x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="flex items-center space-x-3"
//           >
//             <Users className="w-6 h-6 text-purple-400" />
//             <h2 className="text-xl font-bold text-white">Gestion des Utilisateurs</h2>
//             <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-xs font-medium border border-purple-700/50">
//               {filteredUsers.length} utilisateurs
//             </span>
//           </motion.div>
          
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//             className="flex space-x-2"
//           >
//             <motion.button
//               whileHover={{ y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={fetchData}
//               className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 text-sm text-white flex items-center space-x-1"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span>Rafraîchir</span>
//             </motion.button>
//           </motion.div>
//         </div>
//       </div>

//       <div className="relative">
//         <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent" 
//           style={{
//             boxShadow: "inset 0 0 20px rgba(168, 85, 247, 0.1)"
//           }}>
//         </div>

//         <table className="w-full divide-y divide-gray-700/50">
//           <thead className="bg-gray-800/50">
//             <tr>
//               <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                 <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
//                     onChange={handleSelectAll}
//                     className="h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-400 focus:ring-offset-gray-900"
//                   />
//                 </motion.div>
//               </th>
              
//               {[
//                 { key: 'name', label: 'Utilisateur' },
//                 { key: 'email', label: 'Email' },
//                 { key: 'role', label: 'Rôle' },
//                 { key: 'isVerified', label: 'Statut' },
//                 { key: 'createdAt', label: 'Inscription' },
//                 { label: 'Abonnement' }
//               ].map((header, idx) => (
//                 <th 
//                   key={idx}
//                   scope="col" 
//                   className={`px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${header.key ? 'cursor-pointer' : ''}`}
//                   onClick={() => header.key && requestSort(header.key)}
//                 >
//                   <motion.div 
//                     whileHover={{ color: '#a78bfa' }}
//                     className="flex items-center space-x-1"
//                   >
//                     <span>{header.label}</span>
//                     {header.key && getSortIcon(header.key)}
//                   </motion.div>
//                 </th>
//               ))}
              
//               <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700/30">
//             {filteredUsers.length === 0 ? (
//               <motion.tr 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <td colSpan="8" className="px-6 py-8 text-center">
//                   <div className="flex flex-col items-center justify-center space-y-3">
//                     <Users className="w-12 h-12 text-gray-500" />
//                     <h3 className="text-lg font-medium text-gray-400">Aucun utilisateur trouvé</h3>
//                     <p className="text-gray-500 max-w-md text-center">
//                       Essayez de modifier vos critères de recherche ou ajoutez un nouvel utilisateur
//                     </p>
//                   </div>
//                 </td>
//               </motion.tr>
//             ) : (
//               filteredUsers.map((user) => (
//                 <motion.tr
//                   key={user._id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3 }}
//                   whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
//                   className="group"
//                 >
//                   <td className="px-6 py-4">
//                     <motion.div whileHover={{ scale: 1.1 }}>
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user._id)}
//                         onChange={() => handleSelectUser(user._id)}
//                         className="h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-400 focus:ring-offset-gray-900"
//                       />
//                     </motion.div>
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="flex items-center space-x-4">
//                       <motion.div 
//                         whileHover={{ rotate: 5, scale: 1.05 }}
//                         className="flex-shrink-0"
//                       >
//                         {getUserAvatar(user)}
//                       </motion.div>
//                       <div>
//                         <div className="text-sm font-medium text-white flex items-center space-x-2">
//                           <span>{user.name}</span>
//                           {displayUserPlanBadge(user._id)}
//                           {user.role === 'admin' && (
//                             <motion.span 
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-900/30 to-purple-700/30 text-purple-300 border border-purple-700/50"
//                             >
//                               <ShieldCheck className="w-3 h-3 mr-1" />
//                               Admin
//                             </motion.span>
//                           )}
//                         </div>
//                         <div className="text-xs mt-1">
//                           <motion.span 
//                             animate={{ 
//                               color: getUserStatus(user) === 'active' ? '#34d399' : '#9ca3af',
//                               backgroundColor: getUserStatus(user) === 'active' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(156, 163, 175, 0.1)'
//                             }}
//                             className="inline-flex items-center px-2 py-0.5 rounded-full border"
//                           >
//                             <motion.span 
//                               animate={{ 
//                                 backgroundColor: getUserStatus(user) === 'active' ? '#34d399' : '#9ca3af'
//                               }}
//                               className="w-2 h-2 rounded-full mr-1"
//                             />
//                             {getUserStatus(user) === 'active' ? 'Actif' : 'Inactif'}
//                           </motion.span>
//                         </div>
//                       </div>
//                     </div>
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="text-sm text-white">{user.email}</div>
//                     {user.googleId && (
//                       <motion.div 
//                         initial={{ scale: 0.9 }}
//                         animate={{ scale: 1 }}
//                         className="text-xs mt-1"
//                       >
//                         <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-900/20 text-amber-300 border border-amber-800/50">
//                           <span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
//                           Compte Google
//                         </span>
//                       </motion.div>
//                     )}
//                   </td>

//                   <td className="px-6 py-4">
//                     {editingUser === user._id ? (
//                       <select
//                         value={editForm.role}
//                         onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
//                         className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//                       >
//                         <option value="user">Utilisateur</option>
//                         <option value="admin">Administrateur</option>
//                       </select>
//                     ) : (
//                       <motion.span 
//                         whileHover={{ scale: 1.05 }}
//                         className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
//                           user.role === 'admin' 
//                             ? 'bg-gradient-to-r from-purple-900/30 to-purple-700/30 text-purple-300 border border-purple-700/50' 
//                             : 'bg-gray-700/30 text-gray-300 border border-gray-600/50'
//                         }`}
//                       >
//                         {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
//                       </motion.span>
//                     )}
//                   </td>

//                   <td className="px-6 py-4">
//                     {editingUser === user._id ? (
//                       <div className="flex items-center">
//                         <label className="inline-flex items-center space-x-2">
//                           <motion.div whileTap={{ scale: 0.9 }}>
//                             <input
//                               type="checkbox"
//                               checked={editForm.isVerified}
//                               onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
//                               className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-400"
//                             />
//                           </motion.div>
//                           <span className="text-sm text-gray-300">
//                             {editForm.isVerified ? 'Vérifié' : 'Non vérifié'}
//                           </span>
//                         </label>
//                       </div>
//                     ) : (
//                       <motion.span 
//                         whileHover={{ scale: 1.05 }}
//                         className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                           user.isVerified 
//                             ? 'bg-gradient-to-r from-green-900/30 to-green-700/30 text-green-300 border border-green-700/50' 
//                             : 'bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 text-yellow-300 border border-yellow-700/50'
//                         }`}
//                       >
//                         {user.isVerified ? (
//                           <>
//                             <BadgeCheck className="w-3 h-3 mr-1" />
//                             Vérifié
//                           </>
//                         ) : (
//                           <>
//                             <X className="w-3 h-3 mr-1" />
//                             Non vérifié
//                           </>
//                         )}
//                       </motion.span>
//                     )}
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="text-sm text-white">
//                       {moment(user.createdAt).format('DD/MM/YYYY')}
//                     </div>
//                     <div className="text-xs text-gray-400 mt-1">
//                       {user.lastLogin ? `Dernière connexion: ${moment(user.lastLogin).fromNow()}` : 'Jamais connecté'}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4">
//                     <motion.div 
//                       whileHover={{ scale: 1.02 }}
//                       className="inline-block"
//                     >
//                       {displayPlanDetails(user._id)}
//                     </motion.div>
//                   </td>

//                   <td className="px-6 py-4 text-right">
//                     <div className="flex justify-end space-x-1">
//                       {editingUser === user._id ? (
//                         <>
//                           <motion.button
//                             whileHover={{ scale: 1.1, rotate: 10 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleEditSubmit(user._id)}
//                             className="p-1.5 rounded-lg bg-green-900/20 text-green-400 border border-green-800/50 hover:bg-green-800/30"
//                             title="Confirmer"
//                           >
//                             <Check className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, rotate: -10 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => setEditingUser(null)}
//                             className="p-1.5 rounded-lg bg-gray-700/20 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30"
//                             title="Annuler"
//                           >
//                             <X className="w-5 h-5" />
//                           </motion.button>
//                         </>
//                       ) : (
//                         <>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleEditUser(user)}
//                             className="p-1.5 rounded-lg bg-blue-900/20 text-blue-400 border border-blue-800/50 hover:bg-blue-800/30"
//                             title="Modifier"
//                           >
//                             <Edit className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleVerifyUser(user._id, !user.isVerified)}
//                             className={`p-1.5 rounded-lg border ${
//                               user.isVerified 
//                                 ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50 hover:bg-yellow-800/30' 
//                                 : 'bg-green-900/20 text-green-400 border-green-800/50 hover:bg-green-800/30'
//                             }`}
//                             title={user.isVerified ? "Désactiver" : "Vérifier"}
//                           >
//                             {user.isVerified ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => showPasswordResetConfirmation(user._id)}
//                             className="p-1.5 rounded-lg bg-purple-900/20 text-purple-400 border border-purple-800/50 hover:bg-purple-800/30"
//                             title="Réinitialiser mot de passe"
//                           >
//                             <Key className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleGenerateNewToken(user._id)}
//                             className="p-1.5 rounded-lg bg-indigo-900/20 text-indigo-400 border border-indigo-800/50 hover:bg-indigo-800/30"
//                             title="Générer nouveau token"
//                           >
//                             <Sparkles className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleSubscriptionAction(user._id, 'pause')}
//                             className="p-1.5 rounded-lg bg-amber-900/20 text-amber-400 border border-amber-800/50 hover:bg-amber-800/30"
//                             title="Mettre en pause"
//                           >
//                             <Pause className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => showDeleteConfirmation(user._id)}
//                             className="p-1.5 rounded-lg bg-red-900/20 text-red-400 border border-red-800/50 hover:bg-red-800/30"
//                             title="Supprimer"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </motion.button>
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <motion.div 
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//         className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30 flex items-center justify-between"
//       >
//         <div className="text-sm text-gray-400">
//           {selectedUsers.length > 0 ? (
//             <span>{selectedUsers.length} sélectionné(s)</span>
//           ) : (
//             <span>{filteredUsers.length} utilisateur(s) au total</span>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <motion.button
//             whileHover={{ y: -2 }}
//             whileTap={{ scale: 0.95 }}
//             className="px-3 py-1 text-sm text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 flex items-center space-x-1"
//           >
//             <Download className="w-4 h-4" />
//             <span>Exporter</span>
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   </motion.div>
// );
// return (
//   <motion.div 
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     transition={{ duration: 0.5 }}
//     className="relative"
//   >
//     {/* Effet de fond élégant */}
//     <div className="absolute inset-0 -z-10 overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>
//       <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/10 to-transparent"></div>
//     </div>

//     {/* Conteneur principal avec ombres et bordures subtiles */}
//     <motion.div
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ delay: 0.2, duration: 0.6 }}
//       className="relative bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
//     >
//       {/* En-tête avec effet de verre */}
//       <div className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-md">
//         <div className="px-6 py-4 flex items-center justify-between">
//           <motion.div 
//             initial={{ x: -20 }}
//             animate={{ x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="flex items-center space-x-3"
//           >
//             <Users className="w-6 h-6 text-purple-400" />
//             <h2 className="text-xl font-bold text-white">Gestion des Utilisateurs</h2>
//             <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-xs font-medium border border-purple-700/50">
//               {filteredUsers.length} utilisateurs
//             </span>
//           </motion.div>
          
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//             className="flex space-x-2"
//           >
//             <motion.button
//               whileHover={{ y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 text-sm text-white flex items-center space-x-1"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span>Rafraîchir</span>
//             </motion.button>
//           </motion.div>
//         </div>
//       </div>

//       {/* Tableau avec design premium */}
//       <div className="relative">
//         {/* Effet de lumière sur les bords */}
//         <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent" 
//           style={{
//             boxShadow: "inset 0 0 20px rgba(168, 85, 247, 0.1)"
//           }}>
//         </div>

//         <table className="w-full divide-y divide-gray-700/50">
//           <thead className="bg-gray-800/50">
//             <tr>
//               <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                 <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
//                     onChange={handleSelectAll}
//                     className="h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-400 focus:ring-offset-gray-900"
//                   />
//                 </motion.div>
//               </th>
              
//               {[
//                 { key: 'name', label: 'Utilisateur' },
//                 { key: 'email', label: 'Email' },
//                 { key: 'role', label: 'Rôle' },
//                 { key: 'isVerified', label: 'Statut' },
//                 { key: 'createdAt', label: 'Inscription' },
//                 { label: 'Abonnement' }
//               ].map((header, idx) => (
//                 <th 
//                   key={idx}
//                   scope="col" 
//                   className={`px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${header.key ? 'cursor-pointer' : ''}`}
//                   onClick={() => header.key && requestSort(header.key)}
//                 >
//                   <motion.div 
//                     whileHover={{ color: '#a78bfa' }}
//                     className="flex items-center space-x-1"
//                   >
//                     <span>{header.label}</span>
//                     {header.key && getSortIcon(header.key)}
//                   </motion.div>
//                 </th>
//               ))}
              
//               <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-700/30">
//             {filteredUsers.length === 0 ? (
//               <motion.tr 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <td colSpan="8" className="px-6 py-8 text-center">
//                   <div className="flex flex-col items-center justify-center space-y-3">
//                     <Users className="w-12 h-12 text-gray-500" />
//                     <h3 className="text-lg font-medium text-gray-400">Aucun utilisateur trouvé</h3>
//                     <p className="text-gray-500 max-w-md text-center">
//                       Essayez de modifier vos critères de recherche ou ajoutez un nouvel utilisateur
//                     </p>
//                   </div>
//                 </td>
//               </motion.tr>
//             ) : (
//               filteredUsers.map((user) => (
//                 <motion.tr
//                   key={user._id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3 }}
//                   whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
//                   className="group"
//                 >
//                   <td className="px-6 py-4">
//                     <motion.div whileHover={{ scale: 1.1 }}>
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user._id)}
//                         onChange={() => handleSelectUser(user._id)}
//                         className="h-4 w-4 text-purple-500 rounded bg-gray-700 border-gray-600 focus:ring-purple-400 focus:ring-offset-gray-900"
//                       />
//                     </motion.div>
//                   </td>

//                   {/* Cellule Utilisateur */}
//                   <td className="px-6 py-4">
//                     <div className="flex items-center space-x-4">
//                       <motion.div 
//                         whileHover={{ rotate: 5, scale: 1.05 }}
//                         className="flex-shrink-0"
//                       >
//                         {getUserAvatar(user)}
//                       </motion.div>
//                       <div>
//                         <div className="text-sm font-medium text-white flex items-center space-x-2">
//                           <span>{user.name}</span>
//                           {user.role === 'admin' && (
//                             <motion.span 
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-900/30 to-purple-700/30 text-purple-300 border border-purple-700/50"
//                             >
//                               <ShieldCheck className="w-3 h-3 mr-1" />
//                               Admin
//                             </motion.span>
//                           )}
//                         </div>
//                         <div className="text-xs mt-1">
//                           <motion.span 
//                             animate={{ 
//                               color: getUserStatus(user) === 'active' ? '#34d399' : '#9ca3af',
//                               backgroundColor: getUserStatus(user) === 'active' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(156, 163, 175, 0.1)'
//                             }}
//                             className="inline-flex items-center px-2 py-0.5 rounded-full border"
//                           >
//                             <motion.span 
//                               animate={{ 
//                                 backgroundColor: getUserStatus(user) === 'active' ? '#34d399' : '#9ca3af'
//                               }}
//                               className="w-2 h-2 rounded-full mr-1"
//                             />
//                             {getUserStatus(user) === 'active' ? 'Actif' : 'Inactif'}
//                           </motion.span>
//                         </div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Cellule Email */}
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-white">{user.email}</div>
//                     {user.googleId && (
//                       <motion.div 
//                         initial={{ scale: 0.9 }}
//                         animate={{ scale: 1 }}
//                         className="text-xs mt-1"
//                       >
//                         <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-900/20 text-amber-300 border border-amber-800/50">
//                           <span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
//                           Compte Google
//                         </span>
//                       </motion.div>
//                     )}
//                   </td>

//                   {/* Cellule Rôle */}
//                   <td className="px-6 py-4">
//                     {editingUser === user._id ? (
//                       <select
//                         value={editForm.role}
//                         onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
//                         className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
//                       >
//                         <option value="user">Utilisateur</option>
//                         <option value="admin">Administrateur</option>
//                       </select>
//                     ) : (
//                       <motion.span 
//                         whileHover={{ scale: 1.05 }}
//                         className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
//                           user.role === 'admin' 
//                             ? 'bg-gradient-to-r from-purple-900/30 to-purple-700/30 text-purple-300 border border-purple-700/50' 
//                             : 'bg-gray-700/30 text-gray-300 border border-gray-600/50'
//                         }`}
//                       >
//                         {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
//                       </motion.span>
//                     )}
//                   </td>

//                   {/* Cellule Statut */}
//                   <td className="px-6 py-4">
//                     {editingUser === user._id ? (
//                       <div className="flex items-center">
//                         <label className="inline-flex items-center space-x-2">
//                           <motion.div whileTap={{ scale: 0.9 }}>
//                             <input
//                               type="checkbox"
//                               checked={editForm.isVerified}
//                               onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
//                               className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-400"
//                             />
//                           </motion.div>
//                           <span className="text-sm text-gray-300">
//                             {editForm.isVerified ? 'Vérifié' : 'Non vérifié'}
//                           </span>
//                         </label>
//                       </div>
//                     ) : (
//                       <motion.span 
//                         whileHover={{ scale: 1.05 }}
//                         className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                           user.isVerified 
//                             ? 'bg-gradient-to-r from-green-900/30 to-green-700/30 text-green-300 border border-green-700/50' 
//                             : 'bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 text-yellow-300 border border-yellow-700/50'
//                         }`}
//                       >
//                         {user.isVerified ? (
//                           <>
//                             <BadgeCheck className="w-3 h-3 mr-1" />
//                             Vérifié
//                           </>
//                         ) : (
//                           <>
//                             <X className="w-3 h-3 mr-1" />
//                             Non vérifié
//                           </>
//                         )}
//                       </motion.span>
//                     )}
//                   </td>

//                   {/* Cellule Date d'inscription */}
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-white">
//                       {moment(user.createdAt).format('DD/MM/YYYY')}
//                     </div>
//                     <div className="text-xs text-gray-400 mt-1">
//                       {user.lastLogin ? `Dernière connexion: ${moment(user.lastLogin).fromNow()}` : 'Jamais connecté'}
//                     </div>
//                   </td>

//                   {/* Cellule Abonnement */}
//                   <td className="px-6 py-4">
//                     <motion.div 
//                       whileHover={{ scale: 1.02 }}
//                       className="inline-block"
//                     >
//                       {displayPlanDetails(user._id)}
//                     </motion.div>
//                   </td>

//                   {/* Cellule Actions */}
//                   <td className="px-6 py-4 text-right">
//                     <div className="flex justify-end space-x-1">
//                       {editingUser === user._id ? (
//                         <>
//                           <motion.button
//                             whileHover={{ scale: 1.1, rotate: 10 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleEditSubmit(user._id)}
//                             className="p-1.5 rounded-lg bg-green-900/20 text-green-400 border border-green-800/50 hover:bg-green-800/30"
//                             title="Confirmer"
//                           >
//                             <Check className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, rotate: -10 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => setEditingUser(null)}
//                             className="p-1.5 rounded-lg bg-gray-700/20 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30"
//                             title="Annuler"
//                           >
//                             <X className="w-5 h-5" />
//                           </motion.button>
//                         </>
//                       ) : (
//                         <>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleEditUser(user)}
//                             className="p-1.5 rounded-lg bg-blue-900/20 text-blue-400 border border-blue-800/50 hover:bg-blue-800/30"
//                             title="Modifier"
//                           >
//                             <Edit className="w-5 h-5" />
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => handleVerifyUser(user._id, !user.isVerified)}
//                             className={`p-1.5 rounded-lg border ${
//                               user.isVerified 
//                                 ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50 hover:bg-yellow-800/30' 
//                                 : 'bg-green-900/20 text-green-400 border-green-800/50 hover:bg-green-800/30'
//                             }`}
//                             title={user.isVerified ? "Désactiver" : "Vérifier"}
//                           >
//                             {user.isVerified ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
//                           </motion.button>
//                           <motion.button
//                             whileHover={{ scale: 1.1, y: -2 }}
//                             whileTap={{ scale: 0.9 }}
//                             onClick={() => showDeleteConfirmation(user._id)}
//                             className="p-1.5 rounded-lg bg-red-900/20 text-red-400 border border-red-800/50 hover:bg-red-800/30"
//                             title="Supprimer"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </motion.button>
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pied de tableau animé */}
//       <motion.div 
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//         className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30 flex items-center justify-between"
//       >
//         <div className="text-sm text-gray-400">
//           {selectedUsers.length > 0 ? (
//             <span>{selectedUsers.length} sélectionné(s)</span>
//           ) : (
//             <span>{filteredUsers.length} utilisateur(s) au total</span>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <motion.button
//             whileHover={{ y: -2 }}
//             whileTap={{ scale: 0.95 }}
//             className="px-3 py-1 text-sm text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/50 flex items-center space-x-1"
//           >
//             <Download className="w-4 h-4" />
//             <span>Exporter</span>
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   </motion.div>
// );///v2
//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2 }}
//       className="overflow-x-auto rounded-xl border border-gray-700 shadow-2xl"
//     >
//       <table className="min-w-full divide-y divide-gray-700">
//         <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
//           <tr>
//             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
//                   onChange={handleSelectAll}
//                   className="h-4 w-4 text-purple-600 rounded bg-gray-700 border-gray-600 focus:ring-purple-500"
//                 />
//               </div>
//             </th>
//             <th 
//               scope="col" 
//               className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
//               onClick={() => requestSort('name')}
//             >
//               <div className="flex items-center gap-1">
//                 Utilisateur
//                 {getSortIcon('name')}
//               </div>
//             </th>
//             <th 
//               scope="col" 
//               className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
//               onClick={() => requestSort('email')}
//             >
//               <div className="flex items-center gap-1">
//                 Email
//                 {getSortIcon('email')}
//               </div>
//             </th>
//             <th 
//               scope="col" 
//               className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
//               onClick={() => requestSort('role')}
//             >
//               <div className="flex items-center gap-1">
//                 Rôle
//                 {getSortIcon('role')}
//               </div>
//             </th>
//             <th 
//               scope="col" 
//               className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
//               onClick={() => requestSort('isVerified')}
//             >
//               <div className="flex items-center gap-1">
//                 Statut
//                 {getSortIcon('isVerified')}
//               </div>
//             </th>
//             <th 
//               scope="col" 
//               className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
//               onClick={() => requestSort('createdAt')}
//             >
//               <div className="flex items-center gap-1">
//                 Inscrit le
//                 {getSortIcon('createdAt')}
//               </div>
//             </th>
//             <th 
//               scope="col" 
//               className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
//             >
//               <div className="flex items-center gap-1">
//                 Plan & Abonnement
//               </div>
//             </th>
//             <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody className="bg-gray-800 divide-y divide-gray-700">
//           {filteredUsers.length === 0 ? (
//             <tr>
//               <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
//                 Aucun utilisateur trouvé
//               </td>
//             </tr>
//           ) : (
//             filteredUsers.map((user) => (
//               <motion.tr
//                 key={user._id}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className={`hover:bg-gray-750 ${selectedUsers.includes(user._id) ? 'bg-gray-750' : ''}`}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <input
//                     type="checkbox"
//                     checked={selectedUsers.includes(user._id)}
//                     onChange={() => handleSelectUser(user._id)}
//                     className="h-4 w-4 text-purple-600 rounded bg-gray-700 border-gray-600 focus:ring-purple-500"
//                   />
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0">
//                       {getUserAvatar(user)}
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-white flex items-center gap-2">
//                         {user.name}
//                         {displayUserPlanBadge(user._id)}
//                         {user.role === 'admin' && (
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-700">
//                             <ShieldCheck className="w-3 h-3 mr-1" />
//                             Admin
//                           </span>
//                         )}
//                       </div>
//                       <div className="text-xs text-gray-400 mt-1">
//                         {getUserStatus(user) === 'active' ? (
//                           <span className="inline-flex items-center text-green-400">
//                             <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
//                             Actif
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center text-gray-400">
//                             <span className="w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
//                             Inactif
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-white">{user.email}</div>
//                   {user.googleId && (
//                     <div className="text-xs text-amber-400 flex items-center mt-1">
//                       <span className="bg-amber-900/20 px-1.5 py-0.5 rounded flex items-center border border-amber-800">
//                         <span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
//                         Google
//                       </span>
//                     </div>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {editingUser === user._id ? (
//                     <select
//                       value={editForm.role}
//                       onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
//                       className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
//                     >
//                       <option value="user">Utilisateur</option>
//                       <option value="admin">Administrateur</option>
//                     </select>
//                   ) : (
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       user.role === 'admin' 
//                         ? 'bg-purple-900/30 text-purple-300 border border-purple-700' 
//                         : 'bg-gray-700/30 text-gray-300 border border-gray-600'
//                     }`}>
//                       {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {editingUser === user._id ? (
//                     <div className="flex items-center">
//                       <label className="inline-flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={editForm.isVerified}
//                           onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
//                           className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-300">
//                           {editForm.isVerified ? 'Vérifié' : 'Non vérifié'}
//                         </span>
//                       </label>
//                     </div>
//                   ) : (
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       user.isVerified 
//                         ? 'bg-green-900/30 text-green-300 border border-green-700' 
//                         : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
//                     }`}>
//                       {user.isVerified ? (
//                         <span className="flex items-center">
//                           <BadgeCheck className="w-3 h-3 mr-1" />
//                           Vérifié
//                         </span>
//                       ) : (
//                         <span className="flex items-center">
//                           <X className="w-3 h-3 mr-1" />
//                           Non vérifié
//                         </span>
//                       )}
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
//                   {moment(user.createdAt).format('DD/MM/YYYY')}
//                   <div className="text-xs text-gray-500 mt-1">
//                     {user.lastLogin ? `Dernière connexion: ${moment(user.lastLogin).fromNow()}` : 'Jamais connecté'}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {displayPlanDetails(user._id)}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   {editingUser === user._id ? (
//                     <div className="flex space-x-2 justify-end">
               

//                 <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={() => handleSubscriptionAction(user._id, 'deactivate')}
//                 className="text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 p-1 rounded-lg border border-yellow-800"
//                 title="Désactiver l'abonnement"
//                 >
//                 <EyeOff className="w-5 h-5" />
//                 </motion.button>
// <motion.button
//   whileHover={{ scale: 1.1 }}
//   whileTap={{ scale: 0.9 }}
//   onClick={() => handleGenerateNewToken(user._id)}
//   className="text-indigo-400 hover:text-indigo-300 bg-indigo-900/20 p-1 rounded-lg border border-indigo-800"
//   title="Générer un nouveau token"
// >
//   <Key className="w-5 h-5" />
// </motion.button>
//                 <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={() => handleSubscriptionAction(user._id, 'cancel')}
//                 className="text-red-400 hover:text-red-300 bg-red-900/20 p-1 rounded-lg border border-red-800"
//                 title="Annuler l'abonnement"
//                 >
//                 <X className="w-5 h-5" />
//                 </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => handleEditSubmit(user._id)}
//                         disabled={isLoading}
//                         className="text-green-400 hover:text-green-300 bg-green-900/20 p-1 rounded-lg border border-green-800"
//                         title="Confirmer"
//                       >
//                         <Check className="w-5 h-5" />
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => setEditingUser(null)}
//                         className="text-gray-400 hover:text-gray-300 bg-gray-700/20 p-1 rounded-lg border border-gray-600"
//                         title="Annuler"
//                       >
//                         <X className="w-5 h-5" />
//                       </motion.button>
//                     </div>
//                   ) : (
//                     <div className="flex items-center space-x-2 justify-end">
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => handleEditUser(user)}
//                         className="text-blue-400 hover:text-blue-300 bg-blue-900/20 p-1 rounded-lg border border-blue-800"
//                         title="Modifier"
//                       >
//                         <Edit className="w-5 h-5" />
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => handleVerifyUser(user._id, !user.isVerified)}
//                         className={user.isVerified ? "text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 p-1 rounded-lg border border-yellow-800" : "text-green-400 hover:text-green-300 bg-green-900/20 p-1 rounded-lg border border-green-800"}
//                         title={user.isVerified ? "Désactiver" : "Vérifier"}
//                       >
//                         {user.isVerified ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => showPasswordResetConfirmation(user._id)}
//                         className="text-purple-400 hover:text-purple-300 bg-purple-900/20 p-1 rounded-lg border border-purple-800"
//                         title="Réinitialiser mot de passe"
//                       >
//                         <Key className="w-5 h-5" />
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => showDeleteConfirmation(user._id)}
//                         className="text-red-400 hover:text-red-300 bg-red-900/20 p-1 rounded-lg border border-red-800"
//                         title="Supprimer"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </motion.button>
//                     </div>
//                   )}
//                 </td>
//               </motion.tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </motion.div>
//   );
};

export default UserTable;