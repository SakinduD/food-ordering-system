import { useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import { Users, Store, LayoutDashboard } from 'lucide-react';
import AdminUser from './AdminUser';
import AdminRestaurants from './AdminRestaurants';

function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    }
  ];

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
          <Route path="/" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome to the admin panel</p>
            </div>
          } />
          <Route path="/users" element={<AdminUser />} />
          <Route path="/restaurants" element={<AdminRestaurants />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;