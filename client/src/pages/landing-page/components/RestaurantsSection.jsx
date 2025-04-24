import { ArrowRight, Star } from "lucide-react"

function RestaurantsSection() {
  const restaurants = [
    { name: "Burger Palace", rating: "4.8", cuisine: "American", deliveryTime: "25-35 min" },
    { name: "Pizza Heaven", rating: "4.7", cuisine: "Italian", deliveryTime: "30-40 min" },
    { name: "Sushi World", rating: "4.9", cuisine: "Japanese", deliveryTime: "35-45 min" },
    { name: "Taco Fiesta", rating: "4.6", cuisine: "Mexican", deliveryTime: "20-30 min" },
  ]

  return (
    <section id="restaurants" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Popular Restaurants
          </h2>
          <a href="#" className="group flex items-center gap-2 text-orange-500 font-medium 
            hover:text-orange-600 transition-colors">
            View All 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {restaurants.map((restaurant, index) => (
            <RestaurantCard key={index} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RestaurantCard({ restaurant }) {
  return (
    <div className="group rounded-2xl bg-white border border-orange-100 overflow-hidden 
      shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 
      transform hover:scale-[1.02]">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={`https://placehold.co/300x200/png?text=${restaurant.name}`}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
          <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
            Free Delivery
          </span>
        </div>
      </div>
    </div>
  )
}

export default RestaurantsSection
