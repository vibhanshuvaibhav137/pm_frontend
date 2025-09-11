import React from 'react';
import { useSocket } from '../context/SocketContext';
import { FiBell, FiVolume2, FiVolumeX } from 'react-icons/fi';

const NotificationSettings = () => {
  const { 
    notificationsEnabled, 
    soundEnabled, 
    toggleNotifications, 
    toggleSound
  } = useSocket();

  const handleNotificationsToggle = () => {
    toggleNotifications();
  };

  const handleSoundToggle = () => {
    toggleSound();
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-white rounded-md shadow-sm">
      <div className="flex items-center">
        <button
          onClick={handleNotificationsToggle}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md ${
            notificationsEnabled ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100'
          }`}
          title={notificationsEnabled ? 'Disable browser notifications' : 'Enable browser notifications'}
        >
          <FiBell className="h-4 w-4" />
          <span className="text-sm font-medium">
            {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
          </span>
        </button>
      </div>

      <div className="flex items-center">
        <button
          onClick={handleSoundToggle}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md ${
            soundEnabled ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100'
          }`}
          title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
        >
          {soundEnabled ? (
            <FiVolume2 className="h-4 w-4" />
          ) : (
            <FiVolumeX className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;