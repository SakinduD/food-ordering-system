// src/pages/restaurant-service/EditRestaurant.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LocationPicker from '../../components/Orders/LocationPicker';
import { MapPin, Loader, ArrowLeft } from 'lucide-react';

const EditRestaurant = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch restaurant data or use state passed from navigation
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // If data was passed via navigation state
        if (state && state._id) {
          setForm(state);
          setOriginalData(state);
          setImagePreview(state.imageUrl ? `http://localhost:5000${state.imageUrl}` : null);
          setLoading(false);
          return;
        }
        
        // Otherwise, fetch from API
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          navigate('/login');
          return;
        }
        
        // Get user's restaurant
        const response = await axios.get(
          'http://localhost:5000/api/restaurants/user/current', 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.data) {
          const restaurantData = response.data.data;
          setForm(restaurantData);
          setOriginalData(restaurantData);
          setImagePreview(restaurantData.imageUrl ? `http://localhost:5000${restaurantData.imageUrl}` : null);
        } else {
          toast.error('Could not fetch restaurant data');
          navigate('/restaurant-profile');
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Failed to load restaurant information');
        navigate('/restaurant-profile');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [state, navigate]);

  // Handle location selection from map
  const handleLocationSelect = (loc) => {
    setForm((prev) => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [loc.lng, loc.lat], // GeoJSON format
      },
    }));
    setShowMap(false);
    toast.success('Location updated');
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!form.name) {
      setError('Restaurant name is required');
      return;
    }
    
    try {
      toast.loading('Updating restaurant profile...');
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address || '');
      formData.append('phone', form.phone || '');
      formData.append('category', form.category || '');
      formData.append('available', String(form.available !== false));  // Default to true if undefined
      
      // Fix coordinates format to ensure it's sent correctly
      if (form.location && form.location.coordinates && form.location.coordinates.length === 2) {
        // Directly add the location object as JSON string - this works better with some backends
        formData.append('location', JSON.stringify({
          type: 'Point',
          coordinates: [
            parseFloat(form.location.coordinates[0]),  // Ensure it's a number
            parseFloat(form.location.coordinates[1])   // Ensure it's a number
          ]
        }));
        
        // Also include the individual coordinates as flat FormData fields as backup
        // This ensures both formats are tried by the backend
        formData.append('location[type]', 'Point');
        formData.append('location[coordinates][]', parseFloat(form.location.coordinates[0]));
        formData.append('location[coordinates][]', parseFloat(form.location.coordinates[1]));
      } else if (originalData.location && originalData.location.coordinates && originalData.location.coordinates.length === 2) {
        // Use original location if not changed - same dual format approach
        formData.append('location', JSON.stringify({
          type: 'Point',
          coordinates: [
            parseFloat(originalData.location.coordinates[0]), 
            parseFloat(originalData.location.coordinates[1])
          ]
        }));
        
        // Also include as flat fields
        formData.append('location[type]', 'Point');
        formData.append('location[coordinates][]', parseFloat(originalData.location.coordinates[0]));
        formData.append('location[coordinates][]', parseFloat(originalData.location.coordinates[1]));
      }
      
      // Only append image if new image selected
      if (image) {
        formData.append('image', image);
      }

      // Log FormData contents to verify what's being sent (for debugging)
      console.log('Updating restaurant with FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Make API request
      const response = await axios.put(
        `http://localhost:5000/api/restaurants/${form._id}`, 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.dismiss();
      
      // Check if update was successful and show appropriate feedback
      if (response.data && response.data.data) {
        toast.success('Restaurant profile updated successfully');
        // Update the form with the latest data from server to ensure consistency
        setForm(response.data.data);
        setOriginalData(response.data.data);
        navigate('/restaurant-profile');
      } else {
        toast.error('Update may not have been completed properly');
      }
    } catch (err) {
      toast.dismiss();
      console.error('Error updating restaurant:', err);
      
      // Enhanced error handling
      let errorMessage = 'Failed to update restaurant profile';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
          <p className="text-gray-600">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  if (!form || !form._id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Restaurant Not Found</h2>
            <p className="text-gray-600">Could not load restaurant information</p>
          </div>
          <button
            onClick={() => navigate('/restaurant-profile')}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/restaurant-profile')}
            className="flex items-center gap-1 text-orange-600 font-medium hover:underline"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Edit Restaurant Profile</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name *
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none transition"
                placeholder="Enter restaurant name"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none transition"
                placeholder="Enter address"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none transition"
                placeholder="Enter phone number"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Restaurant Category *
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Fine Dining">Fine Dining</option>
                  <option value="Casual Dining">Casual Dining</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Buffet">Buffet</option>
                  <option value="Food Truck">Food Truck</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Bar / Pub">Bar / Pub</option>
                </select>
              </div>
              
            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Location
              </label>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="w-full p-3 flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-100 transition"
              >
                <MapPin className="h-5 w-5" />
                {form.location?.coordinates ? 'Change Location on Map' : 'Select Location on Map'}
              </button>

              {form.location?.coordinates && (
                <div className="mt-2 bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                  <p><span className="font-medium">Latitude:</span> {form.location.coordinates[1]}</p>
                  <p><span className="font-medium">Longitude:</span> {form.location.coordinates[0]}</p>
                </div>
              )}

              <LocationPicker
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                onLocationSelect={handleLocationSelect}
                initialLocation={
                  form.location?.coordinates 
                    ? { lat: form.location.coordinates[1], lng: form.location.coordinates[0] } 
                    : undefined
                }
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Image
              </label>
              
              {/* Current/Preview Image */}
              {imagePreview && (
                <div className="mb-3">
                  <img 
                    src={imagePreview} 
                    alt="Restaurant preview" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-300" 
                  />
                </div>
              )}
              
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
                <p className="mt-1 text-xs text-gray-500">Upload a new image to change the current one</p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={form.available !== false}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="w-4 h-4 accent-green-500"
              />
              <label htmlFor="available" className="ml-2 text-gray-700">
                Restaurant is currently open
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/restaurant-profile')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;
