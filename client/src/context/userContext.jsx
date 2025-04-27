import { createContext, useEffect, useState, useReducer, useContext } from "react";
import axios from "axios";
import cartReducer from "../reducers/cartReducer";

export const UserContext = createContext();

// Add this custom hook to export useUser
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize user from localStorage if available
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, dispatch] = useReducer(cartReducer, []);
    // Add token state
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // Function to fetch user profile
    const fetchUserProfile = async (authToken) => {
        try {
            const { data } = await axios.get('http://localhost:5010/api/users/profile', {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            console.log('Profile data:', data);

            const userData = {
                _id: data.userId, // Store as _id for consistency
                userId: data.userId, // Keep userId for backward compatibility
                name: data.name,
                email: data.email,
                isAdmin: Boolean(data.isAdmin),
                role: data.role,
                profilePicture: data.profilePicture || null // Include profile picture
            };

            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error("Profile fetch error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setToken(null); // Clear token on error
        }
    };

    // Check auth status on mount and token change
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("token");
            console.log('Initializing auth:', { 
                hasToken: !!storedToken,
                currentUser: user 
            });

            if (storedToken) {
                try {
                    await fetchUserProfile(storedToken);
                    setToken(storedToken); // Store token in state
                } catch (error) {
                    console.error("Auth initialization error:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                    setToken(null);
                }
            } else {
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (authToken, userData) => {
        try {
            localStorage.setItem("token", authToken);
            setToken(authToken); // Set token in state
            await fetchUserProfile(authToken);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null); // Clear token on logout
        dispatch({ type: 'Clear' });
    };

    // Debug effect to monitor user state changes
    useEffect(() => {
        console.log('User state changed:', {
            isAuthenticated: !!user,
            userData: user,
            hasToken: !!token,
            timestamp: new Date().toISOString()
        });
    }, [user, token]);

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            loading,
            error,
            token, // Include token in context
            cart,
            dispatch,
            login,
            logout,
            fetchUserProfile,
            isAuthenticated: !!user && !!token, // Add isAuthenticated flag
            isAdmin: !!user?.isAdmin
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;