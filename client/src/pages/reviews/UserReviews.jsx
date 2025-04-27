import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useReview } from '../../context/reviewContext';
import { useUser } from '../../context/userContext';

const UserReviews = () => {
  const [page, setPage] = useState(1);
  const { userReviews, loading, error, getUserReviews, deleteReview } = useReview();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile/reviews' } });
      return;
    }
    
    getUserReviews(page);
  }, [getUserReviews, isAuthenticated, navigate, page]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(reviewId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && userReviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/profile" className="flex items-center text-orange-500 hover:text-orange-600">
          <FaArrowLeft className="mr-2" /> Back to Profile
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Reviews</h2>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}
          
          {userReviews.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <FaStar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="text-gray-500 mt-3">You haven't written any reviews yet.</p>
              <Link 
                to="/restaurants" 
                className="mt-4 inline-block px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {userReviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {review.restaurantName || 'Restaurant'}
                    </h3>
                    <div className="flex space-x-2">
                      <Link
                        to={`/restaurant/${review.restaurantId}/edit-review`}
                        state={{ review }}
                        className="p-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/restaurant/${review.restaurantId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Restaurant
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination can be added here if needed */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviews;