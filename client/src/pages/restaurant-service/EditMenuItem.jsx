import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { updateMenuItem } from '../../services/restaurantService';

const EditMenuItem = () => {
  const location = useLocation();
  const item = location.state;
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...item });
  const [image, setImage] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await updateMenuItem(item._id, { ...form, image }, token);
      alert('✅ Menu item updated!');
      navigate('/admin/menu');
    } catch (err) {
      console.error(err);
      alert('Failed to update item');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Menu Item</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Show current image */}
        {form.imageUrl && (
          <img
            src={`http://localhost:5000${form.imageUrl}`}
            alt={form.name}
            className="w-full h-40 object-cover rounded mb-2"
          />
        )}

        <input
          className="w-full p-2 border rounded"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="w-full p-2 border rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-2 border rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="accent-yellow-500"
          />
          <span className="text-sm text-gray-700">Available</span>
        </label>

        <div className="flex gap-30">
          <button
            type="submit"
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/menu')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditMenuItem;
