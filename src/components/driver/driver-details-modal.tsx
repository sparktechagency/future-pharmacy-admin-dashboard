// components/driver-details-modal.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, Car, Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";

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

interface DriverDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  isLoading: boolean;
}

export function DriverDetailsModal({
  open,
  onOpenChange,
  driver,
  isLoading,
}: DriverDetailsModalProps) {
  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'available') {
      return 'bg-green-100 text-green-700 hover:bg-green-100';
    } else if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    } else if (statusLower === 'active') {
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    } else if (statusLower === 'ondelivery' || statusLower === 'on delivery') {
      return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
    } else {
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const formatStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'ondelivery') {
      return 'On Delivery';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Driver Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the driver
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading driver details...</p>
            </div>
          </div>
        ) : driver ? (
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            <div className="space-y-6">
              {/* Header with Driver Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{driver.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Driver ID: #{driver._id.slice(-6).toUpperCase()}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`${getStatusBadgeClass(driver.status)} text-sm font-medium`}
                >
                  {formatStatus(driver.status)}
                </Badge>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{driver.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{driver.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{driver.city}, {driver.zipCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Driver Details */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Driver Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Vehicle Type:</span>
                    </div>
                    <p className="font-medium capitalize">{driver.vehicleType}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {/* <License className="h-4 w-4 text-gray-500" /> */}
                      <span className="text-sm text-gray-600">License Experience:</span>
                    </div>
                    <p className="font-medium">{driver.yearOfDriverLicense} years</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {driver.message && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-700">Message / Notes</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{driver.message}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator />
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Timestamps</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">{formatDate(driver.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(driver.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No driver data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}