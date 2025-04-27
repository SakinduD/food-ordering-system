import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import UserContextProvider from './context/userContext';
import { ReviewProvider } from './context/reviewContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <UserContextProvider>
      <ReviewProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </ReviewProvider>
    </UserContextProvider>
  );
}

export default App;