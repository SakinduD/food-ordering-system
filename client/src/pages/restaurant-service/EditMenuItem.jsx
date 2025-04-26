import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { updateMenuItem } from '../../services/restaurantService';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditMenuItem = () => {
  const location = useLocation();
  const item = location.state;
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...item });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      toast.loading('Updating menu item...');

      await updateMenuItem(item._id, { ...form, image }, token);

      toast.dismiss();
      toast.success('Menu item updated!');
      navigate('/restaurant-profile', { state: { activeTab: 'menu' } });
    } catch (err) {
      toast.dismiss();
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
          
          {/* Back navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/restaurant-profile', { state: { activeTab: 'menu' } })}
              className="flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Menu</span>
            </button>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Edit Menu Item</h2>
              <p className="text-gray-600 mt-1">Update your menu item details</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdate} className="space-y-6">

                {/* Image Preview */}
                {form.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={`http://localhost:5000${form.imageUrl}`}
                      alt={form.name}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                      value={form.category || ''}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
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

                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Change Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Availability Toggle */}
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

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center font-semibold text-white ${
                      loading
                        ? 'bg-orange-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30'
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
