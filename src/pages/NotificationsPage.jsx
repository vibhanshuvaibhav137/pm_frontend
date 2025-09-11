import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import NotificationService from '../services/notification.service';
import NotificationSettings from '../components/NotificationSettings';
import { useSocket } from '../context/SocketContext';
import { 
  FiBell, 
  FiCheckCircle, 
  FiMessageSquare, 
  FiClipboard
} from 'react-icons/fi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clearNotification } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await NotificationService.markAsRead(id);
      if (response.success) {
        setNotifications(notifications.map(notification => 
          notification._id === id ? { ...notification, read: true } : notification
        ));
        clearNotification(id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assignment':
      case 'task_update':
        return <FiClipboard className="h-5 w-5 text-primary-500" />;
      case 'message':
        return <FiMessageSquare className="h-5 w-5 text-primary-500" />;
      default:
        return <FiBell className="h-5 w-5 text-primary-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.task && (notification.type === 'task_assignment' || notification.type === 'task_update')) {
      navigate(`/tasks/${notification.task._id}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Notifications</h1>
      
      {/* Notification Settings Component */}
      <NotificationSettings />
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {notifications.map((notification) => (
              <li 
                key={notification._id}
                className={`p-4 hover:bg-neutral-50 ${
                  notification.read ? 'bg-white' : 'bg-blue-50'
                } ${
                  notification.task ? 'cursor-pointer' : 'cursor-default'
                }`}
                onClick={() => notification.task && handleNotificationClick(notification)}
              >
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900">
                        From: {notification.sender.name}
                      </p>
                      <div className="flex items-center">
                        {!notification.read && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-2">
                            New
                          </span>
                        )}
                        <span className="text-sm text-neutral-500">
                          {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">{notification.message}</p>
                    {notification.task && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Related to task: {notification.task.title}
                      </p>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 self-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="text-primary-500 hover:text-primary-700"
                        title="Mark as read"
                      >
                        <FiCheckCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;