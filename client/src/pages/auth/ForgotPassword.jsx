import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5010/api/users/forgot-password', { email });
      setSuccess(true);
      toast.success('Reset link sent! Please check your email.');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-orange-100">
        {success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Reset Link Sent</h2>
            <p className="text-gray-600 text-base">
              We've sent an email to <span className="font-medium text-gray-800">{email}</span> with 
              instructions to reset your password.
            </p>
            <p className="text-gray-600 text-sm">
              Please check your inbox and spam folder. The link will be valid for 60 minutes.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Return to Login
              </Link>
              <button
                onClick={() => { setSuccess(false); setEmail(''); }}
                className="text-orange-600 hover:text-orange-500 text-sm font-medium"
              >
                Try another email address
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Forgot Password
              </h2>
              <p className="mt-2 text-gray-600">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl 
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                    focus:border-orange-500 transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r 
                from-orange-500 to-orange-600 text-white font-semibold rounded-xl 
                shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 
                transform hover:scale-[1.02] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center text-sm">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-orange-600 hover:text-orange-500 font-medium">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;