import { useState, useEffect } from 'react'

function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverButton, setHoverButton] = useState(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    observer.observe(document.getElementById('cta'));
    return () => observer.disconnect();
  }, []);
  
  return (
    <section id="cta" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="container relative mx-auto px-4 max-w-7xl">
        <div className={`relative p-8 md:p-12 rounded-3xl overflow-hidden transition-all duration-1000 transform
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ff6b3433_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 z-0"></div>
          
          {/* Content */}
          <div className="relative z-10 space-y-6 md:space-y-8 text-center max-w-3xl mx-auto">
            <h2 className={`text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500 tracking-tight transition-all duration-700 delay-300 transform
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Ready to Order Delicious Sri Lankan Food?
            </h2>
            <p className={`text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-500 transform
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Join thousands of satisfied customers across Sri Lanka who order with FoodFast every day.
              Experience the convenience of doorstep delivery from the best local restaurants.
            </p>
            
            <div className={`flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 pt-4 transition-all duration-700 delay-700 transform
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <button 
                className={`relative overflow-hidden w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl 
                  px-8 text-base font-semibold text-white shadow-lg transition-all duration-300
                  hover:shadow-orange-500/30 focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-orange-500 focus-visible:ring-offset-2 active:scale-95
                  ${hoverButton === 'order' ? 'scale-105' : ''}`}
                onMouseEnter={() => setHoverButton('order')}
                onMouseLeave={() => setHoverButton(null)}
              >
                {/* Animated gradient background */}
                <span className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500
                    ${hoverButton === 'order' ? 'scale-105' : 'scale-100'}`}></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
                </span>
                
                <span className="relative flex items-center">
                  Order Now
                  <svg className={`ml-2 w-5 h-5 transition-transform duration-300 ${hoverButton === 'order' ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                
                {/* Particle effects on hover */}
                {hoverButton === 'order' && (
                  <span className="absolute top-0 left-0 w-full h-full">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="absolute w-4 h-4 bg-white/30 rounded-full animate-particle-fade"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      ></span>
                    ))}
                  </span>
                )}
              </button>
              
              <button 
                className={`w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl 
                  border-2 border-orange-200 bg-white px-8 text-base font-semibold text-orange-600 
                  shadow-sm transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 
                  focus-visible:ring-offset-2 active:scale-95 
                  ${hoverButton === 'partner' ? 'scale-105' : ''}`}
                onMouseEnter={() => setHoverButton('partner')}
                onMouseLeave={() => setHoverButton(null)}
              >
                <span className="flex items-center">
                  Partner With Us
                  <svg className={`ml-2 w-5 h-5 transition-transform duration-300 ${hoverButton === 'partner' ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Sri Lankan cuisine icons */}
            <div className={`pt-8 flex flex-wrap justify-center gap-6 transition-all duration-700 delay-1000 transform 
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2 animate-float-slow">
                  <span className="text-xl">🍚</span>
                </div>
                <span className="text-xs text-gray-500">Rice & Curry</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2 animate-float" style={{ animationDelay: '0.3s' }}>
                  <span className="text-xl">🥘</span>
                </div>
                <span className="text-xs text-gray-500">Kottu Roti</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2 animate-float-slow" style={{ animationDelay: '0.6s' }}>
                  <span className="text-xl">🌮</span>
                </div>
                <span className="text-xs text-gray-500">Hoppers</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2 animate-float" style={{ animationDelay: '0.9s' }}>
                  <span className="text-xl">🍲</span>
                </div>
                <span className="text-xs text-gray-500">Lamprais</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2 animate-float-slow" style={{ animationDelay: '1.2s' }}>
                  <span className="text-xl">🦐</span>
                </div>
                <span className="text-xs text-gray-500">Seafood</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
