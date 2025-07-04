import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Code, Database, Server, Cpu, Shield, Zap, Globe, 
  BarChart2, Terminal, Clock, Layers, Key, Hash, ChevronDown, 
  ChevronRight, Rocket, Copy, Check, AlertCircle, ArrowRight,
  Menu, X, Search, ExternalLink, GitBranch, GitCommit, GitPullRequest,
  Star, Bookmark, Heart, Share2, MessageSquare, HelpCircle,
  Info, Users, Building2, Phone, Mail, MapPin
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';

const Documentation = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sections de la documentation
  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: BookOpen,
      subsections: [
        { id: 'overview', title: 'Aperçu' },
        { id: 'features', title: 'Fonctionnalités' },
        { id: 'quickstart', title: 'Démarrage rapide' }
      ]
    },
    {
      id: 'authentication',
      title: 'Authentification',
      icon: Key,
      subsections: [
        { id: 'api-keys', title: 'Clés API' },
        { id: 'oauth', title: 'OAuth 2.0' },
        { id: 'rate-limiting', title: 'Limites de requêtes' }
      ]
    },
    {
      id: 'endpoints',
      title: 'Endpoints',
      icon: Server,
      subsections: [
        { id: 'financial-data', title: 'Données financières' },
        { id: 'market-data', title: 'Données de marché' },
        { id: 'company-data', title: 'Données entreprises' },
        { id: 'economic-data', title: 'Données économiques' }
      ]
    },
    {
      id: 'sdks',
      title: 'SDKs & Bibliothèques',
      icon: Code,
      subsections: [
        { id: 'javascript', title: 'JavaScript/Node.js' },
        { id: 'python', title: 'Python' },
        { id: 'java', title: 'Java' },
        { id: 'curl', title: 'cURL' }
      ]
    },
    {
      id: 'best-practices',
      title: 'Bonnes pratiques',
      icon: Shield,
      subsections: [
        { id: 'security', title: 'Sécurité' },
        { id: 'performance', title: 'Performance' },
        { id: 'error-handling', title: 'Gestion des erreurs' }
      ]
    },
    {
      id: 'examples',
      title: 'Exemples',
      icon: Terminal,
      subsections: [
        { id: 'portfolio-tracker', title: 'Tracker de portefeuille' },
        { id: 'market-alerts', title: 'Alertes de marché' },
        { id: 'data-analysis', title: 'Analyse de données' }
      ]
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      subsections: [
        { id: 'common-issues', title: 'Problèmes courants' },
        { id: 'troubleshooting', title: 'Dépannage' }
      ]
    },
    {
      id: 'about',
      title: 'À propos',
      icon: Building2,
      subsections: [
        { id: 'company', title: 'Notre société' },
        { id: 'contact', title: 'Contact' }
      ]
    }
  ];

  // Exemples de code
  const codeExamples = {
    javascript: `// Installation
npm install insightone-api

// Exemple d'utilisation
const { InsightOne } = require('insightone-api');

const client = new InsightOne({
  apiKey: 'votre_cle_api'
});

// Récupérer des données financières
client.getFinancialData('AAPL')
  .then(data => console.log(data))
  .catch(err => console.error(err));`,

    python: `# Installation
pip install insightone-api

# Exemple d'utilisation
from insightone_api import InsightOne

client = InsightOne(api_key='votre_cle_api')

# Récupérer des données de marché
data = client.get_market_data(symbol='AAPL')
print(data)`,

    java: `// Installation (ajouter à pom.xml)
<dependency>
  <groupId>ma.idatech</groupId>
  <artifactId>insightone-api</artifactId>
  <version>1.0.0</version>
</dependency>

// Exemple d'utilisation
import ma.idatech.insightone.InsightOne;

public class Main {
  public static void main(String[] args) {
    InsightOne client = new InsightOne("votre_cle_api");
    JsonObject data = client.getMarketData("AAPL");
    System.out.println(data);
  }
}`,

    curl: `# Exemple avec cURL
curl -X GET "https://api.insightone.com/v1/market/AAPL" \\
  -H "accept: application/json" \\
  -H "Authorization: Bearer votre_cle_api"`,

    auth: `// Authentification avec OAuth 2.0
const oauthConfig = {
  clientId: 'votre_client_id',
  clientSecret: 'votre_client_secret',
  redirectUri: 'https://votre-app.com/callback',
  scopes: ['market_data', 'financial_data']
};

client.authenticateOAuth(oauthConfig)
  .then(token => {
    // Utiliser le token pour les requêtes
    client.setAccessToken(token);
  });`,

    rateLimiting: `// Gestion des limites de requêtes
client.getMarketData('AAPL')
  .then(data => {
    const remaining = response.headers['x-ratelimit-remaining'];
    console.log(\`Requêtes restantes: \${remaining}\`);
  })
  .catch(err => {
    if (err.response.status === 429) {
      const resetTime = new Date(err.response.headers['x-ratelimit-reset'] * 1000);
      console.log(\`Limite atteinte. Réessayez après \${resetTime}\`);
    }
  });`,

    security: `// Bonnes pratiques de sécurité
require('dotenv').config(); // Charger les variables d'environnement

const client = new InsightOne({
  apiKey: process.env.INSIGHTONE_API_KEY // Ne jamais hardcoder les clés
});

// Désactiver les logs sensibles en production
if (process.env.NODE_ENV === 'production') {
  console.debug = () => {};
}`,

    commonIssues: `// Problèmes courants et solutions

// 1. Erreur 401 - Authentification invalide
// Solution: Vérifiez que votre clé API est correcte et active

// 2. Erreur 404 - Endpoint introuvable
// Solution: Vérifiez l'URL et la version de l'API

// 3. Erreur 429 - Trop de requêtes
// Solution: Implémentez un système de retry avec backoff exponentiel

// 4. Données manquantes
// Solution: Vérifiez les paramètres de date et le fuseau horaire (UTC)`
  };

  // Détecter la section active à partir de l'URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && sections.some(s => s.id === hash || s.subsections.some(sub => sub.id === hash))) {
      setActiveSection(hash.includes('-') ? hash.split('-')[0] : hash);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  // Copier du code dans le presse-papiers
  const copyCode = (code, key) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtrer les sections en fonction de la recherche
    const filteredSections = sections.map(section => ({
        ...section,
        subsections: section.subsections.filter(sub => 
        sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.subsections.length > 0);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header user={user} onLogout={onLogout} />
      
      {/* Layout principal */}
      <div className="flex flex-col lg:flex-row pt-20">
        {/* Sidebar - Navigation */}
        <motion.div 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed lg:static inset-y-0 left-0 w-72 bg-gray-800 border-r border-gray-700 z-40 lg:z-auto overflow-y-auto transform lg:transform-none transition-transform duration-300 ease-in-out"
          style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)', lg: { transform: 'none' } }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <BookOpen className="mr-2 text-blue-400" />
                Documentation
              </h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher dans la doc..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Menu de navigation */}
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                      activeSection === section.id ? 'bg-blue-900/30 text-blue-400' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <section.icon className="mr-2 h-4 w-4" />
                      {section.title}
                    </div>
                    {activeSection === section.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {activeSection === section.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-8 mt-1 space-y-1"
                      >
                        {section.subsections.map((subsection) => (
                          <a
                            key={subsection.id}
                            href={`#${subsection.id}`}
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${
                              activeSection === subsection.id ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:bg-gray-700'
                            }`}
                            onClick={() => {
                              setActiveSection(subsection.id);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {subsection.title}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Ressources
              </h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center text-sm text-gray-400 hover:text-blue-400">
                  <GitBranch className="mr-2 h-4 w-4" />
                  API Changelog
                </a>
                <a href="#" className="flex items-center text-sm text-gray-400 hover:text-blue-400">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Support technique
                </a>
                <a href="#" className="flex items-center text-sm text-gray-400 hover:text-blue-400">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Blog technique
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div className="flex-1 ">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Bouton menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
            >
              <Menu size={20} />
            </button>

            {/* Introduction */}
            <motion.section 
              id="introduction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h1 className="text-3xl font-bold mb-6 flex items-center">
                <BookOpen className="mr-3 text-blue-400" />
                Documentation InsightOne API
              </h1>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-300 mb-6">
                  InsightOne API fournit un accès programmatique aux données financières, de marché et économiques les plus récentes. 
                  Cette documentation vous guidera dans l'intégration de nos API dans vos applications.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700"
                  >
                    <div className="flex items-center mb-4">
                      <Zap className="text-yellow-400 mr-3" />
                      <h3 className="font-semibold">Démarrage rapide</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Commencez à utiliser notre API en moins de 5 minutes avec notre guide de démarrage rapide.
                    </p>
                    <a 
                      href="#quickstart" 
                      className="mt-3 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      Voir le guide <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700"
                  >
                    <div className="flex items-center mb-4">
                      <Key className="text-purple-400 mr-3" />
                      <h3 className="font-semibold">Authentification</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Apprenez comment sécuriser vos requêtes avec nos différents mécanismes d'authentification.
                    </p>
                    <a 
                      href="#authentication" 
                      className="mt-3 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700"
                  >
                    <div className="flex items-center mb-4">
                      <Terminal className="text-green-400 mr-3" />
                      <h3 className="font-semibold">Exemples de code</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Explorez nos exemples de code prêts à l'emploi dans plusieurs langages de programmation.
                    </p>
                    <a 
                      href="#sdks" 
                      className="mt-3 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      Voir les exemples <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Aperçu */}
            <motion.section 
              id="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Globe className="mr-3 text-blue-400" />
                Aperçu de la plateforme
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  InsightOne API offre un accès en temps réel et historique aux données financières mondiales, 
                  avec une couverture complète des marchés actions, obligations, devises et matières premières.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Fonctionnalités clés</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>Données de marché en temps réel avec une latence ultra-faible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>Historique complet avec jusqu'à 30 ans de données pour certains instruments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>Couverture globale de plus de 150 marchés et 500 000 instruments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>API RESTful moderne avec support WebSocket pour les flux temps réel</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>SDKs officiels pour JavaScript, Python, Java et plus</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-4">Architecture technique</h3>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-6 md:mb-0">
                      <h4 className="font-medium mb-3">Stack technique</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Server className="text-blue-400 mr-2" />
                          <span>Infrastructure: Kubernetes sur AWS/GCP</span>
                        </li>
                        <li className="flex items-center">
                          <Cpu className="text-blue-400 mr-2" />
                          <span>Backend: Go, Python, Node.js</span>
                        </li>
                        <li className="flex items-center">
                          <Database className="text-blue-400 mr-2" />
                          <span>Stockage: PostgreSQL, TimescaleDB, Redis</span>
                        </li>
                        <li className="flex items-center">
                          <Globe className="text-blue-400 mr-2" />
                          <span>Réseau: Anycast global avec 15 points de présence</span>
                        </li>
                      </ul>
                    </div>
                    <div className="md:w-1/2">
                      <div className="bg-gray-900 p-4 rounded border border-gray-700 shadow-sm">
                        <div className="flex items-center mb-3">
                          <BarChart2 className="text-green-400 mr-2" />
                          <h5 className="font-medium">Performances</h5>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span>Disponibilité API:</span>
                            <span className="font-medium">99.99%</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Latence moyenne:</span>
                            <span className="font-medium">45ms</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Requêtes/jour:</span>
                            <span className="font-medium">5+ milliards</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Data centers:</span>
                            <span className="font-medium">12 mondiaux</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Fonctionnalités */}
            <motion.section 
              id="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Zap className="mr-3 text-blue-400" />
                Fonctionnalités principales
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-900/20 p-2 rounded-full mr-3">
                      <Clock className="text-blue-400 h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Données temps réel</h3>
                  </div>
                  <p className="text-gray-400">
                    Flux de données de marché en temps réel avec une latence inférieure à 50ms, 
                    incluant les prix, volumes, ordres et transactions.
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-900/20 p-2 rounded-full mr-3">
                      <Layers className="text-purple-400 h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Données historiques</h3>
                  </div>
                  <p className="text-gray-400">
                    Accès à des décennies de données historiques avec une granularité allant 
                    de la tick data aux données annuelles.
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-900/20 p-2 rounded-full mr-3">
                      <Database className="text-green-400 h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Données fondamentales</h3>
                  </div>
                  <p className="text-gray-400">
                    Données financières complètes incluant les bilans, comptes de résultat, 
                    flux de trésorerie et indicateurs clés.
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-900/20 p-2 rounded-full mr-3">
                      <Hash className="text-yellow-400 h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Données alternatives</h3>
                  </div>
                  <p className="text-gray-400">
                    Accès exclusif à des données alternatives comme les sentiments des réseaux sociaux, 
                    données satellitaires et plus.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Démarrage rapide */}
            <motion.section 
              id="quickstart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Rocket className="mr-3 text-blue-400" />
                Démarrage rapide
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Suivez ce guide pour effectuer votre première requête API en moins de 5 minutes.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Étape 1: Obtenez votre clé API</h3>
                <p>
                  Inscrivez-vous sur notre plateforme pour obtenir votre clé API gratuite avec des limites 
                  généreuses pour le développement.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Étape 2: Installez un SDK (optionnel)</h3>
                <p>
                  Bien que vous puissiez utiliser directement notre API REST, nous recommandons d'utiliser 
                  l'un de nos SDKs officiels:
                </p>

                <div className="my-6">
                  <div className="flex space-x-2 mb-4">
                    <button className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium border border-gray-700">
                      JavaScript
                    </button>
                    <button className="px-4 py-2 bg-blue-900/50 text-blue-400 rounded-md text-sm font-medium border border-blue-800">
                      Python
                    </button>
                    <button className="px-4 py-2 bg-orange-900/50 text-orange-400 rounded-md text-sm font-medium border border-orange-800">
                      Java
                    </button>
                  </div>

                  <div className="relative">
                    <SyntaxHighlighter
                      language="bash"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.javascript.split('// Installation')[0].trim()}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.javascript.split('// Installation')[0].trim(), 'install-js')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'install-js' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Étape 3: Effectuez votre première requête</h3>
                <p>
                  Utilisez le code suivant pour récupérer les données de marché pour Apple (AAPL):
                </p>

                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="javascript"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.javascript.split('// Exemple d\'utilisation')[1].trim()}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.javascript.split('// Exemple d\'utilisation')[1].trim(), 'example-js')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'example-js' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Étape 4: Explorez la réponse</h3>
                <p>
                  La réponse contiendra les données demandées au format JSON. Voici un exemple de réponse:
                </p>

                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="json"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {`{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 175.43,
  "change": 1.23,
  "changePercent": 0.71,
  "currency": "USD",
  "volume": 45678900,
  "marketCap": 2875000000000,
  "lastUpdated": "2023-05-15T16:00:00Z",
  "exchange": "NASDAQ"
}`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(`{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 175.43,
  "change": 1.23,
  "changePercent": 0.71,
  "currency": "USD",
  "volume": 45678900,
  "marketCap": 2875000000000,
  "lastUpdated": "2023-05-15T16:00:00Z",
  "exchange": "NASDAQ"
}`, 'response-example')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'response-example' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-900/20 border-l-4 border-blue-400 p-4 my-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-300">Astuce</h3>
                      <div className="mt-2 text-sm text-blue-200">
                        <p>
                          Utilisez notre <a href="#" className="font-medium underline">API Explorer</a> pour tester 
                          les endpoints directement depuis votre navigateur sans écrire de code.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Authentification - Clés API */}
            <motion.section 
              id="api-keys"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Key className="mr-3 text-blue-400" />
                Clés API
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Les clés API sont le moyen le plus simple d'authentifier vos requêtes. Chaque requête 
                  doit inclure votre clé API dans l'en-tête d'autorisation.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Obtenir une clé API</h3>
                <p>
                  Pour obtenir une clé API:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Connectez-vous à votre compte InsightOne</li>
                  <li>Accédez à la section "Développeurs" dans votre tableau de bord</li>
                  <li>Cliquez sur "Générer une nouvelle clé API"</li>
                  <li>Donnez un nom descriptif à votre clé (ex: "Application mobile")</li>
                  <li>Sélectionnez les permissions nécessaires</li>
                  <li>Copiez votre clé API et stockez-la en sécurité</li>
                </ol>

                <div className="bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-300">Sécurité des clés API</h3>
                      <div className="mt-2 text-sm text-yellow-200">
                        <p>
                          Traitez vos clés API comme des mots de passe. Ne les commitez jamais dans du code 
                          public ou des dépôts GitHub. Utilisez des variables d'environnement ou un gestionnaire 
                          de secrets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Utilisation des clés API</h3>
                <p>
                  Incluez votre clé API dans l'en-tête <code>Authorization</code> de chaque requête:
                </p>

                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="bash"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {`curl -X GET "https://api.insightone.com/v1/market/AAPL" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "accept: application/json"`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(`curl -X GET "https://api.insightone.com/v1/market/AAPL" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "accept: application/json"`, 'api-key-curl')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'api-key-curl' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Permissions des clés</h3>
                <p>
                  Vous pouvez restreindre les permissions de vos clés API pour limiter leur accès:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Lecture seule</strong> - Permet uniquement les requêtes GET</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Données de marché</strong> - Accès aux données boursières</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Données fondamentales</strong> - Accès aux données financières</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Limites de requêtes */}
            <motion.section 
              id="rate-limiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Shield className="mr-3 text-blue-400" />
                Limites de requêtes
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Pour assurer la stabilité de notre API, nous appliquons des limites de requêtes. 
                  Les limites varient selon votre plan d'abonnement.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">En-têtes de limites</h3>
                <p>
                  Chaque réponse API inclut des en-têtes avec vos informations de limite:
                </p>

                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="http"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1623456789`}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1623456789`, 'rate-headers')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'rate-headers' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Gérer les limites</h3>
                <p>
                  Lorsque vous atteignez la limite, l'API retournera une erreur 429. Voici comment la gérer:
                </p>

                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="javascript"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.rateLimiting}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.rateLimiting, 'rate-limiting-example')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'rate-limiting-example' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Plans et limites</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Requêtes/minute
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Requêtes/jour
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Gratuit
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          1,000
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Développeur
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          60
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          50,000
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Professionnel
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          300
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Illimité
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>

            {/* SDKs - JavaScript */}
            <motion.section 
              id="javascript"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Code className="mr-3 text-blue-400" />
                SDK JavaScript/Node.js
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Notre SDK officiel pour JavaScript et Node.js simplifie l'intégration avec l'API InsightOne.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Installation</h3>
                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="bash"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.javascript.split('// Installation')[0].trim()}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.javascript.split('// Installation')[0].trim(), 'install-js-sdk')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'install-js-sdk' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Utilisation de base</h3>
                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="javascript"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.javascript.split('// Exemple d\'utilisation')[1].trim()}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.javascript.split('// Exemple d\'utilisation')[1].trim(), 'basic-js-example')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'basic-js-example' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Fonctionnalités avancées</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>WebSockets</strong> - Abonnez-vous aux flux de données temps réel</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Pagination automatique</strong> - Parcourez facilement les grands jeux de données</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Types TypeScript</strong> - Support complet des types pour une meilleure expérience de développement</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Bonnes pratiques - Sécurité */}
            <motion.section 
              id="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Shield className="mr-3 text-blue-400" />
                Bonnes pratiques de sécurité
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  La sécurité de vos intégrations API est cruciale pour protéger vos données et celles de vos utilisateurs.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Protection des clés API</h3>
                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="javascript"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.security}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.security, 'security-example')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'security-example' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Recommandations</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Restreindre les permissions</strong> - Utilisez le principe du moindre privilège pour vos clés API</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Rotation des clés</strong> - Régénérez périodiquement vos clés API</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>HTTPS obligatoire</strong> - N'effectuez jamais de requêtes en HTTP simple</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Validation des entrées</strong> - Validez toujours les données avant de les envoyer à l'API</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-4">Sécurité côté serveur</h3>
                <p>
                  Pour les applications côté serveur, implémentez ces mesures supplémentaires:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>Utilisez un proxy pour cacher les appels API côté client</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>Implémentez un cache pour réduire le nombre d'appels API</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span>Limitez les requêtes côté serveur pour éviter de dépasser vos quotas</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Problèmes courants */}
            <motion.section 
              id="common-issues"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <AlertCircle className="mr-3 text-blue-400" />
                Problèmes courants
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Voici les problèmes les plus fréquemment rencontrés et comment les résoudre.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Erreurs d'authentification</h3>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                  <h4 className="font-medium mb-2">Erreur 401 - Non autorisé</h4>
                  <p className="text-gray-400 mb-4">
                    Votre clé API est invalide ou a expiré.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-400">
                    <li>Vérifiez que votre clé API est correcte</li>
                    <li>Assurez-vous que votre compte est actif</li>
                    <li>Vérifiez que votre clé a les permissions nécessaires</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Erreurs de limites</h3>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                  <h4 className="font-medium mb-2">Erreur 429 - Trop de requêtes</h4>
                  <p className="text-gray-400 mb-4">
                    Vous avez dépassé votre quota de requêtes.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-400">
                    <li>Implémentez un système de cache</li>
                    <li>Utilisez les paramètres de pagination</li>
                    <li>Passez à un plan supérieur si nécessaire</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Exemples de code</h3>
                <p>
                  Voici comment gérer les erreurs courantes dans votre code:
                </p>

                <div className="my-6">
                  <div className="relative">
                    <SyntaxHighlighter
                      language="javascript"
                      style={atomDark}
                      customStyle={{ 
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                      }}
                    >
                      {codeExamples.commonIssues}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(codeExamples.commonIssues, 'common-issues-example')}
                      className="absolute top-3 right-3 p-1 rounded bg-gray-700 hover:bg-gray-600"
                    >
                      {copiedCode === 'common-issues-example' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* À propos de la société */}
            <motion.section 
              id="company"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Building2 className="mr-3 text-blue-400" />
                À propos de ID&A Tech
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="md:w-1/3">
                    {/* Logo de l'entreprise */}
                       <motion.div 
                key="logo-open"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <img src="/ID&A TECH .png" alt="Logo" className="w-100" />
              </motion.div>
                  </div>
                  <div className="md:w-2/3">
                    <p>
                      InsightOne est développé par <strong>ID&A Tech</strong>, Un cabinet de conseil spécialisé dans les secteurs de la Fintech et les nouvelles technologies. Riche d’une expérience d’une quinzaine d’années dans les marchés financiers.​    
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 my-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Users className="mr-2 text-blue-400" />
                        Notre mission
                      </h3>
                      <p className="text-gray-300">
                        ID&A Tech s'engage à fournir des solutions technologiques de pointe qui transforment 
                        la manière dont les entreprises accèdent et utilisent les données financières.
                      </p>
                    </div>
                    <div className="md:w-1/2">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Code className="mr-2 text-blue-400" />
                        Notre expertise
                      </h3>
                      <p className="text-gray-300">
                        Avec une équipe d'experts en développement, data science et infrastructure cloud, 
                        nous construisons des API robustes et évolutives pour les marchés financiers.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Nos valeurs</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Innovation</strong> - Nous repoussons constamment les limites technologiques</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Qualité</strong> - Nos solutions sont construites avec rigueur et précision</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2 mt-0.5">
                      <Check />
                    </div>
                    <span><strong>Service client</strong> - Nous accompagnons nos clients à chaque étape</span>
                  </li>
                </ul>

              {/* Intégration du site web */}
<h3 className="text-xl font-semibold mt-8 mb-4">En savoir plus</h3>
<div className="relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden group">
  <iframe 
    src="https://idatech.ma" 
    className="w-full h-90"
    title="Site web ID&A Tech"
  />
  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4 flex justify-between items-end">
    <a 
      href="https://idatech.ma" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      Ouvrir dans un nouvel onglet
    </a>
    <span className="text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded">
      Chargement de idatech.ma
    </span>
  </div>
</div>
              </div>
            </motion.section>

            {/* Contact */}
            <motion.section 
              id="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Phone className="mr-3 text-blue-400" />
                Contactez-nous
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-xl font-semibold mb-4">Coordonnées</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <MapPin className="text-blue-400 mr-3 flex-shrink-0" />
                        <span>Boulevard Damman, Etage 4, Local N° 417 / 418 – Technopark- Casablanca</span>
                      </li>
                      <li className="flex items-start">
                        <Phone className="text-blue-400 mr-3 flex-shrink-0" />
                        <span>+212 5 20 07 60 75 </span>
                      </li>
                      <li className="flex items-start">
                        <Mail className="text-blue-400 mr-3 flex-shrink-0" />
                        <span>contact@idatech.ma</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-xl font-semibold mb-4">Visitez notre site</h3>
                    <p className="mb-4">
                      Pour en savoir plus sur nos autres solutions et services, visitez notre site web officiel.
                    </p>
                    <a 
                      href="https://idatech.ma" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="mr-2" />
                      idatech.ma
                    </a>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;