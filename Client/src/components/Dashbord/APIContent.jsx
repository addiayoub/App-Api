import React from 'react'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown, Code, Shield, Play, RefreshCw, Copy, Eye, EyeOff, X, Zap, Download,Activity  } from 'lucide-react';
import Swal from 'sweetalert2';
const APIContent = ({ apiKeys, fetchData, subscription }) => {
  const [apiList, setApiList] = useState([]);
  const [loadingApis, setLoadingApis] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [apiTokens, setApiTokens] = useState({});
  const [apiData, setApiData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
// Fonction useEffect modifiée pour utiliser le backend
useEffect(() => {
  const fetchAPIs = async () => {
    try {
      if (!subscription || !subscription.data || subscription.error || !subscription.data.autoRenew) {
        setApiList([]);
        setLoadingApis(false);
        return;
      }

      // Utiliser le backend au lieu de l'API directe
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/all-endpoints-by-tag`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des APIs');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la récupération des APIs');
      }
      
      const data = result.data;
      const transformedApis = [];
      const userPlan = subscription.data.plan;
      
      if (userPlan === 'Basique' && data.basique) {
        data.basique.forEach(api => {
          transformedApis.push(transformApiData(api, 'Basique'));
        });
      } else if (userPlan === 'Pro' && data.pro) {
        data.pro.forEach(api => {
          transformedApis.push(transformApiData(api, 'Pro'));
        });
      } else if (userPlan === 'Entreprise' && data.entreprise) {
        data.entreprise.forEach(api => {
          transformedApis.push(transformApiData(api, 'Entreprise'));
        });
      }
      
      setApiList(transformedApis);
      setLoadingApis(false);
    } catch (err) {
      setError(err.message);
      setLoadingApis(false);
      
      // SweetAlert2 pour les erreurs
      Swal.fire({
        icon: 'error',
        title: 'Erreur de chargement',
        text: err.message,
        background: '#1f2937',
        color: '#f3f4f6',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content'
        }
      });
    }
  };
  
  fetchAPIs();
}, [subscription]);

// Fonction executeApi modifiée pour utiliser le backend
const executeApi = async () => {
  if (!apiTokens[apiData.id]) {
    // SweetAlert2 pour demander le token
    const { value: token } = await Swal.fire({
      title: 'Token d\'authentification requis',
      text: 'Veuillez entrer votre token d\'authentification pour exécuter cette API',
      input: 'password',
      inputPlaceholder: 'Votre token API...',
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez entrer un token!'
        }
      },
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content',
        input: 'swal-dark-input'
      }
    });

    if (token) {
      setApiTokens(prev => ({
        ...prev,
        [apiData.id]: token
      }));
      
      // Mettre à jour les headers avec le nouveau token
      const newHeaders = [...apiData.headers];
      const authIndex = newHeaders.findIndex(h => h.name === 'Authorization');
      if (authIndex !== -1) {
        newHeaders[authIndex].value = token;
        setApiData({...apiData, headers: newHeaders});
      }
    } else {
      return;
    }
  }

  setLoading(true);
  
  try {
    // Utiliser le backend pour exécuter l'API
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/execute-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        endpoint: apiData.endpoint,
        method: apiData.method,
        parameters: apiData.parameters,
        headers: apiData.headers,
        userToken: apiTokens[apiData.id]
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Erreur lors de l\'exécution de l\'API');
    }

    setResponse(result.data);
    
    // SweetAlert2 pour le succès
    Swal.fire({
      icon: 'success',
      title: 'API exécutée avec succès',
      text: 'La requête a été traitée avec succès',
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#10b981',
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content'
      }
    });
    
  } catch (err) {
    const errorResponse = {
      status: err.message.includes('Erreur') ? parseInt(err.message.split(' ')[1]) : 500,
      data: { error: err.message },
      headers: {},
      isCsv: false
    };
    
    setResponse(errorResponse);
    
    // SweetAlert2 pour les erreurs d'exécution
    Swal.fire({
      icon: 'error',
      title: 'Erreur d\'exécution',
      text: err.message,
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content'
      }
    });
  } finally {
    setLoading(false);
  }
};

// Fonction pour gérer les erreurs de subscription avec SweetAlert2
const handleSubscriptionError = () => {
  Swal.fire({
    icon: 'warning',
    title: 'Abonnement annulé',
    text: 'Votre abonnement a été annulé. Vous n\'avez plus accès aux APIs.',
    background: '#1f2937',
    color: '#f3f4f6',
    confirmButtonText: 'Réactiver l\'abonnement',
    confirmButtonColor: '#3b82f6',
    showCancelButton: true,
    cancelButtonText: 'Fermer',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'swal-dark-popup',
      title: 'swal-dark-title',
      content: 'swal-dark-content'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Rediriger vers la page d'abonnement
      window.location.href = '/subscription';
    }
  });
};

// Fonction pour gérer les erreurs de chargement avec SweetAlert2
const handleLoadingError = () => {
  Swal.fire({
    icon: 'error',
    title: 'Erreur de chargement',
    text: error,
    background: '#1f2937',
    color: '#f3f4f6',
    confirmButtonText: 'Réessayer',
    confirmButtonColor: '#3b82f6',
    showCancelButton: true,
    cancelButtonText: 'Fermer',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'swal-dark-popup',
      title: 'swal-dark-title',
      content: 'swal-dark-content'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.reload();
    }
  });
};

// Fonction pour copier dans le presse-papiers avec SweetAlert2
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Copié!',
      text: 'Le contenu a été copié dans le presse-papiers',
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#10b981',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content'
      }
    });
  }).catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Impossible de copier dans le presse-papiers',
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content'
      }
    });
  });
};

// Fonction pour télécharger les données CSV avec SweetAlert2
const downloadCSV = (csvData, filename = 'data.csv') => {
  try {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({
      icon: 'success',
      title: 'Téléchargement réussi',
      text: 'Le fichier CSV a été téléchargé avec succès',
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#10b981',
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content'
      }
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur de téléchargement',
      text: 'Impossible de télécharger le fichier CSV',
      background: '#1f2937',
      color: '#f3f4f6',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content'
      }
    });
  }
};

// CSS personnalisé pour SweetAlert2 (à ajouter dans votre fichier CSS)
const swalCustomStyles = `
.swal-dark-popup {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
}

.swal-dark-title {
  color: #f3f4f6 !important;
}

.swal-dark-content {
  color: #d1d5db !important;
}

.swal-dark-input {
  background-color: #374151 !important;
  border: 1px solid #4b5563 !important;
  color: #f3f4f6 !important;
}

.swal-dark-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.swal2-timer-progress-bar {
  background: #3b82f6 !important;
}
`;

// Fonction pour injecter les styles personnalisés
const injectSwalStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = swalCustomStyles;
  document.head.appendChild(styleElement);
};

// Appeler cette fonction au chargement du composant
useEffect(() => {
  injectSwalStyles();
}, []);

  const transformApiData = (api, category) => {
    return {
      id: api.name.replace(/\s+/g, '_').toLowerCase(),
      name: api.name,
      endpoint: api.path,
      method: api.methods[0] || 'GET',
      category: category,
      icon: Terminal,
      description: api.summary || 'No description available',
      longDescription: api.summary || 'No detailed description available',
      parameters: api.parameters ? api.parameters.map(param => {
        const isLiteral = param.type.startsWith("typing.Literal[");
        let options = [];
        let type = param.type;
        
        if (isLiteral) {
          const matches = param.type.match(/^typing.Literal\[(.*)\]$/);
          if (matches && matches[1]) {
            options = matches[1].split(',').map(opt => 
              opt.trim().replace(/^['"]|['"]$/g, '')
            );
            type = "enum";
          }
        } else {
          type = param.type.replace(/^<class '|'>$/g, '');
        }
        
        return {
          name: param.name,
          value: param.default || (options.length > 0 ? options[0] : ''),
          required: !param.default,
          type: type,
          options: options,
          description: `Paramètre ${param.name} de type ${param.type}`,
          example: param.default || ''
        };
      }) : [],
      headers: [
        { 
          name: 'accept', 
          value: 'application/json', 
          required: true, 
          description: 'Format de réponse accepté' 
        },
        {
          name: 'Authorization',
          value: '',
          required: true,
          description: 'Votre token API'
        }
      ],
      responseExample: {
        message: "Exemple de réponse pour " + api.name,
        data: {}
      }
    };
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Basique': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Pro': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Entreprise': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleAPISelect = (api) => {
    if (selectedAPI === api.id) {
      setSelectedAPI(null);
      setApiData(null);
    } else {
      setSelectedAPI(api.id);
      setApiData({
        ...api,
        parameters: api.parameters.map(p => ({ ...p, value: '' })),
        headers: api.headers.map(h => ({ ...h, value: h.name === 'Authorization' ? apiTokens[api.id] || '' : h.value }))
      });
      setResponse(null);
      setActiveTab('details');
    }
  };

  const handleParamChange = (index, value) => {
    const newParams = [...apiData.parameters];
    newParams[index].value = value;
    setApiData({...apiData, parameters: newParams});
  };

  const handleHeaderChange = (index, value) => {
    const newHeaders = [...apiData.headers];
    newHeaders[index].value = value;
    
    if (newHeaders[index].name === 'Authorization') {
      setApiTokens(prev => ({
        ...prev,
        [apiData.id]: value
      }));
    }
    
    setApiData({...apiData, headers: newHeaders});
  };

  

 
  const formatJson = (json) => {
    return JSON.stringify(json, null, 2);
  };

  const generateCurlCommand = () => {
    if (!apiData) return '';
    
    let url = `${import.meta.env.VITE_API_URL}${apiData.endpoint}`;
    const params = apiData.parameters.filter(p => p.value);
    if (params.length > 0) {
      url += '?' + params.map(p => `${p.name}=${encodeURIComponent(p.value)}`).join('&');
    }

    let curl = `curl -X ${apiData.method} "${url}" \\\n`;
    curl += `  -H "accept: application/json" \\\n`;
    
    if (apiTokens[apiData.id]) {
      curl += `  -H "Authorization: Bearer ${apiTokens[apiData.id]}"`;
    } else {
      curl += `  -H "Authorization: Bearer YOUR_API_TOKEN"`;
    }

    return curl;
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleTryItClick = (api) => {
    setSelectedAPI(api.id);
    setApiData({
      ...api,
      parameters: api.parameters.map(p => ({ ...p, value: '' })),
      headers: api.headers.map(h => ({ ...h, value: h.name === 'Authorization' ? apiTokens[api.id] || '' : h.value }))
    });
    setResponse(null);
    setActiveTab('details');
    openSidebar();
  };

  if (!subscription || !subscription.data || subscription.error || !subscription.data.autoRenew) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-md mx-auto">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Abonnement annulé</h3>
            <p className="text-gray-300 mb-4">Votre abonnement a été annulé. Vous n'avez plus accès aux APIs.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réactiver l'abonnement
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingApis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-400 mb-4" />
          <p>Chargement des APIs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
  <div className="relative">
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-4">API Disponibles ({subscription.data.plan})</h3>
      <div className="space-y-4">
        {apiList.length > 0 ? (
          apiList.map((api, index) => {
            const isSelected = selectedAPI === api.id;
            
            return (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gray-800 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                whileHover={{ y: -2 }}
              >
                <div className="p-6" onClick={() => handleAPISelect(api)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Terminal size={24} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">{api.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(api.category)}`}>
                            {api.category}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded font-mono">
                            {api.method}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-2">{api.description}</p>
                        <code className="text-sm text-blue-300 bg-gray-900/50 px-2 py-1 rounded">
                          {api.endpoint}
                        </code>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isSelected ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && apiData && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-gray-700"
                    >
                      <div className="p-6">
                        <div className="flex space-x-2 mb-6 border-b border-gray-700">
                          <button
                            className={`px-4 py-2 font-medium transition-all ${
                              activeTab === 'details' 
                                ? 'text-blue-400 border-b-2 border-blue-400' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('details')}
                          >
                            Détails
                          </button>
                          <button
                            className={`px-4 py-2 font-medium transition-all ${
                              activeTab === 'request' 
                                ? 'text-blue-400 border-b-2 border-blue-400' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('request')}
                          >
                            Requête HTTP
                          </button>
                        </div>

                        <div className="mb-6">
                          {activeTab === 'details' && (
                            <div>
                              <h4 className="text-lg font-semibold mb-2">Description complète</h4>
                              <p className="text-gray-300 mb-6">{apiData.longDescription}</p>
                              
                              <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <Code size={18} className="mr-2" />
                                Paramètres disponibles
                              </h4>
                              <div className="space-y-4 mb-6">
                                {apiData.parameters.map((param, index) => (
                                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium">{param.name}</span>
                                      {param.required && <span className="text-red-500 text-xs">* Requis</span>}
                                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                                        {param.type}
                                      </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">{param.description}</p>
                                    {param.example && (
                                      <p className="text-blue-400 text-sm">Exemple: {param.example}</p>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <Shield size={18} className="mr-2" />
                                Headers requis
                              </h4>
                              <div className="space-y-4">
                                {apiData.headers.map((header, index) => (
                                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium">{header.name}</span>
                                      {header.required && <span className="text-red-500 text-xs">* Requis</span>}
                                    </div>
                                    <p className="text-gray-400 text-sm">{header.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeTab === 'request' && (
                            <div>
                              <h3 className="font-medium mb-4">Exemple de requête HTTP</h3>
                              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm relative">
                                <button
                                  onClick={() => copyToClipboard(generateCurlCommand())}
                                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                                  title="Copier la commande cURL"
                                >
                                  <Copy size={16} />
                                </button>
                                <pre className="overflow-x-auto">
                                  <code className="text-green-400">
                                    {generateCurlCommand()}
                                  </code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center">
                          <motion.button
                            onClick={() => handleTryItClick(api)}
                            className="flex items-center px-8 py-3 rounded-lg font-medium text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play size={20} className="mr-2" />
                            Try it
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <p className="text-gray-400 text-center py-4">Aucune API disponible pour votre plan</p>
        )}
      </div>
    </div>

    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 right-0 w-full max-w-2xl bg-gray-800 shadow-xl z-50 border-l border-gray-700"
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <Zap size={24} className="text-yellow-400 mr-2" />
                  Exécuter l'API
                </h2>
                <button
                  onClick={closeSidebar}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {apiData && (
                <>
                  <div className="mb-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{apiData.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(apiData.category)}`}>
                        {apiData.category}
                      </span>
                    </div>
                    <code className="text-sm text-blue-300 bg-gray-900 px-2 py-1 rounded">
                      {apiData.method} {apiData.endpoint}
                    </code>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Shield size={16} className="mr-2" />
                      Votre Token API
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={apiTokens[apiData.id] || ''}
                        onChange={(e) => {
                          const newTokens = {...apiTokens};
                          newTokens[apiData.id] = e.target.value;
                          setApiTokens(newTokens);
                        }}
                        placeholder="Entrez votre token API personnel"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-12 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Ce token sera utilisé pour authentifier toutes vos requêtes API.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Shield size={16} className="mr-2" />
                      Headers
                    </h3>
                    <div className="space-y-3">
                      {apiData.headers.map((header, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <label className="block text-sm font-medium mb-1">
                            {header.name}
                            {header.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <p className="text-gray-400 text-xs mb-2">{header.description}</p>
                          <input
                            type="text"
                            value={header.value}
                            onChange={(e) => handleHeaderChange(index, e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Valeur pour ${header.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Code size={16} className="mr-2" />
                      Paramètres
                    </h3>
                    <div className="space-y-3">
                      {apiData.parameters.map((param, index) => (
                        <div key={index} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <label className="block text-sm font-medium mb-1">
                            {param.name}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <p className="text-gray-400 text-xs mb-2">{param.description}</p>
                          {param.options && param.options.length > 0 ? (
                            <select
                              value={param.value}
                              onChange={(e) => handleParamChange(index, e.target.value)}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {param.options.map((option, i) => (
                                <option key={i} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={param.value}
                              onChange={(e) => handleParamChange(index, e.target.value)}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={param.example || `Valeur pour ${param.name}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <motion.button
                      onClick={executeApi}
                      disabled={loading}
                      className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium ${
                        loading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                      } transition-colors`}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={20} className="mr-2 animate-spin" />
                          Exécution en cours...
                        </>
                      ) : (
                        <>
                          <Play size={20} className="mr-2" />
                          Exécuter l'API
                        </>
                      )}
                    </motion.button>
                  </div>

                  {response && (
                    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                      <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                        <h3 className="font-medium flex items-center">
                          <Activity size={16} className="mr-2 text-green-400" />
                          Réponse
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            response.status >= 400 
                              ? 'bg-red-900/50 text-red-200 border border-red-500/30' 
                              : 'bg-green-900/50 text-green-200 border border-green-500/30'
                          }`}>
                            {response.status} {response.status >= 400 ? 'Error' : 'Success'}
                          </span>
                        </h3>
                      </div>
                      <div className="p-3">
                        {response.isCsv && response.data.csv ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-green-400">{response.data.message}</p>
                              <button
                                onClick={() => {
                                  const blob = new Blob([response.data.csv], { type: 'text/csv' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${apiData.name}_data.csv`;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                }}
                                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                              >
                                <Download size={14} className="mr-1" />
                                Télécharger CSV
                              </button>
                            </div>
                            <div className="bg-gray-800 rounded p-3 max-h-40 overflow-auto">
                              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                {response.data.csv.split('\n').slice(0, 10).join('\n')}
                                {response.data.csv.split('\n').length > 10 && '\n... (données tronquées pour l\'affichage)'}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-800 rounded p-3 max-h-96 overflow-auto relative">
                            <button
                              onClick={() => copyToClipboard(formatJson(response.data))}
                              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                              title="Copier la réponse"
                            >
                              <Copy size={14} />
                            </button>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                              {formatJson(response.data)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};

export default APIContent;