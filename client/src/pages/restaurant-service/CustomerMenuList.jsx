import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaUtensils, FaTag, FaRegClock, FaRegCalendarAlt } from 'react-icons/fa';
import MenuItemCustomerCard from '../../components/restaurant-service/MenuItemCustomerCard';
import CategoryFilter from '../../components/restaurant-service/CategoryFilter';

const CustomerMenuList = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeSection, setActiveSection] = useState('menu'); // 'menu', 'info', 'reviews'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/menu/restaurant/${id}`);
        const data = await res.json();
        
        if (data.data) {
          setItems(data.data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(data.data.map(item => item.category))].filter(Boolean);
          setCategories(uniqueCategories);
        } else {
          setItems([]);
        }

        // Fetch restaurant details
        const resRest = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const restData = await resRest.json();
        
        // Debug log to see the actual restaurant data structure
        console.log("Restaurant data from API:", restData);
        
        if (restData.data) {
          setRestaurant(restData.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load restaurant data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter based on search term and category
  const filteredItems = items.filter((item) => 
    (selectedCategory === '' || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading restaurant menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4 py-16 text-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-red-800 font-medium text-lg">Error</h3>
          <p className="text-red-700 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4 py-16 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-yellow-800 font-medium text-lg">Restaurant Not Found</h3>
          <p className="text-yellow-700 mt-2">The restaurant you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Hero Banner with Restaurant Image */}
      <div className="relative h-80 w-full overflow-hidden bg-gray-900">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              console.error("Failed to load image:", restaurant.imageUrl);
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/800x400?text=Restaurant+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 opacity-80">
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-white text-5xl font-bold opacity-40">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Restaurant Name and Quick Details Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`${
                      star <= (restaurant.rating || 4.2)
                        ? "text-yellow-400"
                        : "text-gray-400"
                    } w-5 h-5`}
                  />
                ))}
                <span className="ml-1 text-white font-medium">{restaurant.rating || '4.2'}</span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-white">{restaurant.category || 'Restaurant'}</span>
            </div>
            
            {restaurant.address && (
              <div className="flex items-center text-white mb-1">
                <FaMapMarkerAlt className="mr-2" />
                <span>{restaurant.address}</span>
              </div>
            )}
            
            {restaurant.phone && (
              <div className="flex items-center text-white">
                <FaPhoneAlt className="mr-2" />
                <span>{restaurant.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveSection('menu')}
              className={`py-4 px-1 whitespace-nowrap border-b-2 font-medium text-sm ${
                activeSection === 'menu'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUtensils className="inline-block mr-1 mb-1" />
              Menu
            </button>
            <button
              onClick={() => setActiveSection('info')}
              className={`py-4 px-1 whitespace-nowrap border-b-2 font-medium text-sm ${
                activeSection === 'info'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaRegCalendarAlt className="inline-block mr-1 mb-1" />
              Restaurant Info
            </button>
            <button
              onClick={() => setActiveSection('reviews')}
              className={`py-4 px-1 whitespace-nowrap border-b-2 font-medium text-sm ${
                activeSection === 'reviews'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaStar className="inline-block mr-1 mb-1" />
              Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {activeSection === 'menu' && (
          <>
            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-md">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 placeholder-gray-400 transition shadow-sm"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Menu Categories</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === '' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  All Items
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === category 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {selectedCategory ? `${selectedCategory} Menu` : 'Full Menu'} 
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredItems.length} items)
                </span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <MenuItemCustomerCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-700">No items found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    {selectedCategory && (
                      <button 
                        onClick={() => setSelectedCategory('')}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                      >
                        View All Items
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeSection === 'info' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About {restaurant.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="prose max-w-none">
                    <p className="text-gray-600">{restaurant.description || 'This restaurant has not provided a description yet.'}</p>
                  </div>
                  
                  {restaurant.specialties && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Specialties</h3>
                      <p className="text-gray-600">{restaurant.specialties}</p>
                    </div>
                  )}
                  
                  {/* Menu highlights */}
                  {items.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Menu Highlights</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.slice(0, 4).map(item => (
                          <div key={item._id} className="flex items-center p-2 bg-orange-50 rounded-lg">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-orange-500" />
                      Hours of Operation
                    </h3>
                    <div className="text-gray-600">
                      <p className="mb-1">Monday - Friday: {restaurant.openingHours || '9:00 AM - 10:00 PM'}</p>
                      <p className="mb-1">Saturday: {restaurant.weekendHours || '10:00 AM - 11:00 PM'}</p>
                      <p>Sunday: {restaurant.weekendHours || '10:00 AM - 9:00 PM'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-orange-500" />
                      Location
                    </h3>
                    <p className="text-gray-600 mb-2">{restaurant.address || 'Address not provided'}</p>
                    
                    {/* Map placeholder - would usually integrate with Google Maps */}
                    <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-500">Map view unavailable</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaPhoneAlt className="mr-2 text-orange-500" />
                      Contact
                    </h3>
                    <p className="text-gray-600 mb-1">Phone: {restaurant.phone || 'Not provided'}</p>
                    <p className="text-gray-600">Email: {restaurant.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <span className="ml-2 text-lg font-semibold">{restaurant.rating || '4.2'}/5</span>
              </div>
            </div>
            
            {/* Reviews coming soon message */}
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
              <FaStar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">Reviews Coming Soon</h3>
              <p className="text-gray-500 mt-2">Customer reviews will be available in a future update.</p>
            </div>
            
            {/* Would normally map through reviews here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMenuList;
