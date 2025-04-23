import { Clock, MapPin, Star } from "lucide-react"

function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500">
            Why Choose FoodFast?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We make food ordering simple and convenient with features designed for the best experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <FeatureCard
            icon={<Clock className="h-6 w-6 text-orange-500" />}
            title="Fast Delivery"
            description="Get your food delivered in 30 minutes or less, guaranteed fresh and hot."
          />
          <FeatureCard
            icon={<MapPin className="h-6 w-6 text-orange-500" />}
            title="Local Restaurants"
            description="Support local businesses with our wide selection of nearby restaurants."
          />
          <FeatureCard
            icon={<Star className="h-6 w-6 text-orange-500" />}
            title="Best Quality"
            description="We partner only with top-rated restaurants to ensure quality meals every time."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group p-8 rounded-2xl bg-white border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-orange-200">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default FeaturesSection
