import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-gradient-to-b from-white to-orange-50/30">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            About HomePlate
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting Sri Lanka's best restaurants with food lovers across the island.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="/images/about-story.jpg" 
              alt="HomePlate Story" 
              className="rounded-2xl shadow-xl w-full h-auto"
              onError={(e) => {
                e.target.src = "https://i.imgur.com/WJYDoYa.png";
              }}
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
            <p className="text-gray-600 mb-4">
              HomePlate was founded in 2023 with a simple mission: to connect people with the food they love from their favorite local restaurants.
            </p>
            <p className="text-gray-600 mb-4">
              What started as a small startup in Colombo has quickly grown into Sri Lanka's favorite food delivery platform, serving thousands of customers daily across the island.
            </p>
            <p className="text-gray-600">
              We're passionate about supporting local businesses while providing our customers with convenient access to delicious meals delivered right to their doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Mission</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-700 italic">
              "To transform the way people experience food by connecting them with the best restaurants in Sri Lanka, while supporting local businesses and communities."
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-orange-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Quality First</h3>
              <p className="text-gray-600 text-center">
                We partner only with verified quality restaurants that meet our high standards for food safety and taste.
              </p>
            </div>
            
            <div className="bg-orange-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Fast Delivery</h3>
              <p className="text-gray-600 text-center">
                We understand that time matters, which is why we strive to deliver your food as quickly as possible.
              </p>
            </div>
            
            <div className="bg-orange-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Local Support</h3>
              <p className="text-gray-600 text-center">
                We're committed to supporting local restaurants and the communities they serve across Sri Lanka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Sakindu",
                image: "https://i.imgur.com/Rlfm3P4.png"
              },
              {
                name: "Ishan",
                image: "https://i.imgur.com/Rlfm3P4.png"
              },
              {
                name: "Methush",
                image: "https://i.imgur.com/Rlfm3P4.png"
              },
              {
                name: "Shanilka",
                image: "https://i.imgur.com/JFbow0i.png"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-orange-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Order Delicious Food?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who enjoy HomePlate's seamless food ordering experience.
          </p>
          <a 
            href="/restaurants" 
            className="inline-block bg-white text-orange-600 font-bold py-3 px-8 rounded-full hover:bg-orange-50 transition-colors"
          >
            Order Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;