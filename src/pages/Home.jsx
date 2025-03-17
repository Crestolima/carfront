import { AnimatePresence, motion } from 'framer-motion';
import { CarFront, Filter, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CarCard from '../components/cars/CarCard';
import api from '../services/api';
import LoginPromptModal from './LoginPromptModal';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  // Search filters
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    transmission: '',
    city: '',
    available: '',
    features: ''
  });

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cars');
      setCars(response.data);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add basic search term to make and model
      if (searchTerm) {
        params.append('make', searchTerm);
        params.append('model', searchTerm);
      }
      
      // Add all filters that have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      // Use the new search endpoint
      const response = await api.get(`/cars/search?${params.toString()}`);
      
      // Check if the response format includes the cars array
      setCars(response.data.cars || response.data);
    } catch (error) {
      console.error('Error searching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      make: '',
      model: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      transmission: '',
      city: '',
      available: '',
      features: ''
    });
    setSearchTerm('');
  };

  const handleCarSelect = () => {
    setShowLoginPrompt(true);
  };

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const filterVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero Section */}
      <motion.div 
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Find Your Perfect Drive
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto"
            >
              Experience luxury and comfort with our premium selection of vehicles.
              Book your dream car today.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-2">
                <div className="flex items-center">
                  <div className="flex-1 px-4">
                    <input
                      type="text"
                      placeholder="Search by make, model, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 outline-none text-gray-700"
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className="mx-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Filter className="w-5 h-5 text-blue-600" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </motion.button>
                </div>
                
                {/* Advanced Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      variants={filterVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="mt-3 px-4 pb-3 pt-2 border-t"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700">Advanced Filters</h3>
                        <button 
                          onClick={clearFilters}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear All
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Make</label>
                          <input
                            type="text"
                            name="make"
                            value={filters.make}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Toyota"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Model</label>
                          <input
                            type="text"
                            name="model"
                            value={filters.model}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Camry"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Type</label>
                          <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value="">Any Type</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Coupe">Coupe</option>
                            <option value="Truck">Truck</option>
                            <option value="Van">Van</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Min Price</label>
                          <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="Min $"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Max Price</label>
                          <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="Max $"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Transmission</label>
                          <select
                            name="transmission"
                            value={filters.transmission}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value="">Any</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="e.g. New York"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Availability</label>
                          <select
                            name="available"
                            value={filters.available}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            <option value="">Any</option>
                            <option value="true">Available</option>
                            <option value="false">Not Available</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Features</label>
                          <input
                            type="text"
                            name="features"
                            value={filters.features}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="GPS, Bluetooth (comma separated)"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            {/* Auth Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Register
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Cars Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900"
          >
            Featured Cars
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            
          </motion.div>
        </div>

        {loading ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <motion.div 
                key={n} 
                variants={itemVariants}
                className="bg-gray-200 rounded-xl h-72" 
              />
            ))}
          </motion.div>
        ) : (
          <>
            {cars.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <h3 className="text-xl text-gray-600 mb-4">No cars found matching your search criteria</h3>
                <button 
                  onClick={loadCars}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  View All Cars
                </button>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence>
                  {cars.map((car) => (
                    <motion.div
                      key={car._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <CarCard
                        car={car}
                        onSelect={handleCarSelect}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Why Choose Us?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Experience the best car rental service with our premium features
              and customer support.
            </motion.p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <CarFront className="w-8 h-8" />,
                title: "Wide Selection",
                description: "Choose from our vast collection of premium vehicles"
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Easy Booking",
                description: "Simple and fast booking process with instant confirmation"
              },
              {
                icon: <Filter className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Round-the-clock customer support for your peace of mind"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Login Prompt Modal */}
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
      />
    </motion.div>
  );
};

export default Home;