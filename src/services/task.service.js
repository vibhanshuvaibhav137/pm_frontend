import api from './api';

const TaskService = {
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  getTasks: async (queryParams = '') => {
    const response = await api.get(`/tasks${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data;
},

  // New methods for enhanced task management

  // Update task details (admin only)
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete task (admin only)
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  verifyTask: async (id) => {
  const response = await api.patch(`/tasks/${id}/verify`);
  return response.data;
},

  // Get task analytics (admin only)
  getTaskAnalytics: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await api.get(`/tasks/analytics?${queryParams.toString()}`);
    return response.data;
  },

  // Alias for backward compatibility
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  }
};

export default TaskService;