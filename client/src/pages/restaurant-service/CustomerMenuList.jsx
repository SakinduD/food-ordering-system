import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MenuItemCustomerCard from '../../components/restaurant-service/MenuItemCustomerCard';

const CustomerMenuList = () => {
  const { id } = useParams(); // ✅ Get restaurant ID from URL
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch menu items by restaurant ID
        const res = await fetch(`http://localhost:5000/api/menu/restaurant/${id}`);
        const data = await res.json();
        setItems(data.data || []);

        // ✅ Also fetch restaurant info
        const resRest = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        const restData = await resRest.json();
        setRestaurant(restData.data);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      {/* ✅ Show Restaurant Info */}
      {restaurant && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-orange-600">{restaurant.name}</h2>
          <p className="text-gray-600">{restaurant.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCustomerCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CustomerMenuList;
