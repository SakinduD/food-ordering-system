import { Clock, MapPin, Star, Utensils, PiggyBank, Shield } from "lucide-react"
import { useState, useEffect } from "react"

function FeaturesSection() {
  const [visibleFeatures, setVisibleFeatures] = useState(0);
  
  // Animation to reveal features one by one
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleFeatures(prev => (prev < 6 ? prev + 1 : prev));
    }, 300);
    
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Clock className="h-6 w-6 text-orange-500" />,
      title: "Fast Delivery",
      description: "Get your favorite Sri Lankan dishes delivered in 30 minutes or less, guaranteed fresh and hot."
    },
    {
      icon: <MapPin className="h-6 w-6 text-orange-500" />,
      title: "Island Wide Coverage",
      description: "From Colombo to Kandy, Galle to Jaffna, we deliver to all major cities across Sri Lanka."
    },
    {
      icon: <Utensils className="h-6 w-6 text-orange-500" />,
      title: "Authentic Cuisine",
      description: "Experience the true flavors of Sri Lanka with dishes prepared by the best local chefs."
    },
    {
      icon: <Star className="h-6 w-6 text-orange-500" />,
      title: "Top-Rated Restaurants",
      description: "We partner only with the highest-rated restaurants across Sri Lanka to ensure quality every time."
    },
    {
      icon: <PiggyBank className="h-6 w-6 text-orange-500" />,
      title: "Special Offers",
      description: "Enjoy exclusive discounts and promotions on popular Sri Lankan dishes with every order."
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-500" />,
      title: "Contactless Delivery",
      description: "Our delivery partners follow strict safety protocols for a worry-free experience."
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-2 animate-bounce">
            NEXT GEN FOOD DELIVERY
          </span>
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500">
            Why Choose FoodFast Sri Lanka?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We're revolutionizing how Sri Lankans enjoy their favorite foods with features designed for the best experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={feature} 
              delay={index * 0.2}
              isVisible={index < visibleFeatures} 
            />
          ))}
        </div>
        
        {/* Statistics */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <StatCard number="20K+" label="Happy Customers" />
          <StatCard number="500+" label="Restaurant Partners" />
          <StatCard number="100+" label="Cities in Sri Lanka" />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, delay, isVisible }) {
  return (
    <div className={`group p-8 rounded-2xl bg-white border border-orange-100 shadow-lg 
      hover:shadow-xl transition-all duration-500 
      hover:border-orange-200 hover:scale-[1.02] transform 
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      style={{ transitionDelay: `${delay}s` }}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 
          flex items-center justify-center mb-4 
          group-hover:scale-110 transition-transform duration-300">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
            {feature.icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">{feature.title}</h3>
        <p className="text-gray-600">{feature.description}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label }) {
  const [count, setCount] = useState(0);
  const finalNumber = parseInt(number.replace(/[^\d]/g, ''));
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(finalNumber);
    const incrementTime = Math.floor(2000 / end);
    
    // Don't run if there's no actual number
    if (isNaN(end)) return;
    
    // Start counter animation on intersection
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let timer = setInterval(() => {
            start += Math.floor(end / 20);
            if (start > end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, incrementTime);
        }
      },
      { threshold: 0.5 }
    );
    
    // Observe the current component
    observer.observe(document.getElementById('features'));
    
    return () => observer.disconnect();
  }, [finalNumber]);
  
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-center transform transition-transform hover:scale-105">
      <div className="text-3xl md:text-5xl font-bold text-white mb-2">{number.includes("+") ? `${count}+` : count}</div>
      <div className="text-orange-100">{label}</div>
    </div>
  );
}

export default FeaturesSection
