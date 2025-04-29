import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const testimonialsRef = useRef(null);
  
  // Fetch real reviews from the backend
  useEffect(() => {
    const fetchRestaurantReviews = async () => {
      try {
        setLoading(true);
        
        // We'll get reviews from multiple popular restaurants to have more variety
        const popularRestaurantIds = [
          // Replace with actual restaurant IDs from your database
          '65f7d7119f8eaa3cd8fdacd1',
          '65f7d82d9f8eaa3cd8fdacd5',
          '65f7da4d9f8eaa3cd8fdacdf'
        ];
        
        // Fetch reviews for each restaurant
        const reviewPromises = popularRestaurantIds.map(id => 
          axios.get(`http://localhost:5010/api/reviews/restaurant/${id}?limit=5`)
        );
        
        // Wait for all requests to complete
        const responses = await Promise.allSettled(reviewPromises);
        
        // Process successful responses
        let allReviews = [];
        responses.forEach(response => {
          if (response.status === 'fulfilled') {
            const reviewData = response.value.data;
            
            // Handle different response formats
            if (reviewData.data) {
              allReviews = [...allReviews, ...reviewData.data];
            } else if (Array.isArray(reviewData)) {
              allReviews = [...allReviews, ...reviewData];
            }
          }
        });
        
        // If we have real reviews, format them for display
        if (allReviews.length > 0) {
          // Sort by rating (highest first)
          allReviews.sort((a, b) => b.rating - a.rating);
          
          // Format reviews for testimonial display
          const formattedReviews = allReviews
            .filter(review => 
              review.comment && 
              review.comment.length >= 20 && 
              review.rating >= 4  // Only show positive reviews
            )
            .map(review => ({
              name: review.userName || 'Food Lover',
              comment: review.comment,
              role: review.userRole || 'Customer',
              location: 'Sri Lanka',  // Default location
              rating: review.rating,
              image: review.userAvatar,
              restaurantName: review.restaurantName
            }));
          
          // If we have enough reviews, use them
          if (formattedReviews.length >= 3) {
            setTestimonials(formattedReviews.slice(0, 8)); // Limit to 8 reviews
          } else {
            // Otherwise use fallback with some real reviews
            setTestimonials([...formattedReviews, ...fallbackTestimonials]);
          }
        } else {
          // Use fallback testimonials if no real reviews
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // Use fallback testimonials on error
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantReviews();
  }, []);
  
  // Sri Lankan testimonials (fallback)
  const fallbackTestimonials = [
    {
      name: "Dinesh Perera",
      comment: "FoodFast has been a lifesaver during busy workdays in Colombo. Their selection of rice and curry is amazing, and the food always arrives hot and fresh!",
      role: "Software Engineer",
      location: "Colombo",
      rating: 5,
      image: "https://i.imgur.com/onxInez.png"
    },
    {
      name: "Amali Fernando",
      comment: "I love ordering kottu through this app. The variety of restaurants available is impressive, and I've discovered many hidden gems in Kandy!",
      role: "University Lecturer",
      location: "Kandy",
      rating: 5,
      image: "https://i.imgur.com/onxInez.png"
    },
    {
      name: "Malik Jayasuriya",
      comment: "The customer service is exceptional. When my order was slightly delayed due to rain, they kept me informed and offered compensation. Very professional!",
      role: "Bank Manager",
      location: "Galle",
      rating: 4,
      image: "https://i.imgur.com/onxInez.png"
    },
    {
      name: "Tharushi Silva",
      comment: "As a working mom, FoodFast has made dinner time so much easier. The kids love the lamprais and I appreciate the timely delivery and quality of food.",
      role: "Marketing Director",
      location: "Negombo",
      rating: 5,
      image: "https://i.imgur.com/onxInez.png"
    },
    {
      name: "Ranjan Bandara",
      comment: "Being new to Colombo, this app helped me discover authentic Sri Lankan cuisine. The hoppers and curry selection is absolutely fantastic!",
      role: "Tourism Consultant",
      location: "Colombo",
      rating: 5,
      image: "https://i.imgur.com/onxInez.png"
    },
  ];

  // Auto-scrolling carousel
  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Scroll to active testimonial
  useEffect(() => {
    if (testimonialsRef.current && testimonials.length > 0) {
      const scrollAmount = testimonialsRef.current.offsetWidth * activeIndex;
      testimonialsRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, testimonials.length]);

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="text-center mb-16 md:mb-24">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-4">
            CUSTOMER STORIES
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            What Sri Lankans Say About Us
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our happy customers across Sri Lanka have to say.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="relative max-w-5xl mx-auto">
            {/* Navigation buttons */}
            <div className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 z-10">
              <button
                onClick={prevTestimonial}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-lg flex items-center justify-center
                  text-gray-600 hover:text-orange-500 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
            <div className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 z-10">
              <button
                onClick={nextTestimonial}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-lg flex items-center justify-center
                  text-gray-600 hover:text-orange-500 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>

            {/* Testimonials slider */}
            <div className="overflow-hidden rounded-2xl">
              <div 
                ref={testimonialsRef}
                className="flex transition-all duration-500 ease-in-out"
                style={{ width: `${testimonials.length * 100}%` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0"
                    style={{ width: `${100 / testimonials.length}%` }}
                  >
                    <TestimonialCard 
                      testimonial={testimonial} 
                      isActive={activeIndex === index}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === index 
                      ? "bg-orange-500 w-8" 
                      : "bg-orange-200 hover:bg-orange-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

      
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial, isActive }) {
  return (
    <div className={`group p-8 md:p-10 transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-80'}`}>
      <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 
        transform hover:scale-[1.02] border border-orange-100 hover:border-orange-200 relative">
        
        {/* Quote mark */}
        <div className="absolute top-6 right-8 text-6xl font-serif text-orange-100">"</div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`h-5 w-5 ${star <= testimonial.rating ? 'fill-orange-500 text-orange-500' : 'text-gray-200'} 
                group-hover:scale-110 transition-transform`} 
            />
          ))}
        </div>
        
        <p className="mb-8 text-gray-600 text-lg leading-relaxed italic relative z-10">
          "{testimonial.comment}"
        </p>
        
        <div className="flex items-center gap-4">
          {testimonial.image ? (
            <img 
              src={testimonial.image} 
              alt={testimonial.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-orange-100
                group-hover:border-orange-300 transition-all duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=fff4e6&color=f97316`;
              }}
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 
              flex items-center justify-center text-orange-500 font-semibold text-lg border-2 border-orange-100
              group-hover:border-orange-300 transition-all duration-300 group-hover:scale-110">
              {testimonial.name?.charAt(0) || "U"}
            </div>
          )}
          
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
              {testimonial.name}
            </p>
            <div className="flex items-center text-sm text-gray-500 gap-2">
              <span>{testimonial.role}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300"></span>
              <span>{testimonial.location}</span>
            </div>
            {testimonial.restaurantName && (
              <p className="text-xs text-gray-400 mt-1">
                About {testimonial.restaurantName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection
