import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  Star
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import 'react-toastify/dist/ReactToastify.css';
import BookingPage from './BookingPage';

// Rating Stars Component
const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
        />
      ))}
      {hasHalfStar && (
        <Star
          key="half"
          className="w-4 h-4 text-yellow-400 fill-current"
        />
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
        />
      ))}
    </div>
  );
};

const ShowAllCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Fetch cars with their reviews
        const response = await api.get('/cars');
        // For each car, fetch its reviews
        const carsWithReviews = await Promise.all(
          response.data.map(async (car) => {
            try {
              const reviewsResponse = await api.get(`/reviews/car/${car._id}`);
              return {
                ...car,
                averageRating: reviewsResponse.data.averageRating,
                totalReviews: reviewsResponse.data.totalReviews
              };
            } catch (error) {
              console.error(`Error fetching reviews for car ${car._id}:`, error);
              return {
                ...car,
                averageRating: 0,
                totalReviews: 0
              };
            }
          })
        );
        setCars(carsWithReviews);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your Cars...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Cars</h2>
        <p className="text-gray-600">Browse our selection of premium vehicles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car._id} className="relative">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{car.make} {car.model}</h3>
                <p className="text-sm text-gray-500">{car.year} • {car.type}</p>
                
                {/* Rating Section */}
                <div className="mt-2 flex items-center gap-2">
                  <RatingStars rating={car.averageRating || 0} />
                  <span className="text-sm text-gray-600">
                    ({car.totalReviews || 0} {car.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                  car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {car.available ? 'Available' : 'Not Available'}
                </span>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Gauge className="w-4 h-4 mr-2" />
                    <span>{car.mileage || 'Mileage info unavailable'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{car.transmission}</span>
                  </div>
                  {car.fuelType && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{car.fuelType}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Daily Rate</span>
                    <p className="text-lg font-semibold text-indigo-600">${car.pricePerDay}/day</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!car.available}
                    onClick={() => {
                      setSelectedCarId(car._id);
                      setIsBookingModalOpen(true);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BookingPage
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedCarId(null);
        }}
        carId={selectedCarId}
      />
    </div>
  );
};

export default ShowAllCars;