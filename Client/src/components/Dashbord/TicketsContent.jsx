import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, AlertCircle, CheckCircle, Clock, Tag, Filter, Search, Send, Paperclip, AlertTriangle, Star, Archive, Trash2, Edit, Plus, ChevronDown, ChevronUp, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TicketsContent = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', priority: 'medium', category: 'technical' });
  const [replyContent, setReplyContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [isPrivateReply, setIsPrivateReply] = useState(false); // Ajouté pour gérer les réponses privées

  const priorities = {
    high: { color: 'bg-red-500', icon: <AlertTriangle className="w-4 h-4" /> },
    medium: { color: 'bg-yellow-500', icon: <AlertCircle className="w-4 h-4" /> },
    low: { color: 'bg-blue-500', icon: <Clock className="w-4 h-4" /> }
  };

  const statuses = {
    open: { color: 'bg-green-500', text: 'Ouvert' },
    pending: { color: 'bg-yellow-500', text: 'En attente' },
    closed: { color: 'bg-gray-500', text: 'Fermé' },
    solved: { color: 'bg-blue-500', text: 'Résolu' }
  };

  const categories = {
    technical: { color: 'bg-purple-500', text: 'Technique' },
    billing: { color: 'bg-cyan-500', text: 'Facturation' },
    account: { color: 'bg-pink-500', text: 'Compte' },
    general: { color: 'bg-indigo-500', text: 'Général' }
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTickets(response.data.data);
      setFilteredTickets(response.data.data);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de chargement des tickets');
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    let results = tickets;
    if (searchTerm) {
      results = results.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeFilter !== 'all') results = results.filter(ticket => ticket.status === activeFilter);
    setFilteredTickets(results);
  }, [searchTerm, activeFilter, tickets]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('subject', ticketForm.subject);
      formData.append('message', ticketForm.message);
      formData.append('priority', ticketForm.priority);
      formData.append('category', ticketForm.category);
      attachments.forEach(file => formData.append('attachments', file));

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tickets`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const newTicketData = {
        ...response.data.data,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        replies: response.data.data.replies || [],
        repliesCount: response.data.data.repliesCount || 0,
        lastReply: response.data.data.lastReply || null
      };

      setTickets(prevTickets => [newTicketData, ...prevTickets]);
      setFilteredTickets(prevTickets => [newTicketData, ...prevTickets]);
      
      setNewTicket(false);
      setTicketForm({ subject: '', message: '', priority: 'medium', category: 'technical' });
      setAttachments([]);
      toast.success('Ticket créé avec succès!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du ticket');
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedTicket) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', replyContent);
      
      // Envoyer isPrivate seulement si l'utilisateur est admin ET a coché la case
      if (user.role === 'admin' && isPrivateReply) {
        formData.append('isPrivate', 'true');
      } else {
        formData.append('isPrivate', 'false');
      }
      
      attachments.forEach(file => formData.append('attachments', file));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tickets/${selectedTicket._id}/reply`,
        formData,
        { headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }}
      );

      const newReply = {
        _id: response.data.data._id,
        content: replyContent,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        isAdmin: user.role === 'admin',
        isPrivate: user.role === 'admin' && isPrivateReply, // Marquer comme privé seulement si admin ET coché
        createdAt: new Date().toISOString(),
        attachments: response.data.data.attachments || []
      };

      const updatedTicket = { 
        ...selectedTicket, 
        replies: [...(selectedTicket.replies || []), newReply],
        repliesCount: (selectedTicket.replies?.length || 0) + 1,
        lastReply: newReply,
        lastReplyAt: new Date().toISOString()
      };

      const updatedTickets = tickets.map(t => 
        t._id === selectedTicket._id ? updatedTicket : t
      );

      setSelectedTicket(updatedTicket);
      setTickets(updatedTickets);
      setFilteredTickets(updatedTickets);
      setReplyContent('');
      setAttachments([]);
      setIsPrivateReply(false); // Reset la checkbox
      toast.success('Réponse envoyée avec succès!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTickets = tickets.map(ticket => 
        ticket._id === ticketId ? { 
          ...ticket, 
          status: 'closed',
          closedAt: new Date().toISOString()
        } : ticket
      );

      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: 'closed',
          closedAt: new Date().toISOString()
        });
      }

      setTickets(updatedTickets);
      setFilteredTickets(updatedTickets);
      toast.success('Ticket fermé avec succès!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la fermeture du ticket');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      toast.error('Maximum 5 fichiers autorisés');
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  // Fonction pour déterminer si une réponse doit être visible
  const shouldShowReply = (reply) => {
    const isAdmin = user?.role === 'admin';
    const isUserReply = reply.user?._id === user?._id;
    const isPrivateReply = reply.isPrivate;
    
    // Si c'est une réponse privée, seuls les admins et l'auteur peuvent la voir
    if (isPrivateReply) {
      return isAdmin || isUserReply;
    }
    
    // Toutes les autres réponses sont visibles (y compris les réponses publiques des admins)
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
          <p className="text-gray-400">Gérez vos demandes d'assistance</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setNewTicket(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau ticket</span>
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des tickets..."
              className="pl-10 w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'open', 'pending', 'closed', 'solved'].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  activeFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? 'Tous' : statuses[filter]?.text || filter}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {newTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Nouveau ticket</h3>
                  <button onClick={() => setNewTicket(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateTicket}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Sujet</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Priorité</label>
                        <select
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={ticketForm.priority}
                          onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                        >
                          <option value="high">Haute</option>
                          <option value="medium">Moyenne</option>
                          <option value="low">Basse</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                        <select
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                        >
                          <option value="technical">Technique</option>
                          <option value="billing">Facturation</option>
                          <option value="account">Compte</option>
                          <option value="general">Général</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                      <textarea
                        required
                        rows={5}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Pièces jointes (max 5)</label>
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-2 text-sm">
                          <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <span>Ajouter des fichiers</span>
                          </div>
                        </label>
                      </div>
                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
                              <div className="flex items-center space-x-2 truncate">
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                              </div>
                              <button 
                                onClick={() => removeAttachment(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setNewTicket(false)}
                        className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50"
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Send className="w-5 h-5" />
                        <span>Envoyer</span>
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${selectedTicket ? '1' : '3'} bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden`}>
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">Aucun ticket trouvé</h3>
              <p className="text-gray-500 mt-1">
                {activeFilter === 'all' ? 'Vous n\'avez aucun ticket. Créez-en un nouveau !' : `Aucun ticket avec le statut "${statuses[activeFilter]?.text || activeFilter}"`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicket?._id === ticket._id ? 'bg-gray-700/70' : 'hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${statuses[ticket.status]?.color}`}></div>
                        <h3 className="text-lg font-medium text-white truncate">{ticket.subject}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 truncate">{ticket.message.substring(0, 80)}...</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        priorities[ticket.priority]?.color || 'bg-gray-600'
                      } text-white`}>
                        {ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full ${categories[ticket.category]?.color || 'bg-gray-600'} text-white`}>
                        {categories[ticket.category]?.text || ticket.category}
                      </span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{ticket.replies?.length || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {selectedTicket && (
          <div className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      statuses[selectedTicket.status]?.color || 'bg-gray-600'
                    } text-white`}>
                      {statuses[selectedTicket.status]?.text || selectedTicket.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded-full ${categories[selectedTicket.category]?.color || 'bg-gray-600'} text-white`}>
                        {categories[selectedTicket.category]?.text || selectedTicket.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {priorities[selectedTicket.priority]?.icon}
                      <span className={`px-2 py-1 rounded-full ${priorities[selectedTicket.priority]?.color || 'bg-gray-600'} text-white`}>
                        {selectedTicket.priority === 'high' ? 'Haute' : selectedTicket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                    <div>
                      Créé le {formatDate(selectedTicket.createdAt)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedTicket.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{selectedTicket.user?.name || 'Utilisateur'}</h4>
                      <span className="text-xs text-gray-400">{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-gray-300 whitespace-pre-line">{selectedTicket.message}</p>
                    {selectedTicket.attachments?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedTicket.attachments.map((file, index) => (
                          <a 
                            key={index} 
                            href={`${import.meta.env.VITE_API_URL}/api/tickets/download/${file.filename}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span>{file.originalName}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Réponses ({selectedTicket.replies?.filter(shouldShowReply).length || 0})
                </h3>
                
             {selectedTicket.replies?.filter(shouldShowReply).length > 0 ? (
  <div className="space-y-4">
    {selectedTicket.replies?.filter(shouldShowReply).map((reply) => (
      <motion.div
        key={reply._id || reply.createdAt}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-gray-700/30 rounded-lg p-4 border ${
          reply.isPrivate ? 'border-purple-500/50 bg-purple-900/10' : 'border-gray-600'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              reply.isAdmin ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              <span className="text-white font-semibold">
                {reply.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-white">
                  {reply.user?.name || (reply.isAdmin ? 'Support' : 'Utilisateur')}
                </h4>
                {reply.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-600 text-white">
                    Équipe
                  </span>
                )}
                {reply.isPrivate && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-600 text-white">
                    Privé
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(reply.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-gray-300 whitespace-pre-line">
              {reply.content}
            </p>
            {reply.attachments?.length > 0 && (
              <div className="mt-3 space-y-2">
                {reply.attachments.map((file, index) => (
                  <a 
                    key={index}
                    href={`${import.meta.env.VITE_API_URL}/api/tickets/download/${file.filename}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>{file.originalName}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
) : (
  <div className="text-center py-8 text-gray-500">
    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
    <p>Aucune réponse pour ce ticket</p>
  </div>
)}

                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'solved' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-gray-700/30 rounded-lg p-4 border border-gray-600"
                  >
                    <h4 className="font-medium text-white mb-3">Répondre au ticket</h4>
                    <textarea
                      rows={4}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Écrivez votre réponse ici..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Pièces jointes (max 5)</label>
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-2 text-sm">
                          <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <span>Ajouter des fichiers</span>
                          </div>
                        </label>
                      </div>
                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
                              <div className="flex items-center space-x-2 truncate">
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                              </div>
                              <button 
                                onClick={() => removeAttachment(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center space-x-2">
                        {selectedTicket.status === 'open' && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCloseTicket(selectedTicket._id)}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50"
                          >
                            Fermer le ticket
                          </motion.button>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSendReply}
                        disabled={!replyContent.trim()}
                        className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 ${
                          !replyContent.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <Send className="w-5 h-5" />
                        <span>Envoyer</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsContent;///