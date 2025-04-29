// src/pages/restaurant-service/RestaurantProfile.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import Spinner from "../../components/Spinner";
import { toast } from "react-hot-toast";
import { Shield, ShieldCheck, ShieldAlert, Trash  } from "lucide-react";
import AdminMenuList from "./AdminMenuList";
// ✅ Newly added for report export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/api/restaurants/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(response.data.data);
        setLoading(false);
        
        // Only fetch orders if restaurant is verified
        if (response.data.data && response.data.data.isVerified) {
          fetchOrders();
          fetchMenuItems();
        } else {
          setOrdersLoading(false); // Stop loading if restaurant isn't verified
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        setLoading(false);
        setOrdersLoading(false);
      }
    };

    fetchRestaurant();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5001/api/order/getOrdersByRestaurantId`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5025/api/menu/restaurant/${restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };
  
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/order/updateOrderStatus/${orderId}`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prevOrders) =>
        prevOrders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order)
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleDeleteOrder = (orderId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-800">⚠️ Are you sure you want to delete this order?</span>
          <div className="flex justify-center gap-3">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.delete(`http://localhost:5001/api/order/deleteOrder/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
  
                  setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
  
                  toast.success("Order deleted successfully!");
                } catch (error) {
                  console.error("Error deleting order:", error);
                  toast.error("Failed to delete order!");
                } finally {
                  toast.dismiss(t.id); // Close the toast
                }
              }}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            >
              Yes, Delete
            </button>
  
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
      }
    );
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'processing':
      case 'accepted': return "bg-blue-100 text-blue-800";
      case 'delivered':
      case 'completed': return "bg-green-100 text-green-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const canCreateDelivery = (status) => {
    return ["accepted", "processing"].includes(status?.toLowerCase());
  };

  if (loading || !user) return <Spinner />;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Restaurant Profile</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-xl text-gray-600 mb-6">You don't have a restaurant registered yet.</p>
            <Link
              to="/register-restaurant"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Register Your Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Display pending verification message if restaurant exists but isn't verified
  if (restaurant && !restaurant.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Restaurant Dashboard
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl border-2 border-orange-200 bg-white text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Verification Pending Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden mb-8">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-yellow-100 rounded-full mb-6">
                <ShieldAlert size={64} className="text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verification Pending</h3>
              <p className="text-gray-600 mb-6 max-w-xl">
                Your restaurant <span className="font-semibold">{restaurant.name}</span> has been registered successfully, but it's currently awaiting verification by our admin team. 
                You'll gain full access to your restaurant dashboard once the verification process is complete.
              </p>
              <div className="bg-yellow-50 p-4 rounded-xl w-full max-w-md">
                <h4 className="font-semibold text-yellow-700 mb-2">What happens next?</h4>
                <ul className="text-left text-sm text-yellow-800 space-y-2">
                  <li>• Our team will review your restaurant information</li>
                  <li>• You'll receive an email when verification is complete</li>
                  <li>• Once verified, you can manage orders and update your menu</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Restaurant Preview Card (Limited info) */}
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Restaurant Preview</h3>
              <div className="flex flex-col md:flex-row gap-6">
                {restaurant.imageUrl && (
                  <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden">
                    <img 
                      src={`http://localhost:5000${restaurant.imageUrl}`}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="w-full md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">Address</h4>
                      <p className="text-gray-800">{restaurant.address}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">Phone</h4>
                      <p className="text-gray-800">{restaurant.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">Category</h4>
                      <p className="text-gray-800">{restaurant.category || '-'}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/edit-restaurant', { state: restaurant })}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                      Edit Restaurant Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we're here, the restaurant is verified - continue with normal dashboard display
  const pendingOrders = orders.filter(order => order.orderStatus?.toLowerCase() === 'pending');
  const otherOrders = orders.filter(order => 
    ['accepted', 'completed', 'delivered', 'cancelled'].includes(order.orderStatus?.toLowerCase())
  );

  // ✅ Function to Download Orders Report
  const downloadOrdersReport = () => {
    let filteredOrders = [...orders];
  
    if (fromDate) {
      const from = new Date(fromDate);
      filteredOrders = filteredOrders.filter((o) => new Date(o.orderDate || o.createdAt) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      filteredOrders = filteredOrders.filter((o) => new Date(o.orderDate || o.createdAt) <= to);
    }
  
    if (filteredOrders.length === 0) {
      toast.error("No orders available in selected date range!");
      return;
    }
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Main title
    doc.setFontSize(20);
    doc.setTextColor(255, 102, 0); // orange
    doc.text("Orders Management Report", pageWidth / 2, 20, { align: "center" });
  
    // Generated Date
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });
  
    // Calculate Summaries
    const totalOrders = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.orderStatus?.toLowerCase() === "pending").length;
    const accepted = filteredOrders.filter(o => o.orderStatus?.toLowerCase() === "accepted").length;
    const completed = filteredOrders.filter(o => o.orderStatus?.toLowerCase() === "completed").length;
    const cancelled = filteredOrders.filter(o => o.orderStatus?.toLowerCase() === "cancelled").length;
  
    // Draw summary box
    doc.setFillColor(255, 243, 219); // light orange
    doc.roundedRect(14, 35, pageWidth - 28, 35, 4, 4, 'F'); // x, y, w, h, rx, ry
  
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Orders: ${totalOrders}`, 20, 45);
    doc.text(`Pending: ${pending}`, 20, 53);
    doc.text(`Accepted: ${accepted}`, pageWidth / 2, 45);
    doc.text(`Completed: ${completed}`, pageWidth / 2, 53);
    doc.text(`Cancelled: ${cancelled}`, 20, 61);
  
    // Table
    autoTable(doc, {
      startY: 80,
      head: [["Invoice ID", "Customer", "Date", "Amount (LKR)", "Status"]],
      body: filteredOrders.map((o) => [
        o.invoiceId,
        o.userName,
        new Date(o.orderDate || o.createdAt).toLocaleString(),
        o.totalAmount?.toFixed(2),
        o.orderStatus,
      ]),
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 102, 0], textColor: 255, fontSize: 11 }, // Tailwind orange
      alternateRowStyles: { fillColor: [255, 248, 235] },
    });
  
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Generated by Food Ordering System", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  
    doc.save(`Orders_Report_${new Date().toLocaleDateString()}.pdf`);
    toast.success("Report downloaded successfully!");
  };
  
  //Download Menu Item Report
  const downloadMenuListReport = async () => {
    if (!menuItems || menuItems.length === 0) {
      toast.error("No menu items available to download!");
      return;
    }
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    doc.setFontSize(20);
    doc.setTextColor(255, 102, 0);
    doc.text("Menu Items Report", pageWidth / 2, 20, { align: "center" });
  
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });
  
    const tableBody = [];
  
    for (const item of menuItems) {
      let imgData = null;
  
      if (item.imageUrl) {
        try {
          const response = await fetch(`http://localhost:5025${item.imageUrl}`);
          const blob = await response.blob();
          imgData = await blobToBase64(blob);
        } catch (error) {
          console.error("Failed to load image:", error);
        }
      }
  
      tableBody.push([
        imgData ? { image: imgData, width: 13, height: 13 } : '', // ⬅️ image
        item.name,
        item.price?.toFixed(2),
        item.category || "-",
        item.available ? "Available" : "Unavailable"
      ]);
    }
  
    autoTable(doc, {
      startY: 40,
      head: [["Image", "Item Name", "Price (LKR)", "Category", "Availability"]],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 102, 0], textColor: 255, fontSize: 11 },
      alternateRowStyles: { fillColor: [255, 248, 235] },
      columnStyles: {
        0: { cellWidth: 25 }, // image column
      },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.raw?.image) {
          doc.addImage(
            data.cell.raw.image,
            "JPEG",
            data.cell.x + 1,
            data.cell.y + 1,
            data.cell.raw.width,
            data.cell.raw.height
          );
        }
      }
    });
  
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Generated by Food Ordering System", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  
    doc.save(`Menu_List_Report_${new Date().toLocaleDateString()}.pdf`);
    toast.success("Menu List Report downloaded!");
  };
  
  // Helper to convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  
  // Main restaurant dashboard UI (only shown if verified)
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/90 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Restaurant Dashboard
            </h2>
            <div className="flex items-center mt-2 gap-2">
              <ShieldCheck size={20} className="text-green-600" />
              <span className="text-green-700 font-medium">Verified Restaurant</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2.5 rounded-xl border-2 border-orange-200 bg-white text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate('/edit-restaurant', { state: restaurant })}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
            >
              ✏️ Edit Restaurant Profile
            </button>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden mb-8">
          <div className="p-6 flex flex-col md:flex-row gap-6">
            {restaurant.imageUrl && (
              <div className="w-full md:w-1/3 h-64 rounded-xl overflow-hidden">
                <img 
                  src={`http://localhost:5000${restaurant.imageUrl}`}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="w-full md:w-2/3">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Address</h4>
                  <p className="text-gray-800">{restaurant.address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Phone</h4>
                  <p className="text-gray-800">{restaurant.phone}</p>
                </div>
                <div>
                      <h4 className="text-sm font-semibold text-gray-500">Category</h4>
                      <p className="text-gray-800">{restaurant.category || '-'}</p>
                    </div>
              </div>
              <div className="mt-6 flex gap-4">
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${restaurant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {restaurant.available ? 'Open' : 'Closed'}
                </span>
                <button 
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      await axios.put(
                        `http://localhost:5000/api/restaurants/${restaurant._id}/availability`, 
                        { available: !restaurant.available },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      // Update local state
                      setRestaurant({...restaurant, available: !restaurant.available});
                      toast.success(`Restaurant is now ${!restaurant.available ? 'open' : 'closed'}`);
                    } catch (error) {
                      console.error("Error updating availability:", error);
                      toast.error("Failed to update availability");
                    }
                  }}
                  className="px-4 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Toggle Status
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
        <div className="flex border-b border-orange-100">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-semibold ${activeTab === 'orders' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-orange-600'}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-4 font-semibold ${activeTab === 'menu' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-orange-600'}`}
          >
            Menu Items
          </button>
        </div>


          <div className="p-6">
          {activeTab === 'orders' ? (
              <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-3xl font-bold text-orange-600">Recent Orders</h2>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search bar */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search by Order ID or Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* ✅ Newly added Download Report Button */}
                {orders.length > 0 && (
                  <button
                    onClick={downloadOrdersReport}
                    className="whitespace-nowrap px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm"
                  >
                    📄 Download Report
                  </button>
                )}
              </div>
            </div>

            {ordersLoading ? (
              <Spinner />
            ) : orders.length === 0 ? (
              <>
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-xl text-gray-600 mb-2">No orders yet</p>
                <p className="text-gray-500">Orders will appear here when customers place them.</p>
              </div>
              </>
            ) : (
              <>
                <OrderCategory title="🔵 Pending Orders" orders={pendingOrders} searchTerm={searchTerm} />
                <OrderCategory title="🔶 Other Orders" orders={otherOrders} searchTerm={searchTerm} />
              </>
            )}
            </>
            ): (
              <>
                {/* Menu Items Section */}
                <AdminMenuList setActiveTab={setActiveTab} />

                <div className="flex justify-end mt-10 mb-20">
                <button
                  onClick={downloadMenuListReport}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-white bg-orange-500 hover:bg-orange-400 transition-all text-base shadow-md"
                >
                  ⬇️ Download Menu List Report
                </button>
              </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function OrderCategory({ title, orders, searchTerm }) {
    const filteredOrders = orders.filter(order =>
      order.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredOrders.length === 0) return null;

    return (
      <div className="mb-12">
        <h4 className="text-lg font-bold mb-4">{title}</h4>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Order ID</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Items Ordered</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">{order.invoiceId}</td>
                  <td className="p-4">{order.userName}</td>
                  <td className="p-4 space-y-1 text-sm text-gray-700">
                    {order.orderItems?.length > 0 ? (
                      order.orderItems.map((item, index) => (
                        <div key={index}>
                          {item.itemName} <span className="text-gray-400">(x{item.itemQuantity})</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">No items</span>
                    )}
                  </td>
                  <td className="p-4">{new Date(order.orderDate || order.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-medium">LKR {order.totalAmount?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <select
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {canCreateDelivery(order.orderStatus) && (
                        <Link
                          to={`/create-delivery/${order._id}`}
                          className="inline-block px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Create Delivery
                        </Link>
                      )}

                      {/* ✅ Delete Order Button */}
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
};

export default RestaurantProfile;
