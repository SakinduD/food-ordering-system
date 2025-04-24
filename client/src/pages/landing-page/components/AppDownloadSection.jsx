import { useState, useEffect } from "react"

function AppDownloadSection() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    observer.observe(document.getElementById('app-download'));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="app-download" className="py-12 md:py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl overflow-hidden shadow-2xl 
          transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 p-8 md:p-16 text-white">
              <div className={`transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Download Our
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100">
                    Mobile App
                  </span>
                </h2>
                <p className="mb-8 text-lg text-orange-100 max-w-lg leading-relaxed opacity-90">
                  Get exclusive app-only deals on your favorite Sri Lankan dishes. 
                  Track your delivery in real-time, save your favorite restaurants, 
                  and enjoy seamless ordering experience across Sri Lanka.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="group inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-orange-500 shadow-lg transition-all duration-300 hover:bg-orange-50 hover:shadow-orange-200/50 active:transform active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19c.828 0 1.5-.672 1.5-1.5S12.828 16 12 16s-1.5.672-1.5 1.5.672 1.5 1.5 1.5Z" />
                      <path d="M17 5.5v13c0 1.933-1.567 3.5-3.5 3.5h-3c-1.933 0-3.5-1.567-3.5-3.5v-13C7 3.567 8.567 2 10.5 2h3C15.433 2 17 3.567 17 5.5Z" />
                      <path d="M12 7h.01" />
                    </svg>
                    <span>
                      <span className="block text-xs text-orange-600/80">Download on the</span>
                      App Store
                    </span>
                  </button>
                  <button className="group inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-orange-500 shadow-lg transition-all duration-300 hover:bg-orange-50 hover:shadow-orange-200/50 active:transform active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21" />
                    </svg>
                    <span>
                      <span className="block text-xs text-orange-600/80">Get it on</span>
                      Google Play
                    </span>
                  </button>
                </div>
              </div>
              
              {/* App features */}
              <div className={`mt-10 grid grid-cols-2 gap-4 transition-all duration-700 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-400/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span className="text-orange-100 text-sm">Cashback Offers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-400/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span className="text-orange-100 text-sm">Loyalty Points</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-400/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="text-orange-100 text-sm">Customizable Orders</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-400/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M12 8h.01" />
                      <path d="M11 12h1v4" />
                    </svg>
                  </div>
                  <span className="text-orange-100 text-sm">Live Tracking</span>
                </div>
              </div>
            </div>
            
            <div className={`flex-1 p-8 md:p-12 relative transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '6s' }}></div>
              
              {/* Mobile app mockup */}
              <div className="relative">
                <img
                  src="https://i.imgur.com/oW0sQU1.png"
                  width={400}
                  height={400}
                  alt="FoodFast Sri Lanka Mobile App"
                  className="mx-auto relative z-10 transform hover:scale-105 transition-transform duration-500 hover:rotate-2 rounded-2xl shadow-2xl"
                />
                
                {/* Floating UI elements */}
                <div className="absolute -top-6 -left-6 bg-white p-3 rounded-xl shadow-xl animate-float-slow">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                        <path d="M12 3v6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">25% OFF</p>
                      <p className="text-xs text-gray-500">First Order</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 right-8 bg-white p-3 rounded-xl shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <img src="https://i.imgur.com/7vLuA8x.png" alt="Restaurant" className="h-8 w-8 rounded-lg object-cover" />
                    <div>
                      <div className="text-xs text-gray-500">Just delivered</div>
                      <div className="text-sm font-medium">Kottu Roti</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadSection
