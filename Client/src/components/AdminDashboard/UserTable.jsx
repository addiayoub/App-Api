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
import moment from 'moment';

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
  if (!confirm('Êtes-vous sûr de vouloir générer un nouveau token ? L\'ancien token ne sera plus valide.')) {
    return;
  }

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
      alert('Un nouveau token a été généré et envoyé à l\'utilisateur');
      // Rafraîchir les données si nécessaire
      fetchData();
    } else {
      alert(data.message || "Une erreur s'est produite");
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert("Erreur lors de la génération du nouveau token");
  }
};
const handleSubscriptionAction = async (userId, action) => {
  try {
    const token = localStorage.getItem('token');
    const userPlan = getUserPlan(userId);
    
    if (!userPlan || !userPlan.userSubscription) {
      alert("L'utilisateur n'a pas d'abonnement actif");
      return;
    }

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
      alert(`Abonnement ${action} avec succès`);
      fetchData(); // Rafraîchir les données
    } else {
      alert(data.message || "Une erreur s'est produite");
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert("Une erreur s'est produite lors de la mise à jour de l'abonnement");
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="overflow-x-auto rounded-xl border border-gray-700 shadow-2xl"
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-purple-600 rounded bg-gray-700 border-gray-600 focus:ring-purple-500"
                />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => requestSort('name')}
            >
              <div className="flex items-center gap-1">
                Utilisateur
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => requestSort('email')}
            >
              <div className="flex items-center gap-1">
                Email
                {getSortIcon('email')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => requestSort('role')}
            >
              <div className="flex items-center gap-1">
                Rôle
                {getSortIcon('role')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => requestSort('isVerified')}
            >
              <div className="flex items-center gap-1">
                Statut
                {getSortIcon('isVerified')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => requestSort('createdAt')}
            >
              <div className="flex items-center gap-1">
                Inscrit le
                {getSortIcon('createdAt')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors"
            >
              <div className="flex items-center gap-1">
                Plan & Abonnement
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`hover:bg-gray-750 ${selectedUsers.includes(user._id) ? 'bg-gray-750' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                    className="h-4 w-4 text-purple-600 rounded bg-gray-700 border-gray-600 focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getUserAvatar(user)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {user.name}
                        {displayUserPlanBadge(user._id)}
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-700">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getUserStatus(user) === 'active' ? (
                          <span className="inline-flex items-center text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                            Inactif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{user.email}</div>
                  {user.googleId && (
                    <div className="text-xs text-amber-400 flex items-center mt-1">
                      <span className="bg-amber-900/20 px-1.5 py-0.5 rounded flex items-center border border-amber-800">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
                        Google
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user._id ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-900/30 text-purple-300 border border-purple-700' 
                        : 'bg-gray-700/30 text-gray-300 border border-gray-600'
                    }`}>
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user._id ? (
                    <div className="flex items-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={editForm.isVerified}
                          onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                          className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-300">
                          {editForm.isVerified ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isVerified 
                        ? 'bg-green-900/30 text-green-300 border border-green-700' 
                        : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                    }`}>
                      {user.isVerified ? (
                        <span className="flex items-center">
                          <BadgeCheck className="w-3 h-3 mr-1" />
                          Vérifié
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <X className="w-3 h-3 mr-1" />
                          Non vérifié
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {moment(user.createdAt).format('DD/MM/YYYY')}
                  <div className="text-xs text-gray-500 mt-1">
                    {user.lastLogin ? `Dernière connexion: ${moment(user.lastLogin).fromNow()}` : 'Jamais connecté'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {displayPlanDetails(user._id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUser === user._id ? (
                    <div className="flex space-x-2 justify-end">
               

                <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSubscriptionAction(user._id, 'deactivate')}
                className="text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 p-1 rounded-lg border border-yellow-800"
                title="Désactiver l'abonnement"
                >
                <EyeOff className="w-5 h-5" />
                </motion.button>
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={() => handleGenerateNewToken(user._id)}
  className="text-indigo-400 hover:text-indigo-300 bg-indigo-900/20 p-1 rounded-lg border border-indigo-800"
  title="Générer un nouveau token"
>
  <Key className="w-5 h-5" />
</motion.button>
                <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSubscriptionAction(user._id, 'cancel')}
                className="text-red-400 hover:text-red-300 bg-red-900/20 p-1 rounded-lg border border-red-800"
                title="Annuler l'abonnement"
                >
                <X className="w-5 h-5" />
                </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditSubmit(user._id)}
                        disabled={isLoading}
                        className="text-green-400 hover:text-green-300 bg-green-900/20 p-1 rounded-lg border border-green-800"
                        title="Confirmer"
                      >
                        <Check className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingUser(null)}
                        className="text-gray-400 hover:text-gray-300 bg-gray-700/20 p-1 rounded-lg border border-gray-600"
                        title="Annuler"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400 hover:text-blue-300 bg-blue-900/20 p-1 rounded-lg border border-blue-800"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleVerifyUser(user._id, !user.isVerified)}
                        className={user.isVerified ? "text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 p-1 rounded-lg border border-yellow-800" : "text-green-400 hover:text-green-300 bg-green-900/20 p-1 rounded-lg border border-green-800"}
                        title={user.isVerified ? "Désactiver" : "Vérifier"}
                      >
                        {user.isVerified ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => showPasswordResetConfirmation(user._id)}
                        className="text-purple-400 hover:text-purple-300 bg-purple-900/20 p-1 rounded-lg border border-purple-800"
                        title="Réinitialiser mot de passe"
                      >
                        <Key className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => showDeleteConfirmation(user._id)}
                        className="text-red-400 hover:text-red-300 bg-red-900/20 p-1 rounded-lg border border-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default UserTable;