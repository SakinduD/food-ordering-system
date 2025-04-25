import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import { Users, Store, LayoutDashboard, Coffee, ChefHat, ShoppingBag } from 'lucide-react';
import AdminUser from './AdminUser';
import AdminRestaurants from './AdminRestaurants';
import AdminAllOrders from './AdminAllOrders';
import axios from 'axios';
import Spinner from '../../components/Spinner';

function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const [userLoading, setUserLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  //fetch user data
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5010/api/users/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setUserLoading(false);
    }
  };

  //fetch restaurants data
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/restaurants', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Check if response.data is an array or has a nested data property
      const restaurantData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];

      setRestaurants(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
      setRestaurants([]); // Set empty array on error
    } finally {
      setRestaurantsLoading(false);
    }
  };

  //fetch orders data
  const fetchOrders = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5001/api/order/getAllOrders", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setOrders(response.data.orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
    } finally {
        setLoadingOrders(false);
    }   
  }

  // Fetch dashboard stats
  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
    fetchOrders();
  }, []);

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin'
    },
    {
      title: 'Users',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users'
    },
    {
      title: 'Restaurants',
      icon: <Store className="h-5 w-5" />,
      path: '/admin/restaurants'
    },
    {
      title: 'Orders',
      icon: <ShoppingBag className="h-5 w-5" />,
      path: '/admin/orders'
    }
  ];

  const DashboardHome = () => (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your food ordering system.</p>
        </div>
        <ChefHat className="h-12 w-12 text-orange-500" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Restaurants</p>
              <h3 className="text-2xl font-bold text-gray-800">{restaurants.length}</h3>
            </div>
            <Store className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{orders.length}</h3>
            </div>
            <ShoppingBag className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Popular Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Restaurant Cards */}
          <div className="relative rounded-lg overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4" 
              alt="Restaurant" 
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-200"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-semibold">Fine Dining Restaurant</h3>
              <p className="text-white/80 text-sm">⭐ 4.8 (120 reviews)</p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9" 
              alt="Restaurant" 
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-200"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-semibold">Casual Dining</h3>
              <p className="text-white/80 text-sm">⭐ 4.6 (95 reviews)</p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de" 
              alt="Restaurant" 
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-200"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-semibold">Fast Food Chain</h3>
              <p className="text-white/80 text-sm">⭐ 4.5 (150 reviews)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (userLoading || restaurantsLoading || loadingOrders) {
    return <Spinner />;
  }


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg ${isCollapsed ? 'w-20' : 'w-64'} transition-width duration-300`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-bold text-xl text-orange-600 ${isCollapsed ? 'hidden' : 'block'}`}>
              Admin Panel
            </h2>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-orange-50"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors"
              >
                {item.icon}
                <span className={isCollapsed ? 'hidden' : 'block'}>
                  {item.title}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/users" element={<AdminUser />} />
          <Route path="/restaurants" element={<AdminRestaurants />} />
          <Route path="/orders" element={<AdminAllOrders />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;