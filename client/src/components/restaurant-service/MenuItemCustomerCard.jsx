import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import toast, { Toaster } from "react-hot-toast";

const MenuItemCustomerCard = ({ item }) => {
  const { dispatch } = useContext(UserContext);
  const { user } = useContext(UserContext);


  return (
    <div>
    <Toaster/>
    <div className="bg-white p-4 rounded shadow mb-4">
      {/* ✅ Show image if available */}
      {item.imageUrl && (
        <img
          src={`http://localhost:5000${item.imageUrl}`}
          alt={item.name}
          className="w-full h-40 object-cover rounded mb-4"
        />
      )}

      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p>{item.description}</p>
      <p className="text-green-600 font-medium">Rs. {item.price}</p>
      <p className="text-sm text-gray-500">
        {item.available ? 'Available' : 'Not Available'}
      </p>

      <button className={`mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
        ${item.available ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        onClick={() => {
            if(user === null) {
                toast.error('Please login to add items to cart');
                return;
            }
            console.log("User ID:", user?.userId);

            dispatch({
                type: 'Add',
                item: { ...item, cartUsage: 1 },
                userId: user?.userId,
            });
            toast.success('Item added to cart!');
            console.log("Item added to cart:", item);

        }}
        disabled={!item.available}
    >
        🛒 Add to Cart
    </button>
      
    </div>
    </div>
  );
};

export default MenuItemCustomerCard;
