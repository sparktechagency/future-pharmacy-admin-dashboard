"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search
} from 'lucide-react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { useGetAllContactQuery } from '../../../features/contact/contactApi';

// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomLoading } from '../../../hooks/CustomLoading';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';

// Define interfaces based on API response
interface Contact {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TransformedContact {
  _id: string;
  refId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  date: string;
  status: string;
  originalStatus: string;
  originalData: Contact;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
};

// Helper function to format date with time
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  // Load viewed IDs from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('viewed_contact_requests');
    if (saved) {
      try {
        setViewedIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse viewed IDs', e);
      }
    }
  }, []);
  const itemsPerPage = 10;

  const { data, isLoading } = useGetAllContactQuery(currentPage, { refetchOnMountOrArgChange: true, pollingInterval: 1000 });

  const { downloadExcel } = useDownloadXlShit();
  const { downloadPDF } = useDownloadPDF();
  const { downloadCSV } = useCSVDownload();

  // Transform API data
  const apiData = useMemo<TransformedContact[]>(() => {
    if (!data || !data.data) return [];

    return data.data.map((item: Contact) => ({
      _id: item._id,
      refId: `CON-${item._id.slice(-4).toUpperCase()}`, // Use last 4 chars of _id as ref
      fullName: item.fullName,
      email: item.email,
      phoneNumber: item.phoneNumber,
      subject: item.subject,
      date: formatDate(item.createdAt),
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1), // Capitalize first letter
      originalStatus: item.status,
      originalData: item // Keep original data for future use
    }));
  }, [data]);

  // Filter data
  const filteredData = useMemo<TransformedContact[]>(() => {
    if (!apiData.length) return [];

    return apiData.filter((item: TransformedContact) => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        Object.values(item).some(val =>
          val.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        item.originalStatus.toLowerCase() === statusFilter.toLowerCase();

      // Date range filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const itemDate = new Date(item.originalData.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateRange) {
          case 'today':
            const todayStart = new Date(today);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            matchesDate = itemDate >= todayStart && itemDate <= todayEnd;
            break;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            matchesDate = itemDate >= weekStart;
            break;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            matchesDate = itemDate >= monthStart;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [apiData, searchQuery, statusFilter, dateRange]);


  // Paginate data
  const totalPages = data?.meta?.totalPage || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'rejected':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  // Handle view details
  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);

    // Mark as viewed
    if (!viewedIds.has(contact._id)) {
      const newViewed = new Set(viewedIds).add(contact._id);
      setViewedIds(newViewed);
      localStorage.setItem('viewed_contact_requests', JSON.stringify(Array.from(newViewed)));
    }
  };

  // Handle export functions
  const handleExportCSV = () => {
    const dataToExport = filteredData.map(item => ({
      RefID: item.refId,
      FullName: item.fullName,
      Email: item.email,
      Phone: item.phoneNumber,
      Subject: item.subject,
      Date: item.date,
      Status: item.status
    }));
    downloadCSV(dataToExport);
  };

  const handleExportDocs = () => {
    const dataToExport = filteredData.map(item => ({
      RefID: item.refId,
      FullName: item.fullName,
      Email: item.email,
      Phone: item.phoneNumber,
      Subject: item.subject,
      Date: item.date,
      Status: item.status
    }));
    downloadExcel(dataToExport);
  };

  const handleExportPDF = () => {
    const dataToExport = filteredData.map(item => ({
      RefID: item.refId,
      FullName: item.fullName,
      Email: item.email,
      Phone: item.phoneNumber,
      Subject: item.subject,
      Date: item.date,
      Status: item.status
    }));
    downloadPDF(dataToExport);
  };

  if (isLoading) {
    return (
      <CustomLoading />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Contact Request Details</span>

                </DialogTitle>
                <DialogDescription>
                  Request ID: CON-{selectedContact._id.slice(-4).toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 md:space-y-6 py-2 md:py-4">
                {/* Basic Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Subject</p>
                      <p className="text-sm md:text-base text-gray-900 capitalize font-medium">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Created At</p>
                      <p className="text-sm md:text-base text-gray-900">{formatDateTime(selectedContact.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Last Updated</p>
                      <p className="text-sm md:text-base text-gray-900">{formatDateTime(selectedContact.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium break-words">{selectedContact.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm md:text-base text-gray-900 break-words">{selectedContact.email}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedContact.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Message Content</h3>
                  </div>
                  <div className="p-4 md:p-6 bg-gray-50/50">
                    <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              Contact Requests
            </h1>
            <div className="flex gap-3 md:gap-5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-gray-100 hover:bg-gray-100 border-gray-200 flex-1 sm:flex-none"
                onClick={handleExportCSV}
              >
                <Image src="/icons/refill-prescription/csv.png" alt="Export CSV" width={24} height={24} className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-gray-100 hover:bg-gray-100 border-gray-200 flex-1 sm:flex-none"
                onClick={handleExportDocs}
              >
                <Image src="/icons/refill-prescription/docs.png" alt="Export Docs" width={24} height={24} className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-gray-100 hover:bg-gray-100 border-gray-200 flex-1 sm:flex-none"
                onClick={handleExportPDF}
              >
                <Image src="/icons/refill-prescription/pdf.png" alt="Export PDF" width={24} height={24} className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, subject..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Full Name</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Email</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Phone</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Subject</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Date</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item: TransformedContact, index: number) => (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {!viewedIds.has(item._id) && (
                          <div className="w-2 h-2 rounded-full bg-[#9c4a8f] animate-pulse shrink-0" title="New request" />
                        )}
                        <span>{item.fullName}</span>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900 max-w-[150px] md:max-w-xs truncate">{item.email}</td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">{item.phoneNumber}</td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900 capitalize">{item.subject}</td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{item.date}</td>

                    <td className="px-2 md:px-6 py-4">
                      <button
                        className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center shrink-0"
                        onClick={() => handleViewDetails(item.originalData)}
                        title="View details"
                      >
                        <Image
                          src="/icons/users/view.png"
                          alt="View details"
                          width={18}
                          height={18}
                          className="opacity-70 hover:opacity-100"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {apiData.length === 0 ? 'No contact requests found' : 'No matching requests found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredData.length > 0 && (
          <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
              Showing {Math.min(startIndex + 1, filteredData.length)} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>

            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:bg-gray-100 h-8 px-2 md:h-10 md:px-4"
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-1 md:px-2 text-gray-400 text-xs md:text-sm">...</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className={`h-8 w-8 md:h-10 md:w-10 p-0 text-xs md:text-sm ${currentPage === page
                          ? 'bg-[#9c4a8f] hover:bg-[#9c4a8f] hover:text-white text-white font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {String(page).padStart(2, '0')}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:bg-gray-100 h-8 px-2 md:h-10 md:px-4"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}