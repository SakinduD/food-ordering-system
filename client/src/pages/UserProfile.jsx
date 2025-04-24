import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Edit2 } from 'lucide-react';

// API base URL - makes it easier to change in development/production
const API_BASE_URL = 'http://localhost:5010/api';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState(false);
  // Update the initial editForm state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Make sure to destructure setUser from the context
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setApiError(false);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Authentication token missing. Please login again.');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          // Add timeout to prevent long waits on connection issues
          timeout: 5000
        });
        
        console.log('Profile data:', response.data);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Handle different error types
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          setApiError(true);
          toast.error('Cannot connect to server. Is it running?');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          // You might want to redirect to login here
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Sync editForm with profile data when profile changes
    if (profile && isEditing) {
      setEditForm(prev => ({
        ...prev,
        name: profile.name,
        email: profile.email
      }));
    }
  }, [profile, isEditing]);

  // Update validateForm function
  const validateForm = () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (!editForm.email.trim()) {
      toast.error('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (editForm.newPassword) {
      if (editForm.newPassword !== editForm.confirmPassword) {
        toast.error('New passwords do not match');
        return false;
      }
      if (editForm.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  // Update handleEdit function
  const handleEdit = () => {
    setEditForm({
      name: profile?.name || '',
      email: profile?.email || '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(true);
  };

  // Update the debug effect to use userId
  useEffect(() => {
    if (profile) {
      console.log('Current profile:', {
        id: profile.userId, // Changed from _id to userId
        name: profile.name,
        email: profile.email
      });
    }
  }, [profile]);

  // Update handleUpdate function
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication failed. Please login again.');
      return;
    }

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email
      };

      // Add new password if provided
      if (editForm.newPassword) {
        updateData.password = editForm.newPassword;
      }

      const response = await axios({
        method: 'put',
        url: `${API_BASE_URL}/users/${profile.userId}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: updateData
      });

      if (response.data) {
        setProfile(response.data);
        setUser(prev => ({
          ...prev,
          name: response.data.name,
          email: response.data.email
        }));

        toast.success('Profile updated successfully');
        setIsEditing(false);
        setEditForm({
          name: '',
          email: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Connection Error</h2>
            <p className="text-gray-700 mb-6">
              Cannot connect to the server. Please check if the API server is running and accessible.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Unavailable</h2>
            <p className="text-gray-700 mb-6">
              Unable to load your profile information at this time.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="h-10 w-10 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <span>{profile.role}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Account Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{profile.role || 'Customer'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                      profile.isAdmin 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {profile.isAdmin ? 'Admin' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;