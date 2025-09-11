import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') === 'true' || true
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('soundEnabled') === 'true' || true
  );
  const { currentUser } = useAuth();
  
  const notificationSoundRef = useRef(null);
  const lastNotificationRef = useRef(null);
  const socketRef = useRef(null);
  
  // Initialize audio element
  useEffect(() => {
    notificationSoundRef.current = new Audio('/sounds/notification.mp3');
    notificationSoundRef.current.load();
    
    // Play and immediately pause to overcome browser autoplay restrictions
    document.addEventListener('click', function initSound() {
      const sound = notificationSoundRef.current;
      sound.volume = 0.1;
      sound.play()
        .then(() => {
          sound.pause();
          sound.currentTime = 0;
        })
        .catch(err => {});
      
      document.removeEventListener('click', initSound);
    }, { once: true });
    
    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
      }
    };
  }, []);

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.volume = 1.0;
        
        const playPromise = notificationSoundRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Fallback approach
            try {
              const fallbackSound = new Audio('/sounds/notification.mp3');
              fallbackSound.volume = 1.0;
              fallbackSound.play();
            } catch (err) {}
          });
        }
      }
    } catch (err) {}
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback((notification) => {
    // Prevent duplicate notifications
    if (lastNotificationRef.current === notification._id) {
      return;
    }
    
    lastNotificationRef.current = notification._id;
    
    // Update notifications state
    setNotifications(prev => {
      // Check if it already exists
      if (!prev.some(n => n._id === notification._id)) {
        return [notification, ...prev];
      }
      return prev;
    });
    
    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }
    
    // Show browser notification if enabled
    if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
      showBrowserNotification(notification);
    }
  }, [soundEnabled, notificationsEnabled, playNotificationSound]);

  // Request browser notification permission
  useEffect(() => {
    if (notificationsEnabled && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  // Setup and manage socket connection
  useEffect(() => {
    // Only create a new socket if we have a user and no existing socket
    if (currentUser && !socketRef.current) {
      // Get the base URL without the '/api' part
      const baseUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : import.meta.env.VITE_SOCKET_URL;
      
      // Create new socket connection
      const newSocket = io(baseUrl, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
      });
      
      // Store socket in ref to preserve across renders
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      // Setup socket event handlers
      newSocket.on('connect', () => {
        // Join user's room for private notifications
        newSocket.emit('join', currentUser._id);
      });
      
      // Handle notification event
      newSocket.on('notification', (data) => {
        if (data && data._id) {
          handleNewNotification(data);
        }
      });
    }
    
    return () => {
      // Clean up socket on unmount or user logout
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [currentUser, handleNewNotification]);

  const showBrowserNotification = (notification) => {
    try {
      const title = notification.type === 'message' 
        ? `New message from ${notification.sender?.name || 'Someone'}` 
        : `${notification.type === 'task_assignment' ? 'New task assigned' : 'Task update'}`;
      
      const options = {
        body: notification.message,
        icon: '/vite.svg', 
        tag: notification._id,
        requireInteraction: true
      };

      const browserNotification = new Notification(title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        if (notification.task) {
          window.location.href = `/tasks/${notification.task._id}`;
        } else {
          window.location.href = '/notifications';
        }
      };
    } catch (error) {}
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification._id !== id));
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('notificationsEnabled', newState);
    
    if (newState && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('soundEnabled', newState);
    
    if (newState) {
      setTimeout(playNotificationSound, 100);
    }
  };

  const value = {
    socket: socketRef.current,
    notifications,
    clearNotification,
    notificationsEnabled,
    soundEnabled,
    toggleNotifications,
    toggleSound,
    playNotificationSound
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};