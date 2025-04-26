import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MenuItemCustomerCard from '../../components/restaurant-service/MenuItemCustomerCard';
import CategoryFilter from '../../components/restaurant-service/CategoryFilter';

const CustomerMenuList = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/menu/restaurant/${id}`);
        const data = await res.json();
        setItems(data.data || []);

        const resRest = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const restData = await resRest.json();
        setRestaurant(restData.data);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Filter based on search term and category
  const filteredItems = items.filter((item) => 
    (selectedCategory === '' || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">

      {/* ✅ Show Restaurant Info */}
      {restaurant && (
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-orange-600">{restaurant.name}</h2>
          <p className="text-gray-600">{restaurant.description}</p>
        </div>

        <div className="relative w-full md:w-96">
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
      <input
        type="text"
        placeholder="Search food items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-2 border-2 border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 placeholder-gray-400 transition"
      />
    </div>
      </div>
    )}


      {/* ✅ Category Filter Buttons */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* ✅ Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCustomerCard key={item._id} item={item} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No items found.
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerMenuList;
