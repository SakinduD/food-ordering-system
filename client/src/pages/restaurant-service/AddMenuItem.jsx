import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { ArrowLeft, Upload, ShoppingBag, DollarSign, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AddMenuItem = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    restaurantId: '',
    restaurantName: '',
  });

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/restaurants/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const restaurant = res.data.data;
        if (restaurant?._id) {
          setForm((prev) => ({
            ...prev,
            restaurantId: restaurant._id,        
            restaurantName: restaurant.name || '',  
          }));
        }
      } catch (error) {
        console.error('Error fetching restaurant details', error);
      }
    };
  
    if (user?.userId) {
      fetchRestaurant();
    }
  }, [user]);
  
  

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);
           
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // ⭐ Universal input change + field validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // ⭐ Validate each field while typing
  const validateField = (fieldName, value) => {
    let message = '';

    if (fieldName === 'name') {
      if (!value.trim()) {
        message = 'Name is required';
      } else if (!/^[A-Za-z& ]+$/.test(value)) {
        message = 'Name can only contain letters and &';
      }
    }

    if (fieldName === 'price') {
      if (!value) {
        message = 'Price is required';
      } else if (isNaN(value) || Number(value) <= 0) {
        message = 'Price must be a positive number';
      }
    }

    if (fieldName === 'description') {
      if (!value.trim()) {
        message = 'Description is required';
      }
    }

    if (fieldName === 'category') {
      if (!value) {
        message = 'Category is required';
      }
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  };

  // ⭐ Full form validation before submit
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim() || !/^[A-Za-z& ]+$/.test(form.name)) {
      newErrors.name = 'Name can only contain letters and &';
    }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    if (!image) {
      newErrors.image = 'Item image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors.");
      return;
    }
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
  
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('available', form.available);
    formData.append('restaurantId', form.restaurantId);
    if (image) formData.append('image', image);
  
    let loadingToastId; 
  
    try {
      setLoading(true);
      loadingToastId = toast.loading('Adding menu item...'); 
  
      await axios.post('http://localhost:5025/api/menu/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.dismiss(loadingToastId); 
      toast.success('Item successfully added! 🎉', { duration: 3000 });
  
      setTimeout(() => {
        navigate('/restaurant-profile', { state: { activeTab: 'menu' } });
      }, 1000);
  
    } catch (err) {
      toast.dismiss(loadingToastId); 
      console.error(err.response.data);
      toast.error('Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          
          <div className="mb-6">
            <button
              onClick={() => navigate('/restaurant-profile')}
              className="flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Menu</span>
            </button>
          </div>
                    
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Add Menu Item</h2>
              <p className="text-gray-600 mt-1">Create a new item for your restaurant menu</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Item Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 bg-white border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                      type="text"
                      placeholder="Enter item name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-white border ${errors.description ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                    placeholder="Enter item description"
                    rows={3}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-bold text-base">LKR</span> {/* ✅ Correct LKR label */}
                    </div>
                    <input
                      id="price"
                      name="price"
                      value={form.price}
                      onChange={handleInputChange}
                      className={`w-full pl-14 p-3 bg-white border ${errors.price ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.price ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                      type="number"
                      placeholder="Enter price"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                </div>

                  
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        className={`w-full pl-10 p-3 bg-white border ${errors.category ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                      >
                        <option value="">Select Category</option>
                        <option value="Sri Lankan Traditional">Sri Lankan Traditional</option>
                        <option value="Rice & Curry">Rice & Curry</option>
                        <option value="Kottu & Roti">Kottu & Roti</option>
                        <option value="Seafood Special">Seafood Special</option>
                        <option value="Street Food">Street Food</option>
                        <option value="Desserts & Sweets">Desserts & Sweets</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Contemporary Fusion">Contemporary Fusion</option>
                        <option value="Vegetarian & Vegan">Vegetarian & Vegan</option>
                        <option value="Snacks & Short Eats">Snacks & Short Eats</option>
                      </select>
                    </div>
                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                  </div>
                </div>

                
                <div className="space-y-2">
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                    Restaurant Name
                  </label>
                  <input
                    id="restaurantName"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-not-allowed"
                    type="text"
                    placeholder="Restaurant Name"
                    value={form.restaurantName}
                    readOnly
                  />
                </div>
                        
                <div className="space-y-2">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Item Image
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Menu item preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200" 
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
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Upload an image for your menu item</p>
                      <label htmlFor="image" className="cursor-pointer px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                        Select Image
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e)}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF (max. 5MB)</p>
                    </div>
                  )}
                </div>
                
                
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <input
                    id="available"
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="available" className="ml-2 text-gray-700">
                    Item is available for ordering
                  </label>
                </div>
                
                
                <div className="pt-4">
                  <button
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-white ${
                      loading 
                        ? 'bg-orange-400 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30'
                    } transition-all duration-200`}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Menu Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItem;
