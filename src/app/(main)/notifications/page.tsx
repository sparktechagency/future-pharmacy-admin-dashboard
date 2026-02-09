"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Search,
  Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import {
  useAllDeleteNotificationMutation,
  useAllReadNotificationMutation,
  useGetAllNotificationQuery,
  useSingleDeleteNotificationMutation
} from '../../../features/notification/notificationApi';
import { ApiResponse, FrontendStatus } from './type';

const NotificationSystem = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  // Fetch data with pagination
  const { data, isLoading, error, refetch } = useGetAllNotificationQuery({ page, limit });

  const [readAllNotification, { isLoading: isReadAllLoading }] = useAllReadNotificationMutation();
  const [deleteAllNotification, { isLoading: isDeleteAllLoading }] = useAllDeleteNotificationMutation();
  const [deleteSingleNotification, { isLoading: isDeleteSingleLoading }] = useSingleDeleteNotificationMutation();

  const apiData = data as ApiResponse;

  // Map API status to frontend status
  const mapApiStatus = (apiStatus: string): FrontendStatus => {
    switch (apiStatus.toLowerCase()) {
      case 'sent':
        return 'Sent';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const getStatusColor = (status: FrontendStatus): string => {
    switch (status) {
      case 'Sent':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-orange-100 text-orange-700';
      case 'Failed':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getReadStatusColor = (isRead: boolean): string => {
    return isRead ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
  };

  // Handle all notifications read
  const handleReadAllNotifications = async () => {
    try {
      await readAllNotification({}).unwrap();
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  // Handle single notification delete
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;
    try {
      await deleteSingleNotification(selectedNotification).unwrap();
      setShowDeleteDialog(false);
      setSelectedNotification(null);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  // Handle all notifications delete
  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotification({}).unwrap();
      setShowDeleteAllDialog(false);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  // Confirm delete dialog for single notification
  const confirmDelete = (id: string) => {
    setSelectedNotification(id);
    setShowDeleteDialog(true);
  };

  // Confirm delete all dialog
  const confirmDeleteAll = () => {
    setShowDeleteAllDialog(true);
  };

  // Filter notifications based on search and status
  const filteredNotifications = apiData?.data?.filter(notification => {
    const matchesSearch =
      searchQuery === '' ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      notification.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  }) || [];

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (apiData?.meta && page < apiData.meta.totalPage) {
      setPage(prev => prev + 1);
    }
  };

  const renderPaginationButtons = () => {
    if (!apiData?.meta) return null;

    const totalPages = apiData.meta.totalPage;
    const currentPage = apiData.meta.page;
    const pages = [];

    // Always show first page
    pages.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "ghost"}
        size="sm"
        onClick={() => setPage(1)}
        className={`h-8 w-8 md:h-9 md:w-9 font-normal text-xs ${currentPage === 1 ? "bg-purple-600 shadow-lg shadow-purple-200" : "text-gray-500 hover:bg-gray-50"}`}
      >
        01
      </Button>
    );

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "ghost"}
          size="sm"
          onClick={() => setPage(i)}
          className={`h-8 w-8 md:h-9 md:w-9 font-normal text-xs ${currentPage === i ? "bg-purple-600 shadow-lg shadow-purple-200" : "text-gray-500 hover:bg-gray-50"}`}
        >
          {i.toString().padStart(2, '0')}
        </Button>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "ghost"}
          size="sm"
          onClick={() => setPage(totalPages)}
          className={`h-8 w-8 md:h-9 md:w-9 font-normal text-xs ${currentPage === totalPages ? "bg-purple-600 shadow-lg shadow-purple-200" : "text-gray-500 hover:bg-gray-50"}`}
        >
          {totalPages.toString().padStart(2, '0')}
        </Button>
      );
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-xs font-normal text-gray-400 uppercase tracking-widest">Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium">
          Error loading notifications. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 ">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-gray-50">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Notification History</h1>
              <p className="text-sm text-gray-500 font-normal">Track and manage all system-wide alerts and messages</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReadAllNotifications}
                disabled={isReadAllLoading || filteredNotifications.length === 0}
                className="w-full sm:w-auto font-normal h-10 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all active:scale-95"
              >
                {isReadAllLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                <span className="text-xs uppercase tracking-wider">Mark All as Read</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDeleteAll}
                disabled={isDeleteAllLoading || filteredNotifications.length === 0}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 rounded-xl font-normal h-10 shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                {isDeleteAllLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                <span className="text-xs uppercase tracking-wider">Clear All</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notifications by content, role, or ID..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-100 h-11 focus:bg-white transition-all w-full"
              />
            </div>
            <div className="w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-100 h-11 py-[22px] focus:bg-white transition-all shadow-none">
                  <SelectValue placeholder="Delivery Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status: All</SelectItem>
                  <SelectItem value="sent">Sent Successfully</SelectItem>
                  <SelectItem value="pending">Awaiting Send</SelectItem>
                  <SelectItem value="failed">Delivery Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table/List View */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest">Notif ID</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest">Message Content</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest">Target</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest">Delivery</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <tr
                    key={notification._id}
                    className={`hover:bg-purple-50/30 transition-colors group ${notification.isRead ? '' : 'bg-purple-50/50'}`}
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {!notification.isRead && <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse border-none shadow-[0_0_8px_rgba(147,51,234,0.5)]"></div>}
                        <span className="text-xs md:text-sm font-mono font-normal text-gray-900 leading-none">
                          #{notification._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col gap-1 min-w-[200px] md:min-w-none">
                        <p className="text-xs md:text-sm font-normal text-gray-700 leading-relaxed max-w-sm">
                          {notification.message}
                        </p>
                        <span className="text-[10px] font-normal text-gray-400 uppercase tracking-tighter">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-normal text-gray-900">{notification.role}</span>
                        <span className="text-[10px] text-gray-400 font-mono">UID: {notification.userId ? notification.userId.slice(-6).toUpperCase() : 'Global'}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-block text-center w-fit px-2 py-0.5 rounded-full text-[10px] md:text-xs font-normal shadow-sm whitespace-nowrap ${getReadStatusColor(notification.isRead)}`}>
                          {notification.isRead ? 'Opened' : 'New Alert'}
                        </span>
                        <span className={`inline-block text-center w-fit px-2 py-0.5 rounded-full text-[10px] md:text-xs font-normal shadow-sm whitespace-nowrap ${getStatusColor(mapApiStatus(notification.status))}`}>
                          {mapApiStatus(notification.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white hover:shadow-md border-none outline-none">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl min-w-[120px]">
                          <DropdownMenuItem
                            onClick={() => confirmDelete(notification._id)}
                            disabled={isDeleteSingleLoading}
                            className="text-xs font-normal text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer py-2.5"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 text-sm">
                    No matching alerts found in history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {apiData?.meta && (
          <div className="p-4 md:p-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50">
            <div className="text-xs md:text-sm text-gray-600 font-normal text-center md:text-left order-2 md:order-1">
              Displaying <span className="text-purple-600 font-normal">{((apiData.meta.page - 1) * apiData.meta.limit) + 1}</span> to{' '}
              <span className="text-purple-600 font-normal">{Math.min(apiData.meta.page * apiData.meta.limit, apiData.meta.total)}</span> of{' '}
              <span className="text-purple-600 font-normal">{apiData.meta.total}</span> logs
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 order-1 md:order-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevPage}
                disabled={apiData.meta.page === 1}
                className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white hover:shadow-sm transition-all font-normal text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[150px] sm:max-w-none">
                {renderPaginationButtons()}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={apiData.meta.page >= apiData.meta.totalPage}
                className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white hover:shadow-sm transition-all font-normal text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-purple-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-normal text-gray-900 border-l-4 border-red-500 pl-4">Delete Entry</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-500 leading-relaxed">
              This action will permanently remove this notification from the history. This process cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleteSingleLoading} className="rounded-xl font-normal text-gray-500">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotification}
              disabled={isDeleteSingleLoading}
              className="bg-red-600 hover:bg-red-700 rounded-xl font-normal shadow-lg shadow-red-100"
            >
              {isDeleteSingleLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent className="rounded-2xl border-purple-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-normal text-gray-900 border-l-4 border-red-600 pl-4">Purge All Records</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-normal text-gray-500 leading-relaxed">
              DANGER: You are about to delete every single notification log in the system. This action is global and destructive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleteAllLoading} className="rounded-xl font-normal text-gray-500">
              Abort Purge
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllNotifications}
              disabled={isDeleteAllLoading}
              className="bg-red-700 hover:bg-red-800 rounded-xl font-normal shadow-xl shadow-red-200"
            >
              {isDeleteAllLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationSystem;