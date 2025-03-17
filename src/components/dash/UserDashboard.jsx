import {
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import ShowAllCars from '../../pages/ShowAllCars';
import Wallet from '../wallet/Wallet';
import Ubookings from '../../users/Ubookings';

const SCREEN_SIZES = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'cars', label: 'Cars', icon: FileText },
  { id: 'booking', label: 'Booking', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'wallet', label: 'Wallet', icon: Settings },
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
        ${isActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}
        ${isCollapsed ? 'justify-center' : 'justify-start'}
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`} />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Out</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to sign out? Your session will end and you'll need to sign in again.
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center space-x-3 mb-2">
      <Icon className="w-5 h-5 text-indigo-600" />
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

const ActivityItem = ({ icon: Icon, title, description, time }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <span className="text-sm text-gray-500">{time}</span>
  </div>
);

const HomeContent = ({ firstName }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {firstName}!</h2>
      <p className="text-gray-600">
        Here's what's happening with your account today.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard 
        icon={Calendar}
        title="Upcoming Bookings"
        value="3"
        subtitle="Next: Tomorrow at 2:00 PM"
      />
      <StatsCard 
        icon={MessageSquare}
        title="Unread Messages"
        value="5"
        subtitle="2 new since yesterday"
      />
      <StatsCard 
        icon={CreditCard}
        title="Next Payment"
        value="$149.99"
        subtitle="Due in 5 days"
      />
    </div>

    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-2">
        <ActivityItem 
          icon={Calendar}
          title="Car Booking Confirmed"
          description="Toyota Camry - 3 days"
          time="2 hours ago"
        />
        <ActivityItem 
          icon={CreditCard}
          title="Payment Processed"
          description="Booking #1234 - $149.99"
          time="Yesterday"
        />
        <ActivityItem 
          icon={MessageSquare}
          title="New Message"
          description="Support team responded to your inquiry"
          time="2 days ago"
        />
      </div>
    </div>
  </div>
);

const Header = ({ toggleSidebar, isSidebarOpen, isSidebarCollapsed, isMobile, fullName, setShowLogoutModal }) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between px-4 md:px-8 z-30">
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
      <h1 className="text-xl font-bold text-white">My Dashboard</h1>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center bg-white/10 rounded-lg">
        <input
          type="text"
          placeholder="Search..."
          className="w-48 lg:w-64 px-4 py-1.5 bg-transparent text-white placeholder-white/70 outline-none"
        />
        <button className="p-2 text-white/70 hover:text-white">
          <Search className="w-4 h-4" />
        </button>
      </div>

      <button className="relative p-2 text-white hover:bg-white/10 rounded-lg">
        <Bell className="w-5 h-5" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      </button>

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
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  </header>
);

const UserDashboard = () => {
  const [activeItem, setActiveItem] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < SCREEN_SIZES.lg);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const firstName = user?.firstName || 'Guest';

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(width);
      setIsMobile(width < SCREEN_SIZES.lg);
      
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
    if (screenSize < SCREEN_SIZES.lg) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'home':
        return <HomeContent firstName={firstName} />;
      case 'cars':
        return <ShowAllCars />;
      case 'booking':
        return <Ubookings />;
      case 'wallet':
        return <Wallet />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
            </h2>
            <p className="text-gray-600">
              This section is currently under development. Please check back later for updates.
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

export default UserDashboard;