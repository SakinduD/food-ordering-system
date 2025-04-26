import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaChartPie, FaClock, FaSearch, FaMoneyBillWave, FaStore, 
  FaUtensils, FaCalendarAlt, FaRegClock, FaList, FaTable, FaSortAmountDown, FaSortAmountUp, 
  FaExternalLinkAlt, FaFilter, FaDownload, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [viewType, setViewType] = useState('list'); // 'list' or 'search'
  const [userSort, setUserSort] = useState({field: 'name', direction: 'asc'});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
  
  // Fetch all users on component mount
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
        setAllUsers(fetchedUsers);
        
        // Filter users based on the toggle state
        if (!showAllUsers) {
          const customerUsers = fetchedUsers.filter(user => 
            !user.role || user.role === 'customer' || user.role.toLowerCase() === 'customer'
          );
          setUsers(customerUsers);
        } else {
          setUsers(fetchedUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [showAllUsers]); // Re-run when toggle changes

  // Handle user search input
  const handleUserSearch = (e) => {
    const term = e.target.value;
    setUserSearchTerm(term);
    
    if (term.length > 1) {
      const filtered = users.filter(user => {
        const nameMatch = user.name && user.name.toLowerCase().includes(term.toLowerCase());
        const emailMatch = user.email && user.email.toLowerCase().includes(term.toLowerCase());
        return nameMatch || emailMatch;
      });
      
      setFilteredUsers(filtered.slice(0, 10)); // Show more results (10 instead of 5)
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

  // Prepare data for charts
  const prepareStatusChartData = () => {
    if (!summary || !summary.statusDistribution) return [];
    
    return Object.entries(summary.statusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  const prepareRestaurantChartData = () => {
    if (!summary || !summary.topRestaurants) return [];
    
    return summary.topRestaurants.map(restaurant => ({
      name: restaurant.name.length > 15 ? restaurant.name.substring(0, 15) + '...' : restaurant.name,
      orders: restaurant.count,
      spent: restaurant.total
    }));
  };
  
  const prepareTopItemsChartData = () => {
    if (!summary || !summary.topItems) return [];
    
    return summary.topItems.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      count: item.count
    }));
  };
  
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

  // Sort users
  const sortUsers = (usersToSort) => {
    return [...usersToSort].sort((a, b) => {
      const fieldA = (a[userSort.field] || '').toLowerCase();
      const fieldB = (b[userSort.field] || '').toLowerCase();
      
      if (fieldA < fieldB) return userSort.direction === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return userSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // pagination calculation
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const sortedUsers = sortUsers(users);
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Function to handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToCsv = () => {
    if (!summary) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "User Name,Email,Total Orders,Total Spent,Average Order Value,First Order,Last Order\n";
    csvContent += `${selectedUser.name || 'Unnamed User'},${selectedUser.email},${summary.totalOrders},${summary.totalSpent},${summary.averageOrderValue},${summary.firstOrderDate || 'N/A'},${summary.lastOrderDate || 'N/A'}\n\n`;
    
    csvContent += "Recent Orders:\n";
    csvContent += "Order ID,Restaurant,Date,Amount,Status\n";
    
    if (summary.recentOrders && summary.recentOrders.length) {
      summary.recentOrders.forEach(order => {
        csvContent += `${order.invoiceId || order._id},${order.restaurantName || 'Unknown'},${order.orderDate},${order.totalAmount},${order.orderStatus}\n`;
      });
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedUser.name || 'user'}_order_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Customer Order Analytics</h1>
            {selectedUser && summary && (
              <button 
                onClick={exportToCsv}
                className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Export Summary
              </button>
            )}
          </div>
          <p className="text-gray-600">Analyze customer ordering patterns and preferences</p>
        </header>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow">
            <div className="flex">
              <FaTimesCircle className="h-5 w-5 text-red-500 mr-2" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-1 text-sm font-medium text-red-700 underline hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* User Search/List Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Select {showAllUsers ? 'User' : 'Customer'}</h2>
            <div className="flex items-center space-x-4">
              {/* Toggle between search and list */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewType('search')}
                  className={`p-2 rounded-md transition-all ${viewType === 'search' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
                  title="Search View"
                >
                  <FaSearch />
                </button>
                <button 
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded-md transition-all ${viewType === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
                  title="List View"
                >
                  <FaList />
                </button>
              </div>
              
              <label className="flex items-center cursor-pointer bg-gray-100 px-3 py-1 rounded-full">
                <span className="mr-2 text-sm font-medium text-gray-700">Show all users</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showAllUsers}
                    onChange={() => setShowAllUsers(!showAllUsers)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ease-in-out ${showAllUsers ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${showAllUsers ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-4 bg-blue-50 p-2 rounded-md">
            <FaInfoCircle className="mr-2 text-blue-500" />
            <span>Showing {users.length} {showAllUsers ? 'users' : 'customers'}</span>
            {isLoadingUsers && <div className="ml-2 animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>}
          </div>
          
          {viewType === 'search' ? (
            // Search View
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
                <FaSearch className="ml-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={handleUserSearch}
                  placeholder={`Search by ${showAllUsers ? 'user' : 'customer'} name or email`}
                  className="w-full px-4 py-3 border-none bg-transparent focus:outline-none"
                />
              </div>
              
              {filteredUsers.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => selectUser(user)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">{user.name || 'Unnamed User'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center mt-1">
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {user.role || 'customer'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {userSearchTerm.length > 1 && (
                <div className="mt-3 text-sm text-gray-600 flex items-center">
                  <FaFilter className="mr-2" />
                  Found {filteredUsers.length} matching users
                  {filteredUsers.length === 0 && userSearchTerm.length > 1 && (
                    <span className="ml-1 text-red-500">
                      (Try different search terms)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            // List View
            <>
              <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setUserSort({field: 'name', direction: userSort.field === 'name' ? (userSort.direction === 'asc' ? 'desc' : 'asc') : 'asc'})}
                    className={`flex items-center px-3 py-2 text-sm border ${userSort.field === 'name' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'} rounded-md transition-colors`}
                  >
                    Sort by Name
                    {userSort.field === 'name' && (
                      userSort.direction === 'asc' ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setUserSort({field: 'email', direction: userSort.field === 'email' ? (userSort.direction === 'asc' ? 'desc' : 'asc') : 'asc'})}
                    className={`flex items-center px-3 py-2 text-sm border ${userSort.field === 'email' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'} rounded-md transition-colors`}
                  >
                    Sort by Email
                    {userSort.field === 'email' && (
                      userSort.direction === 'asc' ? <FaSortAmountUp className="ml-2" /> : <FaSortAmountDown className="ml-2" />
                    )}
                  </button>
                </div>
                
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={handleUserSearch}
                    placeholder="Filter list..."
                    className="pl-9 pr-3 py-2 w-full md:w-64 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingUsers ? (
                        Array(5).fill(0).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                <div className="ml-4">
                                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-36"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                            </td>
                          </tr>
                        ))
                      ) : currentUsers.length > 0 ? (
                        currentUsers.map(user => (
                          <tr key={user._id} className={`${selectedUser && selectedUser._id === user._id ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                  {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {user.role || 'customer'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => selectUser(user)}
                                className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                              >
                                View Analytics
                                <FaExternalLinkAlt className="ml-1" size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                            {users.length > 0 
                              ? 'No users match your search criteria' 
                              : 'No users available'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination */}
              {users.length > usersPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                            ${currentPage === pageNum 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
          
          {selectedUser && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xl">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : <FaUser />}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800 text-lg">{selectedUser.name || 'Unnamed User'}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setSummary(null);
                }}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <FaTimesCircle className="mr-1" />
                Clear selection
              </button>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="flex flex-col justify-center items-center py-16 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading order data...</p>
          </div>
        )}
        
        {!loading && summary && (
          <>
            {/* Analytics Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recent Orders
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Detailed Analytics
                </button>
              </nav>
            </div>
            
            {activeTab === 'overview' && (
              <>
                {/* Summary Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Total Orders */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.totalOrders || 0}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {summary.firstOrderDate && `Since ${new Date(summary.firstOrderDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FaShoppingBag className="text-blue-600" size={20} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Spent */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Total Spent</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalSpent)}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {summary.lastOrderDate && `Last order: ${new Date(summary.lastOrderDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <FaMoneyBillWave className="text-green-600" size={20} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Average Order Value */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Average Order Value</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.averageOrderValue)}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {`${summary.totalOrders} orders total`}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <FaChartPie className="text-purple-600" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Customer Journey */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Journey</h2>
                  <div className="flex flex-wrap">
                    <div className="w-full md:w-1/2 lg:w-1/3 pr-6 mb-6 md:mb-0">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FaCalendarAlt size={20} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">First Order</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(summary.firstOrderDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <FaRegClock size={20} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Latest Order</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(summary.lastOrderDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/2 lg:w-2/3 lg:border-l lg:border-gray-200 lg:pl-6">
                      {summary.ordersByMonth && prepareMonthlyOrdersChartData().length > 1 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={prepareMonthlyOrdersChartData()}
                              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                name="Orders" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex flex-col justify-center items-center">
                          <FaInfoCircle size={36} className="text-gray-300 mb-3" />
                          <p className="text-gray-500">Insufficient order history data</p>
                          <p className="text-sm text-gray-400">
                            More orders needed to generate trend graph
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Order Status Distribution */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h2>
                    {prepareStatusChartData().length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareStatusChartData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={130}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareStatusChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No status data available</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Top Restaurants */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Favorite Restaurants</h2>
                    {prepareRestaurantChartData().length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareRestaurantChartData()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                            layout="vertical"
                          >
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip formatter={(value, name) => [name === 'spent' ? formatCurrency(value) : value, name === 'spent' ? 'Amount Spent' : 'Order Count']} />
                            <Legend verticalAlign="bottom" height={36} />
                            <Bar dataKey="orders" name="Orders" fill="#8884d8" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No restaurant data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaClock className="mr-2 text-blue-500" />
                    Recent Orders
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    {summary.recentOrders?.length || 0} orders
                  </span>
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
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.recentOrders && summary.recentOrders.length > 0 ? (
                        summary.recentOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                              <a href="#" onClick={(e) => {
                                e.preventDefault();
                                navigate(`/admin/orders/${order._id}`);
                              }}>
                                {order.invoiceId || 
                                (order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'N/A')}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="flex items-center">
                                <FaStore className="text-gray-400 mr-2" />
                                <span className="font-medium">{order.restaurantName || 'Unknown Restaurant'}</span>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              <button 
                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Order Details"
                              >
                                <FaExternalLinkAlt />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center p-4">
                              <FaShoppingBag className="text-gray-300 mb-3" size={32} />
                              <p className="font-medium">No recent orders found</p>
                              <p className="text-sm text-gray-400 mt-1">This customer hasn't placed any orders yet</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Top Ordered Items */}
                {summary.topItems && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUtensils className="mr-2 text-orange-500" />
                      Most Ordered Items
                    </h2>
                    {prepareTopItemsChartData().length > 0 ? (
                      <div className="h-96">
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
                            <Bar 
                              dataKey="count" 
                              name="Times Ordered" 
                              fill="#FFBB28"
                              radius={[0, 4, 4, 0]}
                              label={{
                                position: 'right',
                                formatter: (value) => value
                              }}
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
                )}
                
                {/* Advanced Analytics */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Customer Insights</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Order Frequency</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-blue-600 mr-3">
                          {summary.totalOrders && summary.firstOrderDate ? 
                            (summary.totalOrders / (Math.max(1, Math.round((new Date() - new Date(summary.firstOrderDate)) / (1000 * 60 * 60 * 24 * 30))))).toFixed(1) : 
                            '0'}
                        </div>
                        <div className="text-gray-600">orders per month</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Based on their ordering history since first purchase
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Customer Since</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-green-600 mr-3">
                          {summary.firstOrderDate ? 
                            Math.round((new Date() - new Date(summary.firstOrderDate)) / (1000 * 60 * 60 * 24 * 30)) : 
                            '0'}
                        </div>
                        <div className="text-gray-600">months</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Customer loyalty duration
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Most Recent Activity</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-purple-600 mr-3">
                          {summary.lastOrderDate ? 
                            Math.round((new Date() - new Date(summary.lastOrderDate)) / (1000 * 60 * 60 * 24)) : 
                            'N/A'}
                        </div>
                        <div className="text-gray-600">days ago</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Since their last order
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Order Completion Rate</h3>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-orange-600 mr-3">
                          {summary.statusDistribution && summary.totalOrders ? 
                            (((summary.totalOrders - (summary.statusDistribution.cancelled || 0)) / summary.totalOrders) * 100).toFixed(0) : 
                            '0'}%
                        </div>
                        <div className="text-gray-600">successful orders</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Orders that weren't cancelled
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {!loading && !summary && selectedUser && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-yellow-800">No Order History</h3>
                <p className="mt-2 text-yellow-700">
                  This customer hasn't placed any orders yet. Once they start ordering, you'll see their analytics here.
                </p>
                <p className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSummary(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                  >
                    Select Another Customer
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!selectedUser && !loading && (
          <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl shadow-sm text-center">
            <FaUser className="h-12 w-12 mx-auto text-blue-300 mb-4" />
            <h3 className="text-lg font-medium text-blue-800 mb-1">Select a Customer to Begin</h3>
            <p className="text-blue-700 mb-6">
              Choose a customer from the list above to view their order analytics and history
            </p>
            <p className="text-sm text-blue-600">
              You can use the search function or browse through the customer list
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserOrderSummary;