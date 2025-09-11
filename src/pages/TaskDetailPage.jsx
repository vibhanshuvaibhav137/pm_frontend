import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import UserService from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import TaskService from '../services/task.service';
import {
  FiCheck,
  FiClock,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiArrowLeft,
  FiPlayCircle,
  FiPauseCircle,
  FiCheckCircle
} from 'react-icons/fi';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await TaskService.getTaskById(id);
        if (response.success) {
          setTask(response.data);
          // Initialize edit form
          setEditForm({
            title: response.data.title,
            description: response.data.description,
            assignedTo: response.data.assignedTo._id,
            dueDate: response.data.dueDate.split('T')[0] // Format for date input
          });
        }
      } catch (error) {
        setError(error.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  useEffect(() => {
    // Fetch employees for admin reassignment
    if (isAdmin && showEditModal) {
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

      fetchEmployees();
    }
  }, [isAdmin, showEditModal]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      const response = await TaskService.updateTaskStatus(id, { status: newStatus });
      if (response.success) {
        setTask(response.data);
      }
    } catch (error) {
      setError(error.message || 'Failed to update task status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await TaskService.updateTask(id, editForm);
      if (response.success) {
        setTask(response.data);
        setShowEditModal(false);
      }
    } catch (error) {
      setError(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await TaskService.deleteTask(id);
      if (response.success) {
        navigate('/tasks');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete task');
    }
  };

  // Add verification function
const handleVerifyTask = async () => {
  try {
    setStatusLoading(true);
    const response = await TaskService.verifyTask(id);
    if (response.success) {
      setTask(response.data);
    }
  } catch (error) {
    setError(error.message || 'Failed to verify task');
  } finally {
    setStatusLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
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

  if (!task) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p className="font-medium">Task not found</p>
      </div>
    );
  }

  const isTaskAssignedToCurrentUser = task.assignedTo._id === currentUser?._id;
  const canUpdateStatus = isTaskAssignedToCurrentUser || isAdmin;
  const isPending = task.status === 'pending';
  const isInProgress = task.status === 'in-progress';
  const isCompleted = task.status === 'completed';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center text-neutral-600 hover:text-neutral-900"
        >
          <FiArrowLeft className="mr-1" /> Back to Tasks
        </button>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <FiEdit className="mr-1" /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              <FiTrash2 className="mr-1" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">{task.title}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCompleted ? 'bg-green-100 text-green-800' : 
              isInProgress ? 'bg-blue-100 text-blue-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status}
            </div>
          </div>
          
          <p className="text-neutral-600 mb-6">{task.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Assigned To</h3>
              <p className="text-neutral-800">
                {task.assignedTo.name} ({task.assignedTo.email})
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Status: {task.assignedTo.isActive ? 
                  <span className="text-green-600">Active</span> : 
                  <span className="text-red-600">Inactive</span>}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Assigned By</h3>
              <p className="text-neutral-800">
                {task.assignedBy.name} ({task.assignedBy.email})
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Due Date</h3>
              <p className="text-neutral-800">
                {format(new Date(task.dueDate), 'PPP')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Created On</h3>
              <p className="text-neutral-800">
                {format(new Date(task.createdAt), 'PPP')}
              </p>
            </div>
            
            {task.startedAt && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Started On</h3>
                <p className="text-neutral-800">
                  {format(new Date(task.startedAt), 'PPP p')}
                </p>
              </div>
            )}
            
            {task.completedAt && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Completed On</h3>
                <p className="text-neutral-800">
                  {format(new Date(task.completedAt), 'PPP p')}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {canUpdateStatus && (
  <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
    <h3 className="text-sm font-medium text-neutral-700 mb-3">Update Status</h3>
    <div className="flex flex-wrap gap-2">
      {/* Conditional rendering based on user role */}
      {isTaskAssignedToCurrentUser && ( // Only the assigned employee can change these statuses
        <>
          <button
            onClick={() => handleStatusChange('pending')}
            disabled={isPending || statusLoading}
            className={`px-4 py-2 rounded-md flex items-center ${
              isPending ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' : 
              'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <FiClock className="mr-1" /> Pending
          </button>
          
          <button
            onClick={() => handleStatusChange('in-progress')}
            disabled={isInProgress || statusLoading}
            className={`px-4 py-2 rounded-md flex items-center ${
              isInProgress ? 'bg-blue-100 text-blue-800 cursor-not-allowed' : 
              'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <FiPlayCircle className="mr-1" /> In Progress
          </button>
          
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={isCompleted || statusLoading}
            className={`px-4 py-2 rounded-md flex items-center ${
              isCompleted ? 'bg-green-100 text-green-800 cursor-not-allowed' : 
              'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <FiCheck className="mr-1" /> Completed
          </button>
        </>
      )}
      
      {/* Admin verification button - only for completed tasks that aren't verified yet */}
      {isAdmin && isCompleted && !task.isVerified && (
        <button
          onClick={handleVerifyTask}
          disabled={statusLoading}
          className="px-4 py-2 rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700"
        >
          <FiCheckCircle className="mr-1" /> Verify Task
        </button>
      )}
    </div>
  </div>
)}

{/* Display verification info if verified */}
{task.isVerified && (
  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
    <div className="flex items-center text-green-800">
      <FiCheckCircle className="mr-2" /> 
      <span className="font-medium">Verified by admin</span>
    </div>
    {task.verifiedAt && (
      <p className="text-sm text-green-700 mt-1">
        Verified on {format(new Date(task.verifiedAt), 'PPP p')}
      </p>
    )}
  </div>
)}
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-neutral-900">Edit Task</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={editForm.title}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-neutral-700">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={editForm.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="assignedTo" className="block text-sm font-medium text-neutral-700">Assigned To</label>
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={editForm.assignedTo}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        {employees.map(employee => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name} ({employee.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700">Due Date</label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={editForm.dueDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">Delete Task</h3>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500">
                        Are you sure you want to delete this task? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPage;