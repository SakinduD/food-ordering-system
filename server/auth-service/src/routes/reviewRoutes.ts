import express from 'express';
import { protect, isAdmin } from '../middlewares/authMiddleware';
import {
  createReview,
  getRestaurantReviews,
  getUserReviewForRestaurant,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewById,
  getAllReviews
} from '../controllers/reviewController';

const router = express.Router();

// Create a new review
router.post('/', protect, createReview);

// Get reviews for a specific restaurant
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Get user's review for a specific restaurant
router.get('/user/restaurant/:restaurantId', protect, getUserReviewForRestaurant);

// Get all reviews by current user
router.get('/user', protect, getUserReviews);

// Update a review
router.patch('/:id', protect, updateReview);

// Delete a review
router.delete('/:id', protect, deleteReview);

// Get a single review by ID
router.get('/:id', getReviewById);

// Get all reviews
router.get('/', getAllReviews);

export default router;