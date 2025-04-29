import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { updateMenuItem } from '../../services/restaurantService';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditMenuItem = () => {
  const location = useLocation();
  const item = location.state;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...item,
    price: item.price?.toString() || '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // ⭐️ Added for live preview
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ⭐ Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // ⭐ Handle image upload (live preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ⭐ Validate individual fields
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

  // ⭐ Validate whole form
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors.");
      return;
    }

    const token = localStorage.getItem('token');
    let loadingToastId;

    try {
      setLoading(true);
      loadingToastId = toast.loading('Updating menu item...');

      await updateMenuItem(item._id, { ...form, image }, token);

      toast.dismiss(loadingToastId);
      toast.success('Menu item updated successfully! 🎉', { duration: 3000 });

      setTimeout(() => {
        navigate('/restaurant-profile', { state: { activeTab: 'menu' } });
      }, 1000);

    } catch (err) {
      toast.dismiss(loadingToastId);
      console.error(err);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/restaurant-profile', { state: { activeTab: 'menu' } })}
              className="flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Menu</span>
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Edit Menu Item</h2>
              <p className="text-gray-600 mt-1">Update your menu item details</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdate} className="space-y-6">

                {/* Image Preview */}
                {(imagePreview || form.imageUrl) && (
                  <div className="mb-6">
                    <img
                      src={imagePreview || `http://localhost:5025${form.imageUrl}`}
                      alt={form.name}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    name="name"
                    className={`w-full p-3 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    className={`w-full p-3 border ${errors.description ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                    rows={3}
                    value={form.description}
                    onChange={handleInputChange}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      name="price"
                      className={`w-full p-3 border ${errors.price ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.price ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                      type="number"
                      value={form.price}
                      onChange={handleInputChange}
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      className={`w-full p-3 border ${errors.category ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'focus:ring-red-300' : 'focus:ring-orange-300'}`}
                      value={form.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      <option value="Sri Lankan Traditional">Sri Lankan Traditional</option>
                      <option value="Rice & Curry">Rice & Curry</option>
                      <option value="Kottu & Roti">Kottu & Roti</option>
                      <option value="Seafood Special">Seafood Special</option>
                      <option value="Street Food">Street Food</option>
                      <option value="Desserts & Sweets">Desserts & Sweets</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Burgers">Burgers</option>
                      <option value="Vegetarian & Vegan">Vegetarian & Vegan</option>
                      <option value="Snacks & Short Eats">Snacks & Short Eats</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                  </div>
                </div>

                {/* Change Image (Optional) */}           
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Change Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">         
                      <p className="text-gray-500 mb-3">
                        Upload an image for your menu item
                      </p>

                      <label
                        htmlFor="fileUpload"
                        className="inline-block bg-orange-100 text-orange-600 font-semibold py-2 px-4 rounded-lg cursor-pointer hover:bg-orange-200"
                      >
                        Select Image
                      </label>

                      <input
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      <p className="text-gray-400 text-xs mt-2">JPG, PNG or GIF (max. 5MB)</p>

                      {/* 👇 Show selected OR existing image cleanly */}
                      {image ? (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {image.name}
                        </p>
                      ) : form.imageUrl ? (
                        <p className="text-sm text-blue-600 mt-2">
                          Current Image: {form.imageUrl.split('-').slice(1).join('-')}
                        </p>
                      ) : null}
                    </div>
                    </div>

                {/* Available Toggle */}
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

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center font-semibold text-white ${
                      loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30'
                    } transition-all duration-200`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Update'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/restaurant-profile', { state: { activeTab: 'menu' } })}
                    className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-200"
                  >
                    Cancel
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

export default EditMenuItem;
