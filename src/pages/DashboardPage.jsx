import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import TaskService from '../services/task.service';
import UserService from '../services/user.service';
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlayCircle,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiUserX,
  FiCalendar
} from 'react-icons/fi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [recentTasks, setRecentTasks] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [inactiveEmployees, setInactiveEmployees] = useState([]);
  const [taskStats, setTaskStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskPage, setTaskPage] = useState(1);
  const [totalTaskPages, setTotalTaskPages] = useState(1);
  const tasksPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser, taskPage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks with appropriate filters
      const today = startOfToday();
      const weekAgo = subDays(today, 7);
      
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', taskPage);
      queryParams.append('limit', tasksPerPage);
      
      // Filter for today's tasks and pending/in-progress from past week
      const todayStr = format(today, 'yyyy-MM-dd');
      const weekAgoStr = format(weekAgo, 'yyyy-MM-dd');
      
      // We'll use custom backend filtering for this specific dashboard view
      queryParams.append('dashboardView', 'true');
      queryParams.append('todayDate', todayStr);
      queryParams.append('weekAgoDate', weekAgoStr);
      
      const tasksResponse = await TaskService.getTasks(queryParams.toString());
      
      if (tasksResponse.success) {
        setRecentTasks(tasksResponse.data);
        setTotalTaskPages(tasksResponse.pages || 1);
        
        // Calculate task stats from the response data
        const stats = {
          pending: 0,
          inProgress: 0,
          completed: 0
        };
        
        tasksResponse.data.forEach(task => {
          if (task.status === 'pending') stats.pending++;
          else if (task.status === 'in-progress') stats.inProgress++;
          else if (task.status === 'completed') stats.completed++;
        });
        
        setTaskStats(stats);
      }
      
      // Fetch employee data (for admin only)
      if (isAdmin) {
        const usersResponse = await UserService.getAllUsers();
        
        if (usersResponse.success) {
          // Separate active and inactive employees
          const active = [];
          const inactive = [];
          
          usersResponse.data.forEach(user => {
            if (user.isActive) {
              active.push(user);
            } else {
              inactive.push(user);
            }
          });
          
          setActiveEmployees(active);
          setInactiveEmployees(inactive);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalTaskPages) {
      setTaskPage(newPage);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <FiPlayCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  if (loading && !recentTasks.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium flex items-center">
            <FiAlertCircle className="mr-2" /> {error}
          </p>
        </div>
      )}
      
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-800 mr-4">
            <FiClock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Pending Tasks</h3>
            <p className="text-2xl font-semibold text-neutral-800">{taskStats.pending}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
            <FiPlayCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">In-Progress Tasks</h3>
            <p className="text-2xl font-semibold text-neutral-800">{taskStats.inProgress}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
            <FiCheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Completed Tasks</h3>
            <p className="text-2xl font-semibold text-neutral-800">{taskStats.completed}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-md shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-800 flex items-center">
                <FiCalendar className="mr-2" /> Recent Tasks
              </h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                View All
              </button>
            </div>
            
            {recentTasks.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                No recent tasks found
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Due
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {recentTasks.map(task => (
                        <tr 
                          key={task._id} 
                          className="hover:bg-neutral-50 cursor-pointer"
                          onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900">{task.title}</div>
                            <div className="text-xs text-neutral-500 truncate max-w-xs">
                              {task.description.substring(0, 50)}
                              {task.description.length > 50 ? '...' : ''}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-neutral-900">
                                {task.assignedTo.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(task.status)}`}>
                              {getStatusIcon(task.status)}
                              <span className="ml-1 capitalize">{task.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500">
                            {format(new Date(task.dueDate), 'MMM d')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalTaskPages > 1 && (
                  <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200">
                    <div className="flex-1 flex justify-between items-center">
                      <p className="text-sm text-neutral-700">
                        Showing page <span className="font-medium">{taskPage}</span> of <span className="font-medium">{totalTaskPages}</span>
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTaskPageChange(taskPage - 1)}
                          disabled={taskPage === 1}
                          className={`px-3 py-1 rounded-md flex items-center text-sm ${
                            taskPage === 1 ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <FiChevronLeft className="mr-1" /> Previous
                        </button>
                        <button
                          onClick={() => handleTaskPageChange(taskPage + 1)}
                          disabled={taskPage === totalTaskPages}
                          className={`px-3 py-1 rounded-md flex items-center text-sm ${
                            taskPage === totalTaskPages ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          Next <FiChevronRight className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Employee Status - 1/3 width on large screens */}
        {isAdmin && (
          <div className="space-y-6">
            {/* Active Employees */}
            <div className="bg-white rounded-md shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-800 flex items-center">
                  <FiUserCheck className="mr-2 text-green-600" /> Active Employees
                </h2>
                <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {activeEmployees.length}
                </span>
              </div>
              
              {activeEmployees.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  No active employees
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {activeEmployees.map(employee => (
                    <div key={employee._id} className="p-4 hover:bg-neutral-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-900">{employee.name}</h3>
                          <p className="text-xs text-neutral-500">{employee.email}</p>
                        </div>
                        <div className="flex items-center text-xs text-green-600">
                          <FiUserCheck className="mr-1" /> Active Now
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Inactive Employees */}
            <div className="bg-white rounded-md shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-800 flex items-center">
                  <FiUserX className="mr-2 text-red-600" /> Inactive Employees
                </h2>
                <span className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {inactiveEmployees.length}
                </span>
              </div>
              
              {inactiveEmployees.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  No inactive employees
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {inactiveEmployees.map(employee => (
                    <div key={employee._id} className="p-4 hover:bg-neutral-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-900">{employee.name}</h3>
                          <p className="text-xs text-neutral-500">{employee.email}</p>
                        </div>
                        <div className="flex items-center text-xs text-red-600">
                          <FiUserX className="mr-1" /> Inactive
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-neutral-500">
                        {employee.lastActive ? (
                          <p>Last active: {format(new Date(employee.lastActive), 'MMM d, h:mm a')}</p>
                        ) : (
                          <p>No recent activity</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;