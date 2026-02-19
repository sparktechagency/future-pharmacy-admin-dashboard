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
import { useGetAllScheduleQuery } from '../../../features/refillTransferScheduleRequiest/refillTransferScheduleRequiest';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';

// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define interfaces based on API response
interface PersonalInfo {
  first_name?: string;
  last_name?: string;
  fullName?: string;
  phone: string;
  dateOfBirth: string;
  _id: string;
}

interface AvailableDateTime {
  date: string;
  time: string[];
  _id: string;
}

interface PharmacyInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  serviceType: string;
  availableDateTime: AvailableDateTime[];
  availableDate?: string[];
  availableTime?: string[];
  _id: string;
}

interface Medication {
  medicationName: string;
  rxNumber: string;
  _id: string;
}

interface ScheduleRequest {
  _id: string;
  requiestType: string;
  personalInfo: PersonalInfo;
  pharmacyInfo: PharmacyInfo;
  medicationList: Medication[];
  additionalNotes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Transformed data interface
interface TransformedScheduleRequest {
  _id: string;
  no: string;
  patientName: string;
  pharmacyName: string;
  serviceType: string;
  scheduledDate: string;
  requestDate: string;
  assignedDriver: string;
  status: string;
  originalData: ScheduleRequest;
  availableTimes: string;
  phone: string;
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

// Helper function to format service type
const formatServiceType = (serviceType: string): string => {
  return serviceType.charAt(0).toUpperCase() + serviceType.slice(1).toLowerCase();
};

// Helper function to get scheduled date
const getScheduledDate = (pharmacyInfo: PharmacyInfo): string => {
  // Try to get date from availableDateTime array
  if (pharmacyInfo.availableDateTime && pharmacyInfo.availableDateTime.length > 0) {
    const availableDate = pharmacyInfo.availableDateTime[0].date;
    // Format date if it's in MM/DD/YYYY format
    if (availableDate.includes('/')) {
      const [month, day, year] = availableDate.split('/');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    return availableDate;
  }

  // Try to get from availableDate array
  if (pharmacyInfo.availableDate && pharmacyInfo.availableDate.length > 0) {
    return formatDate(pharmacyInfo.availableDate[0]);
  }

  return 'Not scheduled';
};

// Helper function to get assigned driver (placeholder - replace with actual logic)
const getAssignedDriver = (request: ScheduleRequest): string => {
  console.log(request);
  // This is a placeholder - you'll need to implement actual driver assignment logic
  // For now, return a placeholder or leave empty
  return 'Not assigned';
  // Alternatively, you could return different drivers based on some logic:
  // const drivers = ['Mark Taylor', 'Sarah Johnson', 'David Wilson', 'Emily Brown'];
  // const driverIndex = request._id.charCodeAt(request._id.length - 1) % drivers.length;
  // return drivers[driverIndex];
};

// Helper function to get status badge class
const getStatusBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'approved':
      return 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    case 'in-progress':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    case 'cancelled':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  }
};

export default function HealthcareSchedule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const itemsPerPage = 10;

  const { downloadCSV } = useCSVDownload();
  const { downloadPDF } = useDownloadPDF();
  const { downloadExcel } = useDownloadXlShit();

  const { data, isLoading } = useGetAllScheduleQuery(currentPage, { pollingInterval: 5000 });

  // Transform API data
  const apiData = useMemo<TransformedScheduleRequest[]>(() => {
    if (!data || !data.data) return [];

    return data.data.map((item: ScheduleRequest, index: number) => ({
      _id: item._id,
      no: String(index + 1).padStart(2, '0'),
      patientName: getPatientName(item.personalInfo),
      pharmacyName: item.pharmacyInfo.name,
      serviceType: formatServiceType(item.pharmacyInfo.serviceType),
      scheduledDate: getScheduledDate(item.pharmacyInfo),
      requestDate: formatDate(item.createdAt),
      assignedDriver: getAssignedDriver(item),
      status: item.status,
      originalData: item,
      // Additional info for display
      availableTimes: item.pharmacyInfo.availableDateTime.length > 0
        ? item.pharmacyInfo.availableDateTime[0].time.join(', ')
        : item.pharmacyInfo.availableTime?.join(', ') || 'No times specified',
      phone: item.personalInfo.phone
    }));
  }, [data]);

  // Calculate stats from API data
  const stats = useMemo(() => {
    if (!apiData.length) {
      return [
        {
          icon: "/icons/overview/incoming.png",
          value: 0,
          label: "Incoming Requests",
          bgColor: "bg-[#FFDEE7]",
          iconBgColor: "bg-white",
          iconColor: "text-pink-500",
          textColor: "text-pink-600",
        },
        {
          icon: "/icons/overview/driver.png",
          value: 0,
          label: "Active Drivers",
          bgColor: "bg-[#D6F2E4]",
          iconBgColor: "bg-white",
          iconColor: "text-emerald-500",
          textColor: "text-emerald-600",
        },
        {
          icon: "/icons/overview/active-users.png",
          value: 0,
          label: "Active Users",
          bgColor: "bg-[#FFF0D9]",
          iconBgColor: "bg-white",
          iconColor: "text-amber-500",
          textColor: "text-amber-600",
        },
      ];
    }



    const incomingRequests = apiData.length;
    const pendingRequests = apiData.filter((req: TransformedScheduleRequest) => req.status === 'pending').length;
    console.log(pendingRequests);
    const completedRequests = apiData.filter((req: TransformedScheduleRequest) =>
      req.status === 'completed' || req.status === 'approved'
    ).length;
    console.log(completedRequests);


    // These would need to come from separate API calls
    const activeDrivers = 15; // Placeholder - get from drivers API
    const activeUsers = 152; // Placeholder - get from users API

    return [
      {
        icon: "/icons/overview/incoming.png",
        value: incomingRequests,
        label: "Incoming Requests",
        bgColor: "bg-[#FFDEE7]",
        iconBgColor: "bg-white",
        iconColor: "text-pink-500",
        textColor: "text-pink-600",
      },
      {
        icon: "/icons/overview/driver.png",
        value: activeDrivers,
        label: "Active Drivers",
        bgColor: "bg-[#D6F2E4]",
        iconBgColor: "bg-white",
        iconColor: "text-emerald-500",
        textColor: "text-emerald-600",
      },
      {
        icon: "/icons/overview/active-users.png",
        value: activeUsers,
        label: "Active Users",
        bgColor: "bg-[#FFF0D9]",
        iconBgColor: "bg-white",
        iconColor: "text-amber-500",
        textColor: "text-amber-600",
      },
    ];
  }, [apiData]);

  // Filter data
  const filteredData = useMemo<TransformedScheduleRequest[]>(() => {
    if (!apiData.length) return [];

    return apiData.filter((item: TransformedScheduleRequest) => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        Object.values(item).some(val =>
          val.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      // Date range filter (based on request date)
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

  // Handle view details
  const handleViewDetails = (request: ScheduleRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // Handle export functions
  const handleExportCSV = () => {
    const dataToExport = filteredData.map(item => ({
      No: item.no,
      PatientName: item.patientName,
      Phone: item.phone,
      PharmacyName: item.pharmacyName,
      ServiceType: item.serviceType,
      ScheduledDate: item.scheduledDate,
      AvailableTimes: item.availableTimes,
      RequestDate: item.requestDate,
      Status: item.status,
    }));
    downloadCSV(dataToExport, 'schedule-requests');
  };

  const handleExportDocs = () => {
    const dataToExport = filteredData.map(item => ({
      No: item.no,
      PatientName: item.patientName,
      Phone: item.phone,
      PharmacyName: item.pharmacyName,
      ServiceType: item.serviceType,
      ScheduledDate: item.scheduledDate,
      AvailableTimes: item.availableTimes,
      RequestDate: item.requestDate,
      Status: item.status,
    }));
    downloadExcel(dataToExport, 'schedule-requests');
  };

  const handleExportPDF = () => {
    const dataToExport = filteredData.map(item => ({
      No: item.no,
      PatientName: item.patientName,
      Phone: item.phone,
      PharmacyName: item.pharmacyName,
      ServiceType: item.serviceType,
      ScheduledDate: item.scheduledDate,
      AvailableTimes: item.availableTimes,
      RequestDate: item.requestDate,
      Status: item.status,
    }));
    downloadPDF(dataToExport, 'schedule-requests');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading schedule requests...</div>
      </div>
    );
  }

  console.log(stats)
  return (
    <div className="flex flex-col gap-5">
      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} flex items-center p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            <div className={`${stat.iconBgColor} p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <Image src={stat.icon} alt={stat.label} width={32} height={32} className="w-8 h-8 object-contain" />
            </div>
            <div className="ml-5">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm md:text-md font-medium ${stat.textColor} mt-1`}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Schedule Request Details</span>
                  <Badge
                    variant="secondary"
                    className={getStatusBadgeClass(selectedRequest.status)}
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Request ID: SCHED-{selectedRequest._id.slice(-4).toUpperCase()}
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
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Request Type</p>
                      <p className="text-sm md:text-base text-gray-900 capitalize font-medium">{selectedRequest.requiestType}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Service Type</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">{formatServiceType(selectedRequest.pharmacyInfo.serviceType)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Created At</p>
                      <p className="text-sm md:text-base text-gray-900">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Last Updated</p>
                      <p className="text-sm md:text-base text-gray-900">{formatDateTime(selectedRequest.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Patient Name</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium break-words">{getPatientName(selectedRequest.personalInfo)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedRequest.personalInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Date of Birth</p>
                      <p className="text-sm md:text-base text-gray-900">{formatDate(selectedRequest.personalInfo.dateOfBirth)}</p>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Pharmacy Information</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Pharmacy Name</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium break-words">{selectedRequest.pharmacyInfo.name}</p>
                    </div>
                    {selectedRequest.pharmacyInfo.phone && (
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Pharmacy Phone</p>
                        <p className="text-sm md:text-base text-gray-900">{selectedRequest.pharmacyInfo.phone}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.address && (
                      <div className="sm:col-span-2 md:col-span-3">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Address</p>
                        <p className="text-sm md:text-base text-gray-900 break-words">{selectedRequest.pharmacyInfo.address}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.city && (
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">City</p>
                        <p className="text-sm md:text-base text-gray-900">{selectedRequest.pharmacyInfo.city}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.state && (
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">State</p>
                        <p className="text-sm md:text-base text-gray-900">{selectedRequest.pharmacyInfo.state}</p>
                      </div>
                    )}
                    {selectedRequest.pharmacyInfo.zipCode && (
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">ZIP Code</p>
                        <p className="text-sm md:text-base text-gray-900">{selectedRequest.pharmacyInfo.zipCode}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Schedule Information</h3>
                  </div>
                  <div className="p-4 md:p-6">
                    {/* Check for availableDateTime */}
                    {selectedRequest.pharmacyInfo.availableDateTime &&
                      selectedRequest.pharmacyInfo.availableDateTime.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Available Date & Time Slots</p>
                        <div className="grid grid-cols-1 gap-4">
                          {selectedRequest.pharmacyInfo.availableDateTime.map((slot) => (
                            <div key={slot._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-900">Date: {slot.date}</p>
                                <Badge variant="outline" className="text-[10px] bg-white">
                                  {slot.time.length} slots
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {slot.time.map((time, timeIndex) => (
                                  <span
                                    key={timeIndex}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 shadow-sm"
                                  >
                                    {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Fallback to availableDate and availableTime
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {selectedRequest.pharmacyInfo.availableDate &&
                          selectedRequest.pharmacyInfo.availableDate.length > 0 && (
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Preferred Dates</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedRequest.pharmacyInfo.availableDate.map((date, index) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-none">
                                    {formatDate(date)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {selectedRequest.pharmacyInfo.availableTime &&
                          selectedRequest.pharmacyInfo.availableTime.length > 0 && (
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Preferred Times</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedRequest.pharmacyInfo.availableTime.map((time, index) => (
                                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {(!selectedRequest.pharmacyInfo.availableDate ||
                          selectedRequest.pharmacyInfo.availableDate.length === 0) &&
                          (!selectedRequest.pharmacyInfo.availableTime ||
                            selectedRequest.pharmacyInfo.availableTime.length === 0) && (
                            <div className="sm:col-span-2 text-center py-4 text-gray-500 italic text-sm">
                              No schedule preferences specified
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Driver Information (Placeholder) */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Driver Information</h3>
                  </div>
                  <div className="p-4 md:p-6 bg-gray-50/50">
                    <p className="text-sm md:text-base text-gray-900 font-medium">
                      {getAssignedDriver(selectedRequest)}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                      Driver assignment functionality can be implemented as needed
                    </p>
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedRequest.additionalNotes && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">Additional Notes</h3>
                    </div>
                    <div className="p-4 md:p-6 bg-gray-50/50">
                      <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap">{selectedRequest.additionalNotes}</p>
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
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 line-clamp-2 sm:line-clamp-none">
              Schedule Essential Healthcare Services
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
                placeholder="Search by patient name, pharmacy, service type..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">No</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">Patient Name</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">Pharmacy Name</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">Service Type</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">Scheduled Date</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">Status</th>
                <th className="px-2 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item: TransformedScheduleRequest) => (
                  <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900 font-mono">{item.no}</td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.patientName}</span>
                        <span className="text-[10px] md:text-xs text-gray-500">{item.phone}</span>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900 truncate max-w-[120px] md:max-w-none">{item.pharmacyName}</td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.serviceType}</span>
                        {item.availableTimes && item.availableTimes !== 'No times specified' && (
                          <span className="text-[10px] md:text-xs text-gray-500 truncate max-w-[150px]">Times: {item.availableTimes}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.scheduledDate}</span>
                        <span className="text-[10px] md:text-xs text-gray-500">Requested: {item.requestDate}</span>
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-4 text-xs md:text-sm text-gray-900">
                      <Badge
                        variant="outline"
                        className={`${getStatusBadgeClass(item.status)} border-none text-[10px] md:text-xs font-medium px-2 py-0.5 whitespace-nowrap capitalize`}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-2 md:px-6 py-4">
                      <button
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors flex items-center justify-center shrink-0"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {apiData.length === 0 ? 'No schedule requests found' : 'No matching requests found'}
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