import { Request, Response } from 'express';
import Restaurant, { IRestaurant } from '../models/Restaurant';
import axios from 'axios';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

//Create a new restaurant
export const createRestaurant = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if user already has a restaurant
    const existing = await Restaurant.findOne({ userId });
    if (existing) {
      res.status(400).json({ message: 'Restaurant already exists for this user' });
      return;
    }

    const restaurantData: Partial<IRestaurant> = {
      name: req.body.name,
      address: req.body.address || '',
      phone: req.body.phone || '',
      category: req.body.category || '',
      available: req.body.available !== undefined ? req.body.available === 'true' || req.body.available === true : true,
      isVerified: req.body.isVerified !== undefined ? req.body.isVerified === 'true' || req.body.isVerified === true : false,
      userId: userId
    };

    if (req.file) {
      restaurantData.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (req.body.location) {
      try {
        const locationData = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
          
        if (locationData?.type && locationData?.coordinates?.length === 2) {
          restaurantData.location = {
            type: locationData.type,
            coordinates: [
              parseFloat(locationData.coordinates[0]), 
              parseFloat(locationData.coordinates[1])
            ]
          };
        }
      } catch (e) {
        console.error('Error parsing location JSON:', e);
      }
    }
       
    if (!restaurantData.location || !restaurantData.location.coordinates) {
      if (req.body['location[coordinates][]']) {
        const coords = Array.isArray(req.body['location[coordinates][]']) 
          ? req.body['location[coordinates][]'] 
          : [req.body['location[coordinates][]'], req.body['location[coordinates][]']];
          
        if (coords.length >= 2) {
          restaurantData.location = {
            type: req.body['location[type]'] || 'Point',
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])]
          };
        }
      } 
      
      else if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
        restaurantData.location = {
          type: 'Point',
          coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
        };
      }
    }

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({ 
      message: 'Restaurant created successfully!', 
      data: restaurant 
    });
  } catch (err: any) {
    console.error('Error creating restaurant:', err);
    res.status(400).json({ error: err.message });
  }
};

//Get all restaurants
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    
    if (req.query.available !== undefined) {
      filter.available = req.query.available === 'true';
    }
    
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    const restaurants = await Restaurant.find(filter);
    res.json({ 
      message: 'Restaurants fetched!', 
      count: restaurants.length,
      data: restaurants 
    });
  } catch (err: any) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: err.message });
  }
};

//Get a single restaurant by ID
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.status(200).json({ data: restaurant });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err: any) {
    console.error('Error fetching restaurant by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

//Get a restaurant by user ID
export const getRestaurantByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ userId: req.params.userId });
    if (restaurant) {
      res.status(200).json({ data: restaurant });
    } else {
      res.status(404).json({ message: 'Restaurant not found for this user' });
    }
  } catch (err: any) {
    console.error('Error fetching restaurant by user ID:', err);
    res.status(500).json({ error: err.message });
  }
};

//Update a restaurant by ID
export const updateRestaurant = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const updateData: Partial<IRestaurant> = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.address !== undefined) updateData.address = req.body.address;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.available !== undefined) {
      updateData.available = req.body.available === 'true' || req.body.available === true;
    }
    if (req.body.isVerified !== undefined) {
      updateData.isVerified = req.body.isVerified === 'true' || req.body.isVerified === true;
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (req.body.location) {
      try {      
        const locationData = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
          
        if (locationData?.type && locationData?.coordinates?.length === 2) {
          updateData.location = {
            type: locationData.type,
            coordinates: [
              parseFloat(locationData.coordinates[0]), 
              parseFloat(locationData.coordinates[1])
            ]
          };
        }
      } catch (e) {
        console.error('Error parsing location JSON:', e);
      }
    }
       
    if (!updateData.location) {
      
      if (req.body['location[coordinates][]']) {
        const coords = Array.isArray(req.body['location[coordinates][]']) 
          ? req.body['location[coordinates][]'] 
          : [req.body['location[coordinates][]'], req.body['location[coordinates][]']];
          
        if (coords.length >= 2) {
          updateData.location = {
            type: req.body['location[type]'] || 'Point',
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])]
          };
        }
      }
      
      else if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
        updateData.location = {
          type: 'Point',
          coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
        };
      }
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    res.status(200).json({ 
      message: 'Restaurant updated successfully!', 
      data: updated 
    });
  } catch (err: any) {
    console.error('Error updating restaurant:', err);
    res.status(400).json({ error: err.message });
  }
};

//Delete a restaurant
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: 'Restaurant deleted successfully!' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err: any) {
    console.error('Error deleting restaurant:', err);
    res.status(500).json({ error: err.message });
  }
};

//Set restaurant availability
export const setAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.available === undefined) {
      res.status(400).json({ message: 'Available status is required' });
      return;
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true }
    );

    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found!' });
      return;
    }

    res.json({ 
      message: `Restaurant is now ${req.body.available ? 'available' : 'unavailable'}`, 
      data: restaurant 
    });
  } catch (err: any) {
    console.error('Error updating availability:', err);
    res.status(400).json({ error: err.message });
  }
};

//Set restaurant verification status
export const setVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.isVerified === undefined) {
      res.status(400).json({ message: 'Verification status is required' });
      return;
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );

    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found!' });
      return;
    }

    res.json({ 
      message: `Restaurant is now ${req.body.isVerified ? 'verified' : 'unverified'}`, 
      data: restaurant 
    });
  } catch (err: any) {
    console.error('Error updating verification status:', err);
    res.status(400).json({ error: err.message });
  }
};

//Find nearby restaurants based on coordinates
export const findNearbyRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { longitude, latitude, distance = 5000 } = req.query; 
    
    if (!longitude || !latitude) {
      res.status(400).json({ message: 'Longitude and latitude are required' });
      return;
    }

    const lng = parseFloat(longitude as string);
    const lat = parseFloat(latitude as string);
    
    if (isNaN(lng) || isNaN(lat)) {
      res.status(400).json({ message: 'Invalid coordinates format' });
      return;
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(distance as string) || 5000
        }
      },
      available: true 
    });

    res.json({
      message: 'Nearby restaurants fetched successfully',
      count: restaurants.length,
      data: restaurants
    });
  } catch (err: any) {
    console.error('Error finding nearby restaurants:', err);
    res.status(500).json({ error: err.message });
  }
};

//Update rating controller to handle add, update, delete operations
export const updateRatingController = async (req: Request, res: Response): Promise<void> => {
  const { restaurantId, reviewId, rating, oldRating, operation } = req.body;

  try {
    if (!restaurantId || !operation) {
      res.status(400).json({
        success: false,
        message: 'Restaurant ID and operation are required'
      });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
      return;
    }

    let updatedRating = restaurant.rating || 0;
    let reviewCount = restaurant.reviewCount || 0;
    
    if (operation === 'add') {
      const newTotal = (updatedRating * reviewCount) + Number(rating);
      reviewCount++;
      updatedRating = parseFloat((newTotal / reviewCount).toFixed(1));
    } else if (operation === 'update' && oldRating) {
      const newTotal = (updatedRating * reviewCount) - Number(oldRating) + Number(rating);
      updatedRating = parseFloat((newTotal / reviewCount).toFixed(1));
    } else if (operation === 'delete') {
      if (reviewCount <= 1) {
        updatedRating = 0;
        reviewCount = 0;
      } else {
        const newTotal = (updatedRating * reviewCount) - Number(rating);
        reviewCount--;
        updatedRating = parseFloat((newTotal / reviewCount).toFixed(1));
      }
    }

    restaurant.rating = updatedRating;
    restaurant.reviewCount = reviewCount;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Restaurant rating updated successfully',
      data: {
        rating: updatedRating,
        reviewCount
      }
    });
  } catch (error: any) {
    console.error('Error updating restaurant rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update restaurant rating',
      error: error.message
    });
  }
};
