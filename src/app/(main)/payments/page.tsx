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
import React, { useMemo, useState } from 'react';
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
  userId?: UserId;
}

// Status mapping from API to UI
const statusMap: Record<string, 'Successful' | 'Failed' | 'Refunded'> = {
  'paid': 'Successful',
  'failed': 'Failed',
  'refunded': 'Refunded',
  'pending': 'Failed',
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
  const [dateRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { downloadExcel } = useDownloadXlShit();
  const { downloadPDF } = useDownloadPDF();
  const { downloadCSV } = useCSVDownload();

  const { data: apiResponse, isLoading, error } = useGetAllPaymentQuery({});

  const payments = useMemo<Payment[]>(() => {
    return apiResponse?.data?.result || [];
  }, [apiResponse]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment: Payment) => {
      const matchesSearch = searchQuery === '' ||
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (payment.userId?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        payment._id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        payment.status.toLowerCase() === statusFilter.toLowerCase();

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

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusStyles = (status: string): string => {
    const uiStatus = statusMap[status] || 'Failed';
    switch (uiStatus) {
      case 'Successful': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Failed': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'Refunded': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getDisplayStatus = (status: string): string => statusMap[status] || 'Failed';

  const renderPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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
    }));
    downloadExcel(dataToExport, 'transactions-data');
  };

  const getFullName = (payment: Payment): string => {
    if (!payment.userId) return 'N/A';
    const name = `${payment.userId.first_name || ''} ${payment.userId.last_name || ''}`.trim();
    return name || 'N/A';
  };

  if (isLoading) return <CustomLoading />;

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error loading transactions.';
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 sm:p-6'>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-gray-50">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Transaction History
              </h1>
              <p className="text-sm text-gray-500 font-medium">Monitor and manage all payment activities across the platform</p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <span className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Export Records:</span>
              <Button onClick={handleExportCSV} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                <Image src="/icons/refill-prescription/csv.png" alt="CSV" width={24} height={24} className="w-6 h-6" unoptimized />
              </Button>
              <Button onClick={handleExportXL} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                <Image src="/icons/refill-prescription/docs.png" alt="Excel" width={24} height={24} className="w-6 h-6" unoptimized />
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                <Image src="/icons/refill-prescription/pdf.png" alt="PDF" width={24} height={24} className="w-6 h-6" unoptimized />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Transaction ID, Email, or Transaction Hash..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-100 h-11 focus:bg-white transition-all w-full"
              />
            </div>
            <div className="w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-100 h-11 focus:bg-white transition-all shadow-none">
                  <SelectValue placeholder="Filter by Status" />
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction Info</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Payee Details</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Method</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {currentPayments.length > 0 ? (
                currentPayments.map((payment: Payment) => (
                  <tr key={payment._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-bold text-gray-900 font-mono">
                          {payment.transactionId || `#${payment._id.substring(0, 12)}`}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400 font-medium whitespace-nowrap">
                          {formatDate(payment.transactionDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-bold text-gray-700 truncate max-w-[120px] md:max-w-none">{getFullName(payment)}</span>
                        <span className="text-[10px] md:text-xs text-blue-600 font-medium truncate max-w-[120px] md:max-w-none">{payment.userId?.email || payment.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{payment.method.charAt(0)}</span>
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-gray-600 capitalize whitespace-nowrap">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <Badge className={`border-none ${getStatusStyles(payment.status)} text-[10px] md:text-xs font-bold px-3 py-1 shadow-sm capitalize`}>
                        {getDisplayStatus(payment.status)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                    No transactions found in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:p-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50">
          <div className="text-xs md:text-sm text-gray-600 font-medium text-center md:text-left order-2 md:order-1">
            Showing <span className="text-blue-600 font-bold">{Math.min(startIndex + 1, filteredPayments.length)}</span> to <span className="text-blue-600 font-bold">{Math.min(endIndex, filteredPayments.length)}</span> of <span className="text-blue-600 font-bold">{filteredPayments.length}</span> entries
          </div>

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
              {renderPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-2 py-1 text-gray-300 text-xs">...</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={`h-8 w-8 min-w-[32px] md:h-9 md:w-9 md:min-w-[36px] p-0 text-xs font-bold transition-all ${currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'
                        : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'
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
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 md:h-9 px-2 md:px-3 text-gray-500 hover:bg-white hover:shadow-sm transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}