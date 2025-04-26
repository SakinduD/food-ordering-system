import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { UserContext } from '../../context/userContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);
    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5010/api/auth/login', data);
            const { token, user } = response.data;

            if (token) {
                await login(token, user);
                toast.success('Login Successful!');

                // Navigate based on user role
                if (user.isAdmin) {
                    navigate('/admin');
                } else if(user.role === 'restaurant') {
                    navigate('/restaurant-profile');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
            toast.error('Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Toaster />
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-orange-100">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-5">
                        {/* Email Input */}
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
                                    value={data.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl 
                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                                    focus:border-orange-500 transition-colors duration-200"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl 
                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                                    focus:border-orange-500 transition-colors duration-200"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r 
                        from-orange-500 to-orange-600 text-white font-semibold rounded-xl 
                        shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 
                        transform hover:scale-[1.02] transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>

                    {/* Additional Links */}
                    <div className="text-center text-sm">
                        <a href="/forgot-password" className="text-orange-600 hover:text-orange-500">
                            Forgot your password?
                        </a>
                        <p className="mt-2 text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="text-orange-600 hover:text-orange-500 font-medium">
                                Sign up
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;