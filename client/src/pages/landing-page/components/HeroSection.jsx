import { Search } from "lucide-react"
import { useState, useEffect } from "react"

function HeroSection() {
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/90 to-white">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
      </div>

      <div className="container relative mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-20">
          {/* Content Section */}
          <div className={`flex-1 space-y-8 text-center md:text-left transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-orange-300 after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-500 after:animate-scale-in">Authentic</span> Sri Lankan Food{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Delivered
              </span>{" "}
              To Your Door
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-[600px] mx-auto md:mx-0 leading-relaxed">
              From spicy kottu to delicious hoppers, order your favorite local dishes and get them delivered in minutes.
              Experience the taste of Sri Lanka from the comfort of your home.
            </p>
            
            {/* Search Form */}
            <div className={`flex flex-col sm:flex-row gap-4 max-w-md mx-auto md:mx-0 transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter your location in Sri Lanka"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-orange-100 bg-white shadow-lg 
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 
                  hover:border-orange-200 transition-all duration-200"
                />
              </div>
              <button className="h-14 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 
                text-white font-semibold shadow-lg transition-all duration-200 
                hover:shadow-orange-500/30 hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                animate-pulse-subtle">
                Find Food
              </button>
            </div>
            
            {/* Popular areas */}
            <div className={`text-sm text-gray-500 transition-all duration-1000 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="font-medium">Popular areas: </span>
              <span className="space-x-2">
                <button className="text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline transition-all">Colombo</button>
                <button className="text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline transition-all">Kandy</button>
                <button className="text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline transition-all">Galle</button>
                <button className="text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline transition-all">Negombo</button>
              </span>
            </div>
          </div>

          {/* Image Section */}
          <div className={`flex-1 relative transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-2'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-2xl"></div>
            <img
              src="https://i.imgur.com/w1e5Wl0.png"
              alt="Sri Lankan food delivery illustration"
              className="relative rounded-2xl shadow-2xl w-full max-w-[500px] mx-auto 
              transform hover:scale-[1.02] transition-transform duration-300
              animate-floating"
            />
            
            {/* Floating food items */}
            <div className="absolute -top-6 -right-6 bg-white p-3 rounded-full shadow-xl
                transform hover:scale-110 transition-all duration-300 animate-float-slow">
              <span className="text-2xl">🍛</span>
            </div>
            <div className="absolute top-1/3 -left-6 bg-white p-3 rounded-full shadow-xl
                transform hover:scale-110 transition-all duration-300 animate-float-delay">
              <span className="text-2xl">🍚</span>
            </div>
            <div className="absolute -bottom-6 right-1/3 bg-white p-3 rounded-full shadow-xl
                transform hover:scale-110 transition-all duration-300 animate-float">
              <span className="text-2xl">🌶️</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
