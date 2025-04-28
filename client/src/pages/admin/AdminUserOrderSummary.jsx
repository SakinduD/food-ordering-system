import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaChartPie, FaSearch, FaMoneyBillWave, FaStore, 
  FaUtensils, FaCalendarAlt, FaList, FaExternalLinkAlt, FaDownload, FaInfoCircle, 
  FaTimesCircle, FaSortAmountDown, FaSortAmountUp, FaFilter } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminUserOrderSummary = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [userSort, setUserSort] = useState({field: 'orderCount', direction: 'desc'});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Colors for charts - simplified color palette
  const COLORS = ['#38bdf8', '#a78bfa', '#fbbf24', '#4ade80', '#f43f5e', '#10b981', '#c084fc'];
  
  // Fetch users with orders on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5010/api/users/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const fetchedUsers = Array.isArray(response.data) ? response.data : [];
        
        // Show simple loading message
        setError("Loading users with order history...");
        
        // Process users in batches
        const batchSize = 20; // Increased for better performance
        const usersWithOrders = [];
        
        for (let i = 0; i < fetchedUsers.length; i += batchSize) {
          const batch = fetchedUsers.slice(i, i + batchSize);
          const batchPromises = batch.map(async (user) => {
            try {
              const orderResponse = await axios.get('http://localhost:5001/api/order/getUserOrderSummary', {
                headers: {
                  Authorization: `Bearer ${token}`
                },
                params: {
                  userId: user._id
                },
                timeout: 3000 // Increased timeout slightly
              });
              
              // Only include users with orders
              if (orderResponse.data.summary?.totalOrders > 0) {
                return { 
                  ...user, 
                  orderCount: orderResponse.data.summary.totalOrders,
                  totalSpent: orderResponse.data.summary.totalSpent || 0
                };
              }
              return null;
            } catch (err) {
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          usersWithOrders.push(...batchResults.filter(user => user !== null));
          
          // Simple progress update
          setError(`Loading users: ${Math.min(i + batchSize, fetchedUsers.length)}/${fetchedUsers.length}`);
        }
        
        // Sort by most orders by default
        const sortedUsers = usersWithOrders.sort((a, b) => b.orderCount - a.orderCount);
        
        // Filter based on toggle state
        if (!showAllUsers) {
          setUsers(sortedUsers.filter(user => !user.role || user.role === 'customer'));
        } else {
          setUsers(sortedUsers);
        }
        
        setError(null);
      } catch (err) {
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [showAllUsers]);

  // Handle user search
  const handleUserSearch = (e) => {
    const term = e.target.value;
    setUserSearchTerm(term);
    
    if (term.length > 1) {
      const filtered = users.filter(user => {
        return (user.name && user.name.toLowerCase().includes(term.toLowerCase())) || 
               (user.email && user.email.toLowerCase().includes(term.toLowerCase()));
      });
      
      setFilteredUsers(filtered.slice(0, 10));
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
      } else {
        setError("No order data available");
        setSummary(null);
      }
    } catch (err) {
      setError(`Failed to load order summary for ${user.name || 'selected user'}`);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

  // Chart data preparation functions
  const prepareStatusChartData = () => {
    if (!summary?.statusDistribution) return [];
    
    return Object.entries(summary.statusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  const prepareRestaurantChartData = () => {
    if (!summary?.topRestaurants) return [];
    
    return summary.topRestaurants.map(restaurant => ({
      name: restaurant.name.length > 15 ? restaurant.name.substring(0, 15) + '...' : restaurant.name,
      orders: restaurant.count,
      spent: restaurant.total
    }));
  };
  
  const prepareTopItemsChartData = () => {
    if (!summary?.topItems) return [];
    
    return summary.topItems.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      count: item.count
    }));
  };
  
  const prepareMonthlyOrdersChartData = () => {
    if (!summary?.ordersByMonth) return [];
    
    return Object.entries(summary.ordersByMonth)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          name: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
          count
        };
      });
  };

  // Sort users
  const sortUsers = (usersToSort) => {
    return [...usersToSort].sort((a, b) => {
      if (userSort.field === 'orderCount' || userSort.field === 'totalSpent') {
        const valA = a[userSort.field] || 0;
        const valB = b[userSort.field] || 0;
        return userSort.direction === 'asc' ? valA - valB : valB - valA;
      } else {
        const valA = (a[userSort.field] || '').toString().toLowerCase();
        const valB = (b[userSort.field] || '').toString().toLowerCase();
        return userSort.direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
    });
  };

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const sortedUsers = sortUsers(users);
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Export data to CSV
  const exportToCsv = () => {
    if (!summary || !selectedUser) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "User Name,Email,Total Orders,Total Spent,Average Order Value,First Order,Last Order\n";
    csvContent += `${selectedUser.name || 'Unnamed User'},${selectedUser.email},${summary.totalOrders},${summary.totalSpent},${summary.averageOrderValue},${formatDate(summary.firstOrderDate)},${formatDate(summary.lastOrderDate)}\n\n`;
    
    if (summary.recentOrders?.length) {
      csvContent += "Recent Orders:\n";
      csvContent += "Order ID,Restaurant,Date,Amount,Status\n";
      
      summary.recentOrders.forEach(order => {
        csvContent += `${order.invoiceId || order._id},${order.restaurantName || 'Unknown'},${formatDate(order.orderDate)},${order.totalAmount},${order.orderStatus}\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedUser.name || 'user'}_order_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Customer Order Analytics</h1>
            {selectedUser && summary && (
              <button 
                onClick={exportToCsv}
                className="flex items-center px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
            )}
          </div>
        </header>
        
        {/* Error message */}
        {error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 mb-4 rounded flex items-center">
            {isLoadingUsers ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            ) : (
              <FaInfoCircle className="h-4 w-4 text-blue-500 mr-2" />
            )}
            <span>{error}</span>
          </div>
        )}
        
        {/* User Selection Area */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={handleUserSearch}
                  placeholder="Search customers..."
                  className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">All users</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showAllUsers}
                    onChange={() => setShowAllUsers(!showAllUsers)}
                  />
                  <div className={`w-9 h-5 rounded-full transition ${showAllUsers ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition transform ${showAllUsers ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setUserSort({field: 'orderCount', direction: userSort.field === 'orderCount' ? (userSort.direction === 'desc' ? 'asc' : 'desc') : 'desc'})}
                className={`flex items-center px-3 py-2 text-sm border rounded ${userSort.field === 'orderCount' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
              >
                Orders
                {userSort.field === 'orderCount' && (
                  userSort.direction === 'desc' ? <FaSortAmountDown className="ml-1" /> : <FaSortAmountUp className="ml-1" />
                )}
              </button>
              
              <button 
                onClick={() => setUserSort({field: 'totalSpent', direction: userSort.field === 'totalSpent' ? (userSort.direction === 'desc' ? 'asc' : 'desc') : 'desc'})}
                className={`flex items-center px-3 py-2 text-sm border rounded ${userSort.field === 'totalSpent' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
              >
                Spent
                {userSort.field === 'totalSpent' && (
                  userSort.direction === 'desc' ? <FaSortAmountDown className="ml-1" /> : <FaSortAmountUp className="ml-1" />
                )}
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {filteredUsers.length > 0 && (
            <div className="mb-4 border rounded-lg overflow-hidden">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => selectUser(user)}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{user.name || 'Unnamed User'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.orderCount} orders
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* User List */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingUsers ? (
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                          <div className="ml-3 h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="h-4 bg-gray-200 rounded w-36"></div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedUser && selectedUser._id === user._id ? 'bg-blue-50' : ''}`}
                      onClick={() => selectUser(user)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {user.name ? user.name.charAt(0).toUpperCase() : <FaUser size={12} />}
                          </div>
                          <div className="ml-3 font-medium">{user.name || 'Unnamed'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3 text-right font-medium">{user.orderCount}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(user.totalSpent)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      No users with orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Prev
                </button>
                
                {[...Array(totalPages)].slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-full ${
                      currentPage === idx + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                
                {totalPages > 5 && <span className="text-gray-500">...</span>}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
          
          {/* Selected User Indicator */}
          {selectedUser && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : <FaUser />}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{selectedUser.name || 'Unnamed User'}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setSummary(null);
                }}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                <FaTimesCircle />
              </button>
            </div>
          )}
        </div>
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Analytics Content */}
        {!loading && summary && (
          <>
            {/* Analytics Tabs */}
            <div className="mb-4 border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Total Orders */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold">{summary.totalOrders || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {summary.firstOrderDate && `Since ${formatDate(summary.firstOrderDate)}`}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                        <FaShoppingBag className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Spent */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Spent</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {summary.lastOrderDate && `Last order: ${formatDate(summary.lastOrderDate)}`}
                        </p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                        <FaMoneyBillWave className="text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Average Order */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Average Order</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Per order average
                        </p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                        <FaChartPie className="text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Order Status Distribution */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-4">Order Status</h3>
                    {prepareStatusChartData().length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareStatusChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {prepareStatusChartData().map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">No status data</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Trends */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-4">Order Trends</h3>
                    {prepareMonthlyOrdersChartData().length > 1 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={prepareMonthlyOrdersChartData()}
                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                          >
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">Not enough data for trends</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Favorite Restaurants */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-medium mb-4">Favorite Restaurants</h3>
                  {prepareRestaurantChartData().length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareRestaurantChartData()}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip formatter={(value, name) => [
                            name === 'spent' ? formatCurrency(value) : `${value} orders`, 
                            name === 'spent' ? 'Amount Spent' : 'Order Count'
                          ]} />
                          <Bar dataKey="orders" name="Orders" fill="#8884d8" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="spent" name="Amount Spent" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                      <p className="text-gray-500">No restaurant data</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium">Recent Orders</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {summary.recentOrders?.length || 0} orders
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Restaurant
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.recentOrders && summary.recentOrders.length > 0 ? (
                        summary.recentOrders.map((order) => (
                          <tr key={order._id} 
                              className="hover:bg-gray-50 cursor-pointer" 
                              onClick={() => navigate(`/admin/orders/${order._id}`)}>
                            <td className="px-4 py-3 text-sm font-medium text-blue-600">
                              {order.invoiceId || order._id?.substring(order._id.length - 6).toUpperCase()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {order.restaurantName || 'Unknown'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(order.orderDate)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-right">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(order.orderStatus)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                            No recent orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Top Items */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FaUtensils className="mr-2 text-orange-500" />
                    Most Ordered Items
                  </h3>
                  {prepareTopItemsChartData().length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareTopItemsChartData()}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip />
                          <Bar 
                            dataKey="count" 
                            name="Times Ordered" 
                            fill="#FFBB28"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No item data available</p>
                    </div>
                  )}
                </div>
                
                {/* Customer Insights */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-medium mb-4">Customer Insights</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded p-3">
                      <p className="text-sm text-gray-500 mb-1">Order Frequency</p>
                      <p className="text-xl font-bold text-blue-600">
                        {summary.totalOrders && summary.firstOrderDate ? 
                          (summary.totalOrders / (Math.max(1, Math.round((new Date() - new Date(summary.firstOrderDate)) / (1000 * 60 * 60 * 24 * 30))))).toFixed(1) : 
                          '0'}
                        <span className="text-sm font-normal text-gray-500 ml-1">per month</span>
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded p-3">
                      <p className="text-sm text-gray-500 mb-1">Customer Since</p>
                      <p className="text-xl font-bold text-green-600">
                        {summary.firstOrderDate ? 
                          Math.max(1, Math.round((new Date() - new Date(summary.firstOrderDate)) / (1000 * 60 * 60 * 24 * 30))) : 
                          '0'}
                        <span className="text-sm font-normal text-gray-500 ml-1">months</span>
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded p-3">
                      <p className="text-sm text-gray-500 mb-1">Last Order</p>
                      <p className="text-xl font-bold text-purple-600">
                        {summary.lastOrderDate ? 
                          Math.round((new Date() - new Date(summary.lastOrderDate)) / (1000 * 60 * 60 * 24)) : 
                          '0'}
                        <span className="text-sm font-normal text-gray-500 ml-1">days ago</span>
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded p-3">
                      <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                      <p className="text-xl font-bold text-orange-600">
                        {summary.statusDistribution && summary.totalOrders ? 
                          (((summary.totalOrders - (summary.statusDistribution.cancelled || 0)) / summary.totalOrders) * 100).toFixed(0) : 
                          '0'}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Empty State */}
        {!selectedUser && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <FaUser className="mx-auto text-gray-300 mb-3" size={32} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Customer</h3>
            <p className="text-gray-600">
              Choose a customer from the list to view their order analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserOrderSummary;