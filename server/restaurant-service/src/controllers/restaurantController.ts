import { Request, Response } from 'express';
import Restaurant, { IRestaurant } from '../models/Restaurant';


interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Create a new restaurant for the logged-in user
 * Ensures all model fields are properly handled
 */
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

    // Prepare restaurant data with all possible fields from the model
    const restaurantData: Partial<IRestaurant> = {
      name: req.body.name,
      address: req.body.address || '',
      phone: req.body.phone || '',
      category: req.body.category || '',
      available: req.body.available !== undefined ? req.body.available === 'true' || req.body.available === true : true,
      isVerified: req.body.isVerified !== undefined ? req.body.isVerified === 'true' || req.body.isVerified === true : false,
      userId: userId
    };

    // Handle image if uploaded
    if (req.file) {
      restaurantData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Handle location data
    if (req.body.location) {
      try {
        // Try parsing location as JSON first (from direct JSON inputs)
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
    
    // If location wasn't set from the location object, try individual coordinates
    if (!restaurantData.location || !restaurantData.location.coordinates) {
      // Check for coordinates in form data format (from FormData submissions)
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
      // Also check for separate latitude/longitude fields
      else if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
        restaurantData.location = {
          type: 'Point',
          coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
        };
      }
    }

    // Create restaurant with properly structured data
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

/**
 * Get all restaurants
 * Can filter by availability and verification status
 */
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    
    // Add filters if provided as query params
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

/**
 * Get a single restaurant by ID
 */
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

/**
 * Get a restaurant by user ID
 */
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

/**
 * Update a restaurant by ID
 * Properly handles all model fields
 */
export const updateRestaurant = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const updateData: Partial<IRestaurant> = {};

    // Only update fields that are provided
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

    // Handle image upload if provided
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Handle location data - try different ways the client might send coordinates
    if (req.body.location) {
      try {
        // Try parsing location as JSON first
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
    
    // If location wasn't set from the location object, try individual coordinates
    if (!updateData.location) {
      // Check for coordinates in form data format
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
      // Also check for separate latitude/longitude fields
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

/**
 * Delete a restaurant
 */
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

/**
 * Set restaurant availability
 */
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

/**
 * Set restaurant verification status
 */
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

/**
 * Find nearby restaurants based on coordinates
 */
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
