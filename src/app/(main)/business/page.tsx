"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import React, { ReactElement, ReactNode, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useGetAllDriverQuery } from '../../../features/driver/driverApi';
import { useGetAllPharmacyQuery } from "../../../features/fharmacy/fharmacyApi";
import { useGetAllIndependentPharmacyQuery } from "../../../features/independentPharmacy/IndependentApi";
import { useGetAllInvestorsQuery } from "../../../features/investor/investorApi";
import { useGetAllOtherBussinessQuery } from "../../../features/other/otherAPi";
import { CustomLoading } from '../../../hooks/CustomLoading';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';
import { baseURL } from '../../../utils/BaseURL';

// Tab Component Props
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

interface TabsListProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

interface TabsTriggerProps {
  children: ReactNode;
  tabValue: string;
  value: string;
  onValueChange: (value: string) => void;
}

interface TabsContentProps {
  children: ReactNode;
  tabValue: string;
  value: string;
}

// API Response Interfaces
interface Investor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  organizationName: string;
  organizationType: string;
  website: string;
  yearOfInvestmentExperience: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}


interface OtherBussiness {
  _id: string;
  name: string;
  phone: string;
  email: string;
  organizationName: string;
  organizationType: string;
  region: string;
  website: string;
  yearOfInvestmentExperience: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  organizationWebsite: string;
}

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

interface Pharmacy {
  _id: string;
  logo: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  title: string;
  yearofBusiness: string;
  businessPhoneNumber: string;
  licenseNumber: string;
  message: string;
  status: string;
  latitude: number;
  longitude: number;
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
  updatedAt: string;
}

interface IndependentPharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  title: string;
  yearofBusiness: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Tabs Component
const Tabs = ({ value, onValueChange, children }: TabsProps) => {
  return (
    <div className="w-full">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as ReactElement<TabsListProps | TabsTriggerProps | TabsContentProps>, { value, onValueChange })
          : child
      )}
    </div>
  );
};

const TabsList = ({ children, value, onValueChange }: TabsListProps) => {
  return (
    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as ReactElement<TabsTriggerProps>, { value, onValueChange })
          : child
      )}
    </div>
  );
};

const TabsTrigger = ({ children, tabValue, value, onValueChange }: TabsTriggerProps) => {
  const isActive = value === tabValue;
  return (
    <button
      onClick={() => onValueChange(tabValue)}
      className={`px-4 md:px-6 py-3 text-xs md:text-sm font-medium transition-colors relative shrink-0 ${isActive
        ? 'text-purple-600'
        : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
      )}
    </button>
  );
};

const TabsContent = ({ children, tabValue, value }: TabsContentProps) => {
  if (value !== tabValue) return null;
  return <div>{children}</div>;
};

// View Details Dialog Component
interface ViewDetailsDialogProps {
  type: 'pharmacy' | 'driver' | 'investor' | "other Bussiness" | "independentPharmacy";
  data: Pharmacy | Driver | Investor | OtherBussiness | IndependentPharmacy | null;
  children: ReactNode;
}

const ViewDetailsDialog = ({ type, data, children }: ViewDetailsDialogProps) => {
  if (!data) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4 capitalize">
            {type} Details
          </DialogTitle>
          <DialogDescription className="pl-5 text-gray-500">
            Comprehensive overview of {type === 'pharmacy' ? 'pharmacy' : type} information
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Independent Pharmacy Details */}
          {type === 'independentPharmacy' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{(data as IndependentPharmacy).name}</h3>
                  <p className="text-purple-600 font-medium break-all text-sm md:text-base">{(data as IndependentPharmacy).email}</p>
                  <div className="pt-2">
                    <Badge variant="outline" className={`border-none px-3 py-1 font-semibold ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {data.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Contact Person", value: (data as IndependentPharmacy).contactPerson },
                  { label: "Title", value: (data as IndependentPharmacy).title },
                  { label: "Phone", value: (data as IndependentPharmacy).phone },
                  { label: "Year of Business", value: (data as IndependentPharmacy).yearofBusiness },
                  { label: "Created At", value: new Date(data.createdAt).toLocaleDateString() },
                  { label: "Updated At", value: new Date(data.updatedAt).toLocaleDateString() },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">{item.label}</p>
                    <p className={`text-sm md:text-base text-gray-900 font-semibold break-words`}>{item.value || 'N/A'}</p>
                  </div>
                ))}
                <div className="sm:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Complete Address</p>
                  <p className="text-sm md:text-base text-gray-900 font-semibold break-words">{(data as IndependentPharmacy).address}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-inner">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Message</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">{(data as IndependentPharmacy).message || 'No additional message provided.'}</p>
              </div>
            </div>
          )}

          {/* Regular Pharmacy Details */}
          {type === 'pharmacy' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                {(data as Pharmacy).logo && (
                  <div className="w-24 h-24 md:w-32 md:h-32 relative bg-white rounded-2xl p-2 shadow-sm border border-purple-100 shrink-0">
                    <Image
                      src={`${baseURL}/${(data as Pharmacy).logo}`}
                      alt={(data as Pharmacy).name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{(data as Pharmacy).name}</h3>
                  <p className="text-purple-600 font-medium break-all text-sm md:text-base">{(data as Pharmacy).email}</p>
                  <div className="pt-2">
                    <Badge variant="outline" className={`border-none px-3 py-1 font-semibold ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {data.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Contact Person", value: (data as Pharmacy).contactPerson },
                  { label: "Title", value: (data as Pharmacy).title },
                  { label: "Phone", value: (data as Pharmacy).phone },
                  { label: "Year of Business", value: (data as Pharmacy).yearofBusiness },
                  { label: "Business Phone", value: (data as Pharmacy).businessPhoneNumber },
                  { label: "License Number", value: (data as Pharmacy).licenseNumber, mono: true },
                  { label: "Latitude", value: (data as Pharmacy).latitude },
                  { label: "Longitude", value: (data as Pharmacy).longitude },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">{item.label}</p>
                    <p className={`text-sm md:text-base text-gray-900 font-semibold break-words ${item.mono ? 'font-mono' : ''}`}>{item.value || 'N/A'}</p>
                  </div>
                ))}
                <div className="sm:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Complete Address</p>
                  <p className="text-sm md:text-base text-gray-900 font-semibold break-words">{(data as Pharmacy).address}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-inner">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Message</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">{(data as Pharmacy).message || 'No additional message provided.'}</p>
              </div>
            </div>
          )}

          {/* Driver Details */}
          {type === 'driver' && (
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">{(data as Driver).name}</h3>
                  <p className="text-blue-600 font-medium break-all">{(data as Driver).email}</p>
                </div>
                <Badge variant="outline" className={`border-none px-4 py-1.5 font-bold ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {data.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Phone", value: (data as Driver).phone },
                  { label: "City", value: (data as Driver).city },
                  { label: "Zip Code", value: (data as Driver).zipCode },
                  { label: "Vehicle Type", value: (data as Driver).vehicleType, capitalize: true },
                  { label: "Years of License", value: (data as Driver).yearOfDriverLicense },
                  { label: "Created At", value: new Date(data.createdAt).toLocaleDateString() },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-400">{item.label}</p>
                    <p className={`text-sm md:text-base text-gray-900 font-semibold ${item.capitalize ? 'capitalize' : ''}`}>{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Driver Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{(data as Driver).message || 'No additional details provided.'}</p>
              </div>
            </div>
          )}

          {/* Investor Details */}
          {type === 'investor' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">{(data as Investor).name}</h3>
                  <p className="text-emerald-600 font-medium break-all">{(data as Investor).email}</p>
                </div>
                <Badge variant="outline" className={`border-none px-4 py-1.5 font-bold ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {data.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Organization", value: (data as Investor).organizationName },
                  { label: "Org Type", value: (data as Investor).organizationType },
                  { label: "Phone", value: (data as Investor).phone },
                  { label: "Experience", value: `${(data as Investor).yearOfInvestmentExperience} years` },
                  { label: "Website", value: (data as Investor).website, link: true },
                  { label: "Joined", value: new Date(data.createdAt).toLocaleDateString() },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    {item.link ? (
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-emerald-600 font-semibold truncate block hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm md:text-base text-gray-900 font-semibold break-words">{item.value || 'N/A'}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Investor Message</p>
                <p className="text-sm text-gray-700 leading-relaxed">{(data as Investor).message || 'No message provided.'}</p>
              </div>
            </div>
          )}

          {/* Other Business Details */}
          {type === 'other Bussiness' && (
            <div className="space-y-6">
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900">{(data as OtherBussiness).name}</h3>
                  <p className="text-amber-600 font-medium break-all">{(data as OtherBussiness).email}</p>
                </div>
                <Badge variant="outline" className={`border-none px-4 py-1.5 font-bold ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {data.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Organization", value: (data as OtherBussiness).organizationName },
                  { label: "Org Type", value: (data as OtherBussiness).organizationType },
                  { label: "Phone", value: (data as OtherBussiness).phone },
                  { label: "Region", value: (data as OtherBussiness).region },
                  { label: "Website", value: (data as OtherBussiness).organizationWebsite, link: true },
                  { label: "Joined", value: new Date(data.createdAt).toLocaleDateString() },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    {item.link ? (
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-amber-600 font-semibold truncate block hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm md:text-base text-gray-900 font-semibold break-words">{item.value || 'N/A'}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business Message</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">{(data as OtherBussiness).message || 'No additional details.'}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Pharmacy Component
const PharmacyTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: independentResponse, isLoading } = useGetAllIndependentPharmacyQuery({}, { pollingInterval: 5000 });

  // Filter pharmacy data based on search and status
  const filteredPharmacyData = independentResponse?.data?.filter((pharmacy: IndependentPharmacy) => {
    const matchesSearch = searchTerm === '' ||
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.phone.includes(searchTerm) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = status === 'all' || pharmacy.status === status;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by pharmacy name, email, phone, or address..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>

        <div className='w-full'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <CustomLoading />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Pharmacy Name</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPharmacyData.length > 0 ? (
                    filteredPharmacyData.map((item: IndependentPharmacy, index: number) => (
                      <tr key={item._id} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500 font-mono">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-bold text-gray-900 line-clamp-1">{item.name}</span>
                            <span className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{item.address}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600 font-medium">{item.phone || 'N/A'}</td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-purple-600 font-medium truncate max-w-[120px] md:max-w-none">{item.email}</td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{item.contactPerson}</td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge variant="secondary" className={`border-none text-[10px] md:text-xs font-bold px-2 py-0.5 capitalize shadow-sm ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <ViewDetailsDialog type="independentPharmacy" data={item}>
                            <button
                              className="p-2 hover:bg-purple-100 text-purple-600 rounded-lg transition-all active:scale-95 shadow-sm bg-white border border-purple-100"
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
                          </ViewDetailsDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                        No pharmacy data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 font-medium">
              Showing <span className="text-purple-600 font-bold">{filteredPharmacyData.length}</span> of <span className="text-purple-600 font-bold">{independentResponse?.meta?.total || 0}</span> pharmacies
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Driver Component
const DriverTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: driverResponse, isLoading } = useGetAllDriverQuery({}, { pollingInterval: 5000 });

  // Filter driver data based on search and status
  const filteredDriverData = driverResponse?.data?.filter((driver: Driver) => {
    const matchesSearch = searchTerm === '' ||
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = status === 'all' || driver.status === status;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search driver by name, email, phone, or city..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>
        <div className='w-full'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-full'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <CustomLoading />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Driver Info</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDriverData.length > 0 ? (
                    filteredDriverData.map((item: Driver, index: number) => (
                      <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500 font-mono">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-bold text-gray-900">{item.name}</span>
                            <span className="text-[10px] md:text-xs text-blue-600 font-medium truncate max-w-[120px] md:max-w-none">{item.email}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600 capitalize font-medium">{item.vehicleType}</td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-700 text-[10px] md:text-xs px-2 py-0.5 whitespace-nowrap">
                            {item.yearOfDriverLicense} Years
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge variant="secondary" className={`border-none text-[10px] md:text-xs font-bold px-2 py-0.5 capitalize shadow-sm ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <ViewDetailsDialog type="driver" data={item}>
                            <button
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all active:scale-95 shadow-sm bg-white border border-blue-100"
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
                          </ViewDetailsDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                        No driver data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 font-medium text-center sm:text-left">
              Showing <span className="text-blue-600 font-bold">{filteredDriverData.length}</span> of <span className="text-blue-600 font-bold">{driverResponse?.meta?.total || 0}</span> drivers
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Investor Component
const InvestorTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: investorResponse, isLoading } = useGetAllInvestorsQuery({}, { pollingInterval: 5000 });

  // Filter investor data based on search and status
  const filteredInvestorData = investorResponse?.data?.filter((investor: Investor) => {
    const matchesSearch = searchTerm === '' ||
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.phone.includes(searchTerm) ||
      investor.organizationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = status === 'all' || investor.status === status;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search investor by name, email, organization..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>
        <div className='w-full'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-full'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Investor Info</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Company</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvestorData.length > 0 ? (
                    filteredInvestorData.map((item: Investor, index: number) => (
                      <tr key={item._id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500 font-mono">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-xs md:text-sm font-bold text-gray-900">{item.name}</span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600 font-medium">{item.organizationName}</td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-emerald-600 font-medium truncate max-w-[150px] md:max-w-none">{item.email}</td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge variant="secondary" className={`border-none text-[10px] md:text-xs font-bold px-2 py-0.5 capitalize shadow-sm ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <ViewDetailsDialog type="investor" data={item}>
                            <button
                              className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all active:scale-95 shadow-sm bg-white border border-emerald-100"
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
                          </ViewDetailsDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                        No investor data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 font-medium text-center sm:text-left">
              Showing <span className="text-emerald-600 font-bold">{filteredInvestorData.length}</span> of <span className="text-emerald-600 font-bold">{investorResponse?.meta?.total || 0}</span> investors
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Other Business Component
const OtherTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: otherBusinessResponse, isLoading } = useGetAllOtherBussinessQuery({}, { pollingInterval: 5000 });

  // Filter other business data based on search and status
  const filteredOtherBusinessData = otherBusinessResponse?.data?.filter((business: OtherBussiness) => {
    const matchesSearch = searchTerm === '' ||
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.phone.includes(searchTerm) ||
      business.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = status === 'all' || business.status === status;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, organization, phone, or region..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 w-full"
          />
        </div>
        <div className='w-full'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-full'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <CustomLoading />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Business Info</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Region</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOtherBusinessData.length > 0 ? (
                    filteredOtherBusinessData.map((item: OtherBussiness, index: number) => (
                      <tr key={item._id} className="hover:bg-amber-50/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500 font-mono">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="font-bold text-gray-900 line-clamp-1">{item.name}</span>
                            <span className="text-gray-500 line-clamp-1">{item.organizationName}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600 font-medium">{item.region}</td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{item.organizationType}</td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge variant="secondary" className={`border-none text-[10px] md:text-xs font-bold px-2 py-0.5 capitalize shadow-sm ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                            }`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-900">
                          <ViewDetailsDialog type="other Bussiness" data={item}>
                            <button
                              className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-all active:scale-95 shadow-sm bg-white border border-amber-100"
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
                          </ViewDetailsDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                        No other business data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 font-medium text-center sm:text-left">
              Showing <span className="text-amber-600 font-bold">{filteredOtherBusinessData.length}</span> of <span className="text-amber-600 font-bold">{otherBusinessResponse?.meta?.total || 0}</span> legal entities
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pharmacy');

  // ✅ Call hooks ONCE at component top level
  const { data: pharmacyResponse } = useGetAllPharmacyQuery({}, { pollingInterval: 5000 });
  const { data: independentResponse } = useGetAllIndependentPharmacyQuery({}, { pollingInterval: 5000 });
  const { data: driverResponse } = useGetAllDriverQuery({}, { pollingInterval: 5000 });
  const { data: investorResponse } = useGetAllInvestorsQuery({}, { pollingInterval: 5000 });
  const { data: otherBusinessResponse } = useGetAllOtherBussinessQuery({}, { pollingInterval: 5000 });

  const { downloadCSV } = useCSVDownload();
  const { downloadPDF } = useDownloadPDF();
  const { downloadExcel } = useDownloadXlShit();

  // ✅ Reuse already-fetched data — DO NOT call hooks inside these functions!
  const handleExportPharmacyCSV = () => {
    const pharmacyData = independentResponse?.data || [];
    const dataToExport = pharmacyData.map((pharmacy: IndependentPharmacy) => ({
      PharmacyID: pharmacy._id,
      PharmacyName: pharmacy.name,
      Email: pharmacy.email,
      Phone: pharmacy.phone,
      Address: pharmacy.address,
      ContactPerson: pharmacy.contactPerson,
      Title: pharmacy.title,
      YearOfBusiness: pharmacy.yearofBusiness,
      Status: pharmacy.status,
      CreatedAt: new Date(pharmacy.createdAt).toLocaleDateString(),
    }));
    downloadCSV(dataToExport, 'independent-pharmacy-data');
  };

  const handleExportDriverCSV = () => {
    const driverData = driverResponse?.data || [];
    const dataToExport = driverData.map((driver: Driver) => ({
      DriverID: driver._id,
      Name: driver.name,
      Email: driver.email,
      Phone: driver.phone,
      City: driver.city,
      ZipCode: driver.zipCode,
      VehicleType: driver.vehicleType,
      YearsOfLicense: driver.yearOfDriverLicense,
      Status: driver.status,
      CreatedAt: new Date(driver.createdAt).toLocaleDateString(),
    }));
    downloadCSV(dataToExport, 'driver-data');
  };

  const handleExportInvestorCSV = () => {
    const investorData = investorResponse?.data || [];
    const dataToExport = investorData.map((investor: Investor) => ({
      InvestorID: investor._id,
      Name: investor.name,
      Email: investor.email,
      Phone: investor.phone,
      OrganizationName: investor.organizationName,
      OrganizationType: investor.organizationType,
      Website: investor.website,
      YearsOfInvestmentExperience: investor.yearOfInvestmentExperience,
      Status: investor.status,
      CreatedAt: new Date(investor.createdAt).toLocaleDateString(),
    }));
    downloadCSV(dataToExport, 'investor-data');
  };

  const handleExportPharmacyPDF = () => {
    const pharmacyData = independentResponse?.data || [];
    const dataToExport = pharmacyData.map((pharmacy: IndependentPharmacy) => ({
      PharmacyID: pharmacy._id,
      PharmacyName: pharmacy.name,
      Email: pharmacy.email,
      Phone: pharmacy.phone,
      Address: pharmacy.address,
      ContactPerson: pharmacy.contactPerson,
      Title: pharmacy.title,
      YearOfBusiness: pharmacy.yearofBusiness,
      Status: pharmacy.status,
      CreatedAt: new Date(pharmacy.createdAt).toLocaleDateString(),
    }));
    downloadPDF(dataToExport, 'independent-pharmacy-data');
  };

  const handleExportDriverPDF = () => {
    const driverData = driverResponse?.data || [];
    const dataToExport = driverData.map((driver: Driver) => ({
      DriverID: driver._id,
      Name: driver.name,
      Email: driver.email,
      Phone: driver.phone,
      City: driver.city,
      ZipCode: driver.zipCode,
      VehicleType: driver.vehicleType,
      YearsOfLicense: driver.yearOfDriverLicense,
      Status: driver.status,
      CreatedAt: new Date(driver.createdAt).toLocaleDateString(),
    }));
    downloadPDF(dataToExport, 'driver-data');
  };

  const handleExportInvestorPDF = () => {
    const investorData = investorResponse?.data || [];
    const dataToExport = investorData.map((investor: Investor) => ({
      InvestorID: investor._id,
      Name: investor.name,
      Email: investor.email,
      Phone: investor.phone,
      OrganizationName: investor.organizationName,
      OrganizationType: investor.organizationType,
      Website: investor.website,
      YearsOfInvestmentExperience: investor.yearOfInvestmentExperience,
      Status: investor.status,
      CreatedAt: new Date(investor.createdAt).toLocaleDateString(),
    }));
    downloadPDF(dataToExport, 'investor-data');
  };

  const handleExportPharmacyExcel = () => {
    const pharmacyData = independentResponse?.data || [];
    const dataToExport = pharmacyData.map((pharmacy: IndependentPharmacy) => ({
      PharmacyID: pharmacy._id,
      PharmacyName: pharmacy.name,
      Email: pharmacy.email,
      Phone: pharmacy.phone,
      Address: pharmacy.address,
      ContactPerson: pharmacy.contactPerson,
      Title: pharmacy.title,
      YearOfBusiness: pharmacy.yearofBusiness,
      Status: pharmacy.status,
      CreatedAt: new Date(pharmacy.createdAt).toLocaleDateString(),
    }));
    downloadExcel(dataToExport, 'independent-pharmacy-data');
  };

  const handleExportDriverExcel = () => {
    const driverData = driverResponse?.data || [];
    const dataToExport = driverData.map((driver: Driver) => ({
      DriverID: driver._id,
      Name: driver.name,
      Email: driver.email,
      Phone: driver.phone,
      City: driver.city,
      ZipCode: driver.zipCode,
      VehicleType: driver.vehicleType,
      YearsOfLicense: driver.yearOfDriverLicense,
      Status: driver.status,
      CreatedAt: new Date(driver.createdAt).toLocaleDateString(),
    }));
    downloadExcel(dataToExport, 'driver-data');
  };

  const handleExportInvestorExcel = () => {
    const investorData = investorResponse?.data || [];
    const dataToExport = investorData.map((investor: Investor) => ({
      InvestorID: investor._id,
      Name: investor.name,
      Email: investor.email,
      Phone: investor.phone,
      OrganizationName: investor.organizationName,
      OrganizationType: investor.organizationType,
      Website: investor.website,
      YearsOfInvestmentExperience: investor.yearOfInvestmentExperience,
      Status: investor.status,
      CreatedAt: new Date(investor.createdAt).toLocaleDateString(),
    }));
    downloadExcel(dataToExport, 'investor-data');
  };

  const handleExportOtherBusinessCSV = () => {
    const otherBusinessData = otherBusinessResponse?.data || [];
    const dataToExport = otherBusinessData.map((business: OtherBussiness) => ({
      BusinessID: business._id,
      Name: business.name,
      Email: business.email,
      Phone: business.phone,
      OrganizationName: business.organizationName,
      OrganizationType: business.organizationType,
      Website: business.organizationWebsite,
      Region: business.region,
      Status: business.status,
      CreatedAt: new Date(business.createdAt).toLocaleDateString(),
    }));
    downloadCSV(dataToExport, 'other-business-data');
  };

  const handleExportOtherBusinessPDF = () => {
    const otherBusinessData = otherBusinessResponse?.data || [];
    const dataToExport = otherBusinessData.map((business: OtherBussiness) => ({
      BusinessID: business._id,
      Name: business.name,
      Email: business.email,
      Phone: business.phone,
      OrganizationName: business.organizationName,
      OrganizationType: business.organizationType,
      Website: business.organizationWebsite,
      Region: business.region,
      Status: business.status,
      CreatedAt: new Date(business.createdAt).toLocaleDateString(),
    }));
    downloadPDF(dataToExport, 'other-business-data');
  };

  const handleExportOtherBusinessExcel = () => {
    const otherBusinessData = otherBusinessResponse?.data || [];
    const dataToExport = otherBusinessData.map((business: OtherBussiness) => ({
      BusinessID: business._id,
      Name: business.name,
      Email: business.email,
      Phone: business.phone,
      OrganizationName: business.organizationName,
      OrganizationType: business.organizationType,
      Website: business.organizationWebsite,
      Region: business.region,
      Status: business.status,
      CreatedAt: new Date(business.createdAt).toLocaleDateString(),
    }));
    downloadExcel(dataToExport, 'other-business-data');
  };

  const handleDownloadCsv = () => {
    if (activeTab === 'pharmacy') {
      handleExportPharmacyCSV();
    } else if (activeTab === 'driver') {
      handleExportDriverCSV();
    } else if (activeTab === 'investor') {
      handleExportInvestorCSV();
    } else if (activeTab === 'other') {
      handleExportOtherBusinessCSV();
    }
  };

  const handleDownloadPdf = () => {
    if (activeTab === 'pharmacy') {
      handleExportPharmacyPDF();
    } else if (activeTab === 'driver') {
      handleExportDriverPDF();
    } else if (activeTab === 'investor') {
      handleExportInvestorPDF();
    } else if (activeTab === 'other') {
      handleExportOtherBusinessPDF();
    }
  };

  const handleDownloadXL = () => {
    if (activeTab === 'pharmacy') {
      handleExportPharmacyExcel();
    } else if (activeTab === 'driver') {
      handleExportDriverExcel();
    } else if (activeTab === 'investor') {
      handleExportInvestorExcel();
    } else if (activeTab === 'other') {
      handleExportOtherBusinessExcel();
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-gray-100 pb-6">
            <div className="w-full lg:w-auto overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList value={activeTab} onValueChange={setActiveTab}>
                  <TabsTrigger tabValue="pharmacy" value={activeTab} onValueChange={setActiveTab}>
                    Independent Pharmacy
                  </TabsTrigger>
                  <TabsTrigger tabValue="driver" value={activeTab} onValueChange={setActiveTab}>
                    Delivery Driver
                  </TabsTrigger>
                  <TabsTrigger tabValue="investor" value={activeTab} onValueChange={setActiveTab}>
                    Investor
                  </TabsTrigger>
                  <TabsTrigger tabValue="other" value={activeTab} onValueChange={setActiveTab}>
                    Other Businesses
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <span className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Export Data:</span>
              <Button onClick={handleDownloadCsv} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                <Image src="/icons/refill-prescription/csv.png" alt="CSV" width={24} height={24} className="w-6 h-6" />
              </Button>
              <Button onClick={handleDownloadXL} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                <Image src="/icons/refill-prescription/docs.png" alt="Excel" width={24} height={24} className="w-6 h-6" />
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline" size="icon" className="h-10 w-10 md:h-11 md:w-11 bg-gray-50 hover:bg-white hover:shadow-md border-gray-200 transition-all flex-1 sm:flex-none">
                <Image src="/icons/refill-prescription/pdf.png" alt="Pdf" width={24} height={24} className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent tabValue="pharmacy" value={activeTab}>
                <PharmacyTab />
              </TabsContent>
              <TabsContent tabValue="driver" value={activeTab}>
                <DriverTab />
              </TabsContent>
              <TabsContent tabValue="investor" value={activeTab}>
                <InvestorTab />
              </TabsContent>
              <TabsContent tabValue="other" value={activeTab}>
                <OtherTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
