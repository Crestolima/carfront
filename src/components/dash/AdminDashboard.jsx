import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Car,
  Calendar,
  DollarSign,
  Settings,
  User,
  LogOut,
  Search,
  Menu,
  X,
  ChevronRight,
  Users as UsersIcon,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CarDetails from '../../pages/CarDetails';
import Users from '../../pages/Users';
import Wallet from '../wallet/Wallet';
import AllBookings from '../admin/AllBookings';
import AdashContent from '../admin/AdashContent';

const SCREEN_SIZES = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'wallet', label: 'Wallets', icon: Settings },
];

const SidebarItem = ({ item, isActive, isCollapsed, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200
        ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
        ${isCollapsed ? 'justify-center' : 'justify-start'}
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
      {!isCollapsed && (
        <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>
      )}
      {isCollapsed && isHovered && (
        <div className="absolute left-16 bg-white px-4 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap">
          {item.label}
        </div>
      )}
    </button>
  );
};

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to logout? You will need to login again to access your account.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, items }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          {item.status ? (
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 bg-${item.status}-500 rounded-full`} />
              <span className="text-gray-600">{item.label}</span>
            </div>
          ) : (
            <>
              <span className="text-gray-600">{item.label}</span>
              <span className={item.valueColor || 'text-gray-900 font-semibold'}>
                {item.value}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);

const Header = ({ 
  toggleSidebar, 
  isSidebarOpen, 
  isSidebarCollapsed, 
  isMobile, 
  fullName, 
  setShowLogoutModal,
  searchQuery,
  setSearchQuery,
  handleSearch
}) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between px-4 md:px-8 z-30">
    <div className="flex items-center">
      <button
        onClick={toggleSidebar}
        className="mr-4 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
        aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isMobile ? (
          isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />
        ) : (
          <ChevronRight className={`w-5 h-5 transform transition-transform ${
            !isSidebarCollapsed ? 'rotate-180' : ''
          }`} />
        )}
      </button>
      <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center bg-white/10 rounded-lg">
        <input
          type="text"
          placeholder="Search users..."
          className="w-48 lg:w-64 px-4 py-1.5 bg-transparent text-white placeholder-white/70 outline-none"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Trigger search immediately when typing
            handleSearch(e.target.value);
          }}
        />
        <button 
          className="p-2 text-white/70 hover:text-white" 
          aria-label="Search"
          onClick={() => handleSearch(searchQuery)}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-2 text-white">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <span className="hidden sm:inline">{fullName}</span>
      </div>
      
      <button 
        onClick={() => setShowLogoutModal(true)}
        className="flex items-center space-x-2 text-white hover:opacity-80"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  </header>
);

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < SCREEN_SIZES.lg);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const firstName = user?.firstName || 'Admin';

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(width);
      setIsMobile(width < SCREEN_SIZES.lg);
      
      // Auto collapse sidebar based on screen size
      if (width < SCREEN_SIZES.xl && width >= SCREEN_SIZES.lg) {
        setIsSidebarCollapsed(true);
        setIsSidebarOpen(true);
      } else if (width >= SCREEN_SIZES.xl) {
        setIsSidebarCollapsed(false);
        setIsSidebarOpen(true);
      } else if (width < SCREEN_SIZES.lg) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleSidebarItemClick = (itemId) => {
    setActiveItem(itemId);
    // Clear search when changing sections
    if (itemId !== 'users') {
      setSearchQuery('');
      setUserSearchTerm('');
    }
    if (screenSize < SCREEN_SIZES.lg) {
      setIsSidebarOpen(false);
    }
  };

  // Modified to accept a direct search term parameter
  const handleSearch = (term) => {
    const searchTerm = term || searchQuery.trim();
    if (searchTerm) {
      // Set the active item to users and store the search term
      setActiveItem('users');
      setUserSearchTerm(searchTerm);
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'cars':
        return <CarDetails />;
      case 'users':
        return <Users searchTerm={userSearchTerm} />;
      case 'bookings':
        return <AllBookings />;
      case 'wallet':
        return <Wallet />;
      case 'dashboard':
        return <AdashContent />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
            </h2>
            <p className="text-gray-600">
              This section is under development. Please check back later.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Header 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        fullName={fullName}
        setShowLogoutModal={setShowLogoutModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <div className="flex w-full pt-16">
        {/* Sidebar */}
        <aside 
          className={`fixed lg:static top-16 bottom-0 bg-white border-r border-gray-100 
            transform transition-all duration-300 ease-in-out z-20 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
            lg:translate-x-0`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                isCollapsed={isSidebarCollapsed}
                onClick={() => handleSidebarItemClick(item.id)}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 lg:hidden z-10"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 
            ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-0'}`}
        >
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;