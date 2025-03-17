import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import ReviewModal from '../pages/ReviewModal';

const STATUS_STYLES = {
    completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: 'M5 13l4 4L19 7'
    },
    cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
};

const FILTER_OPTIONS = ['all', 'completed', 'cancelled'];

const Ubookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await api.get(`/bookings/${user._id}`);
            
            // Fetch review status for completed bookings
            const bookingsWithReviewStatus = await Promise.all(
                response.data.map(async (booking) => {
                    if (booking.status === 'completed') {
                        try {
                            const reviewResponse = await api.get(`/reviews/booking/${booking._id}`);
                            return {
                                ...booking,
                                hasReview: reviewResponse.data.exists || false
                            };
                        } catch (error) {
                            console.error(`Error fetching review status for booking ${booking._id}:`, error);
                            return {
                                ...booking,
                                hasReview: false
                            };
                        }
                    }
                    return booking;
                })
            );

            setBookings(bookingsWithReviewStatus);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await api.post(`/bookings/${bookingId}/cancel`);
            setBookings(prevBookings => 
                prevBookings.map(booking => 
                    booking._id === bookingId 
                        ? { ...booking, status: 'cancelled' } 
                        : booking
                )
            );
            toast.success('Booking cancelled successfully. Refund has been processed.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error cancelling booking');
        }
    };

    const handleReviewSubmit = async (bookingId) => {
        try {
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking._id === bookingId
                        ? { ...booking, hasReview: true }
                        : booking
                )
            );
            setIsReviewModalOpen(false);
            setSelectedBooking(null);
            toast.success('Review submitted successfully');
        } catch (error) {
            toast.error('Failed to submit review');
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Date not available';
        }
    };

    const formatPrice = (price) => {
        try {
            return `$${Number(price).toFixed(2)}`;
        } catch {
            return 'Price not available';
        }
    };

    const calculateRentalDuration = (startDate, endDate) => {
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const renderBookingCard = (booking) => {
        const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.default;
        const daysRented = calculateRentalDuration(booking.startDate, booking.endDate);
        
        return (
            <div key={booking._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                    {booking.car?.mainImage && (
                        <>
                            <img 
                                src={booking.car.mainImage}
                                alt={booking.car?.model || 'Vehicle'} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </>
                    )}
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {booking.car?.model || 'Vehicle not specified'}
                            </h2>
                            <div 
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                            >
                                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d={statusStyle.icon} />
                                </svg>
                                <span>{booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}</span>
                            </div>
                        </div>
                        {booking.car?.type && (
                            <p className="text-sm text-gray-200 mt-1">
                                {booking.car.type} • {booking.car.transmission}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">Trip Details</h3>
                            <div className="space-y-4">
                                <DateDisplay label="Start Date" date={formatDate(booking.startDate)} />
                                <DateDisplay label="End Date" date={formatDate(booking.endDate)} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">Location Details</h3>
                            <div className="space-y-4">
                                <LocationDisplay label="Pickup Location" location={booking.pickupLocation} />
                                <LocationDisplay label="Dropoff Location" location={booking.dropoffLocation} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Rental Charge</span>
                            <span className="font-medium text-gray-800">
                                {daysRented} day{daysRented !== 1 ? 's' : ''}
                                {booking.car?.pricePerDay && ` @ ${formatPrice(booking.car.pricePerDay)}/day`}
                            </span>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 rounded-lg">
                            <span className="text-xs text-gray-500 block">Total price</span>
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-800">
                                    {formatPrice(booking.totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cancel button for active bookings */}
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button 
                            className="mt-6 w-full py-2 px-4 bg-red-400 hover:bg-red-600 text-white rounded-lg transition-colors"
                            onClick={() => handleCancelBooking(booking._id)}
                        >
                            Cancel Booking
                        </button>
                    )}

                    {/* Review section for completed bookings */}
                    {booking.status === 'completed' && (
                        <div className="mt-4 text-center">
                            {booking.hasReview ? (
                                <div className="py-2 px-4 bg-green-50 text-green-700 rounded-lg">
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Review submitted
                                    </span>
                                </div>
                            ) : (
                                <button
                                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                    onClick={() => {
                                        setSelectedBooking(booking);
                                        setIsReviewModalOpen(true);
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Write a Review
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading your bookings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md max-w-lg" role="alert">
                    <p className="font-bold">Unable to load bookings</p>
                    <p className="mt-2">{error}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const filteredBookings = activeFilter === 'all' 
        ? bookings 
        : bookings.filter(booking => booking.status === activeFilter);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {FILTER_OPTIONS.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full transition-colors ${
                                activeFilter === filter 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {filter === 'all' ? 'All Bookings' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            <span className="ml-1 text-xs">
                                ({bookings.filter(b => filter === 'all' ? true : b.status === filter).length})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center bg-gray-50 rounded-xl p-16 shadow-sm">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-700">
                        No {activeFilter !== 'all' ? activeFilter : ''} bookings found
                    </h3>
                    <p className="mt-2 text-gray-500">
                        {activeFilter !== 'all' 
                            ? `You don't have any ${activeFilter} bookings at the moment.` 
                            : "You haven't made any bookings yet. Start by exploring available vehicles."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredBookings.map(renderBookingCard)}
                </div>
            )}

            {/* Review Modal */}
            {selectedBooking && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    onReviewSubmitted={() => handleReviewSubmit(selectedBooking._id)}
                />
            )}
        </div>
    );
};

// Utility Components
const DateDisplay = ({ label, date }) => (
    <div className="flex items-start space-x-3">
        <div className="bg-blue-50 p-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <div>
            <p className="font-medium text-gray-700">{label}</p>
            <p className="text-gray-600">{date}</p>
        </div>
    </div>
);

const LocationDisplay = ({ label, location }) => (
    <div className="flex items-start space-x-3">
        <div className="bg-green-50 p-2 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
        <div>
            <p className="font-medium text-gray-700">{label}</p>
            <p className="text-gray-600">{location}</p>
        </div>
    </div>
);

export default Ubookings;