import { createContext, useEffect, useState, useReducer } from "react";
import axios from "axios";
import cartReducer from "../reducers/cartReducer";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize user from localStorage if available
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, dispatch] = useReducer(cartReducer, []);

    // Function to fetch user profile
    const fetchUserProfile = async (token) => {
        try {
            const { data } = await axios.get('http://localhost:5010/api/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Profile data:', data);

            const userData = {
                _id: data.userId, // Store as _id for consistency
                userId: data.userId, // Keep userId for backward compatibility
                name: data.name,
                email: data.email,
                isAdmin: Boolean(data.isAdmin),
                role: data.role
            };

            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error("Profile fetch error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    // Check auth status on mount and token change
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token");
            console.log('Initializing auth:', { 
                hasToken: !!token,
                currentUser: user 
            });

            if (token) {
                try {
                    await fetchUserProfile(token);
                } catch (error) {
                    console.error("Auth initialization error:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (token, userData) => {
        try {
            localStorage.setItem("token", token);
            await fetchUserProfile(token);
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
        dispatch({ type: 'Clear' });
    };

    // Debug effect to monitor user state changes
    useEffect(() => {
        console.log('User state changed:', {
            isAuthenticated: !!user,
            userData: user,
            timestamp: new Date().toISOString()
        });
    }, [user]);

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            loading,
            error,
            cart,
            dispatch,
            login,
            logout,
            isAdmin: !!user?.isAdmin
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;