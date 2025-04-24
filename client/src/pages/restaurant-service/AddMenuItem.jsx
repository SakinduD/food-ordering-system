import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext'; // ✅ import your context

const AddMenuItem = () => {
  const { user } = useContext(UserContext); // ✅ useContext here
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    available: true,
    restaurantId: '',
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      setForm((prev) => ({
        ...prev,
        restaurantId: user.userId, // ✅ update from context
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('available', form.available);
    formData.append('restaurantId', form.restaurantId);
    if (image) formData.append('image', image);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/menu`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Menu item added with image!');
      navigate('/admin/menu');
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Price"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Restaurant ID"
          value={form.restaurantId}
          onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
          readOnly
        />
        <input
          className="w-full p-2 border rounded"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="accent-blue-600"
          />
          <span className="text-sm text-gray-700">Available</span>
        </label>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default AddMenuItem;
