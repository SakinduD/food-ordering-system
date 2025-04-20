// src/pages/restaurant-service/MenuItemList.jsx
import { useEffect, useState } from 'react';
import { fetchMenuItems, deleteMenuItem } from '../../services/restaurantService';
import MenuItemCard from '../../components/restaurant-service/MenuItemCard';
import { useNavigate } from 'react-router-dom';

const MenuItemList = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const loadItems = async () => {
    const data = await fetchMenuItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await deleteMenuItem(id, token);
    loadItems();
  };

  const handleEdit = (item) => {
    navigate(`/edit-menu/${item._id}`, { state: item });
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Menu Items</h2>
        <button onClick={() => navigate('/add-menu')} className="px-4 py-2 bg-green-600 text-white rounded">
          + Add Item
        </button>
      </div>
      {items.map((item) => (
        <MenuItemCard key={item._id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default MenuItemList;
