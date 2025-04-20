const MenuItemCustomerCard = ({ item }) => {
  return (
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

      <button
        onClick={() => addToCart(item)}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🛒 Add to Cart
      </button>
      
    </div>
  );
};

export default MenuItemCustomerCard;
