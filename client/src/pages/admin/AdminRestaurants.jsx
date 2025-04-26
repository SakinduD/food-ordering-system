import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Eye, Trash2, Edit, MapPin, Phone, Mail, X, 
  CheckCircle, XCircle, AlertCircle, ShieldCheck 
} from 'lucide-react';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantUsers, setRestaurantUsers] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'verified', or 'unverified'
  const { user } = useContext(UserContext);

  // Verify token validity and admin status
  useEffect(() => {
    const verifyAdminToken = async () => {
      try {
        if (!user?.isAdmin) return;
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Decode and check token
        try {
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1]));
          
          console.log('Token payload:', payload);
          console.log('isAdmin in token:', payload.isAdmin);
          
          // If token doesn't have admin flag, try to refresh it
          if (payload.isAdmin !== true) {
            console.log('Token missing admin flag, attempting refresh...');
            await refreshAdminToken();
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      } catch (error) {
        console.error('Token verification error:', error);
      }
    };
    
    verifyAdminToken();
  }, [user]);

  // Refresh token function to ensure admin privileges
  const refreshAdminToken = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      
      // Check if your backend has a token refresh endpoint
      // If not, you might need to re-login
      toast.loading('Refreshing admin session...');
      
      // Example token refresh call
      const response = await axios.post(
        'http://localhost:5010/api/auth/refresh-token', 
        { isAdmin: true }, // Make sure backend knows to include admin flag
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.dismiss();
        toast.success('Admin session refreshed');
        
        // Verify the new token
        const newToken = response.data.token;
        const parts = newToken.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log('New token payload:', payload);
        console.log('isAdmin in new token:', payload.isAdmin);
        
        return true;
      } else {
        toast.dismiss();
        toast.error('Could not refresh admin session');
        return false;
      }
    } catch (error) {
      toast.dismiss();
      console.error('Token refresh error:', error);
      toast.error('Failed to refresh admin session');
      return false;
    }
  };

  // Fetch all restaurants with improved error handling
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user?.isAdmin) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/restaurants', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Restaurants API Response:', response.data);
        
        // Always use response.data.data since your backend returns this structure
        const restaurantData = response.data.data || [];
        
        setRestaurants(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        
        if (error.response?.status === 403) {
          toast.error('Admin access denied. Refreshing session...');
          const refreshed = await refreshAdminToken();
          
          if (refreshed) {
            // Try again with new token
            fetchRestaurants();
          } else {
            toast.error('Could not restore admin session. Please log out and log in again.');
          }
        } else {
          toast.error('Failed to fetch restaurants');
        }
        
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [user?.isAdmin]);

  // Handle delete restaurant with better token handling
  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      console.log('Attempting to delete restaurant with ID:', restaurantId);
      
      if (!user?.isAdmin) {
        toast.error('Admin privileges required');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      // First, verify token has admin flag
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        if (payload.isAdmin !== true) {
          toast.error('Token missing admin privileges. Refreshing...');
          const refreshed = await refreshAdminToken();
          if (!refreshed) {
            toast.error('Could not obtain admin privileges. Please log in again.');
            return;
          }
        }
      } catch (e) {
        console.error('Error checking token:', e);
      }
      
      // Get the latest token (in case it was refreshed)
      const currentToken = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/api/restaurants/${restaurantId}`,
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Delete response:', response);

      if (response.status === 200 || response.status === 204) {
        setRestaurants(prevRestaurants => 
          prevRestaurants.filter(restaurant => restaurant._id !== restaurantId)
        );
        toast.success('Restaurant deleted successfully');
        
        if (selectedRestaurant && selectedRestaurant._id === restaurantId) {
          setSelectedRestaurant(null);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      if (error.response?.status === 403) {
        toast.error('Admin access denied. Your session may have expired.');
        // Log token details for debugging
        try {
          const token = localStorage.getItem('token');
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token after 403 error:', payload);
        } catch (e) {
          console.error('Could not decode token', e);
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete restaurant');
      }
    }
  };

  // New function to handle verification status update
  const handleVerificationStatus = async (restaurantId, isVerified) => {
    try {
      if (!user?.isAdmin) {
        toast.error('Admin privileges required');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Get the latest token (in case it was refreshed)
      toast.loading(isVerified ? 'Verifying restaurant...' : 'Rejecting restaurant...');
      
      const response = await axios.put(
        `http://localhost:5000/api/restaurants/${restaurantId}/verification`,
        { isVerified },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.dismiss();
      
      if (response.status === 200) {
        // Update the restaurant in local state
        setRestaurants(prevRestaurants => 
          prevRestaurants.map(restaurant => 
            restaurant._id === restaurantId 
              ? { ...restaurant, isVerified } 
              : restaurant
          )
        );
        
        // If this restaurant is currently selected, update its data
        if (selectedRestaurant && selectedRestaurant._id === restaurantId) {
          setSelectedRestaurant({ ...selectedRestaurant, isVerified });
        }
        
        toast.success(isVerified 
          ? 'Restaurant verified successfully!' 
          : 'Restaurant verification rejected!'
        );
      }
    } catch (error) {
      toast.dismiss();
      console.error('Verification update error:', error);
      
      if (error.response?.status === 403) {
        toast.error('Admin access denied. Your session may have expired.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update verification status');
      }
    }
  };

  // Filter restaurants based on verification status
  const filteredRestaurants = restaurants.filter(restaurant => {
    if (filter === 'verified') return restaurant.isVerified === true;
    if (filter === 'unverified') return restaurant.isVerified === false;
    return true; // 'all' filter
  });

  // Get counts for each category
  const unverifiedCount = restaurants.filter(r => r.isVerified === false).length;
  const verifiedCount = restaurants.filter(r => r.isVerified === true).length;

  // Redirect if not admin - keep this check
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Restaurant Management</h1>
          <p className="text-sm text-gray-600">Manage registered restaurants</p>
        </div>
        
        {/* Filter controls */}
        <div className="flex gap-3 items-center">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm ${
                filter === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({restaurants.length})
            </button>
            <button 
              onClick={() => setFilter('unverified')}
              className={`px-4 py-2 text-sm ${
                filter === 'unverified' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending ({unverifiedCount})
            </button>
            <button 
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 text-sm ${
                filter === 'verified' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Verified ({verifiedCount})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <div key={restaurant._id} className={`bg-white rounded-xl shadow-md overflow-hidden ${
              !restaurant.isVerified ? 'border-2 border-yellow-200' : ''
            }`}>
              {/* Verification badge */}
              <div className="relative">
                <div className="absolute top-3 right-3 z-10">
                  {restaurant.isVerified ? (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={14} />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle size={14} />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
                
                {/* Restaurant image */}
                <div className="h-48">
                  <img
                    src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{restaurant.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{restaurant.phone || 'No phone'}</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center mt-4">
                  {/* Verification actions */}
                  {!restaurant.isVerified ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerificationStatus(restaurant._id, true)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-1"
                        title="Approve restaurant"
                      >
                        <CheckCircle size={16} />
                        <span className="text-xs font-medium">Approve</span>
                      </button>
                      <button
                        onClick={() => handleVerificationStatus(restaurant._id, false)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
                        title="Reject restaurant"
                      >
                        <XCircle size={16} />
                        <span className="text-xs font-medium">Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => handleVerificationStatus(restaurant._id, false)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors flex items-center gap-1"
                        title="Revoke verification"
                      >
                        <AlertCircle size={16} />
                        <span className="text-xs font-medium">Revoke</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Other actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewRestaurant(restaurant._id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete restaurant"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-xl font-medium text-gray-600 mb-1">No restaurants found</p>
            <p className="text-gray-500">
              {filter === 'unverified' ? 'There are no restaurants pending verification.' : 
               filter === 'verified' ? 'There are no verified restaurants yet.' : 
               'No restaurants have been registered yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Restaurant Details Modal with Verification Controls */}
      {selectedRestaurant && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRestaurant(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-6 relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedRestaurant.imageUrl ? `http://localhost:5000${selectedRestaurant.imageUrl}` : 'https://via.placeholder.com/800x400?text=No+Image'}
                  alt={selectedRestaurant.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                {/* Verification badge on modal */}
                <div className="absolute top-4 right-4">
                  {selectedRestaurant.isVerified ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 shadow-md">
                      <ShieldCheck size={18} />
                      <span className="font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-2 shadow-md">
                      <AlertCircle size={18} />
                      <span className="font-medium">Pending Verification</span>
                    </div>
                  )}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
              
              {/* Verification action buttons in modal */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Verification Status</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerificationStatus(selectedRestaurant._id, true)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      selectedRestaurant.isVerified ? 
                      'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                      'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    disabled={selectedRestaurant.isVerified}
                  >
                    <CheckCircle size={18} />
                    {selectedRestaurant.isVerified ? 'Already Verified' : 'Approve Restaurant'}
                  </button>
                  
                  {selectedRestaurant.isVerified ? (
                    <button
                      onClick={() => handleVerificationStatus(selectedRestaurant._id, false)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                    >
                      <AlertCircle size={18} />
                      Revoke Verification
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerificationStatus(selectedRestaurant._id, false)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject Restaurant
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedRestaurant.address || 'No address provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedRestaurant.phone || 'No phone provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                    selectedRestaurant.available ? 
                    'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedRestaurant.available ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p className="font-medium">
                    {selectedRestaurant.createdAt ? 
                      new Date(selectedRestaurant.createdAt).toLocaleDateString() : 
                      'Not available'}
                  </p>
                </div>
                
                {selectedRestaurant.userId && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Owner ID</p>
                    <p className="font-medium font-mono text-sm bg-gray-50 p-2 rounded">{selectedRestaurant.userId}</p>
                  </div>
                )}
              </div>
              
              {/* Restaurant Location (if available) */}
              {selectedRestaurant.location && selectedRestaurant.location.coordinates && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                    Lat: {selectedRestaurant.location.coordinates[1]}, 
                    Long: {selectedRestaurant.location.coordinates[0]}
                  </div>
                </div>
              )}
              
              {/* Add a clear close button at the bottom */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => handleDeleteRestaurant(selectedRestaurant._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 size={18} />
                  Delete Restaurant
                </button>
                
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;