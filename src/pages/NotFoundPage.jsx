import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-neutral-900 tracking-tight">
          Page not found
        </h2>
        <p className="mt-4 text-base text-neutral-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiHome className="mr-2 -ml-1 h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;