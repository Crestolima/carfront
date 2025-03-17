import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, X, Car, Clock, Wallet, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const BookingModal = ({ isOpen, onClose, carId }) => {
  const modalRef = useRef();
  const { user, walletBalance, fetchWalletBalance } = useAuth();
  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!carId || !isOpen) return;
  
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/cars/${carId}`);
        setCar(data);
      } catch (error) {
        console.error('Error fetching car details:', error);
        toast.error('Error loading car details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCarDetails();
  }, [carId, isOpen]);

  useEffect(() => {
    if (car && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
      setTotalPrice(days * car.pricePerDay);
    }
  }, [car, startDate, endDate]);

  const handleBooking = async () => {
    if (!startDate || !endDate || !pickupLocation || !dropoffLocation) {
      toast.warning('Please fill all required fields.');
      return;
    }

    if (walletBalance < totalPrice) {
      toast.error('Insufficient wallet balance. Please recharge.');
      return;
    }

    setProcessing(true);
    try {
      // First create the booking
      const bookingResponse = await api.post('/bookings', {
        user: user._id,
        car: carId,
        startDate,
        endDate,
        pickupLocation,
        dropoffLocation,
        totalPrice,
        status: 'pending'
      });

      // If booking successful, process payment
      if (bookingResponse.data?.booking) {
        try {
          // Call the processPayment endpoint instead of transactions
          const paymentResponse = await api.post(`/bookings/${bookingResponse.data.booking._id}/payment`, {
            user: user._id
          });

          if (paymentResponse.data) {
            // Update the local wallet balance with the new balance from response
            await fetchWalletBalance(user._id);
            toast.success('Booking successful!');
            onClose();
          }
        } catch (paymentError) {
          console.error('Payment error details:', {
            error: paymentError,
            response: paymentError.response?.data
          });

          const errorMessage = paymentError.response?.data?.message ||
            'Booking created but payment processing failed. Please contact support.';
          toast.error(errorMessage);

          // Consider reverting the booking status here if the payment fails
          try {
            await api.patch(`/bookings/${bookingResponse.data.booking._id}`, { status: 'failed' });
            console.log("Booking status updated to 'failed' due to payment failure.");
          } catch (revertError) {
            console.error("Failed to revert booking status:", revertError);
          }
        }
      } else {
        console.error('Booking creation failed:', bookingResponse.data);
        toast.error(bookingResponse.data?.message || 'Booking creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error details:', {
        error,
        response: error.response?.data
      });

      const errorMessage = error.response?.data?.message ||
        'Error processing booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return startDate >= today && endDate >= startDate;
  };

  const ProgressBar = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
            ${step >= stepNumber ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
            {stepNumber}
          </div>
          {stepNumber < 3 && (
            <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const Input = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <ProgressBar />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Dates</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <Input
              icon={Calendar}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <Input
              icon={Calendar}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <button
        className="w-full py-3 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 
          transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={() => startDate && endDate && validateDates(startDate, endDate) && setStep(2)}
        disabled={!startDate || !endDate || !validateDates(startDate, endDate)}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <ProgressBar />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
            <Input
              icon={MapPin}
              type="text"
              placeholder="Enter pickup location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
            <Input
              icon={MapPin}
              type="text"
              placeholder="Enter dropoff location"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="flex-1 py-3 px-4 rounded-lg text-blue-600 font-medium border border-blue-600 
            hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
          onClick={() => setStep(1)}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          className="flex-1 py-3 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 
            transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={() => pickupLocation && dropoffLocation && setStep(3)}
          disabled={!pickupLocation || !dropoffLocation}
        >
          Review <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <ProgressBar />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
        
        {car && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Car className="w-5 h-5" />
              <span className="font-medium">{car.make} {car.model} ({car.year})</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span>{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5" />
              <div className="flex flex-col">
                <span>From: {pickupLocation}</span>
                <span>To: {dropoffLocation}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">Total Price</span>
            </div>
            <span className="text-xl font-semibold text-blue-600">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Wallet Balance</span>
            <span className="text-xl font-semibold text-gray-900">${walletBalance.toFixed(2)}</span>
          </div>
          {walletBalance < totalPrice && (
            <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
              <span className="text-red-500 text-sm">
                Insufficient balance. Please recharge your wallet.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="flex-1 py-3 px-4 rounded-lg text-blue-600 font-medium border border-blue-600 
            hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
          onClick={() => setStep(2)}
          disabled={processing}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          className="flex-1 py-3 px-4 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 
            transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleBooking}
          disabled={walletBalance < totalPrice || processing}
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-md relative shadow-xl transform transition-all"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Book Your Car</h2>
          {car && (
            <p className="text-sm text-gray-600 mt-1">
              {car.make} {car.model} - {car.year}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;