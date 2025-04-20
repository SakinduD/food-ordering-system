import { useEffect, useState } from 'react';
import { fetchMenuItems } from '../../services/restaurantService';
import MenuItemCustomerCard from '../../components/restaurant-service/MenuItemCustomerCard';

const CustomerMenuList = () => {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    const data = await fetchMenuItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">🍽️ Our Menu</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCustomerCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CustomerMenuList;
