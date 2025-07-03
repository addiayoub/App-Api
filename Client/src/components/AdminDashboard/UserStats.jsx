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

const MySwal = withReactContent(Swal);

const UserStats = ({ users, plans, plansData, getUserStatus }) => {
  // Fonction pour trouver le plan d'un utilisateur
  const getUserPlan = (userId) => {
    for (const plan of plansData) {
      const userInPlan = plan.users?.find(user => user.id === userId);
      if (userInPlan) {
        return {
          ...plan,
          userSubscription: userInPlan
        };
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total utilisateurs</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <motion.div 
              className="p-3 rounded-full bg-blue-900/20 text-blue-400"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <Users className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Administrateurs</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <motion.div 
              className="p-3 rounded-full bg-purple-900/20 text-purple-400"
              whileHover={{ scale: 1.1 }}
            >
              <Shield className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Utilisateurs vérifiés</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.isVerified).length}
              </p>
            </div>
            <motion.div 
 который              className="p-3 rounded-full bg-green-900/20 text-green-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Check className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => getUserStatus(u) === 'active').length}
              </p>
            </div>
            <motion.div 
              className="p-3 rounded-full bg-amber-900/20 text-amber-400"
              animate={{ 
                rotate: [0, 10, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Activity className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="text-purple-400" />
          Statistiques des Plans
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(plans).map(([key, plan]) => {
            // Compter les utilisateurs pour ce plan en utilisant getUserPlan
            const userCount = users.filter(u => {
              const userPlan = getUserPlan(u._id);
              return userPlan && userPlan.tag === key;
            }).length;

            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.03 }}
                className={`p-4 rounded-xl border ${plan.color} flex flex-col`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {plan.icon}
                  <span className="font-medium text-white">{plan.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {userCount}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {((userCount / users.length) * 100 || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-300 mb-1">Fonctionnalités:</div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {plan.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300">
                          {feat}
                        </span>
                      ))}
                      {plan.features.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300">
                          +{plan.features.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default UserStats;