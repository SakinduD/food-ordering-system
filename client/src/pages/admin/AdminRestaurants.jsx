import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Eye, Trash2, Edit, MapPin, Phone, Mail, X, Search,
  CheckCircle, XCircle, AlertCircle, ShieldCheck, RefreshCcw 
} from 'lucide-react';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantUsers, setRestaurantUsers] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'verified', or 'unverified'
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

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

  // Add responsive adjustments based on window size
  useEffect(() => {
    const handleResize = () => {
      // On mobile, make modal fullscreen by default
      setIsModalFullScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const refreshAdminToken = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      
      toast.loading('Refreshing admin session...');
      
      const response = await axios.post(
        'http://localhost:5010/api/auth/refresh-token', 
        { isAdmin: true },
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
  const fetchRestaurants = async () => {
    if (!user?.isAdmin) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/restaurants', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Always use response.data.data since your backend returns this structure
      const restaurantData = response.data.data || [];
      setRestaurants(restaurantData);
      toast.success(`Loaded ${restaurantData.length} restaurants`);
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

  useEffect(() => {
    fetchRestaurants();
  }, [user?.isAdmin]);

  // Handle delete restaurant with better token handling
  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

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
      
      // Add loading toast
      toast.loading('Deleting restaurant...');
      
      const response = await axios.delete(
        `http://localhost:5000/api/restaurants/${restaurantId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.dismiss();

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
      toast.dismiss();
      console.error('Delete error:', error);
      
      if (error.response?.status === 403) {
        toast.error('Admin access denied. Your session may have expired.');
        // Try to refresh token automatically
        const refreshed = await refreshAdminToken();
        if (refreshed) {
          toast.success('Session refreshed. Try deleting again.');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete restaurant');
      }
    }
  };

  // Function to handle verification status update
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

      toast.loading(isVerified ? 'Verifying restaurant...' : 'Updating verification status...');
      
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
          : 'Restaurant verification status updated!'
        );
      }
    } catch (error) {
      toast.dismiss();
      console.error('Verification update error:', error);
      
      if (error.response?.status === 403) {
        toast.error('Admin access denied. Your session may have expired.');
        await refreshAdminToken();
      } else {
        toast.error(error.response?.data?.message || 'Failed to update verification status');
      }
    }
  };

  // Function to view restaurant details
  const handleViewRestaurant = (restaurantId) => {
    try {
      // Find the restaurant in our existing data
      const restaurant = restaurants.find(r => r._id === restaurantId);
      
      if (restaurant) {
        setSelectedRestaurant(restaurant);
      } else {
        // If not found in current list (rare case), fetch it from API
        const fetchRestaurantDetails = async () => {
          try {
            toast.loading('Loading restaurant details...');
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            toast.dismiss();
            
            if (response.data && response.data.data) {
              setSelectedRestaurant(response.data.data);
            } else {
              toast.error('Could not load restaurant details');
            }
          } catch (error) {
            toast.dismiss();
            console.error('Error fetching restaurant details:', error);
            toast.error('Failed to load restaurant details');
          }
        };
        
        fetchRestaurantDetails();
      }
    } catch (error) {
      console.error('Error viewing restaurant:', error);
      toast.error('An error occurred while viewing restaurant details');
    }
  };

  // Filter restaurants based on verification status and search term
  const filteredRestaurants = restaurants.filter(restaurant => {
    // First filter by verification status
    const matchesFilter = 
      (filter === 'verified' && restaurant.isVerified === true) ||
      (filter === 'unverified' && restaurant.isVerified === false) ||
      filter === 'all';
    
    // Then filter by search term if one exists
    const matchesSearch = !searchTerm || 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (restaurant.phone && restaurant.phone.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });

  // Get counts for each category
  const unverifiedCount = restaurants.filter(r => r.isVerified === false).length;
  const verifiedCount = restaurants.filter(r => r.isVerified === true).length;

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button and header section */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Restaurant Management</h1>
        </div>
        
        <button
          onClick={fetchRestaurants}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          title="Refresh restaurant data"
          aria-label="Refresh data"
        >
          <RefreshCcw size={16} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search and filter controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Filter buttons */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All <span className="ml-1 opacity-75">({restaurants.length})</span>
            </button>
            <button 
              onClick={() => setFilter('unverified')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'unverified' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending <span className="ml-1 opacity-75">({unverifiedCount})</span>
            </button>
            <button 
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'verified' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Verified <span className="ml-1 opacity-75">({verifiedCount})</span>
            </button>
          </div>
        </div>
        
        {/* Search results summary */}
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-500">
            Found {filteredRestaurants.length} restaurant{filteredRestaurants.length === 1 ? '' : 's'} 
            matching "{searchTerm}"
            {filter !== 'all' && ` in ${filter} category`}
          </div>
        )}
      </div>

      {/* Restaurant grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <div 
              key={restaurant._id} 
              className={`bg-white rounded-xl shadow-md overflow-hidden ${
                !restaurant.isVerified ? 'border-2 border-yellow-200' : ''
              } transition-all duration-300 hover:shadow-lg`}
              tabIndex="0"
              role="button"
              onClick={() => handleViewRestaurant(restaurant._id)}
              onKeyDown={(e) => e.key === 'Enter' && handleViewRestaurant(restaurant._id)}
            >
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
                    loading="lazy"
                  />
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{restaurant.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{restaurant.phone || 'No phone'}</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center mt-4">
                  {/* Verification actions */}
                  <div className="flex space-x-2">
                    {!restaurant.isVerified ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleVerificationStatus(restaurant._id, true);
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-1"
                        title="Approve restaurant"
                      >
                        <CheckCircle size={16} />
                        <span className="text-xs font-medium hidden sm:inline">Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleVerificationStatus(restaurant._id, false);
                        }}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors flex items-center gap-1"
                        title="Revoke verification"
                      >
                        <AlertCircle size={16} />
                        <span className="text-xs font-medium hidden sm:inline">Revoke</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Other actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDeleteRestaurant(restaurant._id);
                      }}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete restaurant"
                      aria-label="Delete restaurant"
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
              {searchTerm ? `No restaurants match "${searchTerm}"` : 
               filter === 'unverified' ? 'There are no restaurants pending verification.' : 
               filter === 'verified' ? 'There are no verified restaurants yet.' : 
               'No restaurants have been registered yet.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Responsive Restaurant Details Modal */}
      {selectedRestaurant && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto"
          onClick={() => setSelectedRestaurant(null)}
        >
          <div 
            className={`bg-white shadow-xl overflow-auto transition-all ${
              isModalFullScreen 
                ? 'w-full h-full' 
                : 'rounded-xl max-w-2xl w-full max-h-[90vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header with close button */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold truncate">{selectedRestaurant.name}</h2>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Restaurant image with verification badge */}
              <div className="relative">
                <img
                  src={selectedRestaurant.imageUrl ? `http://localhost:5000${selectedRestaurant.imageUrl}` : 'https://via.placeholder.com/800x400?text=No+Image'}
                  alt={selectedRestaurant.name}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
                
                <div className="absolute top-4 right-4">
                  {selectedRestaurant.isVerified ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 shadow-md">
                      <ShieldCheck size={18} />
                      <span className="font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-2 shadow-md">
                      <AlertCircle size={18} />
                      <span className="font-medium">Pending</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verification action buttons */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Verification Status</h3>
                <div className="flex flex-wrap gap-2">
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
                    {selectedRestaurant.isVerified ? 'Already Verified' : 'Approve'}
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
                      Reject
                    </button>
                  )}
                </div>
              </div>
              
              {/* Restaurant details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-sm text-gray-500">Owner ID</p>
                    <div className="overflow-auto bg-gray-50 p-2 rounded text-xs sm:text-sm font-mono">
                      {selectedRestaurant.userId}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Restaurant Location */}
              {selectedRestaurant.location && selectedRestaurant.location.coordinates && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono overflow-auto">
                    Lat: {selectedRestaurant.location.coordinates[1]}, 
                    Long: {selectedRestaurant.location.coordinates[0]}
                  </div>
                </div>
              )}
            </div>
            
            {/* Fixed action bar at bottom */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex justify-between items-center gap-2">
              <button
                onClick={() => handleDeleteRestaurant(selectedRestaurant._id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Delete</span>
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
      )}
      
      {/* "No restaurants" indicator for empty state */}
      {restaurants.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500 mb-4">No restaurants yet</p>
          <p className="text-gray-400 max-w-md mx-auto">
            When restaurant owners register their restaurants, they will appear here for verification.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;