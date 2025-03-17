import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, MapPin, Car, User } from 'lucide-react';
import api from '../../services/api';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const response = await api.get('/bookings/admin/all');
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
        setLoading(false);
        console.error('Error fetching bookings:', err);
      }
    };

    fetchAllBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
        <select
          className="px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredBookings.map((booking) => (
          <div 
            key={booking._id} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
          >
            <div className="grid md:grid-cols-3 gap-6 p-6">
              {/* Car Information */}
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={booking.car.images[0]}
                    alt={`${booking.car?.make} ${booking.car?.model}`}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-lg text-white">
                        {booking.car?.make} {booking.car?.model}
                      </h3>
                      <p className="text-white/90 text-sm">{booking.car?.year}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 items-center">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                    <Car className="w-4 h-4" />
                    {booking.car?.type}
                  </span>
                  <span className="bg-gray-50 px-3 py-1 rounded-full">
                    {booking.car?.transmission}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Booking Details</h4>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium
                    ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">
                        Pickup: <span className="font-medium text-gray-900">{new Date(booking.startDate).toLocaleDateString()}</span>
                      </p>
                      <p className="text-gray-600">
                        Return: <span className="font-medium text-gray-900">{new Date(booking.endDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">
                        From: <span className="font-medium text-gray-900">{booking.pickupLocation}</span>
                      </p>
                      <p className="text-gray-600">
                        To: <span className="font-medium text-gray-900">{booking.dropoffLocation}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-lg font-semibold text-blue-600">
                      ${booking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 p-2 rounded-full">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                      <p className="text-gray-600 text-sm">{booking.user?.email}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm pl-12">
                    <p className="text-gray-600">
                      Phone: <span className="font-medium text-gray-900">{booking.user?.phoneNumber}</span>
                    </p>
                    <p className="text-gray-600">
                      License: <span className="font-medium text-gray-900">{booking.user?.drivingLicense}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllBookings;