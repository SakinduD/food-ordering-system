import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Trash2, UserCog, ShieldCheck, ShieldX, Eye, X, Save, Filter, RefreshCw, Download, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AVAILABLE_ROLES = ['customer', 'restaurant', 'deliveryAgent'];

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });
  // Add filter states
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const { user } = useContext(UserContext);
  
  // Debug user state
  useEffect(() => {
    console.log('AdminDashboard state:', {
      currentUser: user,
      isAdmin: user?.isAdmin,
      token: localStorage.getItem('token')
    });
  }, [user]);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5010/api/users/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('API Response:', response);
        
        // Check if the data has the expected structure
        let userData = [];
        if (response.data && response.data.data) {
          // Handle the case where data is nested under 'data'
          userData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          // Handle the case where data is the direct response
          userData = response.data;
        }
        
        console.log('Processed user data:', userData);
        
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fix the useEffect that handles filters
  useEffect(() => {
    // Only run the filter if users have been loaded
    if (users.length > 0) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, users.length]); // Only re-run when filters change or users array length changes

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  // Fix the applyFilters function
  const applyFilters = () => {
    console.log('Applying filters:', filters);
    console.log('Current users:', users);
    
    let result = [...users];
    
    // Filter by role
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    // Filter by status (admin)
    if (filters.status === 'admin') {
      result = result.filter(user => user.isAdmin === true);
    } else if (filters.status === 'user') {
      result = result.filter(user => user.isAdmin === false);
    }
    
    console.log('Filtered result:', result);
    setFilteredUsers(result);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: '',
      status: ''
    });
    setFilteredUsers(users);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5010/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(applyFiltersToUsers(updatedUsers));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Helper function to apply current filters to a new user set
  const applyFiltersToUsers = (userList) => {
    let result = [...userList];
    
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    if (filters.status === 'admin') {
      result = result.filter(user => user.isAdmin === true);
    } else if (filters.status === 'user') {
      result = result.filter(user => user.isAdmin === false);
    }
    
    return result;
  };

  // Handle admin status toggle
  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5010/api/users/${userId}`, 
        { 
          isAdmin: !currentAdminStatus 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const updatedUsers = users.map(user => 
        user._id === userId 
          ? { ...user, isAdmin: !currentAdminStatus } 
          : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(applyFiltersToUsers(updatedUsers));
      
      toast.success(`User ${!currentAdminStatus ? 'promoted to' : 'removed from'} admin`);
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5010/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const handleEditClick = (userData) => {
    setEditForm({
      name: userData.name,
      email: userData.email,
      role: userData.role || 'User'
    });
    setIsEditing(true);
  };

  const handleUpdateUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5010/api/users/${userId}`, 
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const updatedUsers = users.map(user => 
        user._id === userId 
          ? { ...user, ...editForm }
          : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(applyFiltersToUsers(updatedUsers));
      
      setSelectedUser(null);
      setIsEditing(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user');
    }
  };

  // Generate PDF of user list
  const handleExportPDF = async () => {
    try {
      setExportLoading(true);
      const doc = new jsPDF('landscape', 'pt', 'a4');
      
      // Add header with title and date
      const pageWidth = doc.internal.pageSize.getWidth();
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Add header
      doc.setFillColor(255, 165, 0); // Orange color
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('User Management Report', 40, 35);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${currentDate}`, 40, 55);
      
      // Add filter information
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(11);
      let filterText = 'Filters: ';
      filterText += filters.role ? `Role: ${filters.role}, ` : '';
      filterText += filters.status ? `Status: ${filters.status}, ` : '';
      filterText = filterText === 'Filters: ' ? 'Filters: None' : filterText.slice(0, -2);
      doc.text(filterText, 40, 80);
      
      doc.setFontSize(10);
      doc.text(`Total Users: ${filteredUsers.length} of ${users.length}`, 40, 100);
      
      // Create table
      const tableData = [];
      const tableColumns = [
        { header: 'Name', dataKey: 'name', width: 150 },
        { header: 'Email', dataKey: 'email', width: 200 },
        { header: 'Role', dataKey: 'role', width: 100 },
        { header: 'Status', dataKey: 'status', width: 80 }
      ];
      
      // Add data
      filteredUsers.forEach(user => {
        tableData.push({
          name: user.name,
          email: user.email,
          role: user.role || 'User',
          status: user.isAdmin ? 'Admin' : 'User'
        });
      });
      
      // Create table with autoTable if installed or create custom table
      if (doc.autoTable) {
        // If using jspdf-autotable plugin
        doc.autoTable({
          startY: 120,
          head: [tableColumns.map(col => col.header)],
          body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
          theme: 'striped',
          headStyles: { 
            fillColor: [255, 237, 213],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: [249, 250, 251] }
        });
      } else {
        // Manual table creation
        const startY = 120;
        const rowHeight = 30;
        const colX = [40, 190, 390, 490];
        
        // Draw table headers
        doc.setFillColor(255, 237, 213);
        doc.rect(40, startY, 520, rowHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Name', colX[0], startY + 20);
        doc.text('Email', colX[1], startY + 20);
        doc.text('Role', colX[2], startY + 20);
        doc.text('Status', colX[3], startY + 20);
        
        // Draw rows
        doc.setFont('helvetica', 'normal');
        tableData.forEach((row, i) => {
          const y = startY + (i + 1) * rowHeight;
          
          // Alternate row background
          if (i % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(40, y, 520, rowHeight, 'F');
          }
          
          doc.text(row.name, colX[0], y + 20);
          doc.text(row.email, colX[1], y + 20);
          doc.text(row.role, colX[2], y + 20);
          doc.text(row.status, colX[3], y + 20);
          
          // Add horizontal line
          doc.setDrawColor(230, 230, 230);
          doc.line(40, y, 560, y);
        });
      }
      
      // Add footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text('Generated from Food Ordering System Admin Panel', pageWidth / 2, pageHeight - 20, { align: 'center' });
      
      // Save the PDF
      doc.save(`User_Management_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExportLoading(false);
    }
  };

  // Export individual user details
  const handleExportUserDetailsPDF = async (userData) => {
    try {
      setExportLoading(true);
      const doc = new jsPDF('portrait', 'pt', 'a4');
      
      // Set up dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add header with title
      doc.setFillColor(255, 165, 0); // Orange color
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('User Details', margin, 50);
      
      // Add date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.setFontSize(11);
      doc.text(`Generated: ${currentDate}`, margin, 70);
      
      // Start content positioning
      let yPos = 120;
      
      // Add user avatar placeholder
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.circle(pageWidth / 2, yPos + 50, 50, 'FD');
      
      // Add user initials in circle
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(40);
      const initials = userData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      doc.text(initials, pageWidth / 2, yPos + 65, { align: 'center' });
      
      yPos += 120;
      
      // Add user information
      // Helper function for adding a field
      const addField = (label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text(value || 'N/A', margin, yPos + 20);
        
        // Add separator line
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPos + 30, pageWidth - margin, yPos + 30);
        
        yPos += 50;
      };
      
      // Add user details fields
      addField('Full Name', userData.name);
      addField('Email Address', userData.email);
      addField('Role', userData.role || 'User');
      addField('Status', userData.isAdmin ? 'Administrator' : 'Regular User');
      addField('User ID', userData._id);
      
      if (userData.createdAt) {
        const joinDate = new Date(userData.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        addField('Joined', joinDate);
      }
      
      // Add footer
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text('Generated from Food Ordering System Admin Panel', pageWidth / 2, pageHeight - 20, { align: 'center' });
      
      // Save the PDF
      doc.save(`User_Details_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast.success('User details exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export user details');
    } finally {
      setExportLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={handleExportPDF}
            disabled={exportLoading || filteredUsers.length === 0}
            className={`flex items-center gap-2 px-4 py-2 ${
              exportLoading || filteredUsers.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            } rounded-lg shadow-sm transition-colors`}
            title="Export users to PDF"
          >
            {exportLoading ? (
              <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Exporting...</>
            ) : (
              <><FileDown className="h-4 w-4" /> Export PDF</>
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4 text-gray-600" />
            <span>Filters</span>
          </button>
          <div className="bg-orange-100 px-4 py-2 rounded-lg">
            <span className="text-orange-800 font-medium">
              {filteredUsers.length} / {users.length} Users
            </span>
          </div>
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full p-2 border rounded-lg bg-white cursor-pointer hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              >
                <option value="">All Roles</option>
                {AVAILABLE_ROLES.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border rounded-lg bg-white cursor-pointer hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="admin">Admin</option>
                <option value="user">Regular User</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full">
          <thead className="bg-orange-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-orange-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {user.role || 'User'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      user.isAdmin 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View user details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                        title={user.isAdmin ? "Remove admin privileges" : "Grant admin privileges"}
                      >
                        {user.isAdmin ? (
                          <ShieldX className="h-5 w-5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No users match the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal - keep as is */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl">
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsEditing(false);
              }}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit User' : 'User Details'}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role || 'customer'}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-white cursor-pointer hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    {AVAILABLE_ROLES.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateUser(selectedUser._id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{selectedUser.role || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                    selectedUser.isAdmin 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedUser.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(selectedUser)}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                  >
                    <UserCog className="h-4 w-4" />
                    Edit User
                  </button>
                  <button
                    onClick={() => handleExportUserDetailsPDF(selectedUser)}
                    disabled={exportLoading}
                    className={`flex-1 px-4 py-2 ${
                      exportLoading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } rounded-lg flex items-center justify-center gap-2`}
                  >
                    {exportLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;