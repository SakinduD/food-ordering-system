import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './userContext';
import toast from 'react-hot-toast';

const ReviewContext = createContext();

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalReviews: 0
  });

  const { token, isAuthenticated } = useUser();

  // Get token directly from localStorage to ensure it's the most current
  const getAuthToken = () => {
    const storedToken = localStorage.getItem('token');
    return storedToken || token;
  };

  // Add this axios instance with interceptor
  const reviewApi = axios.create({
    baseURL: 'http://localhost:5010/api/reviews'
  });

  // Setup axios interceptors to attach token to all requests
  useEffect(() => {
    const requestInterceptor = reviewApi.interceptors.request.use(
      (config) => {
        // Get the most current token from localStorage
        const currentToken = getAuthToken();
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        } else {
          console.warn('No auth token available for request:', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = reviewApi.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('Auth token expired or invalid');
          toast.error('Your session has expired. Please log in again.');
          // Redirect to login if needed
        }
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      reviewApi.interceptors.request.eject(requestInterceptor);
      reviewApi.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Helper for safe loading state management
  const safelySetLoading = (state) => {
    // Only set loading true if it's not already true
    if (state === true && loading === true) return;
    setLoading(state);
  };

  // Fetch reviews for a restaurant
  const getRestaurantReviews = useCallback(async (restaurantId, page = 1, limit = 5) => {
    if (!restaurantId) {
      setError('Restaurant ID is required');
      return { success: false, error: 'Restaurant ID is required' };
    }

    safelySetLoading(true);
    setError(null);
    
    try {
      console.log('Fetching reviews for restaurant:', restaurantId);
      const response = await reviewApi.get(`/restaurant/${restaurantId}`, {
        params: { page, limit }
      });
      
      // Updated to handle both response formats - with or without success property
      if (response.data) {
        // If the data directly contains the reviews
        if (Array.isArray(response.data)) {
          setReviews(response.data);
          setPagination({
            page: page,
            totalPages: 1,
            totalReviews: response.data.length
          });
          console.log('Reviews loaded successfully:', response.data.length);
          safelySetLoading(false);
          return { success: true, data: response.data };
        } 
        // If the data has a success property
        else if (response.data.success) {
          setReviews(response.data.data || []);
          setPagination({
            page: response.data.currentPage || page,
            totalPages: response.data.totalPages || 1,
            totalReviews: response.data.totalReviews || 0
          });
          console.log('Reviews loaded successfully:', response.data.data?.length || 0);
          safelySetLoading(false);
          return response.data;
        } 
        // If data exists but doesn't fit either pattern
        else if (response.data.data) {
          setReviews(response.data.data || []);
          setPagination({
            page: response.data.currentPage || page,
            totalPages: response.data.totalPages || 1,
            totalReviews: response.data.totalReviews || 0
          });
          console.log('Reviews loaded with alternative format:', response.data.data?.length || 0);
          safelySetLoading(false);
          return { success: true, ...response.data };
        } 
        else {
          throw new Error(response.data?.message || 'Failed to fetch reviews');
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching restaurant reviews:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load reviews');
      safelySetLoading(false);
      return { success: false, error: err.message, data: [] };
    }
  }, []);

  // Fetch user's reviews
  const getUserReviews = useCallback(async (page = 1, limit = 10) => {
    // Always check for fresh token
    const currentToken = getAuthToken();
    if (!currentToken) {
      console.warn('No authentication token for getUserReviews');
      return { success: false, error: 'Not authenticated', data: [] };
    }
    
    safelySetLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user reviews with token:', currentToken ? `${currentToken.substring(0, 10)}...` : 'No token');
      const response = await axios.get('http://localhost:5010/api/reviews/user', {
        headers: {
          Authorization: `Bearer ${currentToken}`
        },
        params: { page, limit }
      });
      
      // Updated to handle both response formats
      if (response.data) {
        if (response.data.success) {
          setUserReviews(response.data.data || []);
          console.log('User reviews loaded:', response.data.data?.length || 0);
          safelySetLoading(false);
          return response.data;
        } else if (response.data.data) {
          setUserReviews(response.data.data || []);
          console.log('User reviews loaded with alternative format:', response.data.data?.length || 0);
          safelySetLoading(false);
          return { success: true, ...response.data };
        } else if (Array.isArray(response.data)) {
          setUserReviews(response.data);
          console.log('User reviews loaded as array:', response.data.length);
          safelySetLoading(false);
          return { success: true, data: response.data };
        } else {
          throw new Error(response.data?.message || 'Failed to fetch user reviews');
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      
      // Special handling for auth errors
      if (err.response?.status === 401) {
        console.error('Authentication failed when fetching user reviews');
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load your reviews');
      }
      
      safelySetLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message, 
        data: [],
        authError: err.response?.status === 401
      };
    }
  }, []);

  // Get user's review for a specific restaurant
  const getUserReviewForRestaurant = useCallback(async (restaurantId) => {
    if (!restaurantId) {
      return { success: false, error: 'Missing restaurant ID', data: null };
    }
    
    // ALWAYS get a fresh token from localStorage
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.warn('No authentication token for getUserReviewForRestaurant');
      return { success: false, error: 'Not authenticated', data: null };
    }
    
    safelySetLoading(true);
    
    try {
      console.log('Fetching user review for restaurant:', restaurantId);
      console.log('Using fresh token (prefix):', currentToken ? `${currentToken.substring(0, 10)}...` : 'No token');
      
      // Use direct axios call with explicit token
      const response = await axios.get(`http://localhost:5010/api/reviews/user/restaurant/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      
      safelySetLoading(false);
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success) {
          return response.data;
        } else if (response.data.data) {
          return { success: true, ...response.data };
        } else {
          // Direct data might be the review itself
          return { success: true, data: response.data };
        }
      } else {
        return { success: false, error: 'No data received', data: null };
      }
    } catch (err) {
      safelySetLoading(false);
      // If 404, it means user hasn't reviewed this restaurant yet
      if (err.response && err.response.status === 404) {
        return { success: true, data: null, message: 'No review found' };
      }
      // If 401, authentication failed
      if (err.response && err.response.status === 401) {
        console.error('Authentication failed when fetching user review:', err.response.data);
        return { 
          success: false, 
          error: 'Authentication failed. Please log in again.', 
          data: null,
          authError: true // Special flag to indicate auth error
        };
      }
      console.error('Error fetching user review for restaurant:', err);
      return { success: false, error: err.response?.data?.message || err.message, data: null };
    }
  }, []);

  // Create a new review - UPDATED VERSION
  const createReview = useCallback(async (reviewData) => {
    // ALWAYS get a fresh token from localStorage
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      toast.error('Authentication required to submit review');
      return { success: false, error: 'Authentication required', status: 401 };
    }
    
    try {
      console.log('Creating review with fresh auth token:', currentToken ? `${currentToken.substring(0, 10)}...` : 'No token');
      
      // Use direct axios call with explicit fresh token
      const response = await axios.post('http://localhost:5010/api/reviews', reviewData, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Review creation response:', response.data);
      
      if (response.data && (response.data.success || response.data.data)) {
        return response.data.success ? response.data : { success: true, ...response.data };
      } else {
        throw new Error(response.data?.message || 'Failed to create review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Enhanced error logging
      console.error('Review creation error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Provide a more descriptive error based on the response
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
        return { 
          success: false, 
          error: 'Authentication failed. Please log in again.',
          status: 401 
        };
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('already reviewed')) {
        toast.error(error.response.data.message || 'You have already reviewed this restaurant');
        return {
          success: false,
          error: error.response.data.message || 'You have already reviewed this restaurant',
          status: 400,
          alreadyReviewed: true
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        status: error.response?.status 
      };
    }
  }, []);

  // Update an existing review
  const updateReview = useCallback(async (reviewId, reviewData) => {
    // ALWAYS get a fresh token from localStorage
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      toast.error('Please login to update a review');
      return { success: false, error: 'Not authenticated', status: 401 };
    }
    
    if (!reviewId) {
      toast.error('Review ID is required');
      return { success: false, error: 'Missing review ID' };
    }
    
    safelySetLoading(true);
    
    try {
      console.log('Updating review:', reviewId);
      console.log('Using fresh token (prefix):', currentToken ? `${currentToken.substring(0, 10)}...` : 'No token');
      
      // Use direct axios call with explicit fresh token
      const response = await axios.patch(`http://localhost:5010/api/reviews/${reviewId}`, reviewData, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update response:', response.data);
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success) {
          toast.success('Review updated successfully!');
          safelySetLoading(false);
          return response.data;
        } else if (response.data.data) {
          toast.success('Review updated successfully!');
          safelySetLoading(false);
          return { success: true, ...response.data };
        } else {
          throw new Error(response.data?.message || 'Failed to update review');
        }
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error updating review:', err);
      let errorMessage = 'Failed to update review';
      
      // Enhanced error handling
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Review not found';
        } else if (err.response.status === 403) {
          errorMessage = 'You are not authorized to update this review';
        } else if (err.response.status === 401) {
          errorMessage = 'Please login to update a review';
        }
        
        console.error('Update error details:', {
          status: err.response.status,
          data: err.response.data,
          url: err.config?.url
        });
      }
      
      toast.error(err.response?.data?.message || errorMessage);
      safelySetLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message,
        status: err.response?.status
      };
    }
  }, []);

  // Delete a review
  const deleteReview = useCallback(async (reviewId) => {
    // ALWAYS get a fresh token from localStorage
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      toast.error('Please login to delete a review');
      return { success: false, error: 'Not authenticated', status: 401 };
    }
    
    if (!reviewId) {
      toast.error('Review ID is required');
      return { success: false, error: 'Missing review ID' };
    }
    
    safelySetLoading(true);
    
    try {
      console.log('Deleting review:', reviewId);
      console.log('Using fresh token (prefix):', currentToken ? `${currentToken.substring(0, 10)}...` : 'No token');
      
      // Use direct axios call with explicit fresh token
      const response = await axios.delete(`http://localhost:5010/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success) {
          toast.success('Review deleted successfully!');
          
          // Update user reviews list if we have it loaded
          if (userReviews.length > 0) {
            setUserReviews(prev => prev.filter(review => review._id !== reviewId));
          }
          
          // Also update restaurant reviews if we have them loaded
          if (reviews.length > 0) {
            setReviews(prev => prev.filter(review => review._id !== reviewId));
          }
          
          safelySetLoading(false);
          return response.data;
        } else {
          throw new Error(response.data?.message || 'Failed to delete review');
        }
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      let errorMessage = 'Failed to delete review';
      
      // Enhanced error handling
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Review not found';
        } else if (err.response.status === 403) {
          errorMessage = 'You are not authorized to delete this review';
        } else if (err.response.status === 401) {
          errorMessage = 'Please login to delete a review';
        }
      }
      
      toast.error(err.response?.data?.message || errorMessage);
      safelySetLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message,
        status: err.response?.status
      };
    }
  }, [userReviews, reviews]);

  // Get a specific review by ID
  const getReviewById = useCallback(async (reviewId) => {
    if (!reviewId) {
      return { success: false, error: 'Review ID is required', data: null };
    }
    
    safelySetLoading(true);
    
    try {
      console.log('Fetching review by ID:', reviewId);
      const response = await reviewApi.get(`/${reviewId}`);
      safelySetLoading(false);
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success) {
          return response.data;
        } else if (response.data.data) {
          return { success: true, ...response.data };
        } else {
          // The response might be the review object directly
          return { success: true, data: response.data };
        }
      } else {
        return { success: false, error: 'No data received', data: null };
      }
    } catch (err) {
      console.error('Error fetching review by ID:', err);
      safelySetLoading(false);
      return { success: false, error: err.response?.data?.message || err.message, data: null };
    }
  }, []);

  // Clear any stored review data
  const clearReviewData = useCallback(() => {
    setReviews([]);
    setUserReviews([]);
    setPagination({
      page: 1,
      totalPages: 1,
      totalReviews: 0
    });
    setError(null);
  }, []);

  // Get reviews directly without auth context
  const getReviewsDirectly = useCallback(async (restaurantId, page = 1, limit = 5) => {
    if (!restaurantId) {
      return { success: false, error: 'Restaurant ID is required', data: [] };
    }
    
    try {
      console.log('Fetching reviews directly for restaurant:', restaurantId);
      // Use direct axios call instead of the instance to avoid interceptors
      const response = await axios.get(`http://localhost:5010/api/reviews/restaurant/${restaurantId}`, {
        params: { page, limit }
      });
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success) {
          return response.data;
        } else if (response.data.data) {
          return { success: true, ...response.data };
        } else if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        } else {
          throw new Error(response.data?.message || 'Failed to fetch reviews');
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching reviews directly:', err);
      return { success: false, error: err.response?.data?.message || err.message, data: [] };
    }
  }, []);

  return (
    <ReviewContext.Provider value={{
      reviews,
      userReviews,
      loading,
      error,
      pagination,
      getRestaurantReviews,
      getUserReviews,
      getUserReviewForRestaurant,
      createReview,
      updateReview,
      deleteReview,
      getReviewById,
      clearReviewData,
      getReviewsDirectly
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export default ReviewContext;