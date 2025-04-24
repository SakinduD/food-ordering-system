import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialsRef = useRef(null);
  
  // Sri Lankan testimonials
  const testimonials = [
    {
      name: "Dinesh Perera",
      comment: "FoodFast has been a lifesaver during busy workdays in Colombo. Their selection of rice and curry is amazing, and the food always arrives hot and fresh!",
      role: "Software Engineer",
      location: "Colombo",
      rating: 5,
      image: "https://i.imgur.com/8Km9tLL.jpg"
    },
    {
      name: "Amali Fernando",
      comment: "I love ordering kottu through this app. The variety of restaurants available is impressive, and I've discovered many hidden gems in Kandy!",
      role: "University Lecturer",
      location: "Kandy",
      rating: 5,
      image: "https://i.imgur.com/wUbtrR1.jpg"
    },
    {
      name: "Malik Jayasuriya",
      comment: "The customer service is exceptional. When my order was slightly delayed due to rain, they kept me informed and offered compensation. Very professional!",
      role: "Bank Manager",
      location: "Galle",
      rating: 4,
      image: "https://i.imgur.com/7oM3RYk.jpg"
    },
    {
      name: "Tharushi Silva",
      comment: "As a working mom, FoodFast has made dinner time so much easier. The kids love the lamprais and I appreciate the timely delivery and quality of food.",
      role: "Marketing Director",
      location: "Negombo",
      rating: 5,
      image: "https://i.imgur.com/3jLPBGK.jpg"
    },
    {
      name: "Ranjan Bandara",
      comment: "Being new to Colombo, this app helped me discover authentic Sri Lankan cuisine. The hoppers and curry selection is absolutely fantastic!",
      role: "Tourism Consultant",
      location: "Colombo",
      rating: 5,
      image: "https://i.imgur.com/PpGYUaT.jpg"
    },
  ];

  // Auto-scrolling carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Scroll to active testimonial
  useEffect(() => {
    if (testimonialsRef.current) {
      const scrollAmount = testimonialsRef.current.offsetWidth * activeIndex;
      testimonialsRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
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

        {/* Testimonials carousel */}
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

        {/* Social proof */}
        <div className="mt-20">
          <p className="text-center text-gray-500 mb-6">Trusted by food lovers across Sri Lanka</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <div className="h-8 md:h-10">
              <img src="https://i.imgur.com/8KxDSOU.png" alt="Daily Mirror" className="h-full" />
            </div>
            <div className="h-8 md:h-10">
              <img src="https://i.imgur.com/TeC4Zs2.png" alt="Sunday Times" className="h-full" />
            </div>
            <div className="h-8 md:h-10">
              <img src="https://i.imgur.com/7vLuA8x.png" alt="Ceylon Today" className="h-full" />
            </div>
            <div className="h-8 md:h-10">
              <img src="https://i.imgur.com/PPpgVjW.png" alt="Daily News" className="h-full" />
            </div>
          </div>
        </div>
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
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 
              flex items-center justify-center text-orange-500 font-semibold text-lg border-2 border-orange-100
              group-hover:border-orange-300 transition-all duration-300 group-hover:scale-110">
              {testimonial.name.charAt(0)}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection
