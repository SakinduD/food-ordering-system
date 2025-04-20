import './App.css';
import AppRoutes from './routes/AppRoutes';
import UserContextProvider from './context/userContext';

function App() {
  return (
    <UserContextProvider>
      <AppRoutes />
    </UserContextProvider>
    
  );
}

export default App;
