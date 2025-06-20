import { motion } from 'framer-motion';
import { User, Mail, Lock, Key } from 'lucide-react';
import { useState } from 'react';

const RegisterForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <Key className="text-blue-400 mx-auto mb-4" size={40} />
        <h3 className="text-2xl font-bold text-gray-100">Inscription</h3>
      </div>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nom complet</label>
          <div className="relative">
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              placeholder="Votre nom"
              value={formData.name}
              onChange={handleChange}
            />
            <User className="absolute right-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              placeholder="email@exemple.com"
              value={formData.email}
              onChange={handleChange}
            />
            <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <motion.button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          S'inscrire
        </motion.button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Vous avez déjà un compte? {' '}
          <button 
            onClick={switchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;