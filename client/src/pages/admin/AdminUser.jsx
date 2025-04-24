import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, UserCog, ShieldCheck, ShieldX, Eye, X, Save } from 'lucide-react';

const AVAILABLE_ROLES = ['customer', 'restaurantOwner', 'deliveryAgent'];

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });
  const { user } = useContext(UserContext);

  // Debug user state
  useEffect(() => {
    console.log('AdminDashboard state:', {
      currentUser: user,
      isAdmin: user?.isAdmin,
      token: localStorage.getItem('token')
    });
  }, [user]);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5010/api/users/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Fetched users:', response.data);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5010/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle admin status toggle
  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5010/api/users/${userId}`, 
        { 
          isAdmin: !currentAdminStatus 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isAdmin: !currentAdminStatus } 
          : user
      ));
      
      toast.success(`User ${!currentAdminStatus ? 'promoted to' : 'removed from'} admin`);
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5010/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const handleEditClick = (userData) => {
    setEditForm({
      name: userData.name,
      email: userData.email,
      role: userData.role || 'User'
    });
    setIsEditing(true);
  };

  const handleUpdateUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5010/api/users/${userId}`, 
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, ...editForm }
          : user
      ));
      
      setSelectedUser(null);
      setIsEditing(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="bg-orange-100 px-4 py-2 rounded-lg">
          <span className="text-orange-800 font-medium">
            Total Users: {users.length}
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full">
          <thead className="bg-orange-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-orange-50">
                <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {user.role || 'User'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.isAdmin 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewUser(user._id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View user details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                      className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                      title={user.isAdmin ? "Remove admin privileges" : "Grant admin privileges"}
                    >
                      {user.isAdmin ? (
                        <ShieldX className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl">
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsEditing(false);
              }}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit User' : 'User Details'}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role || 'customer'}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-white cursor-pointer hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    {AVAILABLE_ROLES.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateUser(selectedUser._id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{selectedUser.role || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                    selectedUser.isAdmin 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedUser.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <button
                  onClick={() => handleEditClick(selectedUser)}
                  className="mt-4 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <UserCog className="h-4 w-4" />
                  Edit User
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;