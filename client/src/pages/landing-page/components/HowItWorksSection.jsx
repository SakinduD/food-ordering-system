import { useState, useEffect } from "react"
import { Search, ShoppingBag, Bike } from "lucide-react"

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  
  // Auto-cycle through steps with animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-40 right-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDuration: '15s' }}></div>
      
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed">
            Order your favorite Sri Lankan dishes in just a few simple steps and get them delivered to your doorstep.
          </p>
        </div>
        
        <div className="relative">
          {/* Steps navigation indicators */}
          <div className="hidden md:flex justify-center mb-16">
            <div className="flex items-center">
              {[0, 1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <button 
                    onClick={() => setActiveStep(step)}
                    className={`h-12 w-12 rounded-full flex items-center justify-center font-bold transition-all duration-500
                      ${activeStep === step 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110" 
                        : "bg-white text-gray-400 border border-gray-200"}`}
                  >
                    {step + 1}
                  </button>
                  {step < 2 && (
                    <div className={`w-24 h-1 mx-4 transition-all duration-500 ${
                      activeStep > step ? "bg-orange-500" : "bg-gray-200"
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              title="Choose Your Restaurant"
              description="Browse through hundreds of popular Sri Lankan restaurants and select your favorite."
              icon={<Search className="h-8 w-8" />}
              showConnector={true}
              isActive={activeStep === 0}
            />
            <StepCard
              number={2}
              title="Select Your Meals"
              description="From kottu to hoppers, rice & curry to devilled dishes - pick your favorite Sri Lankan cuisines."
              icon={<ShoppingBag className="h-8 w-8" />}
              showConnector={true}
              isActive={activeStep === 1}
            />
            <StepCard
              number={3}
              title="Enjoy Your Delivery"
              description="Track your delivery in real-time and enjoy authentic Sri Lankan food at your doorstep."
              icon={<Bike className="h-8 w-8" />}
              showConnector={false}
              isActive={activeStep === 2}
            />
          </div>
        </div>
        
        {/* Process illustration */}
        <div className="mt-24 relative max-w-4xl mx-auto p-8 bg-orange-50/50 rounded-2xl border border-orange-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-1/2">
              <div className="aspect-video rounded-xl overflow-hidden border-8 border-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10"></div>
                <img 
                  src="https://i.imgur.com/JfcSHWL.jpg" 
                  alt="Sri Lankan food ordering app" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* App UI elements */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-xl transform rotate-6 animate-float">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-medium text-green-600">Delivery on the way</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">Simple Process, Amazing Food</h3>
              <p className="text-gray-600">Our app makes ordering your favorite Sri Lankan dishes incredibly easy. Browse, select, and track your order in real-time with our intuitive interface.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-orange-500 font-bold text-lg mb-1">200+</div>
                  <div className="text-sm text-gray-600">Cities Covered</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-orange-500 font-bold text-lg mb-1">15 min</div>
                  <div className="text-sm text-gray-600">Average Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, description, icon, showConnector, isActive }) {
  return (
    <div className="relative flex flex-col items-center text-center group">
      <div className={`h-24 w-24 rounded-2xl flex items-center justify-center mb-6 shadow-lg 
        transition-all duration-500 z-10
        ${isActive 
          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white scale-110 rotate-3" 
          : "bg-white text-orange-500 border border-orange-100"
        }
        group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <h3 className={`text-xl md:text-2xl font-bold mb-4 transition-colors duration-300
        ${isActive ? "text-orange-500" : "text-gray-800"}`}>
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
      {showConnector && (
        <div className="hidden md:block absolute top-12 left-[calc(100%_-_16px)] w-[calc(100%_-_32px)] h-0.5 
          bg-gradient-to-r from-orange-200 to-orange-300 transform transition-transform duration-300
          group-hover:scale-105">
          <div className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2
            transition-all duration-500 ${isActive ? "bg-orange-500 animate-ping" : "bg-orange-300"}`}></div>
        </div>
      )}
    </div>
  )
}

export default HowItWorksSection
