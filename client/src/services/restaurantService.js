import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/menu';

// ✅ Fetch all menu items
export const fetchMenuItems = async () => {
  const res = await axios.get(API_BASE);
  return res.data.data;
};

// ✅ Create a new menu item with image
export const createMenuItem = async (data, token) => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price);
  formData.append('available', data.available);
  formData.append('restaurantId', data.restaurantId);

  if (data.image) {
    formData.append('image', data.image);
  }

  const res = await axios.post(API_BASE, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

// ✅ Update an existing menu item with optional new image
export const updateMenuItem = async (id, data, token) => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price);
  formData.append('category', data.category); 
  formData.append('available', data.available);
  formData.append('restaurantId', data.restaurantId);

  if (data.image) {
    formData.append('image', data.image); // ✅ Send image if selected
  }

  const res = await axios.put(`${API_BASE}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};
// ✅ Delete a menu item
export const deleteMenuItem = async (id, token) => {
  const res = await axios.delete(`${API_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// (Optional) Get a single menu item by ID (not used here but can be useful)
export const getMenuItemById = async (id) => {
  const res = await axios.get(`${API_BASE}?id=${id}`);
  return res.data;
};
