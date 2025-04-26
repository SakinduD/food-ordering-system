import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants`);
        setRestaurants(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch restaurants', err);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-6 text-orange-600 text-center">All Restaurants</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {restaurants.length === 0 ? (
          <p className="text-center col-span-full text-gray-500">No restaurants available.</p>
        ) : (
          restaurants.map((restaurant) => (
            <Link key={restaurant._id} to={`/restaurant/${restaurant._id}`}>
              <div className="group rounded-2xl bg-white border border-orange-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-500 transform hover:scale-[1.02]">
              <div className="relative bg-white h-40 w-full overflow-hidden flex items-center justify-center border-b">
                <img
                  src={
                    restaurant.imageUrl
                      ? `http://localhost:5000${restaurant.imageUrl}`
                      : "https://via.placeholder.com/400x200?text=No+Image"
                  }
                  alt={restaurant.name}
                  className="h-full w-auto object-contain"
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {restaurant.specialty && (
                    <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {restaurant.specialty}
                    </div>
                  )}
                </div>
                <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">
                    {restaurant.name}
                  </h3>          
                </div>

                {restaurant.rating && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="font-semibold text-orange-600">
                      {restaurant.rating}
                    </span>
                  </div>
                )}
              </div>

                  <p className="text-sm text-gray-600 mb-4">{restaurant.cuisine}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full">
                      {restaurant.deliveryTime || "30-40 min"}
                    </span>
                    {restaurant.available ? (
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                        Open
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-red-100 text-red-800 px-3 py-1.5 rounded-full">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default AllRestaurants;
