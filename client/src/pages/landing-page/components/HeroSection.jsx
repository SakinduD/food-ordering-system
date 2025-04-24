import { Search } from "lucide-react"

function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/90 to-white">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="container relative mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-20">
          {/* Content Section */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Delicious Food{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Delivered
              </span>{" "}
              To Your Door
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-[600px] mx-auto md:mx-0 leading-relaxed">
              Order from your favorite restaurants and get food delivered in minutes. 
              Fast, reliable, and delicious.
            </p>
            
            {/* Search Form */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto md:mx-0">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter your address"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-orange-100 bg-white shadow-lg 
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 
                  hover:border-orange-200 transition-all duration-200"
                />
              </div>
              <button className="h-14 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 
                text-white font-semibold shadow-lg transition-all duration-200 
                hover:shadow-orange-500/30 hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                Find Food
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-2xl"></div>
            <img
              src="https://i.imgur.com/w1e5Wl0.png"
              alt="Food delivery illustration"
              className="relative rounded-2xl shadow-2xl w-full max-w-[500px] mx-auto 
              transform hover:scale-[1.02] transition-transform duration-300
              animate-floating"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
