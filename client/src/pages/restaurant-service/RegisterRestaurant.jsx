import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import LocationPicker from "../../components/Orders/LocationPicker";
import { MapPin } from 'lucide-react';

const RegisterRestaurant = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    available: true,
    location: {
      type: 'Point',
      coordinates: [80.7718, 7.8731], // default Sri Lanka (lng, lat)
    },
  });

  const handleLocationSelect = (loc) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [loc.lng, loc.lat], // Save in GeoJSON order
      },
    }));
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token || !user) {
      setError("You must be logged in to register a restaurant.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("phone", form.phone);
      formData.append("available", String(form.available));
      formData.append("location[type]", "Point");
      formData.append("location[coordinates][]", form.location.coordinates[0]);
      formData.append("location[coordinates][]", form.location.coordinates[1]);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/restaurants", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Restaurant registered successfully!");
      navigate("/restaurant-profile");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to register";
      setError(msg);
      console.error("Register error:", err);
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
        {/* ✅ Image upload field */}
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
            onChange={(e) =>
              setForm({ ...form, available: e.target.checked })
            }
            className="accent-green-600"
          />
          <span className="text-sm text-gray-700">Available</span>
        </label>

        {/* ✅ Location picker button */}
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-orange-100 text-orange-600 font-semibold hover:bg-orange-200 transition-colors"
        >
          <MapPin className="h-5 w-5" />
          Select Restaurant Location
        </button>

        <LocationPicker
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          onLocationSelect={handleLocationSelect}
        />

        {/* ✅ Show selected coordinates */}
        <div className="text-sm text-gray-700 mt-2">
          Selected Coordinates: Longitude: {form.location.coordinates[0]}, Latitude:{' '}
          {form.location.coordinates[1]}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
        >
          Register Restaurant
        </button>
      </form>
    </div>
  );
};

export default RegisterRestaurant;
