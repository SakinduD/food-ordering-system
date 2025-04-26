import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaChartPie, FaClock, FaSearch, FaMoneyBillWave, FaStore, FaUtensils, FaCalendarAlt, FaRegClock } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminUserOrderSummary = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
  
  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5010/api/users/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      }
    };
    
    fetchUsers();
  }, []);

  // Handle user search input
  const handleUserSearch = (e) => {
    const term = e.target.value;
    setUserSearchTerm(term);
    
    if (term.length > 1) {
      const filtered = users.filter(user => 
        (user.name && user.name.toLowerCase().includes(term.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredUsers(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setFilteredUsers([]);
    }
  };

  // Select user and fetch order summary
  const selectUser = async (user) => {
    setSelectedUser(user);
    setUserSearchTerm('');
    setFilteredUsers([]);
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/order/getUserOrderSummary', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          userId: user._id
        }
      });
      
      if (response.data.summary) {
        setSummary(response.data.summary);
        console.log("Order summary data:", response.data.summary);
      } else {
        setError("Invalid summary data returned from server");
        setSummary(null);
      }
    } catch (err) {
      console.error("Error fetching order summary:", err);
      setError(`Failed to load order summary for ${user.name || 'selected user'}. ${err.response?.data?.message || err.message}`);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Generate status badge
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    switch (status) {
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'preparing':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Preparing</span>;
      case 'ready':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Ready</span>;
      case 'delivered':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Delivered</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status || 'Unknown'}</span>;
    }
  };

  // Prepare data for status distribution pie chart
  const prepareStatusChartData = () => {
    if (!summary || !summary.statusDistribution) return [];
    
    return Object.entries(summary.statusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  // Prepare data for top restaurants bar chart
  const prepareRestaurantChartData = () => {
    if (!summary || !summary.topRestaurants) return [];
    
    return summary.topRestaurants.map(restaurant => ({
      name: restaurant.name.length > 15 ? restaurant.name.substring(0, 15) + '...' : restaurant.name,
      orders: restaurant.count,
      spent: restaurant.total
    }));
  };

  // Prepare data for top items chart
  const prepareTopItemsChartData = () => {
    if (!summary || !summary.topItems) return [];
    
    return summary.topItems.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      count: item.count
    }));
  };

  // Prepare data for monthly orders chart
  const prepareMonthlyOrdersChartData = () => {
    if (!summary || !summary.ordersByMonth) return [];
    
    return Object.entries(summary.ordersByMonth)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const displayMonth = monthNames[parseInt(monthNum) - 1];
        return {
          name: `${displayMonth} ${year}`,
          count
        };
      });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">User Order Summary</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="underline text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* User Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select User</h2>
        <div className="relative">
          <input
            type="text"
            value={userSearchTerm}
            onChange={handleUserSearch}
            placeholder="Search by name or email"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          
          {filteredUsers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => selectUser(user)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <FaUser className="text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium">{user.name || 'Unnamed User'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedUser && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center">
            <FaUser className="text-blue-500 mr-2" />
            <div>
              <p className="font-medium">{selectedUser.name || 'Unnamed User'}</p>
              <p className="text-sm">{selectedUser.email}</p>
            </div>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!loading && summary && (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{summary.totalOrders || 0}</p>
                </div>
                <FaShoppingBag className="text-blue-500" size={24} />
              </div>
            </div>
            
            {/* Total Spent */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold mb-1">Total Spent</p>
                  <p className="text-3xl font-bold">{formatCurrency(summary.totalSpent)}</p>
                </div>
                <FaMoneyBillWave className="text-green-500" size={24} />
              </div>
            </div>
            
            {/* Average Order Value */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold mb-1">Average Order</p>
                  <p className="text-3xl font-bold">{formatCurrency(summary.averageOrderValue)}</p>
                </div>
                <FaChartPie className="text-purple-500" size={24} />
              </div>
            </div>
          </div>
          
          {/* Order History Highlights */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  <p className="text-gray-500 text-sm">First Order</p>
                </div>
                <p className="font-medium">{formatDate(summary.firstOrderDate)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FaRegClock className="text-green-500 mr-2" />
                  <p className="text-gray-500 text-sm">Latest Order</p>
                </div>
                <p className="font-medium">{formatDate(summary.lastOrderDate)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FaMoneyBillWave className="text-purple-500 mr-2" />
                  <p className="text-gray-500 text-sm">Customer Since</p>
                </div>
                <p className="font-medium">
                  {summary.firstOrderDate ? 
                    `${Math.round((new Date() - new Date(summary.firstOrderDate)) / (1000 * 60 * 60 * 24 * 30))} months` : 
                    'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
              {prepareStatusChartData().length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareStatusChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50">
                  <p className="text-gray-500">No status data available</p>
                </div>
              )}
            </div>
            
            {/* Top Restaurants */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Top Restaurants</h2>
              {prepareRestaurantChartData().length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareRestaurantChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => [name === 'spent' ? formatCurrency(value) : value, name === 'spent' ? 'Amount Spent' : 'Order Count']} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="spent" name="Amount Spent" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50">
                  <p className="text-gray-500">No restaurant data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Top Items */}
            {summary.topItems && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaUtensils className="mr-2 text-orange-500" />
                  Top Ordered Items
                </h2>
                {prepareTopItemsChartData().length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareTopItemsChartData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip formatter={(value) => [`${value} orders`, 'Quantity']} />
                        <Legend />
                        <Bar dataKey="count" name="Times Ordered" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-50">
                    <p className="text-gray-500">No item data available</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Orders by Month */}
            {summary.ordersByMonth && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Orders by Month</h2>
                {prepareMonthlyOrdersChartData().length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareMonthlyOrdersChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Orders" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-50">
                    <p className="text-gray-500">No monthly data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <FaClock className="mr-2 text-blue-500" />
                Recent Orders
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.recentOrders && summary.recentOrders.length > 0 ? (
                    summary.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            navigate(`/admin/orders/${order._id}`);
                          }}>
                            {order.invoiceId || 
                             (order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'N/A')}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaStore className="text-gray-400 mr-2" />
                            {order.restaurantName || 'Unknown Restaurant'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {!loading && !summary && selectedUser && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No order history found for this user.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!selectedUser && !loading && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Please select a user to view their order summary.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserOrderSummary;