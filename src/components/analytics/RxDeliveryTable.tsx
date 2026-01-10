"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetAllPrescriptionQuery } from "../../features/prescription/prescriptionApi";

interface PrescriptionData {
  _id: string;
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

function RxDeliveryTable() {
  const { data, isLoading } = useGetAllPrescriptionQuery({});

  const LoadingFc = () => {
    return (
      <div className="w-8 h-8 border-4 border-[#8E4484] border-t-transparent rounded-full animate-spin"></div>
    );
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time to readable format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status display text
  const getStatusDisplay = (status: string): "In-Transit" | "Delivered" | "Pending" | "Failed" | "Cancelled" => {
    const statusMap: Record<string, "In-Transit" | "Delivered" | "Pending" | "Failed" | "Cancelled"> = {
      'in-transit': 'In-Transit',
      'completed': 'Delivered',
      'pending': 'Pending',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'processing': 'Pending',
      'accepted': 'In-Transit'
    };
    return statusMap[status.toLowerCase()] || 'Pending';
  };

  // Get payment status based on amount
  const getPaymentStatus = (amount: number): "Paid" | "Free" => {
    return amount > 0 ? "Paid" : "Free";
  };

  // Get pharmacy name from pickup address (you can modify this logic as needed)
  const getPharmacyName = (address: string): string => {
    // Extract first part of address or use a default
    if (address.includes('Main Street')) return 'Main Street Pharmacy';
    if (address.includes('Elm Street')) return 'Elm Street Pharmacy';
    if (address.includes('Oak Avenue')) return 'Oak Avenue Pharmacy';
    return 'Local Pharmacy';
  };

  const getStatusVariant = (status: string) => {
    const displayStatus = getStatusDisplay(status);
    switch (displayStatus) {
      case "In-Transit":
        return "bg-cyan-100 text-cyan-700 hover:bg-cyan-100";
      case "Delivered":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      case "Pending":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "Failed":
        return "bg-pink-100 text-pink-700 hover:bg-pink-100";
      case "Cancelled":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const getPaymentVariant = (status: "Paid" | "Free") => {
    return status === "Paid"
      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
      : "bg-amber-100 text-amber-700 hover:bg-amber-100";
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Latest Rx Delivery Request</h1>
        </div>
        <div className="w-full flex items-center justify-center h-64">
          <LoadingFc />
        </div>
      </Card>
    );
  }

  // Get prescription data from API response
  const prescriptionData: PrescriptionData[] = data?.data || [];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Latest Rx Delivery Request</h1>
        <div className="text-sm text-gray-500">
          Total: {prescriptionData.length} prescription{prescriptionData.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      {prescriptionData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No prescription data available</p>
          <p className="text-gray-400 text-sm">Add new prescriptions to see them here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Request ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Patient Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Pharmacy
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Delivery Address
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Delivery Date & Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Current Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody>
              {prescriptionData.map((prescription) => {
                const displayStatus = getStatusDisplay(prescription.status);
                const paymentStatus = getPaymentStatus(prescription.amount);

                return (
                  <tr
                    key={prescription._id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900 font-mono">
                      #{prescription._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {prescription.legalName}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {getPharmacyName(prescription.pickupAddress)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 max-w-xs truncate">
                      {prescription.deliveryAddress}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>{formatDate(prescription.deliveryDate)}</span>
                        <span className="text-gray-500 text-xs">
                          {formatTime(prescription.deliveryTime)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${getStatusVariant(prescription.status)} font-medium px-3 py-1.5`}
                      >
                        {displayStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${getPaymentVariant(paymentStatus)} font-medium px-3 py-1.5`}
                      >
                        {paymentStatus} {prescription.amount > 0 && `(${formatCurrency(prescription.amount)})`}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default RxDeliveryTable;