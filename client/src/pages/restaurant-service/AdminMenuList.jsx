import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import MenuItemCard from '../../components/restaurant-service/MenuItemCard';
import { deleteMenuItem } from '../../services/restaurantService';

const AdminMenuList = () => {
  const { user } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const loadItems = async () => {
    if (!user?.userId) return;

    try {
      const token = localStorage.getItem('token');

      const restaurantRes = await fetch(`http://localhost:5000/api/restaurants/user/${user.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const restaurantData = await restaurantRes.json();
      const restaurantId = restaurantData.data?._id;

      if (!restaurantId) {
        setItems([]);
        return;
      }

      const menuRes = await fetch(`http://localhost:5000/api/menu/restaurant/${restaurantId}`);
      const menuData = await menuRes.json();

      setItems(menuData.data || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    }
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
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-orange-600">🍽️ All Menu Items</h2>
        <button
          onClick={() => navigate('/add-menu')}
          className="mt-4 sm:mt-0 px-5 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-orange-50 rounded-xl shadow">
          <p className="text-xl text-gray-600 mb-2">No menu items found</p>
          <p className="text-gray-500">Start adding items to build your menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <MenuItemCard key={item._id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMenuList;
