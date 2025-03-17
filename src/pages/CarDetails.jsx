import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import AddCarModal from "./AddCarModal";

const CarDetails = () => {
  const [cars, setCars] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await api.get("/cars");
      setCars(response.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Error fetching cars");
    }
  };

  const handleSubmit = async (carData) => {
    try {
      const formData = new FormData();
      
      // Append basic car data
      Object.keys(carData).forEach((key) => {
        if (key !== "images" && key !== "features" && key !== "location") {
          formData.append(key, carData[key]);
        }
      });

      // Append location and features as JSON strings
      formData.append("location", JSON.stringify(carData.location));
      formData.append("features", JSON.stringify(carData.features));
      
      // Append images
      carData.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });

      const config = {
        headers: { 
          "Content-Type": "multipart/form-data",
          // Add any auth headers if needed
          // "Authorization": `Bearer ${token}`
        }
      };

      if (editMode && selectedCar?._id) {
        await api.put(`/cars/${selectedCar._id}`, formData, config);
        toast.success("Car updated successfully");
      } else {
        await api.post("/cars", formData, config);
        toast.success("Car added successfully");
      }
      
      handleClose();
      fetchCars();
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error(error.response?.data?.message || "Error saving car");
    }
  };

  const handleEdit = (car) => {
    setSelectedCar(car);
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await api.delete(`/cars/${id}`);
        toast.success("Car deleted successfully");
        fetchCars();
      } catch (error) {
        console.error("Error deleting car:", error);
        toast.error("Error deleting car");
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedCar(null);
  };

  return (
    <div className="w-full p-4 md:p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Car Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={() => setOpen(true)}
        >
          Add Car
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cars.map((car) => (
              <tr key={car._id} className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">{car.make}</td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">{car.model}</td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">{car.year}</td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">{car.type}</td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">${car.pricePerDay}/day</td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {car.available ? "Available" : "Not Available"}
                  </span>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">{car.location.city}</td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(car)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car._id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No cars found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <AddCarModal
    open={open}
    onClose={handleClose}
    onSubmit={handleSubmit}
    editMode={editMode}
    initialData={selectedCar}
  />
</div>
);
};

export default CarDetails;