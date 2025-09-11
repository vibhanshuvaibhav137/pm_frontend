import React, { useState, useEffect } from 'react';
import UserService from '../services/user.service';
import TaskService from '../services/task.service';
import TaskAnalytics from '../components/TaskAnalytics';
import { FiBarChart2 } from 'react-icons/fi';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [taskStatusData, setTaskStatusData] = useState({});
  const [taskAssignmentData, setTaskAssignmentData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and tasks
      const usersResponse = await UserService.getAllUsers();
      const tasksResponse = await TaskService.getAllTasks();
      
      if (usersResponse.success && tasksResponse.success) {
        const userData = usersResponse.data;
        const taskData = tasksResponse.data;
        
        setUsers(userData);
        setTasks(taskData);
        
        // Calculate active users count
        setActiveUsersCount(userData.filter(user => user.isActive).length);
        
        // Process task status data for pie chart
        processTaskStatusData(taskData);
        
        // Process task assignment data for bar chart
        processTaskAssignmentData(taskData, userData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTaskStatusData = (taskData) => {
    // Count tasks by status
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0
    };
    
    taskData.forEach(task => {
      statusCounts[task.status]++;
    });
    
    setTaskStatusData({
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [statusCounts.pending, statusCounts['in-progress'], statusCounts.completed],
          backgroundColor: ['#FBBF24', '#60A5FA', '#34D399'],
          borderWidth: 1,
        },
      ],
    });
  };

  const processTaskAssignmentData = (taskData, userData) => {
    // Group tasks by employee
    const employeeTasks = {};
    const employeeMap = {};
    
    // Create a mapping of employee IDs to names
    userData.filter(user => user.role === 'employee').forEach(employee => {
      employeeMap[employee._id] = employee.name;
      employeeTasks[employee._id] = { name: employee.name, count: 0 };
    });
    
    // Count tasks for each employee
    taskData.forEach(task => {
      const employeeId = task.assignedTo._id || task.assignedTo;
      if (employeeTasks[employeeId]) {
        employeeTasks[employeeId].count++;
      }
    });
    
    // Convert to chart data
    const labels = [];
    const data = [];
    
    Object.values(employeeTasks).forEach(employee => {
      labels.push(employee.name);
      data.push(employee.count);
    });
    
    setTaskAssignmentData({
      labels,
      datasets: [
        {
          label: 'Tasks Assigned',
          data,
          backgroundColor: '#3B82F6',
        },
      ],
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     
      
      <TaskAnalytics />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-neutral-500 text-sm font-medium uppercase mb-2">Total Employees</h2>
          <p className="text-3xl font-bold text-neutral-900">
            {users.filter(user => user.role === 'employee').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-neutral-500 text-sm font-medium uppercase mb-2">Active Employees</h2>
          <p className="text-3xl font-bold text-green-600">{activeUsersCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-neutral-500 text-sm font-medium uppercase mb-2">Total Tasks</h2>
          <p className="text-3xl font-bold text-neutral-900">{tasks.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-neutral-500 text-sm font-medium uppercase mb-2">Completed Tasks</h2>
          <p className="text-3xl font-bold text-green-600">
            {tasks.filter(task => task.status === 'completed').length}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Task Status Distribution</h2>
          <div className="h-64">
            {Object.keys(taskStatusData).length > 0 ? (
              <Pie data={taskStatusData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500">No task data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Tasks Per Employee</h2>
          <div className="h-64">
            {Object.keys(taskAssignmentData).length > 0 ? (
              <Bar 
                data={taskAssignmentData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500">No task assignment data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-800">Employee Status Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tasks Assigned
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tasks Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {users
                .filter(user => user.role === 'employee')
                .map((employee) => {
                  const employeeTasks = tasks.filter(task => 
                    (task.assignedTo._id || task.assignedTo) === employee._id
                  );
                  const completedTasks = employeeTasks.filter(task => task.status === 'completed');
                  
                  return (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {employeeTasks.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {completedTasks.length}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;