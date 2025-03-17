import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  ArrowUp,
  ArrowDown,
  Users,
  Calendar,
  DollarSign,
  Star,
  Activity,
} from "lucide-react";

const CustomCard = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl transition-shadow shadow-sm border border-gray-100 ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, description }) => (
  <CustomCard className="transition-all duration-300 hover:shadow-md">
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {change !== undefined && (
              <span className={`text-sm font-medium ${change >= 0 ? "text-emerald-600" : "text-indigo-600"}`}>
                {change > 0 ? `+${change}` : change}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${
            change >= 0 ? "bg-emerald-50" : "bg-indigo-50"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${
              change >= 0 ? "text-emerald-600" : "text-indigo-600"
            }`}
          />
        </div>
      </div>
    </div>
  </CustomCard>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-500 animate-pulse">Loading dashboard data...</p>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <Activity className="h-5 w-5 text-rose-400" />
      </div>
      <p className="text-sm font-medium text-rose-800">{message}</p>
    </div>
  </div>
);

const defaultStats = {
  total: "0",
  change: 0,
  description: "No data available",
};

const initialData = {
  stats: {
    users: { ...defaultStats },
    bookings: { ...defaultStats },
    revenue: { ...defaultStats },
    rating: { ...defaultStats },
  },
  ratings: {
    averageRating: 0,
    totalReviews: 0
  }
};

const AdashContent = () => {
  const [dashboardData, setDashboardData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await api.get("/dashboard/stats");
        
        // Fetch overall ratings
        const ratingsResponse = await api.get("/reviews/stats");
        
        // Merge the API responses with default values
        setDashboardData({
          stats: {
            ...initialData.stats,
            ...(statsResponse.data?.stats || {}),
            // Update the rating stat with data from the ratings endpoint
            rating: {
              total: ratingsResponse.data?.overall?.averageRating?.toString() || "0",
              change: 0, // You might calculate this if you have historical data
              description: `Based on ${ratingsResponse.data?.overall?.totalReviews || 0} reviews`
            }
          },
          ratings: ratingsResponse.data?.overall || initialData.ratings
        });
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const { stats, ratings } = dashboardData;

  const statCards = [
    { key: "users", title: "Total Users", icon: Users },
    { key: "bookings", title: "Total Bookings", icon: Calendar },
    { key: "revenue", title: "Total Revenue", icon: DollarSign },
    { 
      key: "rating", 
      title: "Average Rating", 
      icon: Star,
      value: ratings.averageRating.toFixed(1),
      description: `From ${ratings.totalReviews} reviews` 
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ key, title, icon, value, description }) => (
          <StatCard
            key={key}
            title={title}
            value={value || stats[key]?.total || defaultStats.total}
            change={stats[key]?.change || defaultStats.change}
            icon={icon}
            description={description || stats[key]?.description || defaultStats.description}
          />
        ))}
      </div>
    </div>
  );
};

export default AdashContent;