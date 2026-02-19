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
import { Search } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { DriverDetailsModal } from '../../../components/driver/driver-details-modal';
import { useGetAllDriverQuery, useGetSingleDriverQuery } from "../../../features/driver/driverApi";
import { CustomLoading } from '../../../hooks/CustomLoading';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';


// Define interface based on API response
interface Driver {
  _id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  zipCode: string;
  vehicleType: string;
  yearOfDriverLicense: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: Driver[];
}

export default function AllDriverList() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;
  const { downloadCSV } = useCSVDownload();
  const { downloadExcel } = useDownloadXlShit();
  const { downloadPDF } = useDownloadPDF();

  const { data: apiResponse, isLoading, error } = useGetAllDriverQuery(currentPage, { pollingInterval: 5000 });



  // Fetch single driver data when a driver is selected
  const { data: singleDriverResponse, isLoading: singleDriverLoading } = useGetSingleDriverQuery(
    selectedDriverId!,
    { skip: !selectedDriverId }
  );

  // Type guard to check if we have valid data
  const isApiDataValid = (data: unknown): data is ApiResponse => {
    if (!data || typeof data !== 'object') return false;

    const apiResponse = data as Partial<ApiResponse>;
    return (
      apiResponse.success === true &&
      Array.isArray(apiResponse.data)
    );
  };

  // Use API data if available, otherwise use empty array
  const apiData = isApiDataValid(apiResponse) ? apiResponse.data : [];

  // Get single driver data
  const singleDriver = singleDriverResponse?.success ? singleDriverResponse.data : null;

  // Filter data based on search query and status filter
  const filteredData = apiData.filter(driver => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.city.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' ||
      driver.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Paginate data
  const totalPages = apiResponse?.meta?.totalPage || 1;
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

  // const getStatusBadgeClass = (status: string): string => {
  //   const statusLower = status.toLowerCase();
  //   if (statusLower === 'available') {
  //     return 'bg-green-100 text-green-700 hover:bg-green-100';
  //   } else if (statusLower === 'pending') {
  //     return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
  //   } else if (statusLower === 'active') {
  //     return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
  //   } else if (statusLower === 'ondelivery' || statusLower === 'on delivery') {
  //     return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
  //   } else {
  //     return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  //   }
  // };

  // const formatStatus = (status: string): string => {
  //   const statusLower = status.toLowerCase();
  //   if (statusLower === 'ondelivery') {
  //     return 'On Delivery';
  //   }
  //   return status.charAt(0).toUpperCase() + status.slice(1);
  // };

  // Get driver ID from _id (use last 6 characters or whole ID)
  const getDriverId = (id: string): string => {
    return `#${id.slice(-6).toUpperCase()}`;
  };

  // Handle view details button click
  const handleViewDetails = (driverId: string) => {
    setSelectedDriverId(driverId);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <CustomLoading />
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error loading drivers. Please try again.</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 ">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-8 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-gray-50">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  All Driver List
                </h1>
                <p className="text-sm text-gray-500 font-medium">Manage and monitor all delivery drivers in the system</p>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <span className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Export Data:</span>
                <Button onClick={() => downloadCSV(apiResponse?.data)} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                  <Image src="/icons/refill-prescription/csv.png" alt="CSV" width={24} height={24} className="w-6 h-6" />
                </Button>
                <Button onClick={() => downloadExcel(apiResponse?.data)} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                  <Image src="/icons/refill-prescription/docs.png" alt="Excel" width={24} height={24} className="w-6 h-6" />
                </Button>
                <Button onClick={() => downloadPDF(apiResponse?.data)} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                  <Image src="/icons/refill-prescription/pdf.png" alt="PDF" width={24} height={24} className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, email, or city..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-100 h-11 focus:bg-white transition-all w-full"
                />
              </div>
              <div className="w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-100 h-11 focus:bg-white transition-all shadow-none">
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="ondelivery">On Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Driver Info</th>
                  <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">City</th>
                  <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                      {apiData.length === 0 ? "No drivers found" : "No drivers match your filters"}
                    </td>
                  </tr>
                ) : (
                  currentData.map((driver) => (
                    <tr key={driver._id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-bold text-gray-900 line-clamp-1">{driver.name}</span>
                          <span className="text-[10px] md:text-xs text-gray-400 font-mono font-medium">{getDriverId(driver._id)}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-semibold text-gray-700">{driver.phone}</span>
                          <span className="text-[10px] md:text-xs text-purple-600 font-medium truncate max-w-[120px] md:max-w-none">{driver.email}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">{driver.city}</td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold capitalize shadow-sm border-none ${driver.status === 'active' ? 'bg-green-100 text-green-700' :
                          driver.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            driver.status === 'available' ? 'bg-blue-100 text-blue-700' :
                              driver.status === 'ondelivery' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(driver._id)}
                          className="p-2 cursor-pointer hover:bg-purple-100 text-purple-600 rounded-lg transition-all active:scale-95 shadow-sm bg-white border border-purple-100"
                          title="View details"
                        >
                          <Image
                            src="/icons/users/view.png"
                            alt="view details"
                            width={18}
                            height={18}
                            className="opacity-80"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50">
            <div className="text-xs md:text-sm text-gray-600 font-medium text-center md:text-left order-2 md:order-1">
              Showing <span className="text-purple-600 font-bold">{startIndex + 1}</span> to <span className="text-purple-600 font-bold">{Math.min(endIndex, filteredData.length)}</span> of <span className="text-purple-600 font-bold">{filteredData.length}</span> entries
              {isApiDataValid(apiResponse) && (
                <span className="ml-2 hidden sm:inline text-gray-400">(Total: {apiResponse.meta.total})</span>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 md:gap-2 order-1 md:order-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white hover:shadow-sm transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
                >
                  Prev
                </Button>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[150px] sm:max-w-none">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-2 py-1 text-gray-300 text-xs">...</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          className={`h-8 w-8 min-w-[32px] md:h-9 md:w-9 md:min-w-[36px] p-0 text-xs font-bold transition-all ${currentPage === page
                            ? 'bg-[#9c4a8f] hover:bg-[#9c4a8f] hover:text-white text-white font-bold'
                            : 'text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-sm'
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
                  className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white hover:shadow-sm transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      <DriverDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        driver={singleDriver}
        isLoading={singleDriverLoading}
      />
    </>
  );
}