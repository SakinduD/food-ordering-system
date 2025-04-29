import { MapPin, Utensils, Mail, Phone } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Utensils className="h-6 w-6 text-orange-500" />
              </div>
              <span className="font-bold text-2xl text-white">HomePlate</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The fastest and most reliable food delivery service in town.
            </p>
            <div className="flex gap-6">
              <SocialLink name="Facebook" />
              <SocialLink name="Instagram" />
              <SocialLink name="Twitter" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-4">
              <FooterLink href="#" text="Home" />
              <FooterLink href="#" text="About Us" />
              <FooterLink href="#" text="How It Works" />
              <FooterLink href="#" text="FAQs" />
              <FooterLink href="#" text="Contact Us" />
            </ul>
          </div>

          {/* For Restaurants */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">For Restaurants</h3>
            <ul className="space-y-4">
              <FooterLink href="#" text="Partner With Us" />
              <FooterLink href="#" text="Restaurant Dashboard" />
              <FooterLink href="#" text="For Business" />
              <FooterLink href="#" text="Affiliate Program" />
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="h-5 w-5 text-orange-500 mt-1 group-hover:text-orange-400" />
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  123 HomePlate, Colombo 03, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  support@homeplate.com
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  (123) 456-7890
                </span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="pt-6 space-y-4">
              <h4 className="font-medium text-white">Subscribe to our newsletter</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 h-11 rounded-xl border border-gray-700 bg-gray-800/50 px-4 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                    hover:border-gray-600 transition-colors"
                />
                <button className="h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 
                  text-white font-medium shadow-lg shadow-orange-500/25 
                  hover:shadow-orange-500/40 transform hover:scale-[1.02] 
                  transition-all duration-200 focus:outline-none focus:ring-2 
                  focus:ring-orange-500/20">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800/50 mt-16 pt-8 text-sm text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} HomePlate. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <FooterLink href="#" text="Privacy Policy" />
            <FooterLink href="#" text="Terms of Service" />
            <FooterLink href="#" text="Cookie Policy" />
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ name }) {
  return (
    <a href="#" 
      className="text-gray-400 hover:text-white transform hover:scale-110 transition-all duration-200">
      <span className="sr-only">{name}</span>
      {name === "Facebook" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {name === "Instagram" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {name === "Twitter" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )}
    </a>
  )
}

function FooterLink({ href, text }) {
  return (
    <li>
      <a href={href} 
        className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
        {text}
      </a>
    </li>
  )
}

export default Footer