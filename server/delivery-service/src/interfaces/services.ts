// External service interfaces
export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IOrderResponse {
  order: {
    _id: string;
    restaurantId: string;
    orderLocation: ILocation;
    orderStatus: string;
  };
}

export interface IRestaurantResponse {
  restaurant: {
    _id: string;
    location: ILocation;
  };
}

export interface IAuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'restaurantOwner' | 'deliveryAgent';
  isAdmin: boolean;
}
