import api from './api';

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      
      // Clear local storage regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear local storage even if server call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Add getCurrentUser method
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
};

export default AuthService;