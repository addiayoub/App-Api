import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
  Zap,
  Sparkles,
  Shield,
  BadgeCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminSubscriptionsContent = ({ subscriptions, fetchData }) => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    tag: '',
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [''],
    popular: false,
    active: true
  });
  const [showMonthly, setShowMonthly] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlans(response.data.data || response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load plans');
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleEdit = (plan) => {
    setEditingPlan({ ...plan });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPlan({
      ...editingPlan,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = value;
    setEditingPlan({
      ...editingPlan,
      features: newFeatures
    });
  };

  const addFeature = () => {
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, '']
    });
  };

  const removeFeature = (index) => {
    const newFeatures = editingPlan.features.filter((_, i) => i !== index);
    setEditingPlan({
      ...editingPlan,
      features: newFeatures
    });
  };

 const savePlan = async () => {
  try {
    // 1. Mise à jour optimiste
    setPlans(prev => prev.map(p => 
      p._id === editingPlan._id ? editingPlan : p
    ));

    // 2. Envoi à l'API
    const token = localStorage.getItem('token');
    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/plans/${editingPlan._id}`,
      editingPlan,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 3. Synchronisation avec le serveur
    toast.success('Plan updated successfully');
    setEditingPlan(null);
    fetchData(); // Recharge les données fraîches
  } catch (error) {
    // 4. Rollback en cas d'erreur
    fetchData(); // Recharge les données originales
    console.error('Error updating plan:', error);
    toast.error('Failed to update plan');
  }
};

  const deletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlan({
      ...newPlan,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateFeatureChange = (index, value) => {
    const newFeatures = [...newPlan.features];
    newFeatures[index] = value;
    setNewPlan({
      ...newPlan,
      features: newFeatures
    });
  };

  const addCreateFeature = () => {
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, '']
    });
  };

  const removeCreateFeature = (index) => {
    const newFeatures = newPlan.features.filter((_, i) => i !== index);
    setNewPlan({
      ...newPlan,
      features: newFeatures
    });
  };

  const createPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/plans`,
        newPlan,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Plan created successfully');
      setIsCreating(false);
      setNewPlan({
        name: '',
        tag: '',
        description: '',
        monthlyPrice: 0,
        annualPrice: 0,
        features: [''],
        popular: false,
        active: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
    }
  };

  const getPlanColor = (name) => {
    switch (name.toLowerCase()) {
      case 'basique': return 'from-blue-500 to-blue-600';
      case 'pro': return 'from-purple-500 to-purple-600';
      case 'entreprise': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'basique': return <Zap className="w-5 h-5" />;
      case 'pro': return <TrendingUp className="w-5 h-5" />;
      case 'entreprise': return <Sparkles className="w-5 h-5" />;
      default: return <BadgeCheck className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-blue-500"
        >
          <RefreshCw className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <CreditCard className="w-6 h-6 mr-2 text-purple-400" />
          Subscription Plans Management
        </h2>
        <div className="flex items-center space-x-4">
          {/* Pricing Toggle */}
          <div className="flex items-center bg-gray-800 rounded-full p-1">
            <motion.button
              onClick={() => setShowMonthly(true)}
              className={`relative px-4 py-2 rounded-full z-10 text-sm font-medium ${
                showMonthly ? 'text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Monthly
              {showMonthly && (
                <motion.span
                  layoutId="pricingToggle"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setShowMonthly(false)}
              className={`relative px-4 py-2 rounded-full z-10 text-sm font-medium ${
                !showMonthly ? 'text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Annual
              {!showMonthly && (
                <motion.span
                  layoutId="pricingToggle"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Plan
          </motion.button>
        </div>
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Create New Plan</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newPlan.name}
                    onChange={handleCreateChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tag</label>
                  <select
                    name="tag"
                    value={newPlan.tag}
                    onChange={handleCreateChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a tag</option>
                    <option value="basique">Basique</option>
                    <option value="pro">Pro</option>
                    <option value="entreprise">Entreprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newPlan.description}
                    onChange={handleCreateChange}
                    rows="3"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Price ($)</label>
                    <input
                      type="number"
                      name="monthlyPrice"
                      value={newPlan.monthlyPrice}
                      onChange={handleCreateChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Annual Price ($)</label>
                    <input
                      type="number"
                      name="annualPrice"
                      value={newPlan.annualPrice}
                      onChange={handleCreateChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={newPlan.popular}
                    onChange={handleCreateChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">Mark as Popular</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={newPlan.active}
                    onChange={handleCreateChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">Active Plan</label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
              <div className="space-y-2">
                {newPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleCreateFeatureChange(index, e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeCreateFeature(index)}
                      className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCreateFeature}
                  className="mt-2 flex items-center text-sm text-purple-400 hover:text-purple-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Feature
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={createPlan}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Plan
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            className={`bg-gradient-to-br ${getPlanColor(plan.name)} p-1 rounded-xl shadow-lg`}
          >
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg h-full p-6 flex flex-col">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-lg">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-xl font-bold text-white ml-3">{plan.name}</h3>
                </div>
                {plan.popular && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                )}
              </div>

              <p className="text-gray-300 mt-3 text-sm">{plan.description}</p>

              <div className="mt-4">
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-white">
                    ${showMonthly ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="text-gray-400 ml-1">/{showMonthly ? 'month' : 'year'}</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {showMonthly ? (
                    <>or ${plan.annualPrice} billed annually</>
                  ) : (
                    <>only ${(plan.annualPrice / 12).toFixed(2)} per month</>
                  )}
                </div>
              </div>

              <div className="mt-6 flex-1">
                <h4 className="text-sm font-semibold text-white mb-2">FEATURES</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(plan)}
                  className="flex items-center text-sm bg-gray-700/50 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deletePlan(plan._id)}
                  className="flex items-center text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800/95 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-xl w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Edit Plan</h3>
                <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editingPlan.name}
                      onChange={handleEditChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tag</label>
                    <select
                      name="tag"
                      value={editingPlan.tag}
                      onChange={handleEditChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="basique">Basique</option>
                      <option value="pro">Pro</option>
                      <option value="entreprise">Entreprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={editingPlan.description}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Price ($)</label>
                      <input
                        type="number"
                        name="monthlyPrice"
                        value={editingPlan.monthlyPrice}
                        onChange={handleEditChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Annual Price ($)</label>
                      <input
                        type="number"
                        name="annualPrice"
                        value={editingPlan.annualPrice}
                        onChange={handleEditChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={editingPlan.popular}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-300">Mark as Popular</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={editingPlan.active}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-300">Active Plan</label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                <div className="space-y-2">
                  {editingPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-500 hover:text-red-400 rounded-full hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="mt-2 flex items-center text-sm text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={savePlan}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscriptionsContent;