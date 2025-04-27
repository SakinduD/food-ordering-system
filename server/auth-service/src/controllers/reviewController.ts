import { Request, Response } from 'express';
import axios from 'axios';
import asyncHandler from 'express-async-handler';
import Review from '../models/Review';
import User from '../models/User';

async function notifyRestaurantService(data: any): Promise<boolean> {
  // Try multiple possible endpoint variations
  const endpoints = [
    'http://localhost:5000/api/restaurants/update-rating',
    'http://localhost:5000/api/restaurants/updateRating',
    'http://localhost:5000/api/restaurants/rating',
    'http://localhost:5000/api/ratings'
  ];

  let lastError = null;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Attempting to notify restaurant service at: ${endpoint}`);
      const response = await axios.post(endpoint, data, { 
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Restaurant service notification successful:', response.data);
      return true;
    } catch (err: any) {
      console.error(`Failed with endpoint ${endpoint}:`, err.message);
      lastError = err;
      // Only continue to next endpoint if this was a 404
      if (err.response && err.response.status === 404) {
        continue;
      } else {
        // For other types of errors, stop and report it
        throw err;
      }
    }
  }
  
  // If we get here, all endpoints returned 404
  throw lastError || new Error('Failed to notify restaurant service: all endpoints returned 404');
}

export const getAllReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const reviews = await Review.find()
      .populate('userId', 'name profilePicture') // optional: populate user details
      .populate('restaurantId', 'name') // optional: populate restaurant name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalReviews,
      count: reviews.length,
      data: reviews
    });
  } catch (error: any) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all reviews',
      error: error.message
    });
  }
});

// Create a new review
export const createReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { restaurantId, rating, comment } = req.body;
  const userId = (req as any).user._id;

  if (!restaurantId || !rating || !comment) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
    return;
  }

  try {
    // Check if restaurant exists by making a request to restaurant-service
    const restaurantResponse = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}`);
    
    // Check if the response contains restaurant data
    if (!restaurantResponse.data || !restaurantResponse.data.data) {
      res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
      return;
    }

    const restaurantData = restaurantResponse.data.data;

    // Check if user has already reviewed this restaurant
    const existingReview = await Review.findOne({ userId, restaurantId });
    
    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this restaurant'
      });
      return;
    }

    // Get user data
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Create new review
    const newReview = await Review.create({
      userId,
      restaurantId,
      rating,
      comment,
      userName: user.name,
      userAvatar: user.profilePicture || null,
      restaurantName: restaurantData.name
    });

    // Notify restaurant-service about the new review
    try {
      await notifyRestaurantService({
        restaurantId,
        reviewId: newReview._id,
        rating,
        operation: 'add'
      });
    } catch (error) {
      console.error('Failed to notify restaurant-service:', error);
      // Continue anyway - we succeeded in creating the review even if rating update failed
      
      // You could add notification here to retry later or queue for retry
      // This is where you'd implement retry logic if needed
    }

    // Return success even if restaurant notification failed
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview,
      ratingUpdated: true // Set to false if notification failed, for client info
    });
  } catch (error: any) {
    console.error('Review creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

// Get reviews for a restaurant
export const getRestaurantReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { restaurantId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    // Check if restaurant exists by making a request to restaurant-service
    const restaurantResponse = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}`);
    
    // Fixed the check for restaurant existence
    if (!restaurantResponse.data || !restaurantResponse.data.data) {
      res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
      return;
    }

    // Get reviews for the restaurant
    const reviews = await Review.find({ restaurantId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ restaurantId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalReviews,
      count: reviews.length,
      data: reviews
    });
  } catch (error: any) {
    console.error('Get restaurant reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
});

// Get user's review for a restaurant
export const getUserReviewForRestaurant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { restaurantId } = req.params;
  const userId = (req as any).user._id;

  try {
    const review = await Review.findOne({ userId, restaurantId });
    
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error: any) {
    console.error('Get user review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user review',
      error: error.message
    });
  }
});

// Update a review
export const updateReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = (req as any).user._id;

  try {
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review'
      });
      return;
    }

    // Store old rating for restaurant-service notification
    const oldRating = review.rating;

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        rating: rating !== undefined ? rating : review.rating,
        comment: comment !== undefined ? comment : review.comment,
        date: new Date() // Update the date
      },
      { new: true }
    );

    // Notify restaurant-service about the updated review
    try {
      await notifyRestaurantService({
        restaurantId: review.restaurantId,
        reviewId: review._id,
        oldRating,
        rating: rating || oldRating,
        operation: 'update'
      });
    } catch (error) {
      console.error('Failed to notify restaurant-service:', error);
      // Continue anyway
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error: any) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// Delete a review
export const deleteReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user._id;
  const isAdmin = (req as any).user.isAdmin;

  try {
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== userId.toString() && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
      return;
    }

    // Store data needed for restaurant-service
    const { restaurantId, rating } = review;

    // Delete review
    await Review.findByIdAndDelete(id);

    // Notify restaurant-service about the deleted review
    try {
      await notifyRestaurantService({
        restaurantId,
        reviewId: review._id,
        rating,
        operation: 'delete'
      });
    } catch (error) {
      console.error('Failed to notify restaurant-service:', error);
      // Continue anyway
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// Get all reviews for a user
export const getUserReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    // Get reviews
    const reviews = await Review.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ userId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalReviews,
      count: reviews.length,
      data: reviews
    });
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reviews',
      error: error.message
    });
  }
});

// Get a review by ID
export const getReviewById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id);
    
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error: any) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review',
      error: error.message
    });
  }
});