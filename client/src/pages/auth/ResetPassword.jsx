import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Verify the token is valid before showing the reset form
    const verifyToken = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5010/api/users/verify-reset-token/${token}`);
        setTokenValid(true);
        setUserEmail(response.data.email);
      } catch (err) {
        setTokenValid(false);
        setError(err.response?.data?.error || 'Invalid or expired token');
        toast.error('Invalid or expired token');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setLoading(false);
      setTokenValid(false);
      setError('No reset token provided');
    }
  }, [token]);

  const validatePassword = (pass) => {
    // Require at least 8 characters with at least one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and contain at least one number');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5010/api/users/reset-password', {
        token,
        password
      });
      setSuccess(true);
      toast.success('Password reset successful!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      toast.error('Failed to reset password');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-orange-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-orange-100">
        {!tokenValid ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Invalid Reset Link</h2>
            <p className="text-gray-600 text-base">
              This password reset link is invalid or has expired.
            </p>
            <p className="text-gray-600 text-sm">
              Please request a new password reset link.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <Link
                to="/forgot-password"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Password Reset Successful</h2>
            <p className="text-gray-600 text-base">
              Your password has been successfully reset.
            </p>
            <p className="text-gray-600 text-sm">
              You will be redirected to the login page in a few seconds...
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg w-full"
              >
                Log in Now
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Reset Your Password
              </h2>
              <p className="mt-2 text-gray-600">
                {userEmail ? `Reset password for ${userEmail}` : 'Create a new password for your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-11 pr-12 py-3 border border-orange-100 rounded-xl 
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                    focus:border-orange-500 transition-colors duration-200"
                    placeholder="Enter new password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters and include a number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-11 pr-12 py-3 border border-orange-100 rounded-xl 
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                    focus:border-orange-500 transition-colors duration-200"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
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
                disabled={submitLoading || !password || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r 
                from-orange-500 to-orange-600 text-white font-semibold rounded-xl 
                shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 
                transform hover:scale-[1.02] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-orange-600 hover:text-orange-500 font-medium">
                  Return to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;