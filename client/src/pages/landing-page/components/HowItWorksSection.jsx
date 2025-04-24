function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-[600px] mx-auto leading-relaxed">
            Ordering your favorite food is simple and takes just a few minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto">
          <StepCard
            number={1}
            title="Choose Your Restaurant"
            description="Browse through hundreds of restaurants and cuisines near you."
            showConnector={true}
          />
          <StepCard
            number={2}
            title="Select Your Meals"
            description="Pick your favorite dishes and customize them to your liking."
            showConnector={true}
          />
          <StepCard
            number={3}
            title="Enjoy Your Delivery"
            description="Track your order in real-time and enjoy your meal when it arrives."
            showConnector={false}
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, description, showConnector }) {
  return (
    <div className="relative flex flex-col items-center text-center group">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white 
        flex items-center justify-center mb-6 text-2xl font-bold shadow-lg 
        transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {number}
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 group-hover:text-orange-500 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
      {showConnector && (
        <div className="hidden md:block absolute top-10 left-[calc(100%_-_16px)] w-[calc(100%_-_32px)] h-0.5 
          bg-gradient-to-r from-orange-200 to-orange-300 transform group-hover:scale-105 transition-transform">
        </div>
      )}
    </div>
  )
}

export default HowItWorksSection
