function AppDownloadSection() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 p-8 md:p-16 text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in">
                Download Our
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100">
                  Mobile App
                </span>
              </h2>
              <p className="mb-8 text-lg text-orange-100 max-w-lg leading-relaxed opacity-90">
                Get exclusive app-only deals and track your delivery in real-time. 
                Available for iOS and Android devices with seamless experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-orange-500 shadow-lg transition-all duration-200 hover:bg-orange-50 hover:shadow-orange-200/50 active:transform active:scale-95">
                  <img
                    src="https://placehold.co/28x28/png?text=Apple"
                    width={28}
                    height={28}
                    alt="App Store"
                    className="mr-3 group-hover:scale-110 transition-transform duration-200"
                  />
                  <span>
                    <span className="block text-xs text-orange-600/80">Download on the</span>
                    App Store
                  </span>
                </button>
                <button className="group inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-orange-500 shadow-lg transition-all duration-200 hover:bg-orange-50 hover:shadow-orange-200/50 active:transform active:scale-95">
                  <img
                    src="https://placehold.co/28x28/png?text=Play"
                    width={28}
                    height={28}
                    alt="Google Play"
                    className="mr-3 group-hover:scale-110 transition-transform duration-200"
                  />
                  <span>
                    <span className="block text-xs text-orange-600/80">Get it on</span>
                    Google Play
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 p-8 md:p-12 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full filter blur-3xl opacity-30"></div>
              <img
                src="https://i.imgur.com/oW0sQU1.pngp"
                width={400}
                height={400}
                alt="Mobile App"
                className="mx-auto relative transform hover:scale-105 transition-transform duration-300 hover:rotate-2 rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadSection
