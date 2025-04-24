import { Star } from "lucide-react"

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      comment: "FoodFast has been a lifesaver during busy workweeks. The food always arrives hot and on time!",
      role: "Marketing Manager",
    },
    {
      name: "Michael Chen",
      comment:
        "I love the variety of restaurants available. I've discovered so many new favorite places through this app.",
      role: "Software Engineer",
    },
    {
      name: "Emily Rodriguez",
      comment: "The customer service is exceptional. When I had an issue with my order, they resolved it immediately.",
      role: "Teacher",
    },
  ]

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our happy customers have to say.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
      transform hover:scale-[1.02] border border-orange-100 hover:border-orange-200">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className="h-5 w-5 fill-orange-500 text-orange-500 group-hover:scale-110 transition-transform" 
          />
        ))}
      </div>
      <p className="mb-6 text-gray-600 text-lg leading-relaxed italic">
        "{testimonial.comment}"
      </p>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 
          flex items-center justify-center text-orange-500 font-semibold text-lg
          group-hover:scale-110 transition-transform">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
            {testimonial.name}
          </p>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection
