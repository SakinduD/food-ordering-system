import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import MenuItemCard from '../../components/restaurant-service/MenuItemCard';
import { deleteMenuItem } from '../../services/restaurantService';
import { ArrowLeft } from 'lucide-react';

const AdminMenuList = () => {
  const { user } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadItems = async () => {
    if (!user?.userId) return;

    try {
      const token = localStorage.getItem('token');
      const restaurantRes = await fetch(`http://localhost:5000/api/restaurants/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const restaurantData = await restaurantRes.json();
      const restaurantId = restaurantData.data?._id;

      if (!restaurantId) return setItems([]);

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

  const filteredItems = items.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const availableMatch = item.available
      ? 'available'.includes(searchTerm.toLowerCase())
      : 'not available'.includes(searchTerm.toLowerCase());
    return nameMatch || availableMatch;
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* <button
        onClick={() => navigate('/restaurant-profile')}
        className="flex items-center gap-2 text-orange-600 font-medium hover:underline mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Profile
      </button> */}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-orange-600">🍽️ All Menu Items</h2>
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search name or availability"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <button
          onClick={() => navigate('/add-menu')}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          + Add Item
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-orange-50 rounded-xl shadow">
          <p className="text-xl text-gray-600 mb-2">No matching items</p>
          <p className="text-gray-500">Try a different search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard key={item._id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMenuList;
