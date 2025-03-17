import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import api from '../services/api';
import AddUserForm from '../components/admin/AddUserForm';
import EditUserForm from '../components/admin/EditUserForm';

const Users = ({ searchTerm = '' }) => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Set search query when searchTerm prop changes
  useEffect(() => {
    if (searchTerm) {
      setSearchQuery(searchTerm);
      setPage(1); // Reset to first page when search term changes
    }
  }, [searchTerm]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [page, limit, sortField, sortDirection, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit,
        sort: `${sortField}:${sortDirection}`,
      });
      
      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }
      
      const response = await api.get(`/auth/users/search?${params.toString()}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination.pages);
      setTotalUsers(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortDirection(current => {
      if (sortField === field) {
        return current === 'asc' ? 'desc' : 'asc';
      }
      return 'asc';
    });
    setSortField(field);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/users/${userId}`);
        fetchUsers(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleEditUser = (userId) => {
    setCurrentUserId(userId);
    setIsEditUserModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditUserModalOpen(false);
    setCurrentUserId(null);
  };

  // Handler for when a new user is added
  const handleUserAdded = (newUser) => {
    fetchUsers(); // Refresh the list to include the new user
  };

  // Handler for when a user is updated
  const handleUserUpdated = (updatedUser) => {
    fetchUsers(); // Refresh the list to show updated user data
  };

  // Search handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalUsers > 0 ? `${totalUsers} users found` : 'No users found'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row mt-4 md:mt-0 gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            
            {searchQuery && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                
              </button>
            )}
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
            
            </button>
          </form>
          <button 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleAddUser}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <AddUserForm 
          onClose={handleCloseAddModal} 
          onUserAdded={handleUserAdded}
        />
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && currentUserId && (
        <EditUserForm 
          userId={currentUserId}
          onClose={handleCloseEditModal} 
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('firstName')}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer"
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon field="firstName" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hidden md:table-cell"
                  >
                    <div className="flex items-center">
                      Email
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden lg:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden lg:table-cell">License</th>
                  <th 
                    onClick={() => handleSort('createdAt')}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hidden md:table-cell"
                  >
                    <div className="flex items-center">
                      Created
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="w-8 p-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                          {user.firstName?.[0] || '?'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{user.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{user.drivingLicense}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit user"
                          onClick={() => handleEditUser(user._id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-sm text-gray-500">
                  {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={goToPrevPage}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1 ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={page === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === totalPages ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, totalUsers)}
                  </span>{' '}
                  of <span className="font-medium">{totalUsers}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={goToPrevPage}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  
                  {/* Page numbers would go here */}
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronUp className="h-5 w-5 rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;