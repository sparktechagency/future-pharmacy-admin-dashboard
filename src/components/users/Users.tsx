"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ban, Calendar, CheckCircle, Clock, Mail, Phone, Search, Shield, Smartphone, User, XCircle } from 'lucide-react';
import Image from 'next/image';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllUsersQuery, useUpdateBlockAndUnblockMutation, useViewUserDetailsQuery } from "../../features/users/usersApi";
import { baseURL } from '../../utils/BaseURL';
import { Button } from '../ui/button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface InputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  name?: string;
}

interface LabelProps {
  children: ReactNode;
  className?: string;
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'active' | 'inactive' | 'admin' | 'user';
}

interface User {
  _id: string;
  profile: string;
  first_name?: string;
  last_name?: string;
  fullName?: string;
  email: string;
  role: string;
  isActive: boolean;
  phone: string;
  twoStepVerification: boolean;
  createdAt: string;
  updatedAt: string;
  gender?: string;
  dateOfBirth?: string;
  subscriptionId?: string | null;
  isStripeConnectedAccount?: boolean;
  userDeviceId?: string | null;
  isDeleted?: boolean;
  isSubscriberUser?: boolean;
}

// Dialog Components with Animation
const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }: DialogContentProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl animate-in zoom-in-95 fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
};

const UserDetailsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="ml-auto flex gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-8">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Input Component
const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
};

// Label Component
const Label = ({ children, className = '' }: LabelProps) => {
  return (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
      {children}
    </label>
  );
};

// Badge Component
const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const variants = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-red-100 text-red-700',
    admin: 'bg-purple-100 text-purple-700',
    user: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-200 text-gray-700',
  };

  return (
    <span className={`px-3 py-1 rounded-md text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Main Component
export default function UserManagement() {
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const { data, isLoading, refetch } = useGetAllUsersQuery(currentPage);

  const { data: userDetailsData, isLoading: userDetailsLoading } = useViewUserDetailsQuery(
    selectedUserId || '',
    { skip: !selectedUserId }
  );

  const [updateBlockAndUnblock, { isLoading: isUpdating }] = useUpdateBlockAndUnblockMutation();

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user's full name
  const getUserFullName = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.fullName || 'Unknown User';
  };

  // Get user status display
  const getUserStatus = (isActive: boolean): 'Active' | 'Inactive' => {
    return isActive ? 'Active' : 'Inactive';
  };

  // Get user role display
  const getUserRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get users from API response
  const allUsers: User[] = data?.data || [];

  // Filter users based on search and status
  const filteredUsers = allUsers.filter(user => {
    const userName = getUserFullName(user).toLowerCase();
    const userEmail = user.email.toLowerCase();
    const userPhone = user.phone;
    const userId = user._id;

    const matchesSearch = userName.includes(searchQuery.toLowerCase()) ||
      userEmail.includes(searchQuery.toLowerCase()) ||
      userPhone.includes(searchQuery) ||
      userId.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Active' && user.isActive) ||
      (statusFilter === 'Inactive' && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = data?.meta?.totalPage || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers;

  // Generate page numbers
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleBlockUser = async (user: User) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserDetailsModal(true);
  };

  const confirmBlockUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await updateBlockAndUnblock(selectedUser._id).unwrap();
      toast.success(response.message || 'User blocked successfully!');
      refetch(); // Refresh the user list
      setShowBlockModal(false);
      setSelectedUser(null);
    } catch (error) {
      const err = error as { data?: { message?: string } };

      console.error("Failed to update user status:", err);
      toast.error(err.data?.message || "Failed to update user status. Please try again.");
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filter or search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Close user details modal
  const closeUserDetailsModal = () => {
    setShowUserDetailsModal(false);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All Users</h1>
        </div>
        <div className="w-full flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#8E4484] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All Users</h1>
          <div className="text-sm text-gray-500">
            Total: {allUsers.length} user{allUsers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by name, email, phone, or ID"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px] py-5 cursor-pointer">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent className='cursor-pointer'>
              <SelectItem value="All">Status: All</SelectItem>
              <SelectItem value="Active">Active Users</SelectItem>
              <SelectItem value="Inactive">Inactive Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">User ID</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">User Name</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">Phone</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">Role</th>
                {/* <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">Status</th> */}
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">Joined Date</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  // const userStatus = getUserStatus(user.isActive);
                  const userRole = getUserRole(user.role);

                  return (
                    <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900 font-mono">
                        #{user._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {getUserFullName(user)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {userRole}
                      </td>
                      {/* <td className="py-4 px-4">
                        <Badge variant={userStatus === 'Active' ? 'active' : 'inactive'}>
                          {userStatus}
                        </Badge>
                      </td> */}
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Image src="/icons/users/view.png" alt="view details" width={20} height={20} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
                            onClick={() => handleBlockUser(user)}
                            title={user.isActive ? "Block User" : "Unblock User"}
                            disabled={isUpdating}
                          >
                            <Image
                              src={user.isActive ? "/icons/users/block.png" : "/icons/users/ok.png"}
                              alt={user.isActive ? "block icon" : "unblock icon"}
                              width={20}
                              height={20}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              {getPageNumbers().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? 'default' : 'ghost'}
                  className={page === currentPage ? ' text-white' : 'text-gray-600'}
                  onClick={() => handlePageClick(page)}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showUserDetailsModal} onOpenChange={closeUserDetailsModal}>
        <DialogContent className="max-w-2xl w-full h-[600px] flex flex-col p-0 overflow-hidden">
          {/* Fixed Header */}
          <div className="flex justify-between items-center p-6 border-b bg-white">
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            <button
              onClick={closeUserDetailsModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {userDetailsLoading ? (
              <UserDetailsSkeleton />
            ) : userDetailsData?.data ? (
              <div className="space-y-6">
                {/* User Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {userDetailsData?.data?.profile ? (
                      <Image
                        src={baseURL + "/" + userDetailsData?.data?.profile}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userDetailsData.data.first_name} {userDetailsData.data.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">User ID: #{userDetailsData.data._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Badge variant={userDetailsData.data.role === 'admin' ? 'admin' : 'user'}>
                      {getUserRole(userDetailsData.data.role)}
                    </Badge>
                    <Badge variant={userDetailsData.data.isActive ? 'active' : 'inactive'}>
                      {getUserStatus(userDetailsData.data.isActive)}
                    </Badge>
                  </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500 text-sm">Personal Information</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-3">
                          <User size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">
                              {userDetailsData.data.first_name} {userDetailsData.data.last_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="font-medium">{userDetailsData.data.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium">{userDetailsData.data.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-500 text-sm">Account Status</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-3">
                          {userDetailsData.data.isActive ? (
                            <CheckCircle size={18} className="text-emerald-500" />
                          ) : (
                            <XCircle size={18} className="text-red-500 cursor-pointer" />
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Account Status</p>
                            <p className={`font-medium ${userDetailsData.data.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                              {userDetailsData.data.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {userDetailsData.data.isDeleted ? (
                            <XCircle size={18} className="text-red-500 cursor-pointer" />
                          ) : (
                            <CheckCircle size={18} className="text-emerald-500" />
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Deleted Status</p>
                            <p className={`font-medium ${userDetailsData.data.isDeleted ? 'text-red-600' : 'text-emerald-600'}`}>
                              {userDetailsData.data.isDeleted ? 'Deleted' : 'Not Deleted'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Smartphone size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Two-Step Verification</p>
                            <p className={`font-medium ${userDetailsData.data.twoStepVerification ? 'text-emerald-600' : 'text-gray-600'}`}>
                              {userDetailsData.data.twoStepVerification ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500 text-sm">Account Details</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-3">
                          <Shield size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">User Role</p>
                            <p className="font-medium">{getUserRole(userDetailsData.data.role)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Account Created</p>
                            <p className="font-medium">{formatDate(userDetailsData.data.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">{userDetailsData.data.dateOfBirth ? userDetailsData.data.dateOfBirth : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-500 text-sm">Subscription Information</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-3">
                          {userDetailsData.data.isSubscriberUser ? (
                            <CheckCircle size={18} className="text-emerald-500" />
                          ) : (
                            <XCircle size={18} className="text-gray-400 cursor-pointer" />
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Subscriber Status</p>
                            <p className={`font-medium ${userDetailsData.data.isSubscriberUser ? 'text-emerald-600' : 'text-gray-600'}`}>
                              {userDetailsData.data.isSubscriberUser ? 'Subscriber' : 'Non-Subscriber'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {userDetailsData.data.subscriptionId ? (
                            <CheckCircle size={18} className="text-emerald-500" />
                          ) : (
                            <XCircle size={18} className="text-gray-400 cursor-pointer" />
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Subscription ID</p>
                            <p className="font-medium">{userDetailsData.data.subscriptionId || 'No Subscription'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Unable to load user details</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Ban size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedUser?.isActive ? "Block User" : "Unblock User"}
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to {selectedUser?.isActive ? "block" : "unblock"}{" "}
              <span className="font-semibold">{selectedUser && getUserFullName(selectedUser)}</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {selectedUser?.isActive
                ? "Blocked users cannot access the system."
                : "Unblocked users will regain access to the system."}
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowBlockModal(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                onClick={confirmBlockUser}
                className={selectedUser?.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                disabled={isUpdating}
              >
                {isUpdating ? "Processing..." : selectedUser?.isActive ? "Block User" : "Unblock User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}