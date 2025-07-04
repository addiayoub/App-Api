import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Ticket as TicketIcon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Notifications = ({ 
  isOpen = false, 
  onClose = () => {}, 
  onMarkAllRead = () => {}, 
  onNotificationClick = () => {} 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const sortedNotifications = response.data.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(sortedNotifications);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, isUnread: false } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    onNotificationClick(notification.type);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 top-16 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
        >
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-white">Notifications ({unreadCount})</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  onMarkAllRead();
                  setNotifications(prev => 
                    prev.map(notif => ({ ...notif, isUnread: false }))
                  );
                  setUnreadCount(0);
                }}
                disabled={unreadCount === 0}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                Tout marquer comme lu
              </button>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Aucune notification pour le moment
              </div>
            ) : (
              notifications.map(notification => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-700/70 ${
                    notification.isUnread ? 'bg-gray-700/30' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-1 rounded-full mr-3 ${
                      notification.isUnread 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {notification.type === 'ticket' ? (
                        <TicketIcon size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-white">{notification.title}</p>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {notification.isUnread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-700 text-center bg-gray-800/50">
            <button 
              onClick={() => {
                onNotificationClick('ticket');
                onClose();
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Voir tous les tickets
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notifications;