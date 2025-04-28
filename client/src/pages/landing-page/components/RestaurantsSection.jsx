import { ArrowRight, Star, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function RestaurantsSection() {
  const [restaurants, setRestaurants] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

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
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ Fetch restaurants from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/restaurants");
        const json = await res.json();
        setRestaurants(json.data || []);
      } catch (err) {
        console.error("Failed to fetch restaurants", err);
      }
    };

    fetchRestaurants();
  }, []);

  // ✅ Filter logic
  const filteredRestaurants =
    selectedCategory === "All"
      ? restaurants.filter(r => r.isVerified === true)
      : restaurants.filter(
          (r) =>
            r.isVerified === true &&
            r.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  // ✅ Auto carousel
  useEffect(() => {
    if (filteredRestaurants.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % filteredRestaurants.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [filteredRestaurants]);

  return (
    <section
      id="restaurants"
      className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/30 overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Title and View All */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Popular Sri Lankan Restaurants
          </h2>
          <Link
            to="/restaurants"
            className="group flex items-center gap-2 text-orange-500 font-medium hover:text-orange-600 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
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

        {/* Grid Section */}
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-orange-50/50 to-orange-100/50 -z-10"></div>

          <div
            ref={containerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden"
          >
            {filteredRestaurants.length === 0 ? (
              <p className="text-center col-span-full text-gray-500">
                No restaurants found.
              </p>
            ) : (
              filteredRestaurants.map((restaurant, index) => (
                <Link key={restaurant._id} to={`/restaurant/${restaurant._id}`}>
                  <RestaurantCard
                    restaurant={restaurant}
                    isActive={activeIndex === index}
                  />
                </Link>
              ))
            )}
          </div>

          {/* Pagination Dots */}
          {filteredRestaurants.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {filteredRestaurants
                .slice(0, Math.min(6, filteredRestaurants.length))
                .map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === index
                        ? "bg-orange-500 w-6"
                        : "bg-orange-200 hover:bg-orange-300"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant, isActive }) {
  return (
    <div
      className={`group rounded-2xl bg-white border border-orange-100 overflow-hidden 
      shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-500 
      transform hover:scale-[1.02] ${
        isActive ? "ring-2 ring-orange-300 ring-offset-2" : ""
      }`}
    >
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
      </div>
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

        {/* <p className="text-sm text-gray-600 mb-2">
          {restaurant.category || "Uncategorized"}
        </p> */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="h-4 w-4 text-orange-400" />
          <span>{restaurant.address || "No address provided"}</span>
        </div>


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
  );
}

export default RestaurantsSection;
