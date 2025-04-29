export const totalItems = (cart) => {
    return cart.reduce((sum, item) => sum + item.cartUsage, 0);
}

export const totalPrice = (cart) => {
    return cart.reduce((total, item) => total + item.cartUsage * item.price, 0);
}

const CartReducer = (state, action) => {

    switch (action.type) {
        case "Add":
            if (!action.userId) {
                console.error("User ID is missing. Cannot add to cart.");
                return state;
            }

            if (!action.item || typeof action.item !== 'object' || !action.item._id) {
                console.error("Invalid item provided:", action.item);
                return state;
            }

            if (!Array.isArray(state)) {
                console.error("State is not an array:", state);
                return [];
            }

            const existingItem = state.find(item => item._id === action.item._id);
            
            // If item exists, don't add cartUsage to existing cartUsage, just use the new value
            const updatedState = existingItem
                ? state.map(item =>
                    item._id === action.item._id
                        ? { ...item, cartUsage: action.item.cartUsage || 1 }
                        : item
                )
                : [...state, { ...action.item, cartUsage: action.item.cartUsage || 1 }];

            localStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedState));
            return updatedState;

        case "Remove":
            const updatedStateR = state.filter(item => item._id !== action.payload);
            localStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedStateR));
            return updatedStateR;

        case "Increase":
            const updatedStateI = state.map(item => 
                item._id === action.payload
                ? { ...item, cartUsage: item.cartUsage + 1 }
                : item
            );
            localStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedStateI));
            return updatedStateI;

        case "Decrease":
            const updatedStateD = state.map(item => 
                item._id === action.payload && item.cartUsage > 1
                ? { ...item, cartUsage: item.cartUsage - 1 }
                : item
            );
            localStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedStateD));
            return updatedStateD;

        case "Init":
            return action.payload;

        case "Clear":
            localStorage.removeItem(`cart_${action.userId}`);
            return [];

        default:
            return state;
    }
}

export const loadCartFromLocalStorage = (userId) => {
    if (!userId) return [];
    const savedCart = JSON.parse(localStorage.getItem(`cart_${userId}`));
    return savedCart || [];
};

export default CartReducer;