import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import ToastNotification from './ToastNotification';

const ToastContainer = () => {
  const { notifications } = useSocket();
  const [toasts, setToasts] = useState([]);
  const processedNotifications = useRef(new Set());
  
  // Handle new notifications
  useEffect(() => {
    // Process new notifications to show as toasts
    if (notifications.length > 0) {
      // Find unread notifications not already processed
      const newToasts = notifications
        .filter(notification => !notification.read && !processedNotifications.current.has(notification._id))
        .slice(0, 3); // Limit to 3 at a time
      
      if (newToasts.length > 0) {
        // Mark these notifications as processed
        newToasts.forEach(notification => {
          processedNotifications.current.add(notification._id);
        });
        
        // Add to toasts state, maintaining limit of 3
        setToasts(prev => [...newToasts, ...prev].slice(0, 3));
      }
    }
  }, [notifications]);
  
  const removeToast = (id) => {
    setToasts(toasts.filter(toast => toast._id !== id));
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {toasts.map((toast, index) => (
        <ToastNotification
          key={toast._id}
          notification={toast}
          onClose={() => removeToast(toast._id)}
          autoClose={true}
        />
      ))}
    </div>
  );
};

export default ToastContainer;