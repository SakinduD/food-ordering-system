import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';
import LocationPicker from "../../components/Orders/LocationPicker";
import { MapPin, ArrowLeft, Image, Phone, MapPinIcon, Building2, Check } from 'lucide-react';

const RegisterRestaurant = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    category: '',
    available: true,
    location: {
      type: 'Point',
      coordinates: [80.7718, 7.8731], // default Sri Lanka (lng, lat)
    },
  });

  // Handle location selection from map
  const handleLocationSelect = (loc) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [loc.lng, loc.lat], // Save in GeoJSON order
      },
    }));
    setShowMap(false);
    toast.success('Location selected successfully');
  };

  // Handle image selection with preview
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImage(selectedFile);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Form validation
  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Restaurant name is required");
      return false;
    }
    
    if (!form.address.trim()) {
      setError("Restaurant address is required");
      return false;
    }
    
    if (!form.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    
    if (!image) {
      setError("Please upload an image of your restaurant");
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token || !user) {
      setError("You must be logged in to register a restaurant.");
      return;
    }

    // Validate form
    if (!validateForm()) return;

    try {
      setLoading(true);
      toast.loading('Registering your restaurant...');
      
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("phone", form.phone);
      formData.append("category", form.category);
      formData.append("available", String(form.available));
      formData.append("location[type]", "Point");
      formData.append("location[coordinates][]", form.location.coordinates[0]);
      formData.append("location[coordinates][]", form.location.coordinates[1]);
      
      if (image) {
        formData.append("image", image);
      }

      await axios.post("http://localhost:5000/api/restaurants", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      toast.success("Restaurant registered successfully!");
      
      // Show pending verification info
      toast((t) => (
        <span className="flex flex-col">
          <b>Next Steps:</b>
          <span>Your restaurant is pending verification by our team</span>
        </span>
      ), {
        duration: 5000,
      });
      
      navigate("/restaurant-profile");
    } catch (err) {
      toast.dismiss();
      const msg = err.response?.data?.message || "Failed to register restaurant";
      setError(msg);
      toast.error(msg);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Register Your Restaurant</h2>
              <p className="text-gray-600 mt-2">
                Share your restaurant details to get started on our platform
              </p>
            </div>

            {error && (
              <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter restaurant name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter full address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="text"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
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

              {/* Image Upload */}
              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Restaurant Image *
                </label>
                
                {imagePreview ? (
                  <div className="relative mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Restaurant preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Image className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Upload a photo of your restaurant</p>
                    <label htmlFor="image" className="cursor-pointer px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                      Select Image
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF (max. 5MB)</p>
                  </div>
                )}
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Restaurant Location *
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="w-full flex items-center justify-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-100 transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  {form.location.coordinates[0] !== 80.7718 && form.location.coordinates[1] !== 7.8731 
                    ? 'Change Location on Map' 
                    : 'Select Location on Map'}
                </button>

                {/* Show selected coordinates */}
                {form.location.coordinates && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-200">
                    <p><span className="font-medium">Latitude:</span> {form.location.coordinates[1]}</p>
                    <p><span className="font-medium">Longitude:</span> {form.location.coordinates[0]}</p>
                  </div>
                )}
                
                <LocationPicker
                  isOpen={showMap}
                  onClose={() => setShowMap(false)}
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    form.location.coordinates 
                      ? { lat: form.location.coordinates[1], lng: form.location.coordinates[0] } 
                      : undefined
                  }
                />
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg border border-green-100">
                <input
                  id="available"
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="w-5 h-5 rounded text-green-600 border-gray-300 focus:ring-green-500"
                />
                <label htmlFor="available" className="text-gray-700 font-medium">
                  Restaurant is ready to accept orders
                </label>
              </div>

              {/* Legal Notice */}
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <p>
                  By registering, you confirm that you have the authority to register this business 
                  and agree to our <Link to="/terms" className="text-orange-600 hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-white ${
                    loading 
                      ? 'bg-orange-400 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-orange-500/30'
                  } transition-all duration-200`}
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Register Restaurant
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Help Info */}
          <div className="mt-6 bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-orange-800">
            <h3 className="font-semibold mb-1">What happens after registration?</h3>
            <p>Your restaurant will be reviewed by our team for verification, usually within 24-48 hours. 
               Once verified, you will be able to add your menu and start accepting orders!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRestaurant;
