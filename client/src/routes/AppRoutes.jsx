import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                
            </Routes>
        </Router>
    );
}

export default AppRoutes;