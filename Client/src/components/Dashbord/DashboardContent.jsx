import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Key, 
  Server,
  Terminal,
  Rocket,
  Sparkles,
  Activity,
  TrendingUp,
  Calendar,
  AlertCircle,
  Code,
  ChevronDown,
  ChevronUp,
  Globe,
  Database,
  Package,
  Shield,
  Zap
} from 'lucide-react';

const DashboardContent = ({ user, stats, subscription, apiKeys, securityLogs }) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalRequests: 0,
    activeKeys: 0,
    planName: 'Aucun Plan',
    requestsLimit: 100,
    requestsUsed: 0,
    apiCount: 0
  });
  const [availableEndpoints, setAvailableEndpoints] = useState([]);
  const [showAllEndpoints, setShowAllEndpoints] = useState(false);
  const [planDetails, setPlanDetails] = useState(null);
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);

  // Fetch plan details and available APIs
  useEffect(() => {
    const fetchPlanDetails = async () => {
      setLoadingPlanDetails(true);
      try {
        const response = await fetch(`/api/api/tunnel/admin/all_endpoints_by_tag`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des plans');
        }
        
        const data = await response.json();
        setPlanDetails(data);
        
        // Update endpoints based on current plan
        if (subscription?.data?.plan) {
          const userPlan = subscription.data.plan.toLowerCase();
          const endpoints = data[userPlan] || [];
          setAvailableEndpoints(endpoints);
          
          setDashboardStats(prev => ({
            ...prev,
            apiCount: endpoints.length
          }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des plans:', err);
      } finally {
        setLoadingPlanDetails(false);
      }
    };

    fetchPlanDetails();
  }, [subscription]);

  useEffect(() => {
    if (stats) {
      setDashboardStats(prev => ({
        ...prev,
        totalRequests: stats.totalRequests || 0,
        requestsUsed: stats.requestsUsed || 0,
        requestsLimit: stats.requestsLimit || 100
      }));
    }

    if (subscription?.data) {
      setDashboardStats(prev => ({
        ...prev,
        planName: subscription.data.plan || 'Aucun Plan',
        requestsLimit: subscription.data.requestsLimit || 100
      }));
    }

    if (apiKeys) {
      const activeKeysCount = apiKeys.filter(key => key.status === 'active' || key.isActive).length;
      setDashboardStats(prev => ({
        ...prev,
        activeKeys: activeKeysCount
      }));
    }

    if (securityLogs && securityLogs.length > 0) {
      const recentLogs = securityLogs
        .filter(log => log.type === 'api_request' || log.action === 'api_call')
        .slice(0, 5)
        .map(log => ({
          id: log.id,
          action: log.action || 'Requête API',
          timestamp: log.timestamp || log.created_at,
          status: log.status || 'success',
          details: log.details || log.description
        }));
      setRecentActivity(recentLogs);
    }
  }, [stats, subscription, apiKeys, securityLogs]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'À l\'instant';
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
      if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
      return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'active':
      case '200':
        return 'text-green-500';
      case 'error':
      case 'failed':
      case '400':
      case '401':
      case '403':
      case '404':
        return 'text-red-500';
      case 'warning':
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return '200 OK';
      case 'error':
        return '400 Error';
      case 'failed':
        return '500 Error';
      default:
        return status || '200 OK';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'POST':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case 'basique':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'entreprise':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan.toLowerCase()) {
      case 'basique':
        return Package;
      case 'pro':
        return Shield;
      case 'entreprise':
        return Zap;
      default:
        return Package;
    }
  };

  const usagePercentage = dashboardStats.requestsLimit > 0 
    ? (dashboardStats.requestsUsed / dashboardStats.requestsLimit) * 100 
    : 0;

  const displayedEndpoints = showAllEndpoints ? availableEndpoints : availableEndpoints.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">
          Bienvenue, <span className="text-blue-400">{user?.name || 'Utilisateur'}</span>!
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Rocket className="w-4 h-4" />
          <span>Nouvelle fonctionnalité</span>
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 backdrop-blur-sm"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-300">Requêtes totales</h3>
            <Activity className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-white">{dashboardStats.totalRequests.toLocaleString()}</p>
          <p className="text-sm text-blue-300 mt-1">Ce mois</p>
        </motion.div>

        <motion.div 
          className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 backdrop-blur-sm"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-300">Votre plan</h3>
            <CreditCard className="text-green-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-white">{dashboardStats.planName}</p>
        </motion.div>
        
        <motion.div 
          className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 backdrop-blur-sm"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-purple-300">APIs disponibles</h3>
            <Key className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-white">
            {dashboardStats.apiCount}
          </p>
          <p className="text-sm text-purple-300 mt-1">Endpoints</p>
        </motion.div>

        <motion.div 
          className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 backdrop-blur-sm"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-yellow-300">Utilisation</h3>
            <TrendingUp className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-white">{usagePercentage.toFixed(1)}%</p>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <motion.div 
              className={`h-2 rounded-full ${
                usagePercentage > 80 ? 'bg-red-500' : 
                usagePercentage > 60 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-yellow-300 mt-1">
            {dashboardStats.requestsUsed.toLocaleString()} / {dashboardStats.requestsLimit.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Plans disponibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Plans disponibles</h3>
            <div className="flex items-center gap-2">
              <Server className="text-gray-400 w-5 h-5" />
              <span className="text-sm text-gray-400">Tous les plans</span>
            </div>
          </div>
          
          {loadingPlanDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
              <p className="text-gray-400">Chargement des plans...</p>
            </div>
          ) : planDetails ? (
            <div className="space-y-4">
              {Object.entries(planDetails).map(([planName, apis]) => {
                const PlanIcon = getPlanIcon(planName);
                const isCurrentPlan = planName.toLowerCase() === dashboardStats.planName.toLowerCase();
                
                return (
                  <motion.div 
                    key={planName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center p-4 rounded-lg border transition-all ${
                      isCurrentPlan 
                        ? 'bg-blue-900/30 border-blue-500/50' 
                        : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <div className={`p-3 rounded-lg mr-4 border ${getPlanColor(planName)}`}>
                      <PlanIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white capitalize">{planName}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPlanColor(planName)}`}>
                          {apis.length} APIs
                        </span>
                        {isCurrentPlan && (
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                            Plan actuel
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {apis.length} endpoint{apis.length > 1 ? 's' : ''} disponible{apis.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {apis.length}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Impossible de charger les plans</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Vos endpoints</h3>
            <div className="flex items-center gap-2">
              <Globe className="text-gray-400 w-5 h-5" />
              <span className="text-sm text-gray-400">{dashboardStats.planName}</span>
            </div>
          </div>
          
          {availableEndpoints.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Aucun endpoint disponible</p>
              <p className="text-sm text-gray-500 mt-1">Mettez à niveau votre plan pour accéder aux APIs</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {displayedEndpoints.map((endpoint, index) => (
                  <motion.div 
                    key={endpoint.name || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-3 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="bg-purple-900/30 p-2 rounded-lg mr-3 border border-purple-500/30">
                      <Code className="text-purple-400 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {endpoint.name || 'Endpoint'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {endpoint.path}
                      </p>
                      {endpoint.summary && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {endpoint.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {endpoint.methods?.map((method, methodIndex) => (
                        <span
                          key={methodIndex}
                          className={`px-2 py-1 text-xs font-medium rounded border ${getMethodColor(method)}`}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {availableEndpoints.length > 3 && (
                <div className="text-center pt-2">
                  <motion.button
                    onClick={() => setShowAllEndpoints(!showAllEndpoints)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium mx-auto"
                  >
                    {showAllEndpoints ? (
                      <>
                        <span>Voir moins</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Voir tous ({availableEndpoints.length})</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
};

export default DashboardContent;