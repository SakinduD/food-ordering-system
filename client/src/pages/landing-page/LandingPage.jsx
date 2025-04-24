import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorksSection from "./components/HowItWorksSection"
import RestaurantsSection from "./components/RestaurantsSection"
import TestimonialsSection from "./components/TestimonialsSection"
import AppDownloadSection from "./components/AppDownloadSection"
import CTASection from "./components/CTASection"


function LandingPage() {
  return (
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RestaurantsSection />
        <TestimonialsSection />
        <AppDownloadSection />
        <CTASection />
      </main>
  )
}

export default LandingPage