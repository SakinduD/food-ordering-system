import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorksSection from "./components/HowItWorksSection"
import RestaurantsSection from "./components/RestaurantsSection"
import TestimonialsSection from "./components/TestimonialsSection"
import AppDownloadSection from "./components/AppDownloadSection"
import CTASection from "./components/CTASection"
import Footer from "./components/Footer"

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RestaurantsSection />
        <TestimonialsSection />
        <AppDownloadSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage