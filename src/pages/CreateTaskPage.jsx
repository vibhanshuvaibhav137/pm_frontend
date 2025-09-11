import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskService from '../services/task.service';
import UserService from '../services/user.service';
import { FiArrowLeft } from 'react-icons/fi';

const CreateTaskPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await UserService.getAllUsers();
      if (response.success) {
        // Filter only employees (not admins)
        const employeeList = response.data.filter(user => user.role === 'employee');
        setEmployees(employeeList);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!assignedTo) newErrors.assignedTo = 'Please select an employee';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      
      const taskData = {
        title,
        description,
        assignedTo,
        dueDate: new Date(dueDate).toISOString()
      };
      
      const response = await TaskService.createTask(taskData);
      
      if (response.success) {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Create New Task</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                id="title"
                className={`input ${errors.title ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Task Description
              </label>
              <textarea
                id="description"
                rows="4"
                className={`input ${errors.description ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-neutral-700 mb-1">
                Assign To
              </label>
              <select
                id="assignedTo"
                className={`input ${errors.assignedTo ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
              {errors.assignedTo && <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>}
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                className={`input ${errors.dueDate ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button 
              type="button"
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded"
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskPage;