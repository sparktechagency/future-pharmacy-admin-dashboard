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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4">
            Driver Record
          </DialogTitle>
          <DialogDescription className="pl-5 text-gray-500 font-medium">
            Complete background and contact profile for {driver?.name || 'this driver'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling details...</p>
            </div>
          </div>
        ) : driver ? (
          <ScrollArea className="h-[calc(90vh-140px)]">
            <div className="p-6 pt-2 space-y-6">
              {/* Header Profile Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-purple-100 shrink-0">
                  <Car className="w-10 h-10 md:w-12 md:h-12 text-purple-600" />
                </div>
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{driver.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400 font-mono font-bold tracking-tighter">ID: #{driver._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge
                      variant="secondary"
                      className={`${getStatusBadgeClass(driver.status)} border-none text-[10px] md:text-xs font-bold px-3 py-1 shadow-sm capitalize`}
                    >
                      {formatStatus(driver.status)}
                    </Badge>
                    <Badge variant="outline" className="border-purple-100 bg-white text-purple-600 text-[10px] md:text-xs font-bold px-3 py-1">
                      {driver.vehicleType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Email Address", value: driver.email, icon: Mail, type: "email" },
                  { label: "Phone Number", value: driver.phone, icon: Phone, type: "phone" },
                  { label: "Home Base / City", value: `${driver.city}, ${driver.zipCode}`, icon: MapPin },
                  { label: "License Exp.", value: `${driver.yearOfDriverLicense} Years`, icon: Clock },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <item.icon className="h-3.5 w-3.5 text-gray-400 font-bold group-hover:text-purple-600 transition-colors" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-purple-400 transition-colors">{item.label}</p>
                    </div>
                    <p className={`text-sm md:text-base text-gray-900 font-semibold break-words ${item.type === 'email' ? 'text-purple-600' : ''}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Message/Notes Section */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver Notes / Onboarding Message</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                  {driver.message || "No additional notes provided for this driver profile."}
                </p>
              </div>

              {/* Detailed Timestamps Section */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Registration Date</h5>
                    <p className="text-xs md:text-sm font-bold text-gray-900">{formatDate(driver.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Last System Update</h5>
                    <p className="text-xs md:text-sm font-bold text-gray-900">{formatDate(driver.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-2 pb-6">
                <button
                  onClick={() => onOpenChange(false)}
                  className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-gray-200"
                >
                  Close Record
                </button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Profile data synchronizing...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}