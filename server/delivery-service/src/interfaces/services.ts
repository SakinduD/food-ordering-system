// External service interfaces
export interface ILocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IOrderResponse {
  order: {
    _id: string;
    restaurantId: string;
    orderLocation: {
      longitude: number;
      latitude: number;
    };
    orderStatus: string;
  };
}

export interface IRestaurantResponse {
  restaurant: {
    _id: string;
    location: ILocation;
  };
}

export interface IUserResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isAdmin: boolean;
    currentLocation?: ILocation;
    isAvailable?: boolean;
  };
}

export interface IAuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'restaurantOwner' | 'deliveryAgent';
  isAdmin: boolean;
}
