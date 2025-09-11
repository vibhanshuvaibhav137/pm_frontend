import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import TaskService from '../services/task.service';
import UserService from '../services/user.service';
import {
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlayCircle
} from 'react-icons/fi';

const TaskAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchAnalytics();
    fetchEmployees();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await TaskService.getTaskAnalytics(filters);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      setError(error.message || 'Failed to load analytics');
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
  };

  const handleFilterReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeId: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium flex items-center">
          <FiAlertCircle className="mr-2" /> {error}
        </p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-800 flex items-center">
        <FiBarChart2 className="mr-2" /> Task Analytics
      </h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
        <h3 className="text-md font-medium mb-3">Filter Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-neutral-700 mb-1">Employee</label>
            <select
              id="employeeId"
              name="employeeId"
              value={filters.employeeId}
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
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFilterReset}
            className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 mr-2"
          >
            Reset Filters
          </button>
          <button
            onClick={fetchAnalytics}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Task Status Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <FiBarChart2 className="mr-2" /> Task Status Summary
            </h3>
            <div className="space-y-4">
              {analytics.taskStats.map(stat => (
                <div key={stat._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(stat._id)}`}>
                      {getStatusIcon(stat._id)}
                      <span className="ml-1 capitalize">{stat._id}</span>
                    </span>
                  </div>
                  <div className="text-lg font-semibold">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Performance */}
          <div className="bg-white p-4 rounded-md shadow-sm md:col-span-2">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <FiUsers className="mr-2" /> Employee Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Total Tasks
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      In Progress
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {analytics.tasksByEmployee.map(employee => (
                    <tr key={employee._id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{employee.employeeName}</div>
                        <div className="text-xs text-neutral-500">{employee.employeeEmail}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-700">
                        {employee.total}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
                        {employee.completed}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600">
                        {employee.inProgress}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="w-full bg-neutral-200 rounded-full h-2.5">
                          <div
                            className="bg-primary-600 h-2.5 rounded-full"
                            style={{ width: `${employee.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-neutral-500">{employee.completionRate.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Task Completion Times */}
          <div className="bg-white p-4 rounded-md shadow-sm md:col-span-3">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <FiClock className="mr-2" /> Task Completion Times
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Completion Time (Hours)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {analytics.completionTimes.map((task, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-700">
                        {task.title}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{task.employeeName}</div>
                        <div className="text-xs text-neutral-500">{task.employeeEmail}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-md text-sm ${
                          task.completionTime < 24 ? 'bg-green-100 text-green-800' :
                          task.completionTime < 72 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {task.completionTime.toFixed(1)} hrs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAnalytics;