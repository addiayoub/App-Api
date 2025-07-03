import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Bell, Ticket as TicketIcon, User, CheckCircle } from 'lucide-react';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Simuler un WebSocket ou polling pour les nouvelles notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, []);

  // Afficher les notifications toast pour les nouvelles
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.isUnread) {
        toast.info(
          <div className="flex items-start">
            {latest.type === 'ticket' ? (
              <TicketIcon className="mr-2 text-blue-400" size={18} />
            ) : (
              <User className="mr-2 text-purple-400" size={18} />
            )}
            <div>
              <p className="font-medium">{latest.title}</p>
              <p className="text-sm">{latest.message}</p>
            </div>
          </div>,
          {
            autoClose: 5000,
            closeButton: false,
            onClick: () => markAsRead(latest._id)
          }
        );
      }
    }
  }, [notifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications };
};

export default useNotifications;