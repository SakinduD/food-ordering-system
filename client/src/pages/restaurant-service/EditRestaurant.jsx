// src/pages/restaurant-service/EditRestaurant.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EditRestaurant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(location.state || {});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!form?._id) {
      alert('No restaurant data found!');
      navigate('/');
    }
  }, [form, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');

    if (!form.name || !form.location?.coordinates[0] || !form.location?.coordinates[1]) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/restaurants/${form._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Profile updated!');
      navigate('/restaurant-profile');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
  };

  const handleCoordinateChange = (index, value) => {
    const updated = [...form.location.coordinates];
    updated[index] = value;
    setForm({
      ...form,
      location: { ...form.location, coordinates: updated },
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">✏️ Edit Restaurant</h2>

      {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <div className="flex space-x-2">
          <input
            className="w-1/2 p-2 border rounded"
            placeholder="Longitude"
            value={form.location?.coordinates[0]}
            onChange={(e) => handleCoordinateChange(0, e.target.value)}
            required
          />
          <input
            className="w-1/2 p-2 border rounded"
            placeholder="Latitude"
            value={form.location?.coordinates[1]}
            onChange={(e) => handleCoordinateChange(1, e.target.value)}
            required
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="accent-green-500"
          />
          <span>Available</span>
        </label>

        <div className="flex justify-between">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate('/restaurant-profile')}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurant;
