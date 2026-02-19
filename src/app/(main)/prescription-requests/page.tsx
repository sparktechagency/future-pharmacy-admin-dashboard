"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { useGetAllPrescriptionQuery } from '../../../features/prescription/prescriptionApi';
import { CustomLoading } from '../../../hooks/CustomLoading';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';

interface PrescriptionOrder {
  _id: string;
  userId?: string;
  typeUser: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  email: string;
  phone: string;
  legalName: string;
  dateOfBirth: string;
  amount: number;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}


interface PrescriptionRequest {
  id: string;
  patientName: string;
  pharmacyName: string;
  dateTime: string;
  order: PrescriptionOrder; // Store full order data for details
}

const PrescriptionRequestsTable = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRequest, setSelectedRequest] = useState<PrescriptionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { downloadCSV } = useCSVDownload();
  const { downloadPDF } = useDownloadPDF();
  const { downloadExcel } = useDownloadXlShit();

  // Fetch data from API
  const { data: apiResponse, isLoading } = useGetAllPrescriptionQuery({});

  // Transform API data to match frontend format
  const transformedData: PrescriptionRequest[] = useMemo(() => {
    if (!apiResponse?.data) return [];

    return apiResponse.data.map((order: PrescriptionOrder) => ({
      id: order._id.substring(0, 8), // Use first 8 chars of _id as display ID
      patientName: order.legalName,
      pharmacyName: order.pickupAddress.split(',')[0], // Use first part of address as pharmacy name
      dateTime: `${order.deliveryDate} ${order.deliveryTime}`,
      order: order
    }));
  }, [apiResponse]);


  // Apply filters and search
  const filteredRequests = useMemo(() => {
    return transformedData.filter(request => {
      // Apply status filter
      if (statusFilter !== 'all' && request.order.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          request.patientName.toLowerCase().includes(query) ||
          request.pharmacyName.toLowerCase().includes(query) ||
          request.id.toLowerCase().includes(query) ||
          request.order.email.toLowerCase().includes(query) ||
          request.order.phone.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [transformedData, searchQuery, statusFilter]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      if (totalPages > 5) {
        pages.push('...');
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        if (i > 0) pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  // Handle view details
  const handleViewDetails = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // Handle export functions
  const handleExportCSV = () => {
    const dataToExport = filteredRequests.map(request => ({
      RequestID: request.id,
      PatientName: request.patientName,
      PharmacyName: request.pharmacyName,
      deliveryAddress: request.order.deliveryAddress,
      Email: request.order.email,
      Phone: request.order.phone,
      Status: request.order.status,
      Amount: request.order.amount,
    }));
    downloadCSV(dataToExport);
  };

  const handleExportDocs = () => {
    const dataToExport = filteredRequests.map(request => ({
      RequestID: request.id,
      PatientName: request.patientName,
      PharmacyName: request.pharmacyName,
      deliveryAddress: request.order.deliveryAddress,
      Email: request.order.email,
      Phone: request.order.phone,
      Status: request.order.status,
      Amount: request.order.amount,
    }));
    downloadExcel(dataToExport);
  };

  const handleExportPDF = () => {
    const dataToExport = filteredRequests.map(request => ({
      RequestID: request.id,
      PatientName: request.patientName,
      PharmacyName: request.pharmacyName,
      deliveryAddress: request.order.deliveryAddress,
      Email: request.order.email,
      Phone: request.order.phone,
      Status: request.order.status,
      Amount: request.order.amount,
    }));
    downloadPDF(dataToExport, 'prescription_requests.pdf', 'Prescription Requests');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <CustomLoading />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Dialog for Request Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Request Details</span>
                  <Badge
                    className={
                      selectedRequest.order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedRequest.order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }
                  >
                    {selectedRequest.order.status.charAt(0).toUpperCase() + selectedRequest.order.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  View complete details of the prescription request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 md:space-y-6 py-2 md:py-4">
                {/* Patient & Delivery Info */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Patient & Delivery Information</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Patient Information */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm md:text-md font-medium text-purple-600 mb-3 border-b border-purple-100 pb-1">Patient Information</h3>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Name:</span>
                            <span className="text-gray-900 break-words">{selectedRequest.order.legalName}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Phone:</span>
                            <span className="text-gray-900">{selectedRequest.order.phone}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Email:</span>
                            <span className="text-gray-900 break-all">{selectedRequest.order.email}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">DOB:</span>
                            <span className="text-gray-900">{formatDate(selectedRequest.order.dateOfBirth)}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">User Type:</span>
                            <span className="text-gray-900">
                              {selectedRequest.order.typeUser === 'registered' ? 'Registered User' : 'Guest'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm md:text-md font-medium text-purple-600 mb-3 border-b border-purple-100 pb-1">Delivery Information</h3>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Pickup:</span>
                            <span className="text-gray-900 break-words">{selectedRequest.order.pickupAddress}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Delivery:</span>
                            <span className="text-gray-900 break-words">{selectedRequest.order.deliveryAddress}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Date:</span>
                            <span className="text-gray-900">{formatDate(selectedRequest.order.deliveryDate)}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Time:</span>
                            <span className="text-gray-900">{formatTime(selectedRequest.order.deliveryTime)}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                            <span className="font-medium text-gray-700 sm:min-w-24">Amount:</span>
                            <span className="text-gray-900 font-semibold">${selectedRequest.order.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Order Details</h3>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Order Information</h4>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                              <span className="font-medium text-gray-700 sm:min-w-32">Order ID:</span>
                              <span className="text-gray-900 font-mono break-all">{selectedRequest.order._id}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                              <span className="font-medium text-gray-700 sm:min-w-32">Created:</span>
                              <span className="text-gray-900">
                                {formatDate(selectedRequest.order.createdAt)} at {formatTime(selectedRequest.order.createdAt.split('T')[1].slice(0, 5))}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                              <span className="font-medium text-gray-700 sm:min-w-32">Last Updated:</span>
                              <span className="text-gray-900">
                                {formatDate(selectedRequest.order.updatedAt)} at {formatTime(selectedRequest.order.updatedAt.split('T')[1].slice(0, 5))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Status Information</h4>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                              <span className="font-medium text-gray-700 sm:min-w-32">Status:</span>
                              <Badge
                                className={
                                  selectedRequest.order.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : selectedRequest.order.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }
                              >
                                {selectedRequest.order.status.charAt(0).toUpperCase() + selectedRequest.order.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                              <span className="font-medium text-gray-700 sm:min-w-32">User ID:</span>
                              <span className="text-gray-900 break-all">
                                {selectedRequest.order.userId || 'Guest User'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start text-sm md:text-base">
                              <span className="font-medium text-gray-700 sm:min-w-32">Deleted:</span>
                              <span className="text-gray-900">
                                {selectedRequest.order.isDeleted ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                All Prescription Requests
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Showing {filteredRequests.length} of {transformedData.length} requests
              </p>
            </div>
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
                <Image src="/icons/refill-prescription/pdf.png" alt="Export PDF" width={24} height={24} className='w-6 h-6' />
              </Button>
            </div>
          </div>

          <div className="pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Search Input */}
              <div className="relative w-full lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, email, phone, or ID..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>

              {/* Status Filter */}
              <div className='w-full'>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to first page when filtering
                }}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters Button */}
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full sm:w-auto"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Request ID
                  </th>
                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Patient Name
                  </th>
                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Pharmacy Name
                  </th>
                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Type(man)
                  </th>

                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Delivery Date/Time
                  </th>
                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request) => (
                    <tr key={request.order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900 font-mono">
                        #{request.id}
                      </td>
                      <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{request.patientName}</div>
                          <div className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{request.order.email}</div>
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                        <div>
                          <div className="line-clamp-1">{request.pharmacyName}</div>
                          <div className="text-[10px] md:text-xs text-gray-500">
                            {request.order.typeUser === 'registered' ? 'Registered' : 'Guest'}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                        <div>
                          <div>{request.order.typeUser ? "Yes" : "No"}</div>
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>{formatDate(request.order.deliveryDate)}</span>
                          <span className="text-[10px] md:text-xs text-gray-500">{formatTime(request.order.deliveryTime)}</span>
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                        <Badge
                          variant="outline"
                          className={`capitalize text-[10px] md:text-xs font-medium px-2 py-0.5 whitespace-nowrap ${request.order.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : request.order.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                        >
                          {request.order.status}
                        </Badge>
                      </td>
                      <td className="px-2 md:px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors flex items-center justify-center shrink-0"
                          title="View details"
                        >
                          <Image src="/icons/users/view.png" alt="view details" width={18} height={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {transformedData.length === 0 ? (
                        'No prescription requests found.'
                      ) : (
                        'No prescription requests match your search criteria.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs md:text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
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
                        <span className="px-1 md:px-2 text-gray-600 text-xs md:text-sm">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          className={`h-8 w-8 md:h-10 md:w-10 p-0 text-xs md:text-sm ${currentPage === page
                            ? "bg-[#9c4a8f] hover:bg-[#9c4a8f] hover:text-white text-white font-bold"
                            : "text-gray-600 hover:bg-gray-100"
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
    </div >
  );
};

export default PrescriptionRequestsTable;