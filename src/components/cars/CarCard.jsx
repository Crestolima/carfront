import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, ChevronLeft, ChevronRight, Clock, Fuel, Gauge, MapPin 
} from 'lucide-react';

const CarCard = ({ car, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorImages, setErrorImages] = useState(new Set());

  const locationString = useMemo(() => 
    typeof car.location === 'string' 
      ? car.location 
      : car.location?.address || car.location?.city || 'Unknown Location',
    [car.location]
  );

  const availabilityClass = useMemo(() => {
    if (!car.available) return 'bg-red-50 text-red-700 border border-red-200';
    const typeColors = {
      'Luxury': 'bg-purple-50 text-purple-700 border border-purple-200',
      'SUV': 'bg-green-50 text-green-700 border border-green-200',
      'Compact': 'bg-blue-50 text-blue-700 border border-blue-200'
    };
    return typeColors[car.type] || 'bg-green-50 text-green-700 border border-green-200';
  }, [car.available, car.type]);

  const handleImageNavigation = useCallback((direction) => (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => 
      direction === 'next' 
        ? (prev === car.images.length - 1 ? 0 : prev + 1)
        : (prev === 0 ? car.images.length - 1 : prev - 1)
    );
  }, [car.images.length]);

  const handleImageError = useCallback((index) => {
    setErrorImages(prev => new Set(prev.add(index)));
  }, []);

  const carDetailsConfig = useMemo(() => [
    { 
      icon: Gauge, 
      label: 'Mileage', 
      value: car.mileage ? `${car.mileage} miles` : 'Unavailable' 
    },
    { 
      icon: Clock, 
      label: 'Transmission', 
      value: car.transmission 
    },
    ...(car.fuelType ? [{ 
      icon: Fuel, 
      label: 'Fuel Type', 
      value: car.fuelType, 
      fullWidth: true 
    }] : [])
  ], [car.mileage, car.transmission, car.fuelType]);

  const renderCarImage = () => {
    if (!car.images?.length || errorImages.size === car.images.length) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
          <Car className="w-16 h-16 text-gray-400" />
          <span className="ml-4 text-lg font-medium">Image Unavailable</span>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full group">
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={car.images[currentIndex]}
          alt={`${car.name} ${car.model}`}
          className="w-full h-full object-cover"
          onError={() => handleImageError(currentIndex)}
        />
        {car.images.length > 1 && (
          <>
            {['prev', 'next'].map(direction => (
              <motion.button
                key={direction}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleImageNavigation(direction)}
                className={`absolute ${direction === 'prev' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 bg-white/80 p-2.5 rounded-full shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100`}
              >
                {direction === 'prev' ? <ChevronLeft className="w-6 h-6 text-gray-800" /> : <ChevronRight className="w-6 h-6 text-gray-800" />}
              </motion.button>
            ))}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {car.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentIndex === index ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <div className="relative h-64">
        {renderCarImage()}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${availabilityClass}`}>
            {car.available ? (car.type || 'Available') : 'Not Available'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            {car.make} {car.model}
          </motion.h3>
          <p className="text-gray-600 mt-1 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{car.year} • {locationString}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {carDetailsConfig.map(({ icon: Icon, label, value, fullWidth }) => (
            <div 
              key={label} 
              className={`flex items-center space-x-3 bg-gray-50 p-3.5 rounded-2xl ${fullWidth ? 'col-span-2' : ''}`}
            >
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Daily Rate</p>
            <p className="text-3xl font-bold text-blue-600 tracking-tight">
              ${car.pricePerDay}<span className="text-xl font-medium text-gray-600">/day</span>
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-7 py-3.5 text-white font-medium rounded-xl transition-colors ${
              car.available 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (car.available) onSelect();
            }}
            disabled={!car.available}
          >
            {car.available ? 'View Details' : 'Unavailable'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(CarCard);