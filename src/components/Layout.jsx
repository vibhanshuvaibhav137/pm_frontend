import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserService from '../services/user.service';
import NotificationSettings from './NotificationSettings';
import {
  FiMenu,
  FiBell,
  FiUser,
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiLogOut,
} from 'react-icons/fi';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout, isAdmin, updateUser } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleActiveStatusChange = async (e) => {
    try {
      const isActive = e.target.checked;
      const response = await UserService.updateActiveStatus(isActive);
      if (response.success) {
        updateUser({ isActive });
      }
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <FiHome className="w-5 h-5" />, path: '/dashboard' },
    { text: 'Employees', icon: <FiUsers className="w-5 h-5" />, path: '/employees' },
    { text: 'Tasks', icon: <FiCheckSquare className="w-5 h-5" />, path: '/tasks' },
    { text: 'Notifications', icon: <FiBell className="w-5 h-5" />, path: '/notifications' },
  ];
  
  if (isAdmin) {
    menuItems.push({ text: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" />, path: '/analytics' });
  }
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-semibold text-primary-600">EM Portal</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-neutral-100"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-neutral-200">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <FiUser className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-sm text-neutral-500">{currentUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentUser?.isActive}
                    onChange={handleActiveStatusChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 p-2 rounded-full mb-2">
                <FiUser className="w-5 h-5 text-primary-600" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentUser?.isActive}
                  onChange={handleActiveStatusChange}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          )}
        </div>

        {sidebarOpen && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
                <NotificationSettings />
            </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.text}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="ml-3 font-medium">{item.text}</span>
                  )}
                  {item.path === '/notifications' && unreadNotifications > 0 && (
                    <span className={`${sidebarOpen ? 'ml-auto' : 'ml-0 mt-1'} badge badge-error`}>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout button */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-neutral-800">
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full"
              >
                <FiBell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center rounded-full bg-error text-white text-xs">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;