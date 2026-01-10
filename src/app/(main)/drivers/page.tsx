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

  const { data: apiResponse, isLoading, error } = useGetAllDriverQuery({});



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
      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                All Driver List
              </h1>
              <div className="flex gap-5">
                <Button onClick={() => downloadCSV(apiResponse?.data)} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                  <Image src="/icons/refill-prescription/csv.png" alt="Export CSV" width={28} height={28} />
                </Button>
                <Button onClick={() => downloadExcel(apiResponse?.data)} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                  <Image src="/icons/refill-prescription/docs.png" alt="Export Docs" width={28} height={28} />
                </Button>
                <Button onClick={() => downloadPDF(apiResponse?.data)} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                  <Image src="/icons/refill-prescription/pdf.png" alt="Export PDF" width={28} height={28} className='w-8 h-8' />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, email, or city"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Driver ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Driver Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {apiData.length === 0 ? "No drivers found" : "No drivers match your filters"}
                    </td>
                  </tr>
                ) : (
                  currentData.map((driver) => (
                    <tr key={driver._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{getDriverId(driver._id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{driver.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{driver.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{driver.status}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(driver._id)}
                          className="p-1 hover:bg-gray-100 cursor-pointer rounded transition-colors"
                          title="View details"
                        >
                          <Image
                            src="/icons/users/view.png"
                            alt="view details"
                            width={20}
                            height={20}
                            className="opacity-70 hover:opacity-100"
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
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              {isApiDataValid(apiResponse) && (
                <span className="ml-2">(Total in system: {apiResponse.meta.total})</span>
              )}
            </div>

            {totalPages > 1 && (
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