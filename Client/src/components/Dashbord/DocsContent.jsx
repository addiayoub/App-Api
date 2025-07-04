import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, ChevronDown, ChevronUp, Copy, Zap, Shield, 
  Lock, Terminal, Database, BarChart2, Rocket, 
  Sparkles, Globe, Activity, Server, Key, Download,
  ArrowRight, ExternalLink, BookOpen, FileText, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const DocsContent = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [copiedItems, setCopiedItems] = useState({});
  const [activeTab, setActiveTab] = useState('getting-started');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedItems({...copiedItems, [key]: true});
    setTimeout(() => setCopiedItems({...copiedItems, [key]: false}), 2000);
    toast.success('Copié dans le presse-papier');
  };

  const sections = [
    {
      id: 'getting-started',
      title: "Premiers pas",
      icon: <Rocket size={18} className="mr-2 text-purple-400" />,
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap size={18} className="mr-2 text-yellow-400" />
              Configuration rapide
            </h3>
            <p className="text-gray-300 mb-4">
              Pour commencer à utiliser l'API InsightOne, vous avez besoin d'une clé API que vous pouvez obtenir depuis votre tableau de bord.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                    1
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Obtenez votre clé API</p>
                  <p className="text-sm text-gray-400">
                    Allez dans la section <span className="text-blue-400">Sécurité</span> de votre tableau de bord
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                    2
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Configurez l'authentification</p>
                  <p className="text-sm text-gray-400">
                    Utilisez votre clé API dans l'en-tête Authorization
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                    3
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Faites votre première requête</p>
                  <p className="text-sm text-gray-400">
                    Essayez notre exemple de requête ci-dessous
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Terminal size={18} className="mr-2 text-green-400" />
              Exemple de requête
            </h3>
            <div className="relative">
              <button
                onClick={() => copyToClipboard(`curl -X GET "${import.meta.env.VITE_API_URL}/api/v1/status" \\\n  -H "Authorization: Bearer VOTRE_CLE_API"`, 'quickstart-curl')}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              >
                {copiedItems['quickstart-curl'] ? (
                  <span className="text-green-400 text-sm">Copié!</span>
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-green-300">
                {`curl -X GET "${import.meta.env.VITE_API_URL}/api/v1/status" \\\n  -H "Authorization: Bearer VOTRE_CLE_API"`}
              </pre>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'authentication',
      title: "Authentification",
      icon: <Key size={18} className="mr-2 text-yellow-400" />,
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield size={18} className="mr-2 text-blue-400" />
              Clés API
            </h3>
            <p className="text-gray-300 mb-4">
              Toutes les requêtes à l'API InsightOne doivent inclure votre clé API dans l'en-tête HTTP <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm">Authorization</code>.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer VOTRE_CLE_API', 'auth-header')}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedItems['auth-header'] ? (
                    <span className="text-green-400 text-sm">Copié!</span>
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-green-300">
                  {`Authorization: Bearer VOTRE_CLE_API`}
                </pre>
              </div>
              
              <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Lock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-200">Sécurité importante</h3>
                    <div className="mt-2 text-sm text-yellow-300">
                      <p>
                        Ne partagez jamais votre clé API et ne la commitez pas dans votre code. Utilisez des variables d'environnement pour la stocker.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'endpoints',
      title: "Endpoints",
      icon: <Server size={18} className="mr-2 text-blue-400" />,
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Globe size={18} className="mr-2 text-green-400" />
              URL de base
            </h3>
            <div className="relative">
              <button
                onClick={() => copyToClipboard(import.meta.env.VITE_API_URL, 'base-url')}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              >
                {copiedItems['base-url'] ? (
                  <span className="text-green-400 text-sm">Copié!</span>
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-green-300">
                {import.meta.env.VITE_API_URL}
              </pre>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Database size={18} className="mr-2 text-purple-400" />
              Points d'accès principaux
            </h3>
            
            <div className="space-y-4">
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-900/50 px-4 py-3 flex items-center">
                  <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono mr-3">GET</span>
                  <span className="font-mono text-sm">/api/v1/data</span>
                  <span className="ml-auto text-xs text-gray-400">Données principales</span>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <p className="text-gray-300 text-sm mb-3">
                    Accédez aux données principales de votre compte. Peut être filtré avec des paramètres de requête.
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(`curl -X GET "${import.meta.env.VITE_API_URL}/api/v1/data" \\\n  -H "Authorization: Bearer VOTRE_CLE_API"`, 'data-endpoint')}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedItems['data-endpoint'] ? (
                        <span className="text-green-400 text-sm">Copié!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <pre className="bg-gray-900 p-3 rounded text-xs text-green-300">
                      {`curl -X GET "${import.meta.env.VITE_API_URL}/api/v1/data" \\\n  -H "Authorization: Bearer VOTRE_CLE_API"`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-900/50 px-4 py-3 flex items-center">
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded font-mono mr-3">POST</span>
                  <span className="font-mono text-sm">/api/v1/analyze</span>
                  <span className="ml-auto text-xs text-gray-400">Analyse de données</span>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <p className="text-gray-300 text-sm mb-3">
                    Soumettez des données pour analyse et obtenez des insights en retour.
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(`curl -X POST "${import.meta.env.VITE_API_URL}/api/v1/analyze" \\\n  -H "Authorization: Bearer VOTRE_CLE_API" \\\n  -H "Content-Type: application/json" \\\n  -d '{"data": "vos_données"}'`, 'analyze-endpoint')}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedItems['analyze-endpoint'] ? (
                        <span className="text-green-400 text-sm">Copié!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <pre className="bg-gray-900 p-3 rounded text-xs text-green-300">
                      {`curl -X POST "${import.meta.env.VITE_API_URL}/api/v1/analyze" \\\n  -H "Authorization: Bearer VOTRE_CLE_API" \\\n  -H "Content-Type: application/json" \\\n  -d '{"data": "vos_données"}'`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-900/50 px-4 py-3 flex items-center">
                  <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded font-mono mr-3">GET</span>
                  <span className="font-mono text-sm">/api/v1/status</span>
                  <span className="ml-auto text-xs text-gray-400">Statut du service</span>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <p className="text-gray-300 text-sm mb-3">
                    Vérifiez le statut de l'API et la disponibilité des services.
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(`curl -X GET "${import.meta.env.VITE_API_URL}/api/v1/status" \\\n  -H "Authorization: Bearer VOTRE_CLE_API"`, 'status-endpoint')}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedItems['status-endpoint'] ? (
                        <span className="text-green-400 text-sm">Copié!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <pre className="bg-gray-900 p-3 rounded text-xs text-green-300">
                      {`curl -X GET "${import.meta.env.VITE_API_URL}/api/v1/status" \\\n  -H "Authorization: Bearer VOTRE_CLE_API"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: "Bonnes pratiques",
      icon: <Sparkles size={18} className="mr-2 text-purple-400" />,
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity size={18} className="mr-2 text-green-400" />
              Optimisation des requêtes
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-200">Utilisez la mise en cache</h3>
                    <div className="mt-2 text-sm text-blue-300">
                      <p>
                        Les données sont mises à jour toutes les heures. Mettez en cache les réponses côté client pour réduire le nombre d'appels.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-900/20 border border-purple-800 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <BarChart2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-purple-200">Limitez les champs retournés</h3>
                    <div className="mt-2 text-sm text-purple-300">
                      <p>
                        Utilisez le paramètre <code className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">fields</code> pour ne demander que les données dont vous avez besoin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Server className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-200">Gérez les erreurs avec élégance</h3>
                    <div className="mt-2 text-sm text-green-300">
                      <p>
                        Toujours vérifier le code de statut HTTP et implémenter une logique de réessai pour les erreurs 429 (trop de requêtes).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'examples',
      title: "Exemples",
      icon: <FileText size={18} className="mr-2 text-blue-400" />,
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Code size={18} className="mr-2 text-yellow-400" />
              Exemples de code
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-white mb-3">JavaScript (Fetch)</h4>
                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(
`fetch("${import.meta.env.VITE_API_URL}/api/v1/data", {
  headers: {
    "Authorization": "Bearer VOTRE_CLE_API",
    "Accept": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`, 'js-example')}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedItems['js-example'] ? (
                      <span className="text-green-400 text-sm">Copié!</span>
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-green-300">
{`fetch("${import.meta.env.VITE_API_URL}/api/v1/data", {
  headers: {
    "Authorization": "Bearer VOTRE_CLE_API",
    "Accept": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-white mb-3">Python (Requests)</h4>
                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(
`import requests

url = "${import.meta.env.VITE_API_URL}/api/v1/data"
headers = {
    "Authorization": "Bearer VOTRE_CLE_API",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`, 'python-example')}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedItems['python-example'] ? (
                      <span className="text-green-400 text-sm">Copié!</span>
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-green-300">
{`import requests

url = "${import.meta.env.VITE_API_URL}/api/v1/data"
headers = {
    "Authorization": "Bearer VOTRE_CLE_API",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center mb-2">
            <BookOpen className="h-6 w-6 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Documentation InsightOne API
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-3xl">
            Explorez notre documentation complète pour intégrer l'API InsightOne à vos applications et tirer parti de nos puissantes fonctionnalités d'analyse de données.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Layers size={18} className="mr-2 text-blue-400" />
                Sections
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                      activeTab === section.id 
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1"
          >
            {sections.map((section) => (
              <AnimatePresence key={section.id}>
                {activeTab === section.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold flex items-center">
                        {section.icon}
                        <span className="ml-2">{section.title}</span>
                      </h2>
                    </div>
                    {section.content}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </motion.div>
        </div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 border-t border-gray-800 pt-12"
        >
          <h3 className="text-xl font-bold mb-6 text-center">Prêt à commencer?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Terminal className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Explorer l'API</h4>
              <p className="text-gray-400 text-sm mb-4">
                Essayez notre explorateur d'API interactif pour tester les endpoints en temps réel.
              </p>
              <button className="text-blue-400 text-sm font-medium inline-flex items-center">
                Ouvrir l'explorateur <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div>
            
            {/* <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Download className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">SDKs & Bibliothèques</h4>
              <p className="text-gray-400 text-sm mb-4">
                Téléchargez nos SDK officiels pour JavaScript, Python et plus encore.
              </p>
              <button className="text-purple-400 text-sm font-medium inline-flex items-center">
                Voir les SDKs <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div> */}
            
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <ExternalLink className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Support technique</h4>
              <p className="text-gray-400 text-sm mb-4">
                Besoin d'aide? Contactez notre équipe de support dédiée.
              </p>
              <button className="text-green-400 text-sm font-medium inline-flex items-center">
                Contacter le support <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocsContent;