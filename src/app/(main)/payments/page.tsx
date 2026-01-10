"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useMemo, useState } from 'react';
import { useGetAllPaymentQuery } from '../../../features/payment/paymentApi';
import { CustomLoading } from '../../../hooks/CustomLoading';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';

// Payment interface with userId
interface UserId {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;

}

interface Payment {
  _id: string;
  transactionId: string;
  email?: string;
  name?: string;
  phone?: string;
  method: string;
  amount: number;
  transactionDate: string;
  status: string;
  userId?: UserId; // Add userId property
}

// Status mapping from API to UI
const statusMap: Record<string, 'Successful' | 'Failed' | 'Refunded'> = {
  'paid': 'Successful',
  'failed': 'Failed',
  'refunded': 'Refunded',
  'pending': 'Failed',
  // Add other status mappings as needed
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const ITEMS_PER_PAGE = 10;

export default function TransactionsList() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { downloadExcel } = useDownloadXlShit();
  const { downloadPDF } = useDownloadPDF();
  const { downloadCSV } = useCSVDownload();

  // Use the API hook
  const { data: apiResponse, isLoading, error } = useGetAllPaymentQuery({});

  // Extract payments from API response with useMemo
  const payments = useMemo<Payment[]>(() => {
    return apiResponse?.data?.result || [];
  }, [apiResponse]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment: Payment) => {
      const matchesSearch = searchQuery === '' ||
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (payment.userId?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        payment._id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        payment.status.toLowerCase() === statusFilter.toLowerCase();

      // Date filtering
      let matchesDate = true;
      if (dateRange !== 'all') {
        const paymentDate = new Date(payment.transactionDate);
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        switch (dateRange) {
          case 'today':
            matchesDate = paymentDate >= startOfToday;
            break;
          case 'week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            matchesDate = paymentDate >= startOfWeek;
            break;
          case 'month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            matchesDate = paymentDate >= startOfMonth;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, searchQuery, statusFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusStyles = (status: string): string => {
    const uiStatus = statusMap[status] || 'Failed';

    switch (uiStatus) {
      case 'Successful':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Failed':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'Refunded':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getDisplayStatus = (status: string): string => {
    const uiStatus = statusMap[status] || 'Failed';
    return uiStatus;
  };

  const renderPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handleExportCSV = () => {
    const dataToExport = filteredPayments.map((payment: Payment) => ({
      TransactionID: payment.transactionId || payment._id,
      Email: payment.userId?.email || payment.email || 'N/A',
      Method: payment.method,
      Amount: formatCurrency(payment.amount),
      Date: formatDate(payment.transactionDate),
      Status: getDisplayStatus(payment.status),
      OriginalStatus: payment.status,
      RawAmount: payment.amount,
      RawDate: payment.transactionDate,
    }));
    downloadCSV(dataToExport, 'transactions-data');
  };

  const handleExportPDF = () => {
    const dataToExport = filteredPayments.map((payment: Payment) => ({
      TransactionID: payment.transactionId || payment._id,
      Email: payment.userId?.email || payment.email || 'N/A',
      Method: payment.method,
      Amount: formatCurrency(payment.amount),
      Date: formatDate(payment.transactionDate),
      Status: getDisplayStatus(payment.status),
      OriginalStatus: payment.status,
      RawAmount: payment.amount,
      RawDate: payment.transactionDate,
    }));
    downloadPDF(dataToExport, 'transactions-data');
  };

  const handleExportXL = () => {
    const dataToExport = filteredPayments.map((payment: Payment) => ({
      TransactionID: payment.transactionId || payment._id,
      Email: payment.userId?.email || payment.email || 'N/A',
      Method: payment.method,
      Amount: formatCurrency(payment.amount),
      Date: formatDate(payment.transactionDate),
      Status: getDisplayStatus(payment.status),
      OriginalStatus: payment.status,
      RawAmount: payment.amount,
      RawDate: payment.transactionDate,
    }));
    downloadExcel(dataToExport, 'transactions-data');
  };

  const getFullName = (payment: Payment): string => {
    if (!payment.userId) return 'N/A';
    const firstName = payment.userId.first_name || '';
    const lastName = payment.userId.last_name || '';
    const name = `${firstName} ${lastName}`.trim();
    return name || 'N/A';
  };

  if (isLoading) {
    return <CustomLoading />;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error loading transactions. Please try again.';
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions list</h1>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                <Image src="/icons/refill-prescription/csv.png" alt="CSV Export" width={28} height={28} unoptimized />
              </Button>
              <Button onClick={handleExportXL} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                <Image src="/icons/refill-prescription/docs.png" alt="Document Export" width={28} height={28} unoptimized />
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                <Image src="/icons/refill-prescription/pdf.png" alt="PDF Export" width={28} height={28} className='w-8 h-8' unoptimized />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Transaction ID, Email, or ID"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="paid">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment: Payment) => (
                  <tr key={payment._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {payment.transactionId || `#${payment._id.substring(0, 8)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getFullName(payment)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.userId?.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.userId?.email || payment.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{payment.method}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.transactionDate)}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusStyles(payment.status)} font-medium capitalize`}>
                        {getDisplayStatus(payment.status)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {Math.min(startIndex + 1, filteredPayments.length)} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-gray-600"
            >
              Prev
            </Button>

            {renderPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "ghost"}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  className={currentPage === page ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-gray-600"}
                >
                  {typeof page === 'number' && page < 10 ? `0${page}` : page}
                </Button>
              )
            ))}
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="text-gray-600"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}