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
import { useState } from 'react';
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
    return isRead ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';
  };

  // Handle all notifications read
  const handleReadAllNotifications = async () => {
    try {
      const response = await readAllNotification({}).unwrap();
      console.log(response);
      refetch(); // Refresh the data
    } catch (error) {
      console.log(error)
    }
  };

  // Handle single notification delete
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      const response = await deleteSingleNotification(selectedNotification).unwrap();
      console.log(response);

      setShowDeleteDialog(false);
      setSelectedNotification(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.log(error)
    }
  };

  // Handle all notifications delete
  const handleDeleteAllNotifications = async () => {
    try {
      const response = await deleteAllNotification({}).unwrap();
      console.log(response);
      setShowDeleteAllDialog(false);
      refetch(); // Refresh the data
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

  // Handle pagination
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

  // Render pagination buttons
  const renderPaginationButtons = () => {
    if (!apiData?.meta) return null;

    const buttons = [];
    const totalPages = apiData.meta.totalPage;
    const currentPage = apiData.meta.page;

    // Always show first page
    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => setPage(1)}
        className={currentPage === 1 ? " text-white" : ""}
      >
        01
      </Button>
    );

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(i)}
            className={currentPage === i ? " text-white" : ""}
          >
            {i.toString().padStart(2, '0')}
          </Button>
        );
      }
    }

    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => setPage(totalPages)}
          className={currentPage === totalPages ? " text-white" : ""}
        >
          {totalPages.toString().padStart(2, '0')}
        </Button>
      );
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error loading notifications. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Notification History</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReadAllNotifications}
                disabled={isReadAllLoading || filteredNotifications.length === 0}
              >
                {isReadAllLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Mark All as Read
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDeleteAll}
                disabled={isDeleteAllLoading || filteredNotifications.length === 0}
              >
                {isDeleteAllLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete All
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 pt-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by message or role..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto pt-5">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Notif. ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Recipient ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Read Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <tr
                      key={notification._id}
                      className={`hover:bg-gray-50 ${notification.isRead ? '' : 'bg-blue-50'}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{notification._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.userId ? notification.userId.slice(-6).toUpperCase() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {notification.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.message}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(notification.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReadStatusColor(notification.isRead)}`}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mapApiStatus(notification.status))}`}>
                          {mapApiStatus(notification.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">

                            <DropdownMenuItem
                              onClick={() => confirmDelete(notification._id)}
                              disabled={isDeleteSingleLoading}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No notifications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {apiData?.meta && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {((apiData.meta.page - 1) * apiData.meta.limit) + 1} to{' '}
                {Math.min(apiData.meta.page * apiData.meta.limit, apiData.meta.total)} of{' '}
                {apiData.meta.total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={apiData.meta.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>

                {renderPaginationButtons()}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={apiData.meta.page >= apiData.meta.totalPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Single Notification Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteSingleLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotification}
              disabled={isDeleteSingleLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleteSingleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Notifications Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete all notifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteAllLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllNotifications}
              disabled={isDeleteAllLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleteAllLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationSystem;