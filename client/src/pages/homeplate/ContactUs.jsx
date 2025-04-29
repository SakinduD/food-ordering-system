import React, { useState } from 'react';
import axios from 'axios';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));

    try {
      // For now, we'll just simulate a successful submission
      // In a real app, you'd send this data to your backend API
      // await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, msg: "Thank you! We've received your message and will get back to you soon." }
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setStatus({
        submitted: false,
        submitting: false,
        info: { error: true, msg: "Something went wrong. Please try again later." }
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-orange-50/30">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or feedback? We're here to help. Reach out to our team.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-orange-50 p-8 rounded-xl text-center">
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Phone</h3>
            <p className="text-gray-600">+94 11 234 5678</p>
          </div>
          
          <div className="bg-orange-50 p-8 rounded-xl text-center">
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
            <p className="text-gray-600">support@homeplate.lk</p>
          </div>
          
          <div className="bg-orange-50 p-8 rounded-xl text-center">
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Address</h3>
            <p className="text-gray-600">123 Galle Road, Colombo 03, Sri Lanka</p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Map */}
          <div className="bg-white p-4 rounded-xl shadow-sm h-[500px]">
            <div className="h-full w-full rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798553251159!2d79.84854867414863!3d6.9113486179802715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259409e55465d%3A0xbc7b137e1aa2e8b1!2sGalle%20Rd%2C%20Colombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1714392917267!5m2!1sen!2sus"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="HomePlate Location"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
          
          {/* Form */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
            
            {status.info.msg && (
              <div className={`mb-6 p-4 rounded-lg ${status.info.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {status.info.msg}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 focus:outline-none"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 focus:outline-none"
                  placeholder="Subject"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 focus:outline-none"
                  placeholder="Your message"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={status.submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-orange-300"
              >
                {status.submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How do I place an order?",
                answer: "Browse restaurants, select your items, add them to your cart, and proceed to checkout. You can pay online or choose cash on delivery."
              },
              {
                question: "What areas do you deliver to?",
                answer: "We currently deliver to major cities in Sri Lanka including Colombo, Kandy, Galle, Negombo, and Jaffna. We're constantly expanding our delivery areas."
              },
              {
                question: "How long does delivery take?",
                answer: "Delivery time depends on your location and the restaurant you order from. The average delivery time is 30-45 minutes."
              },
              {
                question: "Can I track my order?",
                answer: "Yes! Once your order is confirmed, you can track its status in real-time through our app or website."
              },
              {
                question: "How do I become a restaurant partner?",
                answer: "If you own a restaurant and wish to partner with HomePlate, please contact us through our Partner Registration form or email us at partners@homeplate.lk."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-orange-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Order?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Discover the best restaurants in your area and enjoy convenient delivery with HomePlate.
          </p>
          <a 
            href="/restaurants" 
            className="inline-block bg-white text-orange-600 font-bold py-3 px-8 rounded-full hover:bg-orange-50 transition-colors"
          >
            Browse Restaurants
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;