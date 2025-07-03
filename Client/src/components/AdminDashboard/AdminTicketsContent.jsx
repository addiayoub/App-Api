import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Ticket as TicketIcon,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Archive,
  Tag,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  Star,
  Mail,
  Paperclip,
  User,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Send,
  Lock,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

const AdminTicketsContent = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general',
    recipient: ''
  });
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        search: searchQuery || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        limit: 50
      };

      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });

      setTickets(response.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error(error.response?.data?.message || 'Erreur de chargement des tickets');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user?.role === 'admin');
    fetchTickets();
    if (isAdmin) fetchUsers();
  }, [fetchTickets, isAdmin]);

  const handleTicketClick = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(response.data.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error(error.response?.data?.message || 'Erreur de chargement du ticket');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error('Le contenu de la réponse ne peut pas être vide');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', replyContent);
      formData.append('isPrivate', isPrivate);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tickets/${selectedTicket._id}/reply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Réponse envoyée avec succès');
      setReplyContent('');
      setIsPrivate(false);
      setAttachments([]);
      fetchTickets();
      handleTicketClick(selectedTicket._id);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.entries(newTicketForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tickets`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Ticket créé avec succès');
      setNewTicketForm({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general',
        recipient: ''
      });
      setAttachments([]);
      setShowNewTicketForm(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du ticket');
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`,
        { 
          status,
          subject: selectedTicket.subject,
          message: selectedTicket.message,
          priority: selectedTicket.priority,
          category: selectedTicket.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Ticket marqué comme ${status === 'closed' ? 'fermé' : 'résolu'}`);
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        handleTicketClick(ticketId);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du ticket');
    }
  };

  const assignToMe = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/assign`,
        { assignedTo: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ticket assigné à vous');
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        handleTicketClick(ticketId);
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation du ticket');
    }
  };

  const PriorityBadge = ({ priority }) => {
    const priorityClasses = {
      high: 'bg-red-500/20 text-red-400',
      medium: 'bg-amber-500/20 text-amber-400',
      low: 'bg-green-500/20 text-green-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses[priority]}`}>
        {priority === 'high' ? 'Élevée' : priority === 'medium' ? 'Moyenne' : 'Basse'}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusClasses = {
      open: 'bg-blue-500/20 text-blue-400',
      pending: 'bg-purple-500/20 text-purple-400',
      closed: 'bg-gray-500/20 text-gray-400',
      solved: 'bg-green-500/20 text-green-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status === 'open' ? 'Ouvert' : status === 'pending' ? 'En attente' : status === 'closed' ? 'Fermé' : 'Résolu'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Liste des tickets */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 lg:col-span-1 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <TicketIcon className="mr-2 text-green-400" />
            Tickets de support ({tickets.length})
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewTicketForm(true)}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-lg flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" />
            Nouveau
          </motion.button>
        </div>

        {/* Filtres */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher des tickets..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-3 pr-8 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Tous statuts</option>
                <option value="open">Ouvert</option>
                <option value="pending">En attente</option>
                <option value="closed">Fermé</option>
                <option value="solved">Résolu</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-3 pr-8 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Élevée</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-3 pr-8 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="all">Toutes catégories</option>
                <option value="technical">Technique</option>
                <option value="billing">Facturation</option>
                <option value="account">Compte</option>
                <option value="general">Général</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-700/30 rounded-lg p-3 h-24 animate-pulse"
              />
            ))
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="mx-auto mb-2" />
              <p>Aucun ticket trouvé</p>
              <p className="text-xs mt-1">Essayez d'ajuster les filtres</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTicketClick(ticket._id)}
                className={`bg-gray-700/30 rounded-lg p-3 cursor-pointer transition-all border ${
                  selectedTicket?._id === ticket._id 
                    ? 'border-green-500 bg-gray-700/50' 
                    : 'border-gray-600 hover:bg-gray-700/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium truncate flex-1 mr-2">{ticket.subject}</h3>
                  <div className="flex space-x-1 flex-shrink-0">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{ticket.message}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-400">
                    {ticket.user?.avatar ? (
                      <img 
                        src={ticket.user.avatar} 
                        alt={ticket.user.name} 
                        className="w-4 h-4 rounded-full mr-1"
                      />
                    ) : (
                      <User size={14} className="mr-1" />
                    )}
                    {ticket.user?.name || 'Utilisateur'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {ticket.repliesCount > 0 && (
                  <div className="flex items-center text-xs text-green-400 mt-1">
                    <MessageSquare size={12} className="mr-1" />
                    {ticket.repliesCount} réponse{ticket.repliesCount > 1 ? 's' : ''}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Détails du ticket */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 lg:col-span-2 overflow-hidden flex flex-col"
      >
        {selectedTicket ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedTicket.subject}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <PriorityBadge priority={selectedTicket.priority} />
                  <StatusBadge status={selectedTicket.status} />
                  <span className="text-sm text-gray-400">
                    #{selectedTicket._id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'solved' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateTicketStatus(selectedTicket._id, 'solved')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Résoudre
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateTicketStatus(selectedTicket._id, 'closed')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Fermer
                    </motion.button>
                  </>
                )}
                
                {!selectedTicket.assignedTo && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => assignToMe(selectedTicket._id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    S'assigner
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4">
              {/* Message initial du ticket */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {selectedTicket.user?.avatar ? (
                    <img 
                      src={selectedTicket.user.avatar} 
                      alt={selectedTicket.user.name} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <User size={20} className="text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{selectedTicket.user?.name || 'Utilisateur'}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatDate(selectedTicket.createdAt)}
                        </span>
                      </div>
                      {selectedTicket.assignedTo && (
                        <div className="flex items-center text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                          <User size={12} className="mr-1" />
                          Assigné à: {selectedTicket.assignedTo?.name || 'Admin'}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                    
                    {selectedTicket.attachments?.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.attachments.map((file, index) => (
                            <a 
                              key={index}
                              href={`${import.meta.env.VITE_API_URL}/api/tickets/download/${file.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-600/50 hover:bg-gray-600/70 px-3 py-1 rounded-lg text-sm flex items-center"
                            >
                              <Paperclip size={12} className="mr-1" />
                              {file.originalName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Réponses */}
              {selectedTicket.replies?.length > 0 ? (
                selectedTicket.replies.map((reply, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-lg p-4 ${
                      reply.isPrivate 
                        ? 'bg-red-500/10 border-l-4 border-red-500' 
                        : reply.isAdmin
                          ? 'bg-gray-700/30'
                          : 'bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {reply.user?.avatar ? (
                        <img 
                          src={reply.user.avatar} 
                          alt={reply.user.name} 
                          className={`w-10 h-10 rounded-full ${
                            reply.isAdmin ? 'border-2 border-green-500' : ''
                          }`}
                        />
                      ) : (
                        <div className={`p-2 rounded-full ${
                          reply.isAdmin 
                            ? reply.isPrivate 
                              ? 'bg-red-500/20' 
                              : 'bg-green-500/20' 
                            : 'bg-blue-500/20'
                        }`}>
                          {reply.isAdmin ? (
                            reply.isPrivate ? (
                              <Lock size={20} className="text-red-400" />
                            ) : (
                              <Shield size={20} className="text-green-400" />
                            )
                          ) : (
                            <User size={20} className="text-blue-400" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              {reply.user?.name || (reply.isAdmin ? 'Administrateur' : 'Utilisateur')}
                              {reply.isPrivate && (
                                <span className="text-xs bg-red-500/20 text-red-400 ml-2 px-1.5 py-0.5 rounded-full">
                                  Privé
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                        
                        {reply.attachments?.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {reply.attachments.map((file, idx) => (
                                <a 
                                  key={idx}
                                  href={`${import.meta.env.VITE_API_URL}/api/tickets/download/${file.filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-gray-600/50 hover:bg-gray-600/70 px-3 py-1 rounded-lg text-sm flex items-center"
                                >
                                  <Paperclip size={12} className="mr-1" />
                                  {file.originalName}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="mx-auto mb-2" />
                  Aucune réponse pour ce ticket
                </div>
              )}
            </div>

            {/* Formulaire de réponse */}
            <form onSubmit={handleReplySubmit} className="mt-auto">
              <div className="mb-3">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="form-checkbox rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500 mr-2"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <span className="text-sm text-gray-300">Note privée (visible uniquement par les admins)</span>
                </label>
              </div>
              
              <textarea
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Écrire une réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
              
              <div className="flex justify-between items-center mt-2">
                <div>
                  <input
                    type="file"
                    id="ticket-attachments"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="ticket-attachments"
                    className="inline-flex items-center px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 rounded-lg text-sm cursor-pointer"
                  >
                    <Paperclip size={14} className="mr-1" />
                    Joindre des fichiers
                  </label>
                  
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="bg-gray-700/70 px-2 py-1 rounded-lg text-xs flex items-center">
                          {file.name}
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-1 text-gray-400 hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Send size={16} className="mr-1" />
                  Envoyer
                </motion.button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <TicketIcon size={48} className="mb-4 opacity-30" />
            <h3 className="text-xl font-medium mb-1">Sélectionnez un ticket</h3>
            <p className="text-center max-w-md">
              Choisissez un ticket dans la liste pour voir les détails et répondre.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modal Nouveau Ticket */}
      <AnimatePresence>
        {showNewTicketForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Plus className="mr-2 text-green-400" />
                  Créer un nouveau ticket
                </h2>
                <button
                  onClick={() => setShowNewTicketForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTicket}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sujet *</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newTicketForm.subject}
                      onChange={(e) => setNewTicketForm({...newTicketForm, subject: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Priorité *</label>
                      <select
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newTicketForm.priority}
                        onChange={(e) => setNewTicketForm({...newTicketForm, priority: e.target.value})}
                        required
                      >
                        <option value="high">Élevée</option>
                        <option value="medium">Moyenne</option>
                        <option value="low">Basse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Catégorie *</label>
                      <select
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newTicketForm.category}
                        onChange={(e) => setNewTicketForm({...newTicketForm, category: e.target.value})}
                        required
                      >
                        <option value="technical">Technique</option>
                        <option value="billing">Facturation</option>
                        <option value="account">Compte</option>
                        <option value="general">Général</option>
                      </select>
                    </div>
                  </div>

                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Destinataire</label>
                      <select
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newTicketForm.recipient}
                        onChange={(e) => setNewTicketForm({...newTicketForm, recipient: e.target.value})}
                      >
                        <option value="">Envoyer à tous (ticket public)</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Message *</label>
                    <textarea
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={5}
                      value={newTicketForm.message}
                      onChange={(e) => setNewTicketForm({...newTicketForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Pièces jointes</label>
                    <input
                      type="file"
                      id="new-ticket-attachments"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="new-ticket-attachments"
                      className="inline-flex items-center px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 rounded-lg text-sm cursor-pointer"
                    >
                      <Paperclip size={14} className="mr-1" />
                      Joindre des fichiers
                    </label>
                    
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="bg-gray-700/70 px-2 py-1 rounded-lg text-xs flex items-center">
                            {file.name}
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="ml-1 text-gray-400 hover:text-red-400"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Send size={16} className="mr-1" />
                    Créer le ticket
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTicketsContent;