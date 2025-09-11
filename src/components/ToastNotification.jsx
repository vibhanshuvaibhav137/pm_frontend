import React, { useState, useEffect } from 'react';
import { FiX, FiBell, FiMessageSquare, FiClipboard } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ToastNotification = ({ notification, onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Allow animation to complete
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'task_assignment':
      case 'task_update':
        return <FiClipboard className="h-5 w-5 text-primary-500" />;
      case 'message':
        return <FiMessageSquare className="h-5 w-5 text-primary-500" />;
      default:
        return <FiBell className="h-5 w-5 text-primary-500" />;
    }
  };

  const handleClick = () => {
    if (notification.task) {
      navigate(`/tasks/${notification.task._id}`);
    } else {
      navigate('/notifications');
    }
    onClose();
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border-l-4 border-primary-500 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">
              {notification.type === 'message' 
                ? `New message from ${notification.sender?.name || 'Someone'}` 
                : notification.type === 'task_assignment' 
                  ? 'New task assigned' 
                  : 'Task update'}
            </p>
            <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
              {notification.message}
            </p>
            <div className="mt-2">
              <button
                type="button"
                onClick={handleClick}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View details
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-neutral-400 hover:text-neutral-500"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 300);
              }}
            >
              <span className="sr-only">Close</span>
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;