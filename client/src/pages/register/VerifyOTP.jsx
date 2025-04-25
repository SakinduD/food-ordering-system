import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { KeyRound } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('User ID not found. Please register again.');
      navigate('/register');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5010/api/auth/verify-otp', {
        userId,
        otp
      });

      // Debug response
      console.log('Verification response:', response.data);

      // Check if verification was successful
      if (response.data.success || response.status === 200) {
        setVerified(true);
        toast.success('Account verified successfully!');
        
        // Immediate navigation instead of setTimeout
        navigate('/login', {
          replace: true, // Use replace to prevent going back to verification page
          state: {
            verifiedEmail: email,
            message: 'Account verified successfully! Please login.'
          }
        });
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to handle verified state changes
  useEffect(() => {
    if (verified) {
      // Fallback navigation if the immediate navigation fails
      const timer = setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            verifiedEmail: email,
            message: 'Account verified successfully! Please login.'
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [verified, navigate, email]);

  if (!userId) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-orange-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-orange-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {verified ? 'Verification Successful!' : 'Verify Your Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {verified 
              ? 'Redirecting you to login...' 
              : `Enter the verification code sent to ${email || 'your email'}`
            }
          </p>
        </div>

        {!verified && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="sr-only">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter verification code"
                disabled={verified}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || verified}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            </div>
          </form>
        )}

        {verified && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;