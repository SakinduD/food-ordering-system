import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterRestaurant = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    available: true,
    location: {
      type: 'Point',
      coordinates: ['', ''], // [longitude, latitude]
    },
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCoordinateChange = (index, value) => {
    const updatedCoordinates = [...form.location.coordinates];
    updatedCoordinates[index] = value;
    setForm({
      ...form,
      location: {
        ...form.location,
        coordinates: updatedCoordinates,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to register a restaurant.');
      return;
    }

    try {
      const formattedCoordinates = form.location.coordinates.map((c) => Number(c));
      const payload = {
        ...form,
        location: {
          ...form.location,
          coordinates: formattedCoordinates,
        },
      };

      await axios.post('http://localhost:5000/api/restaurants', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('✅ Restaurant registered successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to register';
      setError(msg);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register Restaurant</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Restaurant Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="accent-green-600"
          />
          <span className="text-sm text-gray-700">Available</span>
        </label>

        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Longitude"
            value={form.location.coordinates[0]}
            onChange={(e) => handleCoordinateChange(0, e.target.value)}
            className="w-1/2 p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Latitude"
            value={form.location.coordinates[1]}
            onChange={(e) => handleCoordinateChange(1, e.target.value)}
            className="w-1/2 p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterRestaurant;
