import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';
import NotificationService from '../services/notification.service';
import { format } from 'date-fns';
import { FiPlus, FiMessageSquare, FiX } from 'react-icons/fi';

const EmployeesPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOpenAddDialog(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'employee'
        });
        fetchUsers();
      } else {
        // Show error
        alert(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!selectedUser || !message.trim()) return;
      
      const response = await NotificationService.sendNotification({
        receiver: selectedUser._id,
        message
      });
      
      if (response.success) {
        setOpenMessageDialog(false);
        setMessage('');
        setSelectedUser(null);
        alert('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const openMessageDialogForUser = (user) => {
    setSelectedUser(user);
    setOpenMessageDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-800">Employees</h1>
        {isAdmin && (
          <button
            className="btn btn-primary flex items-center space-x-2"
            onClick={() => setOpenAddDialog(true)}
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
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
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.isActive && (
                        <button
                          className="text-primary-500 hover:text-primary-700"
                          onClick={() => openMessageDialogForUser(user)}
                        >
                          <FiMessageSquare className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-neutral-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-neutral-900">Add New Employee</h3>
              <button 
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => setOpenAddDialog(false)}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="input mt-1"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="input mt-1"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="input mt-1"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
                  Role
                </label>
                <select
                  id="role"
                  className="input mt-1"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded"
                onClick={() => setOpenAddDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddUser}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {openMessageDialog && (
        <div className="fixed inset-0 bg-neutral-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-neutral-900">
                Send Message to {selectedUser?.name}
              </h3>
              <button 
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => setOpenMessageDialog(false)}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded"
                onClick={() => setOpenMessageDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;