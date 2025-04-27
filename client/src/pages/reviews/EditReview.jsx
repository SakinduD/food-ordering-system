import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import { useReview } from '../../context/reviewContext';
import { useUser } from '../../context/userContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditReview = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const existingReview = location.state?.review;
  
  const [restaurantData, setRestaurantData] = useState(null);
  const [review, setReview] = useState({
    rating: existingReview?.rating || 5,
    comment: existingReview?.comment || ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  
  const { updateReview, getUserReviewForRestaurant } = useReview();
  const { isAuthenticated, token, logout } = useUser();

  // Check authentication status immediately
  useEffect(() => {
    const checkAuthentication = () => {
      const storedToken = localStorage.getItem('token');
      console.log('Auth check:', { 
        isAuthenticated, 
        hasToken: !!token,
        hasStoredToken: !!storedToken
      });
      
      if (!isAuthenticated || !storedToken) {
        console.warn('Authentication required but user is not logged in or token is missing');
        setAuthError(true);
        setLoading(false);
        return false;
      }
      return true;
    };

    if (!checkAuthentication()) {
      // Don't proceed with data fetching if authentication fails
      return;
    }

    // Continue with fetching data if authenticated
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch restaurant data with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        try {
          const resRest = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (resRest.data && (resRest.data.success || resRest.data.data)) {
            setRestaurantData(resRest.data.data || resRest.data);
          } else {
            throw new Error(resRest.data?.message || 'Failed to load restaurant details');
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw err;
        }
        
        // If no existing review from navigation state, try to fetch it
        if (!existingReview) {
          try {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
              throw new Error('Authentication token not provided');
            }
            
            console.log('Fetching existing review with token:', storedToken ? `${storedToken.substring(0, 10)}...` : 'No token');
            const reviewResult = await getUserReviewForRestaurant(restaurantId);
            
            console.log('Existing review fetch result:', reviewResult);
            
            if (reviewResult.success && reviewResult.data) {
              setReview({
                rating: reviewResult.data.rating,
                comment: reviewResult.data.comment
              });
            } else {
              // User hasn't reviewed this restaurant, redirect to create review
              toast.error("You haven't reviewed this restaurant yet");
              navigate(`/restaurant/${restaurantId}/create-review`);
              return;
            }
          } catch (reviewErr) {
            console.error("Error fetching existing review:", reviewErr);
            
            // Check if it's an auth error that requires redirect
            if (reviewErr.response?.status === 401 || 
                reviewErr.message?.includes('token') || 
                reviewErr.message?.includes('auth') || 
                reviewErr.authError) {
              console.error('Authentication error detected:', reviewErr);
              setAuthError(true);
              throw new Error('Authentication failed. Please log in again.');
            }
            throw reviewErr;
          }
        }
      } catch (err) {
        console.error('Error in data fetching:', err);
        
        // Check if it's an auth-related error
        if (err.response?.status === 401 || 
            err.message?.includes('token') || 
            err.message?.includes('auth')) {
          setAuthError(true);
        }
        
        setError(err.message || 'Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, existingReview, getUserReviewForRestaurant, navigate, token, isAuthenticated]);

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      // Clear any existing auth data
      if (typeof logout === 'function') {
        logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Show error toast
      toast.error('Authentication failed. Please log in again', { 
        id: 'auth-error', // Prevent duplicate toasts
        duration: 5000 
      });
      
      // Redirect to login
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: `/restaurant/${restaurantId}/edit-review`,
            message: 'You need to be logged in to edit reviews' 
          } 
        });
      }, 1000);
    }
  }, [authError, navigate, restaurantId, logout]);

  const handleRatingChange = (rating) => {
    setReview(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setReview(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!review.comment.trim()) {
      setError('Please add a comment to your review');
      toast.error('Please add a comment to your review');
      return;
    }
    
    if (!existingReview?._id) {
      setError('Review ID is missing. Please try again.');
      toast.error('Review ID is missing. Please try again.');
      return;
    }

    // Get current token from localStorage to ensure it's fresh
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      // If token is missing, show error and redirect to login
      setAuthError(true);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Debug logging
      console.log('About to update review with credentials:', {
        authenticated: isAuthenticated,
        hasToken: !!currentToken,
        tokenLength: currentToken ? currentToken.length : 0,
        tokenPrefix: currentToken ? currentToken.substring(0, 10) + '...' : 'none',
        reviewId: existingReview._id
      });
      
      // Important change: Use the authAxios from useUser context
      // OR update your reviewContext to use the token from localStorage
      const result = await updateReview(existingReview._id, {
        restaurantId,
        rating: review.rating,
        comment: review.comment
      });
      
      console.log('Review update result:', result);

      if (result.success) {
        toast.success('Review updated successfully!');
        navigate(`/restaurant/${restaurantId}`, { 
          state: { 
            activeTab: 'reviews',
            reviewUpdated: true 
          } 
        });
      } else if (result.status === 401 || result.error?.includes('token') || result.error?.includes('auth')) {
        // Handle authentication error specifically
        setAuthError(true);
      } else {
        throw new Error(result.error || 'Failed to update review');
      }
    } catch (err) {
      console.error('Review update error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Check for authentication errors specifically
      if (err.response?.status === 401 || 
          err.message?.includes('Authentication') ||
          err.message?.includes('token') ||
          err.message?.includes('unauthorized')) {
        setAuthError(true);
      } else {
        setError(err.message || 'Failed to update review. Please try again.');
        toast.error(err.message || 'Failed to update review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // If authentication error, show auth error UI
  if (authError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 p-8 rounded-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FaLock className="text-red-600 text-3xl" />
            </div>
          </div>
          <h3 className="text-red-800 font-medium text-xl mb-2">Authentication Required</h3>
          <p className="text-red-700 mb-6">
            Your session has expired or you need to log in to edit reviews.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/login', { 
                state: { from: `/restaurant/${restaurantId}/edit-review` } 
              })}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate(`/restaurant/${restaurantId}`)}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Return to Restaurant
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (error || !restaurantData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-red-800 font-medium text-lg flex items-center">
            <FaExclamationTriangle className="mr-2" />
            Error
          </h3>
          <p className="text-red-700 mt-2">{error || 'Could not load restaurant details'}</p>
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-orange-500 hover:text-orange-600">
          <FaArrowLeft className="mr-2" /> Back to Restaurant
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Restaurant Details Header */}
        <div className="relative h-48 overflow-hidden">
          {restaurantData.imageUrl ? (
            <img 
              src={
                restaurantData.imageUrl.startsWith('http') 
                  ? restaurantData.imageUrl 
                  : `http://localhost:5000${restaurantData.imageUrl}`
              } 
              alt={restaurantData.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/800x400?text=Restaurant+Image";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white text-5xl font-bold opacity-40">
                {restaurantData.name?.charAt(0) || 'R'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6">
              <h1 className="text-white text-3xl font-bold">{restaurantData.name}</h1>
              <p className="text-gray-200 mt-1">{restaurantData.category || 'Restaurant'}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Your Review</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-lg mb-3">Rate your experience</label>
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none transition transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <FaStar
                      className={`w-10 h-10 ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {review.rating === 1 && "Poor - Not recommended"}
                {review.rating === 2 && "Fair - Below average"}
                {review.rating === 3 && "Average - Meets expectations"}
                {review.rating === 4 && "Good - Recommended"}
                {review.rating === 5 && "Excellent - Outstanding experience!"}
              </p>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-gray-700 text-lg mb-3">
                Share your experience
              </label>
              <textarea
                id="comment"
                rows={6}
                value={review.comment}
                onChange={handleCommentChange}
                placeholder="What did you like or dislike about this restaurant? How was the food, service, and atmosphere?"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                disabled={submitting}
                required
              ></textarea>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">
                  Your review will help other customers make decisions and helps restaurants improve.
                </p>
                <span className="text-sm text-gray-500">
                  {review.comment.length}/1000
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition flex items-center ${
                  submitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Review"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/restaurant/${restaurantId}`)}
                disabled={submitting}
                className={`px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition ${
                  submitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReview;