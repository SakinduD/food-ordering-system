import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import AddMenuItem from "../pages/restaurant-service/AddMenuItem";
import EditMenuItem from "../pages/restaurant-service/EditMenuItem";
import RegisterRestaurant from "../pages/restaurant-service/RegisterRestaurant";
import AdminMenuList from "../pages/restaurant-service/AdminMenuList";
import CustomerMenuList from "../pages/restaurant-service/CustomerMenuList";
import UserOrderList from "../pages/orders/userOrderList";
import Login from "../pages/login/login";
import Register from "../pages/register/Register";
import RestaurantProfile from "../pages/restaurant-service/RestaurantProfile";
import EditRestaurant from "../pages/restaurant-service/EditRestaurant";
import AllRestaurants from "../pages/restaurant-service/AllRestaurants";
import DeliveryDriverAssignment from "../components/Delivery/DeliveryDriverAssignment";
import CreateDelivery from "../components/Delivery/CreateDelivery";
import Cart from "../components/Orders/cart";
import DriverLocationTracker from "../components/Delivery/DriverLocationTracker";   
import DetailedOrderPage from "../pages/orders/DetailedOrderPage";

//Methush imports
import LandingPage from "../pages/landing-page/LandingPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserProfile from '../pages/UserProfile';

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

  console.log("AdminRoute check:", {
    user,
    isAdmin: user?.isAdmin,
    hasToken: !!localStorage.getItem("token"),
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
        path="/admin/*" 
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
      <Route path="/restaurant/:id" element={<CustomerMenuList />} />
      <Route path="/restaurants" element={<AllRestaurants />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/restaurant-profile" element={<RestaurantProfile />} />
      <Route path="/edit-restaurant" element={<EditRestaurant />} />
      <Route path="/assign-driver" element={<DeliveryDriverAssignment />} />
      <Route path="/create-delivery" element={<CreateDelivery />} />
      <Route path="/location-tracker" element={<DriverLocationTracker />} />

      <Route path="/orders" element={<UserOrderList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/detailed-order/:orderId" element={<DetailedOrderPage />} />

      {/* Protected Routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
