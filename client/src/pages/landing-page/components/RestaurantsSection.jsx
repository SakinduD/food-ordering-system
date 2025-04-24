import { ArrowRight, Star } from "lucide-react"
import { useState, useEffect, useRef } from "react"

function RestaurantsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  
  // Automatic carousel for restaurants
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % restaurants.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sri Lankan restaurants data
  const restaurants = [
    { 
      name: "Upali's by Nawaloka", 
      rating: "4.8", 
      cuisine: "Sri Lankan Traditional", 
      deliveryTime: "25-35 min",
      image: "https://i.imgur.com/JyZIk6o.jpg",
      specialty: "Rice & Curry"
    },
    { 
      name: "The Mango Tree", 
      rating: "4.7", 
      cuisine: "Sri Lankan Seafood", 
      deliveryTime: "30-40 min", 
      image: "https://i.imgur.com/NTujTxP.jpg",
      specialty: "Crab Curry"
    },
    { 
      name: "Kaema Sutra", 
      rating: "4.9", 
      cuisine: "Contemporary Sri Lankan", 
      deliveryTime: "35-45 min", 
      image: "https://i.imgur.com/vF0GRAx.jpg",
      specialty: "Hoppers Platter"
    },
    { 
      name: "Isso", 
      rating: "4.6", 
      cuisine: "Sri Lankan Street Food", 
      deliveryTime: "20-30 min", 
      image: "https://i.imgur.com/hcyYiTF.jpg",
      specialty: "Prawn Kottu"
    },
    { 
      name: "Ministry of Crab", 
      rating: "4.9", 
      cuisine: "Seafood", 
      deliveryTime: "35-45 min", 
      image: "https://i.imgur.com/kJDgFcA.jpg",
      specialty: "Garlic Chili Crab"
    },
    { 
      name: "Palmyrah Restaurant", 
      rating: "4.7", 
      cuisine: "Northern Sri Lankan", 
      deliveryTime: "30-40 min", 
      image: "https://i.imgur.com/zqY1WJt.jpg",
      specialty: "Jaffna Crab Curry"
    },
  ];

  // Filter functionality
  const cuisineTypes = ["All", "Sri Lankan Traditional", "Seafood", "Street Food", "Contemporary"];
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  const filteredRestaurants = selectedCuisine === "All" 
    ? restaurants 
    : restaurants.filter(r => r.cuisine.includes(selectedCuisine));

  return (
    <section id="restaurants" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/30 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Popular Sri Lankan Restaurants
          </h2>
          <a href="#" className="group flex items-center gap-2 text-orange-500 font-medium 
            hover:text-orange-600 transition-colors">
            View All 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Cuisine filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
          {cuisineTypes.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCuisine === cuisine
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-100"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        <div className="relative">
          {/* Animated gradient background for restaurants */}
          <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-orange-50/50 to-orange-100/50 -z-10"></div>
          
          {/* Restaurants grid */}
          <div 
            ref={containerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden"
          >
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard 
                key={index} 
                restaurant={restaurant} 
                isActive={activeIndex === index}
              />
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {filteredRestaurants.slice(0, Math.min(6, filteredRestaurants.length)).map((_, index) => (
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
        </div>
      </div>
    </section>
  )
}

function RestaurantCard({ restaurant, isActive }) {
  return (
    <div className={`group rounded-2xl bg-white border border-orange-100 overflow-hidden 
      shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-500 
      transform hover:scale-[1.02] ${isActive ? 'ring-2 ring-orange-300 ring-offset-2' : ''}`}>
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          {restaurant.specialty}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50">
            <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span className="font-semibold text-orange-600">{restaurant.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{restaurant.cuisine}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full">
            {restaurant.deliveryTime}
          </span>
          <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full animate-pulse">
            Free Delivery
          </span>
        </div>
      </div>
    </div>
  )
}

export default RestaurantsSection
