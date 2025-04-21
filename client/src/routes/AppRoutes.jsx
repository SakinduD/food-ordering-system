import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddMenuItem from '../pages/restaurant-service/AddMenuItem';
import EditMenuItem from '../pages/restaurant-service/EditMenuItem';
import RegisterRestaurant from '../pages/restaurant-service/RegisterRestaurant';
import AdminMenuList from '../pages/restaurant-service/AdminMenuList';
import CustomerMenuList from '../pages/restaurant-service/CustomerMenuList';
import UserOrderList from '../components/Orders/userOrderList';
import Login from '../pages/login/login';
import RestaurantProfile from '../pages/restaurant-service/RestaurantProfile';
import EditRestaurant from '../pages/restaurant-service/EditRestaurant';

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                <Route path="/add-menu" element={<AddMenuItem />} />
                <Route path="/edit-menu/:id" element={<EditMenuItem />} />
                <Route path="/register-restaurant" element={<RegisterRestaurant />} />
                <Route path="/admin/menu" element={<AdminMenuList />} />
                <Route path="/menu" element={<CustomerMenuList />} />
                <Route path="/orders" element={<UserOrderList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/restaurant-profile" element={<RestaurantProfile />} />
                <Route path="/edit-restaurant" element={<EditRestaurant />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;