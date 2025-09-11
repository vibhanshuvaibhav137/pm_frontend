import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import TaskService from '../services/task.service';
import UserService from '../services/user.service';
import {
  FiPlus,
  FiFilter,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiAlertCircle,
  FiPlayCircle,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiSearch,
  FiCheckCircle 
} from 'react-icons/fi';

const TasksPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    period: '',
    status: '',
    assignedTo: '',
    date: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    sortBy: 'createdAt'
  });

  useEffect(() => {
    fetchTasks();
    
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin, page, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await TaskService.getTasks(queryParams.toString());
      
      if (response.success) {
        setTasks(response.data);
        setTotalPages(response.pages || 1);
      }
    } catch (error) {
      setError(error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await UserService.getUsers();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterReset = () => {
    setFilters({
      period: '',
      status: '',
      assignedTo: '',
      date: '',
      startDate: '',
      endDate: '',
      searchTerm: '',
      sortBy: 'createdAt'
    });
    setPage(1);
  };

  const handleQuickFilter = (period) => {
    setFilters(prev => ({ 
      ...prev, 
      period,
      date: '',
      startDate: '',
      endDate: ''
    }));
    setPage(1);
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
        return <FiCheck className="h-4 w-4" />;
      case 'in-progress':
        return <FiPlayCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-neutral-800">Tasks</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-neutral-100 rounded-md hover:bg-neutral-200"
          >
            <FiFilter className="mr-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {isAdmin && (
            <button
              onClick={() => navigate('/tasks/create')}
              className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <FiPlus className="mr-1" /> Create Task
            </button>
          )}
        </div>
      </div>

      {/* Quick filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleQuickFilter('today')}
          className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
            filters.period === 'today' ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100'
          }`}
        >
          <FiCalendar className="mr-1" /> Today
        </button>
        <button
          onClick={() => handleQuickFilter('yesterday')}
          className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
            filters.period === 'yesterday' ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100'
          }`}
        >
          <FiCalendar className="mr-1" /> Yesterday
        </button>
        <button
          onClick={() => handleQuickFilter('recent')}
          className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
            filters.period === 'recent' ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100'
          }`}
        >
          <FiCalendar className="mr-1" /> Recent (7 days)
        </button>
        
        {/* Status filters */}
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: 'pending', period: '' }))}
          className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
            filters.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-neutral-100'
          }`}
        >
          <FiClock className="mr-1" /> Pending
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: 'in-progress', period: '' }))}
          className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
            filters.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100'
          }`}
        >
          <FiPlayCircle className="mr-1" /> In Progress
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: 'completed', period: '' }))}
          className={`px-3 py-1.5 rounded-md flex items-center text-sm ${
            filters.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-neutral-100'
          }`}
        >
          <FiCheck className="mr-1" /> Completed
        </button>
        
        {filters.period || filters.status || filters.date || filters.startDate || filters.assignedTo ? (
          <button
            onClick={handleFilterReset}
            className="px-3 py-1.5 rounded-md flex items-center text-sm bg-red-50 text-red-600 hover:bg-red-100"
          >
            <FiX className="mr-1" /> Clear Filters
          </button>
        ) : null}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
          <h3 className="text-md font-medium mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAdmin && (
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-neutral-700 mb-1">Assigned To</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={filters.assignedTo}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-neutral-700 mb-1">Sort By</label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="createdAt">Created Date (Newest)</option>
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">Specific Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  placeholder="Start Date"
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  placeholder="End Date"
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search by title or description..."
                className="block w-full px-3 py-2 border border-neutral-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
              >
                <FiSearch />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium flex items-center">
            <FiAlertCircle className="mr-2" /> {error}
          </p>
        </div>
      )}

      {/* Tasks list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-8 rounded-md shadow-sm text-center">
          <p className="text-neutral-500">No tasks found</p>
          {isAdmin && (
            <button
              onClick={() => navigate('/tasks/create')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <FiPlus className="mr-1" /> Create a Task
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Timeline
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {tasks.map((task) => (
                  <tr 
                    key={task._id} 
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{task.title}</div>
                      <div className="text-sm text-neutral-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-sm font-medium">
                          {task.assignedTo.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">{task.assignedTo.name}</div>
                          <div className="text-sm text-neutral-500">{task.assignedTo.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center space-x-1">
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(task.status)}`}>
      {getStatusIcon(task.status)}
      <span className="ml-1 capitalize">{task.status}</span>
    </span>
    
    {task.status === 'completed' && (
      <>
        {task.isVerified ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FiCheckCircle className="h-3 w-3 mr-1" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
            Pending Verification
          </span>
        )}
      </>
    )}
  </div>
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div>Created: {format(new Date(task.createdAt), 'MMM d, HH:mm')}</div>
                        {task.startedAt && (
                          <div>Started: {format(new Date(task.startedAt), 'MMM d, HH:mm')}</div>
                        )}
                        {task.completedAt && (
                          <div>Completed: {format(new Date(task.completedAt), 'MMM d, HH:mm')}</div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-neutral-200">
              <div className="flex-1 flex justify-between items-center">
                <p className="text-sm text-neutral-700">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md flex items-center text-sm ${
                      page === 1 ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <FiChevronLeft className="mr-1" /> Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md flex items-center text-sm ${
                      page === totalPages ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
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
  );
};

export default TasksPage;