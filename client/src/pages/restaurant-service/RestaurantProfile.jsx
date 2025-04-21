// src/pages/restaurant-service/RestaurantProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // replace with decoded token if needed

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/restaurants/user/${userId}`);
        setRestaurant(res.data.data);
      } catch (err) {
        console.error('Failed to fetch restaurant profile', err);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!restaurant) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">🏪 {restaurant.name}</h2>

      <p className="mb-2"><strong>📍 Address:</strong> {restaurant.address}</p>
      <p className="mb-2"><strong>☎️ Phone:</strong> {restaurant.phone}</p>
      <p className="mb-2">
        <strong>✅ Availability:</strong>{' '}
        <span className={restaurant.available ? 'text-green-600' : 'text-red-600'}>
          {restaurant.available ? 'Available' : 'Unavailable'}
        </span>
      </p>
      <p className="mb-4">
        <strong>📌 Coordinates:</strong>{' '}
        {restaurant.location?.coordinates?.join(', ') || 'N/A'}
      </p>

      {restaurant.location?.coordinates ? (
        <img
            className="mt-4 rounded"
            alt="Map"
            src={`https://maps.wikimedia.org/img/osm-intl,15,${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]},600x300.png`}
            onError={(e) => {
            e.target.src = '';
            e.target.alt = 'Map failed to load';
            }}
        />
) : (
  <p className="text-gray-500">Location not available</p>
)}


      <div className="flex justify-center gap-4">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          ⬅ Back
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/edit-restaurant', { state: restaurant })}
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  );
};

export default RestaurantProfile;
