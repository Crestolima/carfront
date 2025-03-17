import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/common/Footer";
import { AuthProvider } from "./context/AuthContext";
import CarDetails from "./pages/CarDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./components/dash/AdminDashboard";
import UserDashboard from "./components/dash/UserDashboard";
import Wallet from "./components/wallet/Wallet";
import ShowAllCars from "./pages/ShowAllCars";
import Users from "./pages/Users";
import BookingPage from "./pages/BookingPage";
import Ubookings from "./users/Ubookings";
import AllBookings from "./components/admin/AllBookings";
import AdashContent from "./components/admin/AdashContent";

const App = () => {
  const location = useLocation();
  const showFooter = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            <Route path="/car-details" element={<CarDetails />} />
            <Route path="/users" element={<Users />} />
            <Route path="/show-cars" element={<ShowAllCars />} />

            <Route path="/booking/:carId/:userId" element={<BookingPage />} />
            <Route path="/ubook" element={<Ubookings />} />

            <Route path="/wallet" element={<Wallet />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}

            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/allbooks" element={<AllBookings />} />
            <Route path="/adash" element={<AdashContent />} />
          </Routes>
        </main>
        {showFooter && <Footer />}
      </div>
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
