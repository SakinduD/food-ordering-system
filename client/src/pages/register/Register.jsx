import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { Mail, Lock, User, Phone, ArrowRight, Store, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('customer');
    const [data, setData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });

    const [error, setError] = useState('');

    const roleCards = [
        {
            role: 'customer',
            title: 'Customer',
            description: 'Order food from your favorite restaurants',
            icon: <User className="h-6 w-6" />
        },
        {
            role: 'restaurant',
            title: 'Restaurant Owner',
            description: 'Partner with us to reach more customers',
            icon: <Store className="h-6 w-6" />
        },
        {
            role: 'deliveryAgent',
            title: 'Delivery Agent',
            description: 'Deliver food and earn money',
            icon: <Truck className="h-6 w-6" />
        }
    ];

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData(prev => ({ ...prev, role }));
    };

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (data.password !== data.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5010/api/auth/register', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: data.role
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                toast.success('Registration Successful!');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Toaster />
            <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-orange-100">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Choose your role and start your journey with us
                    </p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {roleCards.map((card) => (
                        <button
                            key={card.role}
                            onClick={() => handleRoleSelect(card.role)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left
                                ${selectedRole === card.role 
                                    ? 'border-orange-500 bg-orange-50' 
                                    : 'border-gray-200 hover:border-orange-200'}`}
                        >
                            <div className={`mb-3 p-2 rounded-lg inline-block
                                ${selectedRole === card.role ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {card.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900">{card.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-5">
                        {/* Name Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={handleChange}
                                        className="appearance-none block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl 
                                        text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                                        focus:border-orange-500 transition-colors duration-200"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
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
                        </div>

                        {/* Phone Input */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl 
                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                                    focus:border-orange-500 transition-colors duration-200"
                                    placeholder="Enter your phone number"
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
                                    placeholder="Create a password"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
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
                                    type="password"
                                    required
                                    value={data.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-11 pr-4 py-3 border border-orange-100 rounded-xl 
                                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                                    focus:border-orange-500 transition-colors duration-200"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r 
                        from-orange-500 to-orange-600 text-white font-semibold rounded-xl 
                        shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 
                        transform hover:scale-[1.02] transition-all duration-200"
                    >
                        Create Account
                        <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="text-orange-600 hover:text-orange-500 font-medium">
                                Sign in
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;