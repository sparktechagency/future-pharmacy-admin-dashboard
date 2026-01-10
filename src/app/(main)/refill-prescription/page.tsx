"use client";

import { Badge } from "@/components/ui/badge";
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
import { useGetAllrefillQuery } from '../../../features/refillTransferScheduleRequiest/refillTransferScheduleRequiest';

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
interface PersonalInfo {
  first_name?: string;
  last_name?: string;
  fullName?: string;
  phone: string;
  dateOfBirth: string;
  _id: string;
}

// Replace these lines in the PharmacyInfo interface:
interface PharmacyInfo {
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  availableDate?: string[];  // Changed from any[]
  availableTime?: string[];  // Changed from any[]
  _id: string;
  availableDateTime?: string[];  // Changed from any[]
}

interface DeliveryInfo {
  address: string;
  aptUnit: string;
  city: string;
  state: string;
  zipCode: string;
  _id: string;
}

interface Medication {
  medicationName: string;
  rxNumber: string;
  _id: string;
}

interface PrescriptionRequest {
  _id: string;
  requiestType: string;
  personalInfo: PersonalInfo;
  pharmacyInfo: PharmacyInfo;
  deliveryInfo: DeliveryInfo;
  medicationList: Medication[];
  additionalNotes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// নতুন interface যোগ করুন: Transformed data এর জন্য
interface TransformedRequest {
  _id: string;
  refId: string;
  patientName: string;
  prescription: string;
  pharmacyName: string;
  date: string;
  status: string;
  originalStatus: string;
  originalData: PrescriptionRequest;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
};

// Helper function to get patient name
const getPatientName = (personalInfo: PersonalInfo): string => {
  if (personalInfo.fullName) {
    return personalInfo.fullName;
  }
  if (personalInfo.first_name && personalInfo.last_name) {
    return `${personalInfo.first_name} ${personalInfo.last_name}`;
  }
  return 'Unknown Patient';
};

// Helper function to get medication names
const getMedicationNames = (medicationList: Medication[]): string => {
  return medicationList.map(med => med.medicationName).join(', ');
};

// Helper function to format date with time
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function RefillPrescriptionRequests() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRequest, setSelectedRequest] = useState<PrescriptionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const itemsPerPage = 10;

  const { data, isLoading } = useGetAllrefillQuery({});

  const { downloadExcel } = useDownloadXlShit();
  const { downloadPDF } = useDownloadPDF();
  const { downloadCSV } = useCSVDownload();

  // Transform API data
  const apiData = useMemo<TransformedRequest[]>(() => {
    if (!data || !data.data) return [];

    return data.data.map((item: PrescriptionRequest) => ({
      _id: item._id,
      refId: `REF-${item._id.slice(-4).toUpperCase()}`, // Use last 4 chars of _id as ref
      patientName: getPatientName(item.personalInfo),
      prescription: getMedicationNames(item.medicationList),
      pharmacyName: item.pharmacyInfo.name,
      date: formatDate(item.createdAt),
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1), // Capitalize first letter
      originalStatus: item.status,
      originalData: item // Keep original data for future use
    }));
  }, [data]);

  // Filter data
  const filteredData = useMemo<TransformedRequest[]>(() => {
    if (!apiData.length) return [];

    return apiData.filter((item: TransformedRequest) => {
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

  console.log("filteredData", filteredData)


  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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
  const handleViewDetails = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // Handle export functions (placeholder - implement based on your needs)
  const handleExportCSV = () => {
    const dataToExport = filteredData.map(request => ({
      RefID: request.refId,
      PatientName: request.patientName,
      Prescription: request.prescription,
      PharmacyName: request.pharmacyName,
      Date: request.date,
      Status: request.status,
      OriginalStatus: request.originalStatus
    }));
    downloadCSV(dataToExport);
    // Implement CSV export logic
  };

  const handleExportDocs = () => {
    const dataToExport = filteredData.map(request => ({
      RefID: request.refId,
      PatientName: request.patientName,
      Prescription: request.prescription,
      PharmacyName: request.pharmacyName,
      Date: request.date,
      Status: request.status,
      OriginalStatus: request.originalStatus
    }));
    downloadExcel(dataToExport);
    // Implement Docs export logic
  };

  const handleExportPDF = () => {
    const dataToExport = filteredData.map(request => ({
      RefID: request.refId,
      PatientName: request.patientName,
      Prescription: request.prescription,
      PharmacyName: request.pharmacyName,
      Date: request.date,
      Status: request.status,
      OriginalStatus: request.originalStatus
    }));
    downloadPDF(dataToExport);
    // Implement PDF export logic
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
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Refill Request Details</span>
                  <Badge
                    variant="secondary"
                    className={getStatusBadgeClass(selectedRequest.status)}
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Request ID: REF-{selectedRequest._id.slice(-4).toUpperCase()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Request Type</p>
                      <p className="text-sm text-gray-900 capitalize">{selectedRequest.requiestType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created At</p>
                      <p className="text-sm text-gray-900">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">{formatDateTime(selectedRequest.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Patient Name</p>
                      <p className="text-sm text-gray-900">{getPatientName(selectedRequest.personalInfo)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{selectedRequest.personalInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedRequest.personalInfo.dateOfBirth)}</p>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pharmacy Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pharmacy Name</p>
                      <p className="text-sm text-gray-900">{selectedRequest.pharmacyInfo.name}</p>
                    </div>
                    {selectedRequest.pharmacyInfo.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pharmacy Phone</p>
                        <p className="text-sm text-gray-900">{selectedRequest.pharmacyInfo.phone}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.city && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">City</p>
                        <p className="text-sm text-gray-900">{selectedRequest.pharmacyInfo.city}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.state && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">State</p>
                        <p className="text-sm text-gray-900">{selectedRequest.pharmacyInfo.state}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.zipCode && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">ZIP Code</p>
                        <p className="text-sm text-gray-900">{selectedRequest.pharmacyInfo.zipCode}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{selectedRequest.deliveryInfo.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Apt/Unit</p>
                      <p className="text-sm text-gray-900">{selectedRequest.deliveryInfo.aptUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <p className="text-sm text-gray-900">{selectedRequest.deliveryInfo.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <p className="text-sm text-gray-900">{selectedRequest.deliveryInfo.state}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">ZIP Code</p>
                      <p className="text-sm text-gray-900">{selectedRequest.deliveryInfo.zipCode}</p>
                    </div>
                  </div>
                </div>

                {/* Medication List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Medication List</h3>
                  <div className="space-y-3">
                    {selectedRequest.medicationList.map((medication, index) => (
                      <div key={medication._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Medication {index + 1}</p>
                          <p className="text-sm text-gray-600">{medication.medicationName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">RX Number</p>
                          <p className="text-sm text-gray-900 font-mono">{medication.rxNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedRequest.additionalNotes && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Notes</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{selectedRequest.additionalNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Refill Prescription Requests
            </h1>
            <div className="flex gap-5">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200"
                onClick={handleExportCSV}
              >
                <Image src="/icons/refill-prescription/csv.png" alt="Export CSV" width={28} height={28} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200"
                onClick={handleExportDocs}
              >
                <Image src="/icons/refill-prescription/docs.png" alt="Export Docs" width={28} height={28} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200"
                onClick={handleExportPDF}
              >
                <Image src="/icons/refill-prescription/pdf.png" alt="Export PDF" width={28} height={28} className='w-8 h-8' />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, pharmacy, medication..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ref ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Patient Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Prescription</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Pharmacy Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th> */}
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item: TransformedRequest) => (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.refId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.prescription}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.pharmacyName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.status}</td>
                    {/* <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={getStatusBadgeClass(item.originalStatus)}
                      >
                        {item.status}
                      </Badge>
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-1 cursor-pointer hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleViewDetails(item.originalData)}
                          title="View details"
                        >
                          <Image
                            src="/icons/users/view.png"
                            alt="View details"
                            width={20}
                            height={20}
                            className="opacity-70  hover:opacity-100"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {apiData.length === 0 ? 'No prescription requests found' : 'No matching requests found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredData.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min(startIndex + 1, filteredData.length)} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:bg-gray-100"
              >
                Prev
              </Button>

              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-1 text-gray-400">...</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }
                    >
                      {String(page).padStart(2, '0')}
                    </Button>
                  )}
                </React.Fragment>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:bg-gray-100"
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