import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateDelivery = ({ onDeliveryCreated }) => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateDelivery = async () => {
    if (!orderId.trim()) {
      setError('Order ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        'http://localhost:5005/api/deliveries',
        {
          orderId: orderId.trim()
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setOrderId(''); 
      
      toast.success("Delivery created and waiting for driver assignment");
      onDeliveryCreated?.(response.data.delivery);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create delivery';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Delivery</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="orderId" className="text-gray-600 mb-1">Order ID</label>
          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            disabled={loading}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateDelivery}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Creating...' : 'Create Delivery'}
        </button>
      </div>
    </div>
  );
};

export default CreateDelivery;