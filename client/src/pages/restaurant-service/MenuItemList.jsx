// src/pages/restaurant-service/MenuItemList.jsx
import { useEffect, useState, useContext } from 'react';
import { fetchMenuItems, deleteMenuItem } from '../../services/restaurantService';
import MenuItemCard from '../../components/restaurant-service/MenuItemCard';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';
import { Plus, ArrowLeft, Search, Filter, SortDesc } from 'lucide-react';

const MenuItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const data = await fetchMenuItems(token);
      if (Array.isArray(data)) {
        setItems(data);
        
        // Extract unique categories for filtering
        const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
        setCategories(uniqueCategories);
      } else {
        setItems([]);
        setError('Could not load menu items');
      }
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError('Failed to load menu items');
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      toast.loading('Deleting menu item...');
      const token = localStorage.getItem('token');
      await deleteMenuItem(id, token);
      toast.dismiss();
      toast.success('Menu item deleted successfully');
      loadItems();
    } catch (err) {
      toast.dismiss();
      console.error('Error deleting menu item:', err);
      toast.error('Failed to delete menu item');
    }
  };

  const handleEdit = (item) => {
    navigate(`/edit-menu/${item._id}`, { state: item });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesAvailability = 
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && item.available) ||
      (availabilityFilter === 'unavailable' && !item.available);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/restaurant-profile')}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Menu Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your restaurant's menu items
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/add-menu')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow hover:shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Add New Item
            </button>
          </div>
          
          {/* Search and filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
                />
              </div>
              
              {/* Category filter */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Availability filter */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <SortDesc size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
                  >
                    <option value="all">All Items</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results summary */}
            {items.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredItems.length} of {items.length} items
                {searchTerm && <span> matching "{searchTerm}"</span>}
                {categoryFilter !== 'all' && <span> in category "{categoryFilter}"</span>}
              </div>
            )}
          </div>
          
          {/* Main content */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={loadItems}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <img 
                  src="/images/empty-menu.svg" 
                  alt="No items" 
                  className="mx-auto h-32 mb-4 opacity-60"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your menu is empty</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Add your first menu item to start showcasing your food to customers.
                </p>
                <button 
                  onClick={() => navigate('/add-menu')} 
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Add Your First Menu Item
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 px-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching items</h3>
                <p className="text-gray-500 mb-4">
                  Try changing your search or filters to see more items.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setAvailabilityFilter('all');
                  }} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 p-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {filteredItems.map((item) => (
                  <MenuItemCard 
                    key={item._id} 
                    item={item} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemList;
