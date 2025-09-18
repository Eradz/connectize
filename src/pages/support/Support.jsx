import React from 'react'

const Support = () => {
  return (
    <div>
    <section id="contact" class="bg-gray-100 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center mb-12">Contact Our Support Team</h2>
      <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" placeholder="Your name"/>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" placeholder="Your email"/>
          </div>
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="message" rows="4" class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600" placeholder="How can we help you?"></textarea>
          </div>
          <button class="w-full bg-gold text-white py-3 rounded-lg hover:bg-dark transition">
            Send Message
          </button>
        </div>
      </div>
    </div>
  </section>
    </div>
  )
}

export default Support