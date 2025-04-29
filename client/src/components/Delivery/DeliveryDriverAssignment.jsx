import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const DeliveryDriverAssignment = ({ deliveryId, onAssignSuccess }) => {
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNearbyDrivers();
  }, [deliveryId]);

  const fetchNearbyDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5005/api/deliveries/${deliveryId}/nearby-drivers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableDrivers(response.data.availableDrivers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch nearby drivers');
      toast.error('Could not load available drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (driverId) => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5005/api/deliveries/${deliveryId}/assign`,
        { driverId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      toast.success('Driver assigned successfully');
      onAssignSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !availableDrivers.length) {
    return <div className="text-center p-4">Loading available drivers...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
        <button 
          onClick={fetchNearbyDrivers}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Available Drivers</h3>
      {availableDrivers.length === 0 ? (
        <p className="text-gray-500 text-center">No drivers available at the moment</p>
      ) : (
        <div className="space-y-4">
          {availableDrivers.map((driver) => (
            <div 
              key={driver.driverId}
              className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium">{driver.name}</h4>
                <div className="text-sm text-gray-600">
                  <p>Distance: {driver.distance} km away</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAssignDriver(driver.driverId)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg ${
                    loading 
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? 'Assigning...' : 'Assign Driver'}
                </button>
                <Link
                  to={`/location-tracker/${deliveryId}`}
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                >
                  Track Location
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDriverAssignment;