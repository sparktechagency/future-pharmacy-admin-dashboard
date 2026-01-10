'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

// Mock driver data
const drivers = Array.from({ length: 24 }, (_, i) => ({
  id: `#${78578 + i}`,
  name: 'Jane Cooper',
  contact: '+1-555-123-4587',
  status: i % 2 === 0 ? 'Available' : 'On Delivery',
}));

export default function DriverListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered data
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contact.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

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
      <Card className="max-w-6xl mx-auto shadow-sm border rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Driver List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="On Delivery">On Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-medium">Driver ID</TableHead>
                <TableHead className="font-medium">Driver Name</TableHead>
                <TableHead className="font-medium">Contact</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDrivers.map((driver, index) => (
                <TableRow key={index} className="border-b hover:bg-gray-50">
                  <TableCell>{driver.id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.contact}</TableCell>
                  <TableCell>
                    <Badge
                      variant={driver.status === 'Available' ? 'default' : 'secondary'}
                      className={`${driver.status === 'Available'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                    >
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDrivers.length)} of {filteredDrivers.length} entries
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