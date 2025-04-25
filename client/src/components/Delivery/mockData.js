// Mock data for delivery testing

export const mockAvailableDrivers = [
  {
    driverId: "driver-001",
    name: "John Smith",
    phone: "+94771234567",
    profileImage: null,
    distance: 1.2,
    rating: 4.8,
    totalDeliveries: 128,
    location: {
      latitude: 6.9273,
      longitude: 79.8590
    }
  },
  {
    driverId: "driver-002",
    name: "Sarah Williams",
    phone: "+94772345678",
    profileImage: null,
    distance: 2.5,
    rating: 4.9,
    totalDeliveries: 256,
    location: {
      latitude: 6.9290,
      longitude: 79.8650
    }
  },
  {
    driverId: "driver-003",
    name: "Michael Johnson",
    phone: "+94773456789",
    profileImage: null,
    distance: 3.7,
    rating: 4.6,
    totalDeliveries: 84,
    location: {
      latitude: 6.9240,
      longitude: 79.8580
    }
  }
];

export const mockDelivery = {
  _id: "delivery-001",
  orderId: "order-12345",
  restaurantId: "restaurant-789",
  userId: "user-456",
  driverId: null,
  status: "Pending",
  restaurantLocation: {
    type: "Point",
    coordinates: [79.8612, 6.9271]  // [longitude, latitude]
  },
  customerLocation: {
    type: "Point",
    coordinates: [79.8700, 6.9320]  // [longitude, latitude]
  },
  currentLocation: null,
  createdAt: "2025-04-24T08:30:00.000Z",
  updatedAt: "2025-04-24T08:30:00.000Z"
};

export const mockAssignedDelivery = {
  ...mockDelivery,
  driverId: "driver-001",
  status: "Driver_Assigned",
  currentLocation: {
    type: "Point",
    coordinates: [79.8590, 6.9273]  // [longitude, latitude]
  }
};

export const mockOrder = {
  _id: "order-12345",
  invoiceId: "INV-1234567",
  userId: "user-456",
  userName: "Alex Brown",
  userPhone: "+94777890123",
  restaurantId: "restaurant-789",
  restaurantName: "Tasty Bites",
  orderStatus: "accepted",
  paymentStatus: "paid",
  paymentMethod: "card",
  address: "42 Park Avenue, Colombo 05",
  totalAmount: 1850.00,
  deliveryFee: 250.00,
  roadDistance: 4.2,
  orderItems: [
    {
      itemId: "item-111",
      itemName: "Chicken Fried Rice",
      itemPrice: 800.00,
      itemQuantity: 2
    },
    {
      itemId: "item-222",
      itemName: "Vegetable Spring Rolls",
      itemPrice: 250.00,
      itemQuantity: 1
    }
  ],
  orderLocation: [79.8700, 6.9320],  // [longitude, latitude]
  createdAt: "2025-04-24T08:15:00.000Z",
  updatedAt: "2025-04-24T08:15:00.000Z"
};

export const mockRestaurant = {
  _id: "restaurant-789",
  name: "Tasty Bites",
  userId: "owner-123",
  description: "Authentic Asian cuisine with a modern twist",
  address: "123 Galle Road, Colombo 04",
  phone: "+94112345678",
  email: "info@tastybites.lk",
  openTime: "09:00",
  closeTime: "22:00",
  available: true,
  imageUrl: "/uploads/restaurant-image.jpg",
  location: {
    type: "Point",
    coordinates: [79.8612, 6.9271]  // [longitude, latitude]
  },
  rating: 4.7,
  createdAt: "2024-10-15T00:00:00.000Z",
  updatedAt: "2025-04-01T00:00:00.000Z"
};