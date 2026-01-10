'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DownloadIcon, FileTextIcon } from 'lucide-react';
import { useState } from 'react';

// Mock data
const transferRequests = Array.from({ length: 24 }, () => ({
  no: '01',
  patientName: 'Jane Cooper',
  transferFrom: 'Medplus',
  transferTo: 'CityCare',
  rxId: 'RX1023',
  date: '15/01/2025',
}));

export default function PrescriptionTransferPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered data
  const filteredRequests = transferRequests.filter(req =>
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.rxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.transferFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.transferTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
   const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="start-ellipsis">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>,
        <PaginationItem key="ellipsis-start">
          <span className="px-2">...</span>
        </PaginationItem>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
            className={`${i === currentPage
              ? 'bg-purple-700 text-white hover:bg-purple-800'
              : 'hover:bg-gray-100'
              }`}
          >
            {String(i).padStart(2, '0')}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <span className="px-2">...</span>
        </PaginationItem>,
        <PaginationItem key="end-page">
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {String(totalPages).padStart(2, '0')}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-blue-100 border-none">
          <CardContent className="flex items-center p-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-4">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">35</div>
              <div className="text-sm text-blue-600">Total Transfer Requests</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-100 border-none">
          <CardContent className="flex items-center p-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-4">
              <DownloadIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-800">10</div>
              <div className="text-sm text-orange-600">Total Transfer Requests Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-100 border-none">
          <CardContent className="flex items-center p-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-4">
              <FileTextIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">20</div>
              <div className="text-sm text-green-600">Total Transfer Requests Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="max-w-6xl mx-auto shadow-sm border rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg font-semibold">Prescription Transfer Requests</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" title="Export CSV">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H7a2 2 0 01-2-2V9M9 17h10a2 2 0 002-2V9M9 17v-7.5A2.5 2.5 0 0111.5 7H13" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" title="Export Excel">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H7a2 2 0 01-2-2V9M9 17h10a2 2 0 002-2V9M9 17v-7.5A2.5 2.5 0 0111.5 7H13" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" title="Export PDF">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H7a2 2 0 01-2-2V9M9 17h10a2 2 0 002-2V9M9 17v-7.5A2.5 2.5 0 0111.5 7H13" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              placeholder="Type Something"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Patient Name</TableHead>
                <TableHead className="font-medium">Transfer From</TableHead>
                <TableHead className="font-medium">Transfer To</TableHead>
                <TableHead className="font-medium">RX ID</TableHead>
                <TableHead className="font-medium">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((req, index) => (
                <TableRow key={index} className="border-b hover:bg-gray-50">
                  <TableCell>{req.no}</TableCell>
                  <TableCell>{req.patientName}</TableCell>
                  <TableCell>{req.transferFrom}</TableCell>
                  <TableCell>{req.transferTo}</TableCell>
                  <TableCell>{req.rxId}</TableCell>
                  <TableCell>{req.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
                {renderPaginationNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}