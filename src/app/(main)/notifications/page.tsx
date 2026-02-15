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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useDeleteNotificationMutation,
  useGetAllNotificationQuery,
  useReadNotificationMutation,
  useUnreadNotificationMutation
} from '../../../features/notification/notificationApi';
import { socket } from '../../../utils/socket';
import { ApiResponse, NotificationType } from './type';

const NotificationSystem = () => {
  const [readFilter, setReadFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<NotificationType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Fetch data with pagination
  const { data, isLoading, error, refetch } = useGetAllNotificationQuery({ page, limit });

  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    const handleNotification = (eventName: string, data: unknown) => {
      if (eventName.startsWith("notification")) {
        console.log(`🔔 Real-time notification received (${eventName}):`, data);
        refetch();
      }
    };

    // Listen to ALL events and filter for notification ones
    socket.onAny(handleNotification);

    // Refetch on re-connect to ensure list is up to date
    socket.on("connect", () => {
      console.log("🌐 Socket connected/reconnected in Page. ID:", socket.id);
      refetch();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error in Page:", err.message);
    });

    return () => {
      socket.offAny(handleNotification);
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [refetch]);

  const [deleteNotifications, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [readNotifications] = useReadNotificationMutation();
  const [unreadNotifications] = useUnreadNotificationMutation();


  const apiData = data as ApiResponse;

  // Filter notifications based on Read/Unread status
  const filteredNotifications = apiData?.data?.result?.filter(notification => {
    if (readFilter === 'read') return notification.isRead;
    if (readFilter === 'unread') return !notification.isRead;
    return true;
  }) || [];

  // Toggle single selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  // Handle Bulk Actions
  const handleBulkActionExecute = async () => {
    if (selectedIds.size === 0 || !bulkAction) return;

    if (bulkAction === 'delete') {
      setShowDeleteDialog(true);
      return;
    }

    try {
      const ids = Array.from(selectedIds);
      if (bulkAction === 'markRead') {
        const unreadIds = filteredNotifications
          .filter(n => ids.includes(n._id) && !n.isRead)
          .map(n => n._id);

        if (unreadIds.length > 0) {
          await readNotifications({ notification: "read", notificationIds: unreadIds }).unwrap();
        }
      } else if (bulkAction === 'markUnread') {
        const readIds = filteredNotifications
          .filter(n => ids.includes(n._id) && n.isRead)
          .map(n => n._id);

        if (readIds.length > 0) {
          await unreadNotifications({ notification: "unread", notificationIds: readIds }).unwrap();
        }
      }

      setSelectedIds(new Set());
      setBulkAction('');
      refetch();
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      if (ids.length > 0) {
        await deleteNotifications({ notification: "delete", notificationIds: ids }).unwrap();
      }
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      setBulkAction('');
      refetch();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  };

  const handleViewNotification = async (notification: NotificationType) => {
    setSelectedDetail(notification);
    setIsDetailOpen(true);
    if (!notification.isRead) {
      try {
        await readNotifications({ notification: "read", notificationIds: [notification._id] }).unwrap();
        refetch(); // Ensure UI updates
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };


  const handlePrevPage = () => { if (page > 1) setPage(prev => prev - 1); };
  const handleNextPage = () => { if (apiData?.meta && page < apiData.meta.totalPage) setPage(prev => prev + 1); };

  const renderPaginationButtons = () => {
    if (!apiData?.meta) return null;
    const totalPages = apiData.meta.totalPage;
    const currentPage = apiData.meta.page;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Notification History</h1>
              <p className="text-sm text-gray-500 font-normal">Track and manage all system-wide alerts and messages</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-48">
                <Select value={readFilter} onValueChange={setReadFilter}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-100 h-10 text-xs shadow-none">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Read and Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-full sm:w-48 bg-gray-50 border-gray-200 h-10 text-xs shadow-none">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markRead">Mark as Read</SelectItem>
                    <SelectItem value="markUnread">Mark as Unread</SelectItem>
                    <SelectItem value="delete">Move to Trash</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkActionExecute}
                  disabled={!bulkAction || selectedIds.size === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-10 px-6 rounded-xl transition-all active:scale-95"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* Table/List View */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-4 w-12 text-center border-none">
                  <Checkbox
                    checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest border-none">Notif ID</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest border-none">Message Content</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest border-none">Target</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-medium text-gray-400 tracking-widest text-right border-none">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white border-none">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <tr
                    key={notification._id}
                    className={`hover:bg-purple-50/30 transition-colors group ${notification.isRead ? '' : 'bg-purple-50/50'}`}
                  >
                    <td className="px-4 py-4 text-center border-none">
                      <Checkbox
                        checked={selectedIds.has(notification._id)}
                        onCheckedChange={() => toggleSelect(notification._id)}
                      />
                    </td>
                    <td className="px-4 md:px-6 py-4 border-none">
                      <div className="flex items-center gap-3">
                        {!notification.isRead && <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>}
                        <span className="text-xs md:text-sm font-mono font-normal text-gray-900 leading-none lowercase">
                          #{notification._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 border-none">
                      <div className="flex flex-col gap-1 min-w-[200px] md:min-w-none">
                        <p className="text-xs md:text-sm font-normal text-gray-700 leading-relaxed max-w-sm">
                          {notification.message}
                        </p>
                        <span className="text-[10px] font-normal text-gray-400 uppercase tracking-tighter">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 border-none">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-normal text-gray-900 capitalize">{notification.role}</span>
                        <span className="text-[10px] text-gray-400 font-mono">UID: {notification.userId ? notification.userId.slice(-6).toUpperCase() : 'Global'}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right border-none">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewNotification(notification)}
                          className="h-8 w-8 p-0 hover:bg-purple-100 text-purple-600 rounded-full"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 text-sm border-none">
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

            <div className="flex items-center gap-2 order-1 md:order-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevPage}
                disabled={apiData.meta.page === 1}
                className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white transition-all font-normal text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={apiData.meta.page >= apiData.meta.totalPage}
                className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white transition-all font-normal text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Confirm Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-purple-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-normal text-gray-900 border-l-4 border-red-500 pl-4">Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-500 leading-relaxed">
              Are you sure you want to delete {selectedIds.size} selected notification(s)? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-normal text-gray-500">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded-xl font-normal shadow-lg shadow-red-100"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-gray-100 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Notification Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-mono">
              ID: {selectedDetail?._id}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Message Content</span>
              <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {selectedDetail?.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Target Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{selectedDetail?.role}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date Sent</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedDetail?.createdAt && formatDate(selectedDetail.createdAt)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                <span className={`text-xs font-medium px-2 py-1 rounded w-fit ${selectedDetail?.isRead ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {selectedDetail?.isRead ? 'Read' : 'Unread'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</span>
                <span className="text-xs font-mono text-gray-600 truncate">
                  {selectedDetail?.userId || 'Global'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="text-gray-600 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
};

export default NotificationSystem;
