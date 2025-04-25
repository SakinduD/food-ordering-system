// src/pages/restaurant-service/EditRestaurant.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LocationPicker from '../../components/Orders/LocationPicker';
import { MapPin } from 'lucide-react';

const EditRestaurant = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(state || {});
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [image, setImage] = useState(null); 

  useEffect(() => {
    if (!form?._id) {
      alert('No restaurant data found!');
      navigate('/');
    }
  }, [form, navigate]);

  const handleLocationSelect = (loc) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [loc.lng, loc.lat], // GeoJSON format
      },
    }));
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');

    if (!form.name || !form.location?.coordinates[0] || !form.location?.coordinates[1]) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address);
      formData.append('phone', form.phone);
      formData.append('available', String(form.available));
      formData.append('location[type]', 'Point');
      formData.append('location[coordinates][]', form.location.coordinates[0]);
      formData.append('location[coordinates][]', form.location.coordinates[1]);
      if (image) formData.append('image', image); // ✅ Append image if selected

      await axios.put(`http://localhost:5000/api/restaurants/${form._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Profile updated!');
      navigate('/restaurant-profile');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
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

        {/* ✅ Location Picker Button */}
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-orange-100 text-orange-600 font-semibold hover:bg-orange-200 transition-colors"
        >
          <MapPin className="h-5 w-5" />
          Select Location on Map
        </button>

        <LocationPicker
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          onLocationSelect={handleLocationSelect}
        />

        {/* ✅ Show selected coordinates */}
        <div className="text-sm text-gray-700 mt-2">
          Coordinates: Longitude: {form.location?.coordinates?.[0]}, Latitude: {form.location?.coordinates?.[1]}
        </div>

        {/* ✅ Image Upload */}
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
