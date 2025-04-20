const MenuItemCard = ({ item, onEdit, onDelete }) => {
    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        {/* ✅ Image preview */}
        {item.imageUrl && (
          <img
            src={`http://localhost:5000${item.imageUrl}`}
            alt={item.name}
            className="w-full h-40 object-cover rounded mb-4"
          />
        )}
  
        <h3 className="text-lg font-bold">{item.name}</h3>
        <p>{item.description}</p>
        <p className="text-green-600 font-semibold">Rs. {item.price}</p>
        <p className="text-sm text-gray-500">{item.available ? 'Available' : 'Not Available'}</p>
  
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };
  
  export default MenuItemCard;
  