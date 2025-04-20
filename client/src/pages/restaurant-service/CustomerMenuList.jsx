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
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Our Menu</h2>
      {items.map((item) => (
        <MenuItemCustomerCard key={item._id} item={item} />
      ))}
    </div>
  );
};

export default CustomerMenuList;
