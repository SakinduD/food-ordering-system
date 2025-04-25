import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Eye, Trash2, Edit, MapPin, Phone, Mail } from 'lucide-react';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { user } = useContext(UserContext);

  // Debug user state
  useEffect(() => {
    console.log('AdminRestaurants state:', {
      currentUser: user,
      isAdmin: user?.isAdmin,
      token: localStorage.getItem('token')
    });
  }, [user]);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/restaurants', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Log the response to check its structure
        console.log('API Response:', response.data);

        // Check if response.data is an array or has a nested data property
        const restaurantData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];

        setRestaurants(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast.error('Failed to fetch restaurants');
        setRestaurants([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/restaurants/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRestaurants(restaurants.filter(restaurant => restaurant._id !== restaurantId));
      toast.success('Restaurant deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  const handleViewRestaurant = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      toast.error('Failed to fetch restaurant details');
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
          <h1 className="text-2xl font-bold">Restaurant Management</h1>
          <p className="text-sm text-gray-600">Manage registered restaurants</p>
        </div>
        <div className="bg-orange-100 px-4 py-2 rounded-lg">
          <span className="text-orange-800 font-medium">
            Total Restaurants: {restaurants.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(restaurants) && restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-48">
                <img
                  src={`http://localhost:5000${restaurant.imageUrl}` || 'https://via.placeholder.com/400x200'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{restaurant.email}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
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
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No restaurants found
          </div>
        )}
      </div>

      {/* Restaurant Details Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative shadow-xl">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="space-y-4">
              <img
                src={selectedRestaurant.image || 'https://via.placeholder.com/800x400'}
                alt={selectedRestaurant.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedRestaurant.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedRestaurant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedRestaurant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;