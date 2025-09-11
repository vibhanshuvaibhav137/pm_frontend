import api from './api';

const UserService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Add this method as an alias for getAllUsers
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getActiveUsers: async () => {
    const response = await api.get('/users/active');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateActiveStatus: async (isActive) => {
    const response = await api.patch('/users/active-status', { isActive });
    
    // Update user in localStorage
    if (response.data.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      user.isActive = isActive;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },
};

export default UserService;