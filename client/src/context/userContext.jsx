import axios from "axios";
import { createContext, useEffect, useState, useReducer } from "react";
import cartReducer from "../reducers/cartReducer";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState(null);
    const [cart, dispatch] = useReducer(cartReducer,[]);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const { data } = await axios.get('http://localhost:5010/api/users/profile', {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("User Data:", data);
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (user?.userId) {
            const userId = user.userId;
            const storedCart = localStorage.getItem(`cart_${userId}`);
            
            if (storedCart) {
                dispatch({ type: 'Init', payload: JSON.parse(storedCart) });
            }
        }
    }, [user]);

    const isAdmin = () => user?.role === 'admin';
    
    return (
        <UserContext.Provider value={{ user, loading, error, isAdmin, cart, dispatch }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;