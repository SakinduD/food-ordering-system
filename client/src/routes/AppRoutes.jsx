import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

//Shanika imports
import AddMenuItem from "../pages/restaurant-service/AddMenuItem";
import EditMenuItem from "../pages/restaurant-service/EditMenuItem";
import RegisterRestaurant from "../pages/restaurant-service/RegisterRestaurant";
import AdminMenuList from "../pages/restaurant-service/AdminMenuList";
import RestaurantProfile from "../pages/restaurant-service/RestaurantProfile";
import EditRestaurant from "../pages/restaurant-service/EditRestaurant";
import CustomerMenuList from "../pages/restaurant-service/CustomerMenuList";
import AllRestaurants from "../pages/restaurant-service/AllRestaurants";

import DeliveryDriverAssignment from "../components/Delivery/DeliveryDriverAssignment";
import CreateDelivery from "../components/Delivery/CreateDelivery";

//Ishan imports
import UserOrderList from "../pages/orders/userOrderList";
import Cart from "../components/Orders/cart";
import DetailedOrderPage from "../pages/orders/DetailedOrderPage";

// New import for Delivery Tracking
import DeliveryCreationPage from "../pages/delivery/DeliveryCreationPage";
import DeliveryAgentDashboard from "../pages/delivery/DeliveryAgentDashboard";

//Methush imports
import LandingPage from "../pages/landing-page/LandingPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserProfile from "../pages/UserProfile";
import VerifyOTP from "../pages/register/VerifyOTP";
import Login from "../pages/login/login";
import Register from "../pages/register/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import CreateReview from "../pages/reviews/CreateReview";
import EditReview from "../pages/reviews/EditReview";
import UserReviews from "../pages/reviews/UserReviews";
import ViewReview from "../pages/reviews/ViewReview";

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

// Delivery Agent Route Component
const DeliveryAgentRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user || user.role !== "deliveryAgent") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RestaurantOwnerRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user || user.role !== 'restaurant') {
    return <Navigate to="/login" replace />;
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
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/assign-driver" element={<DeliveryDriverAssignment />} />
      <Route path="/create-delivery" element={<CreateDelivery />} />

      <Route
        path="/create-delivery/:orderId"
        element={
          <ProtectedRoute>
            <DeliveryCreationPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - ishan */}
      <Route path="/orders" element={<ProtectedRoute> <UserOrderList /> </ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>} />
      <Route path="/detailed-order/:orderId" element={<ProtectedRoute> <DetailedOrderPage /> </ProtectedRoute>} />
      <Route
        path="/delivery-driver-assignment/:deliveryId"
        element={
          <ProtectedRoute>
            <DeliveryDriverAssignmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery-tracking/:deliveryId"
        element={<DeliveryTrackingPage />}
      />

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

      <Route
        path="/delivery-agent"
        element={
          <DeliveryAgentRoute>
            <DeliveryAgentDashboard />
          </DeliveryAgentRoute>
        }
      />

      {/* Restaurant Owner Protected Routes-Shanika */}
      <Route path="/add-menu" element={<RestaurantOwnerRoute> <AddMenuItem /> </RestaurantOwnerRoute>} />
      <Route path="/edit-menu/:id" element={<RestaurantOwnerRoute> <EditMenuItem /> </RestaurantOwnerRoute>} />
      <Route path="/register-restaurant" element={<RestaurantOwnerRoute> <RegisterRestaurant /> </RestaurantOwnerRoute>} />
      <Route path="/admin/menu" element={<RestaurantOwnerRoute> <AdminMenuList /> </RestaurantOwnerRoute>} />
      <Route path="/restaurant-profile" element={<RestaurantOwnerRoute> <RestaurantProfile /> </RestaurantOwnerRoute>} />
      <Route path="/edit-restaurant" element={<RestaurantOwnerRoute> <EditRestaurant /> </RestaurantOwnerRoute>} />

      {/* Customer Routes-Shanika */}
      <Route path="/restaurants" element={<AllRestaurants />} />
      <Route path="/restaurant/:id" element={<CustomerMenuList />} />

      <Route
        path="/restaurant/:restaurantId/create-review"
        element={
          <ProtectedRoute>
            <CreateReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/:restaurantId/edit-review"
        element={
          <ProtectedRoute>
            <EditReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/reviews"
        element={
          <ProtectedRoute>
            <UserReviews />
          </ProtectedRoute>
        }
      />
      <Route path="/reviews" element={<ViewReview />} />
    </Routes>
    );
}

export default AppRoutes;
