import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import UserContextProvider from './context/userContext';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <UserContextProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </UserContextProvider>
  );
}

export default App;