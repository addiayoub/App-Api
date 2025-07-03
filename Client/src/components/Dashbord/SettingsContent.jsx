import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SettingsContent = ({ userSettings, fetchData, user }) => {
  const [formData, setFormData] = useState({
    name: userSettings.name || user?.name || '',
    email: userSettings.email || user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/settings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Paramètres mis à jour');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Paramètres</h2>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center mb-8">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="User" 
              className="w-16 h-16 rounded-full border-2 border-blue-500 mr-4" 
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400 mr-4">
              <User className="text-white" size={24} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-white">{user?.name || 'Utilisateur'}</h3>
            <p className="text-gray-400">{user?.email || 'email@example.com'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom complet</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default SettingsContent;