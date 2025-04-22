// External service interfaces
export interface ILocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IOrderResponse {
  message: string;
  order: {
    _id: string;
    restaurantId: string;
    orderLocation: [number, number]; // [longitude, latitude]
    orderStatus: string;
  };
}

export interface IRestaurantResponse {
  data: {
    _id: string;
    location: ILocation;
    name: string;
    address: string;
    phone: string;
    available: boolean;
    userId: string;
  };
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  currentLocation?: ILocation;
  isAvailable?: boolean;
}

export interface IUserResponse {
  user: IUser;
}
