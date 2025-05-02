import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-9xl font-bold text-red-500">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-800">Page Not Found</h2>
        <p className="mt-4 text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link 
            to="/" 
            className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition duration-200"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;