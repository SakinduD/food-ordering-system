import { useEffect } from "react"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorksSection from "./components/HowItWorksSection"
import RestaurantsSection from "./components/RestaurantsSection"
import TestimonialsSection from "./components/TestimonialsSection"
import AppDownloadSection from "./components/AppDownloadSection"
import CTASection from "./components/CTASection"

function LandingPage() {
  // Add scroll reveal animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Target all sections for animation
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-1000');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="flex-1 overflow-hidden">
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