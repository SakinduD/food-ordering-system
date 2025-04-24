import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import AddMenuItem from "../pages/restaurant-service/AddMenuItem";
import EditMenuItem from "../pages/restaurant-service/EditMenuItem";
import RegisterRestaurant from "../pages/restaurant-service/RegisterRestaurant";
import AdminMenuList from "../pages/restaurant-service/AdminMenuList";
import CustomerMenuList from "../pages/restaurant-service/CustomerMenuList";
import UserOrderList from "../components/Orders/userOrderList";
import Login from "../pages/login/login";
import Register from "../pages/register/Register";
import RestaurantProfile from "../pages/restaurant-service/RestaurantProfile";
import EditRestaurant from "../pages/restaurant-service/EditRestaurant";
import DeliveryDriverAssignment from "../components/Delivery/DeliveryDriverAssignment";
import CreateDelivery from "../components/Delivery/CreateDelivery";
import Cart from "../components/Orders/cart";

import LandingPage from "../pages/landing-page/LandingPage";
import AdminDashboard from "../pages/AdminDashboard";

// Protected Route Components
const ProtectedRoute = ({ children }) => {
    const { user } = useContext(UserContext);
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

const AdminRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  
  console.log('AdminRoute check:', {
    user,
    isAdmin: user?.isAdmin,
    hasToken: !!localStorage.getItem('token')
  });

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/add-menu" element={<AddMenuItem />} />
      <Route path="/edit-menu/:id" element={<EditMenuItem />} />
      <Route path="/register-restaurant" element={<RegisterRestaurant />} />
      <Route path="/admin/menu" element={<AdminMenuList />} />
      <Route path="/menu" element={<CustomerMenuList />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/restaurant-profile" element={<RestaurantProfile />} />
      <Route path="/edit-restaurant" element={<EditRestaurant />} />
      <Route path="/assign-driver" element={<DeliveryDriverAssignment />} />
      <Route path="/create-delivery" element={<CreateDelivery />} />

      <Route path="/orders" element={<UserOrderList />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
}

export default AppRoutes;
