import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaStar, FaSearch, FaFilter, FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';
import { useReview } from '../../context/reviewContext';
import { useUser } from '../../context/userContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ViewReview = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { loading: reviewLoading, getReviewsDirectly } = useReview();

  // State for all reviews and filtering
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 10;

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/restaurants');
        if (response.data && (response.data.success || response.data.data)) {
          const restaurantsData = response.data.data || response.data;
          setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
        } else {
          throw new Error('Failed to load restaurants');
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        toast.error('Failed to load restaurants');
        setError('Could not load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedRestaurant) {
          const result = await getReviewsDirectly(selectedRestaurant, currentPage, reviewsPerPage);
          if (result.success) {
            setReviews(result.data || []);
            setTotalPages(result.totalPages || 1);
          } else {
            throw new Error(result.error || 'Failed to load reviews');
          }
        } else {
          const response = await axios.get('http://localhost:5010/api/reviews', {
            params: { page: currentPage, limit: reviewsPerPage }
          });
          if (response.data && (response.data.success || response.data.data)) {
            setReviews(response.data.data || response.data);
            setTotalPages(response.data.totalPages || 1);
          } else {
            throw new Error('Failed to load reviews');
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Could not load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedRestaurant, currentPage, getReviewsDirectly]);

  // Handlers
  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
    setCurrentPage(1);
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderRatingStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <FaStar 
        key={index} 
        className={`${index < rating ? 'text-yellow-400' : 'text-gray-300'} inline-block`} 
      />
    ));
  };

  // Filters
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (review.rating < minRating) return false;
      if (searchTerm && !review.comment.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return sortDirection === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        case 'date':
          return sortDirection === 'asc' 
            ? new Date(a.createdAt) - new Date(b.createdAt) 
            : new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  if (loading && restaurants.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <FaSpinner className="animate-spin h-12 w-12 mx-auto text-orange-500" />
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Restaurant Reviews</h1>
        {isAuthenticated && (
          <Link 
            to={selectedRestaurant ? `/restaurant/${selectedRestaurant}/create-review` : '/restaurants'}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
          >
            {selectedRestaurant ? 'Write a Review' : 'Select a Restaurant'}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaFilter className="mr-2 text-orange-500" /> Filter Reviews
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
              Select Restaurant
            </label>
            <select
              id="restaurant"
              value={selectedRestaurant}
              onChange={handleRestaurantChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            >
              <option value="">All Restaurants</option>
              {restaurants.map(restaurant => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`p-2 rounded-md ${
                    minRating === rating
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {rating === 0 ? "All" : rating}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search in Reviews
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by keyword..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-600">
            <div className="col-span-7 sm:col-span-8">Review</div>
            <div 
              className="col-span-3 sm:col-span-2 flex items-center cursor-pointer"
              onClick={() => handleSortChange('rating')}
            >
              Rating {sortBy === 'rating' && (sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />)}
            </div>
            <div 
              className="col-span-2 flex items-center cursor-pointer"
              onClick={() => handleSortChange('date')}
            >
              Date {sortBy === 'date' && (sortDirection === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 mx-auto text-orange-500" />
            <p className="mt-4 text-gray-500">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition">
              Try Again
            </button>
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedReviews.map(review => (
              <div key={review._id} className="p-6 hover:bg-gray-50 transition">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-7 sm:col-span-8">
                    {/* Show restaurant if not filtered */}
                    {!selectedRestaurant && review.restaurantId && (
                      <Link 
                        to={`/restaurant/${review.restaurantId._id || review.restaurantId}`}
                        className="block text-lg font-medium text-orange-500 hover:text-orange-600 mb-2"
                      >
                        {review.restaurantId.name || "Unknown Restaurant"}
                      </Link>
                    )}

                    {/* Show reviewer name */}
                    <p className="text-sm text-gray-600 mb-2">
                      {review.userId ? (
                        <span className="font-medium">{review.userId.name || "Anonymous User"}</span>
                      ) : (
                        "Anonymous User"
                      )}
                    </p>

                    {/* Review comment */}
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                  </div>

                  {/* Rating */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="flex flex-wrap">
                      {renderRatingStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{review.rating}/5</p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center p-6 bg-gray-50 border-t border-gray-200">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {(index > 0 && array[index - 1] !== page - 1) && <span className="px-2">...</span>}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === page ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      {page}
                    </button>
                    {(index < array.length - 1 && array[index + 1] !== page + 1) && <span className="px-2">...</span>}
                  </div>
                ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ViewReview;
