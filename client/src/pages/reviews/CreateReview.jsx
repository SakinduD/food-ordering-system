import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useReview } from '../../context/reviewContext';
import { useUser } from '../../context/userContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateReview = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  
  const [restaurantData, setRestaurantData] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  
  const { createReview, getUserReviewForRestaurant } = useReview();
  const { isAuthenticated, token } = useUser();

  // Check for existing review and fetch restaurant details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user already reviewed this restaurant
        if (isAuthenticated) {
          try {
            console.log('Checking for existing review with token:', token ? `${token.substring(0, 10)}...` : 'No token');
            const reviewResult = await getUserReviewForRestaurant(restaurantId);
            
            console.log('Existing review check result:', reviewResult);
            
            if (reviewResult.success && reviewResult.data) {
              setExistingReview(reviewResult.data);
              toast.error("You've already reviewed this restaurant");
              // Wait a moment before redirecting to allow toast to be seen
              setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`, { state: { activeTab: 'reviews' } });
              }, 2000);
              return;
            }
          } catch (reviewErr) {
            console.error("Error checking for existing review:", reviewErr);
            
            // Check if it's an auth error that requires redirect
            if (reviewErr.authError) {
              toast.error('Authentication failed. Please log in again.');
              navigate('/login', { 
                state: { 
                  from: `/restaurant/${restaurantId}/create-review`,
                  message: 'Please log in to continue' 
                } 
              });
              return;
            }
            // Continue with restaurant fetch even if this fails
          }
        }
        
        // Fetch restaurant details with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        try {
          const res = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (res.data && (res.data.success || res.data.data)) {
            setRestaurantData(res.data.data || res.data);
          } else {
            throw new Error(res.data?.message || 'Failed to load restaurant details');
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw err;
        }
      } catch (err) {
        console.error('Error in data fetching:', err);
        setError(err.message || 'Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, isAuthenticated, token, getUserReviewForRestaurant, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please log in to write a review');
      navigate('/login', { 
        state: { 
          from: `/restaurant/${restaurantId}/create-review`,
          message: 'You need to be logged in to write a review' 
        } 
      });
    }
  }, [isAuthenticated, loading, navigate, restaurantId]);

  // Add this effect to check token status when component mounts
  useEffect(() => {
    // Debug log to check auth status
    console.log('Auth check on CreateReview mount:', { 
      isAuthenticated, 
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenFromStorage: !!localStorage.getItem('token'),
      tokenPrefix: token ? token.substring(0, 10) : 'none'
    });
    
    // Verify token is valid
    const checkToken = async () => {
      try {
        if (!token) {
          console.warn('No authentication token found');
          return;
        }
        
        // Optional: make a lightweight request to verify token is valid
        const response = await axios.get('http://localhost:5010/api/auth/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Token verification successful:', response.data);
      } catch (err) {
        console.error('Token verification failed:', err);
        if (err.response?.status === 401) {
          toast.error('Your session has expired');
          // Clear invalid token
          localStorage.removeItem('token');
          navigate('/login', { 
            state: { 
              from: `/restaurant/${restaurantId}/create-review`,
              message: 'Please log in to continue' 
            } 
          });
        }
      }
    };
    
    if (isAuthenticated) {
      checkToken();
    }
  }, [isAuthenticated, token, restaurantId, navigate]);

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

    // Get current token from localStorage to ensure it's fresh
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      // If token is missing, show error and redirect to login
      toast.error('Authentication failed. Please log in again');
      navigate('/login', { 
        state: { 
          from: `/restaurant/${restaurantId}/create-review`,
          message: 'Session expired. Please log in again.' 
        } 
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Debug logging
      console.log('About to submit review with credentials:', {
        authenticated: isAuthenticated,
        hasToken: !!currentToken,
        tokenLength: currentToken ? currentToken.length : 0,
        tokenPrefix: currentToken ? currentToken.substring(0, 10) + '...' : 'none'
      });
      
      const result = await createReview({
        restaurantId,
        rating: review.rating,
        comment: review.comment
      });
      
      console.log('Review submission result:', result);

      if (result.success) {
        toast.success('Review submitted successfully!');
        navigate(`/restaurant/${restaurantId}`, { 
          state: { 
            activeTab: 'reviews',
            reviewAdded: true 
          } 
        });
      } else if (result.status === 401) {
        // Handle authentication error specifically
        toast.error('Your session has expired. Please log in again.');
        navigate('/login', { 
          state: { 
            from: `/restaurant/${restaurantId}/create-review`,
            message: 'Session expired. Please log in again.' 
          } 
        });
      } else {
        throw new Error(result.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submission error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Check for authentication errors specifically
      if (err.response?.status === 401 || err.message?.includes('Authentication')) {
        toast.error('Your session has expired. Please log in again');
        navigate('/login', { 
          state: { 
            from: `/restaurant/${restaurantId}/create-review`,
            message: 'Session expired. Please log in again.' 
          } 
        });
      } else {
        setError(err.message || 'Failed to submit review. Please try again.');
        toast.error(err.message || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading restaurant details...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Write a Review</h2>
          
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
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
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

export default CreateReview;