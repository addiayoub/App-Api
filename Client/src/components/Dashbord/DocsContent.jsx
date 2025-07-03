import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  CreditCard, 
  Key, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Database,
  Server,
  Terminal,
  Bell,
  BarChart2,
  Lock,
  Zap,
  Shield,
  Rocket,
  Sparkles,
   X, Code,  ChevronDown, ChevronUp, Copy, Play,  
  RefreshCw, Plus, Trash2, Eye, EyeOff, TrendingUp, Calendar,
  DollarSign, Globe, BarChart, Activity, Menu, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import DashboardContent from './DashboardContent';
import APIContent from './APIContent';
import StatsContent from './StatsContent';
import SecurityContent from './SecurityContent';
import SubscriptionContent from './SubscriptionContent';
import SettingsContent from './SettingsContent.JSX';

const DocsContent = () => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Documentation</h2>
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      <div className="prose max-w-none text-gray-300">
        <h3 className="text-lg font-semibold text-white mb-3">Documentation de l'API</h3>
        <p className="mb-4">
          Bienvenue dans la documentation de l'API InsightOne. Voici comment utiliser notre API.
        </p>
        <div className="bg-gray-900/50 p-4 rounded-lg mb-4 border border-gray-700">
          <h4 className="font-medium text-white mb-2">Endpoint de base</h4>
          <code className="bg-gray-800 px-2 py-1 rounded text-sm text-blue-300 font-mono">
            {import.meta.env.VITE_API_URL}/api/v1
          </code>
        </div>
        <h4 className="font-medium text-white mb-2">Authentification</h4>
        <p className="mb-2 text-gray-300">
          Utilisez votre clé API dans l'en-tête Authorization:
        </p>
        <pre className="bg-gray-900/50 p-3 rounded text-sm overflow-x-auto border border-gray-700 text-green-300">
          {`Authorization: Bearer VOTRE_CLE_API`}
        </pre>
      </div>
    </div>
  </div>
);

export default DocsContent;