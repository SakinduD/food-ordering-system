import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, MapPin } from "lucide-react";

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const restaurantCategories = [
    "All",
    "Fine Dining",
    "Casual Dining",
    "Fast Food",
    "Cafe",
    "Buffet",
    "Bakery",
    "Food Truck",
  ];

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

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      (restaurant.category && restaurant.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

      {/* Centered Title */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl font-bold text-orange-600">
          All Restaurants
        </h2>
      </div>

      {/* Right Aligned Search Bar */}
      <div className="flex justify-center md:justify-end w-full md:w-auto">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by restaurant name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {restaurantCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {filteredRestaurants.length === 0 ? (
          <p className="text-center col-span-full text-gray-500">
            No matching restaurants found.
          </p>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <Link key={restaurant._id} to={`/restaurant/${restaurant._id}`}>
              <div className="group rounded-2xl bg-white border border-orange-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-500 transform hover:scale-[1.02]">
                
                {/* Image */}
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

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">
                      {restaurant.name}
                    </h3>

                    {restaurant.rating && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50">
                        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                        <span className="font-semibold text-orange-600">
                          {restaurant.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  {/* <p className="text-sm text-gray-600 mb-1">
                    {restaurant.category || "Uncategorized"}
                  </p> */}

                  {/* Address */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span>{restaurant.address || "No address provided"}</span>
                  </div>

                  {/* Delivery Time + Availability */}
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
