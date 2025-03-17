import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const AddCarModal = ({ open, onClose, onSubmit, editMode, initialData }) => {
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    year: "",
    type: "",
    transmission: "",
    pricePerDay: "",
    available: true,
    images: [],
    features: [],
    location: {
      city: "",
      address: "",
      coordinates: {
        latitude: "",
        longitude: ""
      }
    }
  });
  const [feature, setFeature] = useState("");

  useEffect(() => {
    if (initialData) {
      setCarData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData((prev) => {
      const keys = name.split(".");
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCoordinatesChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [name]: value
        }
      }
    }));
  };

  const handleFeatureAdd = () => {
    if (feature.trim()) {
      setCarData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
      setFeature("");
    }
  };

  const handleFeatureRemove = (indexToRemove) => {
    setCarData(prev => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) toast.error(`${file.name} is not a valid image type`);
      if (!isValidSize) toast.error(`${file.name} is too large (max 5MB)`);
      return isValidType && isValidSize;
    });

    setCarData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const handleImageRemove = (indexToRemove) => {
    setCarData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {editMode ? "Edit Car" : "Add New Car"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Make</label>
            <input
              type="text"
              name="make"
              value={carData.make}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              name="model"
              value={carData.model}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              name="year"
              value={carData.year}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              name="type"
              value={carData.type}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transmission</label>
            <select
              name="transmission"
              value={carData.transmission}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price per Day</label>
            <input
              type="number"
              name="pricePerDay"
              value={carData.pricePerDay}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="location.city"
              value={carData.location.city}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="location.address"
              value={carData.location.address}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              name="latitude"
              value={carData.location.coordinates.latitude}
              onChange={handleCoordinatesChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              name="longitude"
              value={carData.location.coordinates.longitude}
              onChange={handleCoordinatesChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Features</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
                placeholder="Add a feature"
              />
              <button
                onClick={handleFeatureAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {carData.features.map((feat, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center"
                >
                  {feat}
                  <button
                    onClick={() => handleFeatureRemove(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 w-full"
            />
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {carData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image instanceof File ? URL.createObjectURL(image) : image}
                    alt={`Car ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={carData.available}
                onChange={(e) => setCarData(prev => ({ ...prev, available: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Available for Rent</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(carData)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editMode ? "Update Car" : "Add Car"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCarModal; 