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


const MySwal = withReactContent(Swal);

const UserFilters = ({ searchTerm, setSearchTerm, filters, setFilters, isFilterOpen, setIsFilterOpen, plans, loadingPlans }) => {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 overflow-hidden border border-gray-700 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rôle</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous les rôles</option>
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Statut vérification</label>
                <select
                  value={filters.isVerified}
                  onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous</option>
                  <option value="true">Vérifié</option>
                  <option value="false">Non vérifié</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Activité</label>
                <select
                  value={filters.active}
                  onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous</option>
                  <option value="active">Actif (30j)</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plan</label>
                <select
                  value={filters.plan}
                  onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous les plans</option>
                  {Object.entries(plans).map(([key, plan]) => (
                    <option key={key} value={key}>{plan.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilters({ role: '', isVerified: '', active: '', plan: '' })}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400 w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg transition-all"
        />
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="text-gray-400 w-5 h-5 hover:text-white transition-colors" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};
export default UserFilters;