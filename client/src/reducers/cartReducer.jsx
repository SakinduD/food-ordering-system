export const totalItems = (cart) => {
    return cart.reduce((sum, item) => sum + item.cartUsage, 0);
}

export const totalPrice = (cart) => {
    return cart.reduce((total, item) => total + item.cartUsage * item.itemPrice, 0);
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
            const updatedState = existingItem
                ? state.map(item =>
                    item._id === action.item._id
                        ? { ...item, cartUsage: item.cartUsage + (action.item.cartUsage || 1) }
                        : item
                )
                : [...state, { ...action.item, cartUsage: action.item.cartUsage || 1 }];

            sessionStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedState));

            return updatedState;


        case "Remove":
            const updatedStateR = state.filter(item => item._id !== action.payload);
            sessionStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedStateR));
            return updatedStateR;

        case "Increase":
            const updatedStateI = state.map(item => 
                item._id === action.payload
                ? { ...item, cartUsage: Math.min(item.cartUsage + 1, item.itemStock) }
                : item
            );
            sessionStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedStateI));
            return updatedStateI;

        case "Decrease":
            const updatedStateD = state.map(item => 
                item._id === action.payload && item.cartUsage > 1
                ? { ...item, cartUsage: item.cartUsage - 1 }
                : item
            );
            sessionStorage.setItem(`cart_${action.userId}`, JSON.stringify(updatedStateD));
            return updatedStateD;

        case "Init":
            return action.payload;

        case "Clear":
            sessionStorage.removeItem(`cart_${action.userId}`);
            return [];

        default:
            return state;
    }

}

export const loadCartFromSessionStorage = (userId) => {
    if (!userId) return [];
    const savedCart = JSON.parse(sessionStorage.getItem(`cart_${userId}`));
    return savedCart || [];
};

export default CartReducer;