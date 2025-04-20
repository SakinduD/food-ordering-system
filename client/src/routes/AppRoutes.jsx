import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UserOrderList from '../components/Orders/userOrderList';


function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                <Route path="/orders" element={<UserOrderList />} />
                
            </Routes>
        </Router>
    );
}

export default AppRoutes;