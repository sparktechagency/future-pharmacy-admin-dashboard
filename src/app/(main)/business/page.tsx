"use client";

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
    <div className="flex border-b border-gray-200 mb-6">
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
      className={`px-6 py-3 text-sm font-medium transition-colors relative ${isActive
        ? 'text-gray-900'
        : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
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
  type: 'pharmacy' | 'driver' | 'investor' | "other Bussiness";
  data: Pharmacy | Driver | Investor | OtherBussiness | null;
  children: ReactNode;
}

const ViewDetailsDialog = ({ type, data, children }: ViewDetailsDialogProps) => {
  if (!data) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {type === 'pharmacy' ? 'Pharmacy Details' :
              type === 'driver' ? 'Driver Details' : 'Investor Details'}
          </DialogTitle>
          <DialogDescription>
            View complete information about this {type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pharmacy Details */}
          {type === 'pharmacy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {(data as Pharmacy).logo && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border">
                    <Image
                      src={`${baseURL}/${(data as Pharmacy).logo}`}
                      alt={(data as Pharmacy).name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{(data as Pharmacy).name}</h3>
                  <p className="text-sm text-gray-500">{(data as Pharmacy).email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="text-sm">{(data as Pharmacy).contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Title</p>
                  <p className="text-sm">{(data as Pharmacy).title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{(data as Pharmacy).phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year of Business</p>
                  <p className="text-sm">{(data as Pharmacy).yearofBusiness}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bessiness Phone Number</p>
                  <p className="text-sm">{(data as Pharmacy).businessPhoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">License Number</p>
                  <p className="text-sm">{(data as Pharmacy).licenseNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm">{(data as Pharmacy).address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Latitude</p>
                  <p className="text-sm">{(data as Pharmacy).latitude}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Longitude</p>
                  <p className="text-sm">{(data as Pharmacy).longitude}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Message</p>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{(data as Pharmacy).message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {data.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Driver Details */}
          {type === 'driver' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{(data as Driver).name}</h3>
                <p className="text-sm text-gray-500">{(data as Driver).email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{(data as Driver).phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-sm">{(data as Driver).city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zip Code</p>
                  <p className="text-sm">{(data as Driver).zipCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                  <p className="text-sm capitalize">{(data as Driver).vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Years of License</p>
                  <p className="text-sm">{(data as Driver).yearOfDriverLicense}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {data.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Message</p>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{(data as Driver).message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-sm">{new Date(data.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Investor Details */}
          {type === 'investor' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{(data as Investor).name}</h3>
                <p className="text-sm text-gray-500">{(data as Investor).email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-sm">{(data as Investor).organizationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization Type</p>
                  <p className="text-sm">{(data as Investor).organizationType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{(data as Investor).phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-sm">
                    <a href={(data as Investor).website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {(data as Investor).website}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Investment Experience</p>
                  <p className="text-sm">{(data as Investor).yearOfInvestmentExperience} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {data.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Message</p>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{(data as Investor).message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-sm">{new Date(data.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          {type === 'other Bussiness' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{(data as OtherBussiness).name}</h3>
                <p className="text-sm text-gray-500">{(data as OtherBussiness).email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-sm">{(data as OtherBussiness).organizationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization Type</p>
                  <p className="text-sm">{(data as OtherBussiness).organizationType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{(data as OtherBussiness).phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-sm">
                    <a href={(data as OtherBussiness).organizationWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {(data as OtherBussiness).organizationWebsite}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-sm">{(data as OtherBussiness).region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {data.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Message</p>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{(data as OtherBussiness).message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-sm">{new Date(data.updatedAt).toLocaleDateString()}</p>
                </div>
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

  const { data: pharmacyResponse, isLoading } = useGetAllPharmacyQuery({});

  // Filter pharmacy data based on search and status
  const filteredPharmacyData = pharmacyResponse?.data?.filter((pharmacy: Pharmacy) => {
    const matchesSearch = searchTerm === '' ||
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.phone.includes(searchTerm) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = status === 'all' || pharmacy.status === status;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className='flex flex-col gap-5'>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative w-6/12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pharmacy by name, email, phone, or address"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className='w-3/12'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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
        <>
          <div className="rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPharmacyData.length > 0 ? (
                  filteredPharmacyData.map((item: Pharmacy, index: number) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.licenseNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.contactPerson}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.status}</td>
                      <td className="px-6">
                        <ViewDetailsDialog type="pharmacy" data={item}>
                          <button
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
                        </ViewDetailsDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No pharmacy data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {filteredPharmacyData.length} of {pharmacyResponse?.meta?.total || 0} entries
            </div>
            {/* Pagination can be implemented here */}
          </div>
        </>
      )}
    </div>
  );
};

// Driver Component
const DriverTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: driverResponse, isLoading } = useGetAllDriverQuery({});

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
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative w-6/12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search driver by name, email, phone, or city"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className='w-3/12'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-3/12'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driving License Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDriverData.length > 0 ? (
                  filteredDriverData.map((item: Driver, index: number) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.vehicleType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-20 h-12 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-600">
                          {item.yearOfDriverLicense}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.status}</td>
                      <td className="px-6">
                        <ViewDetailsDialog type="driver" data={item}>
                          <button
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
                        </ViewDetailsDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No driver data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {filteredDriverData.length} of {driverResponse?.meta?.total || 0} entries
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Investor Component
const InvestorTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: investorResponse, isLoading } = useGetAllInvestorsQuery({});

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
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative w-6/12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search investor by name, email, organization, or phone"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className='w-3/12'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-3/12'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestorData.length > 0 ? (
                  filteredInvestorData.map((item: Investor, index: number) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.organizationName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.status}</td>
                      <td className="px-6">
                        <ViewDetailsDialog type="investor" data={item}>
                          <button
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
                        </ViewDetailsDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No investor data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {filteredInvestorData.length} of {investorResponse?.meta?.total || 0} entries
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Other Business Component
const OtherTab = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

  const { data: otherBusinessResponse, isLoading } = useGetAllOtherBussinessQuery({});

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
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative w-6/12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, organization, phone, or region"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className='w-3/12'>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='w-3/12'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOtherBusinessData.length > 0 ? (
                  filteredOtherBusinessData.map((item: OtherBussiness, index: number) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.organizationName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.organizationType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <ViewDetailsDialog type="other Bussiness" data={item}>
                          <button
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
                        </ViewDetailsDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No other business data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {filteredOtherBusinessData.length} of {otherBusinessResponse?.meta?.total || 0} entries
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pharmacy');

  // ✅ Call hooks ONCE at component top level
  const { data: pharmacyResponse } = useGetAllPharmacyQuery({});
  const { data: driverResponse } = useGetAllDriverQuery({});
  const { data: investorResponse } = useGetAllInvestorsQuery({});
  const { data: otherBusinessResponse } = useGetAllOtherBussinessQuery({});

  const { downloadCSV } = useCSVDownload();
  const { downloadPDF } = useDownloadPDF();
  const { downloadExcel } = useDownloadXlShit();

  // ✅ Reuse already-fetched data — DO NOT call hooks inside these functions!
  const handleExportPharmacyCSV = () => {
    const pharmacyData = pharmacyResponse?.data || [];
    const dataToExport = pharmacyData.map((pharmacy: Pharmacy) => ({
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
    downloadCSV(dataToExport, 'pharmacy-data');
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
    const pharmacyData = pharmacyResponse?.data || [];
    const dataToExport = pharmacyData.map((pharmacy: Pharmacy) => ({
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
    downloadPDF(dataToExport, 'pharmacy-data');
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
    const pharmacyData = pharmacyResponse?.data || [];
    const dataToExport = pharmacyData.map((pharmacy: Pharmacy) => ({
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
    downloadExcel(dataToExport, 'pharmacy-data');
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
    <div className='flex flex-col gap-5'>
      <div className="p-6 shadow bg-white rounded-lg">
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList value={activeTab} onValueChange={setActiveTab}>
                  <TabsTrigger tabValue="pharmacy" value={activeTab} onValueChange={setActiveTab}>
                    Pharmacy
                  </TabsTrigger>
                  <TabsTrigger tabValue="driver" value={activeTab} onValueChange={setActiveTab}>
                    Driver
                  </TabsTrigger>
                  <TabsTrigger tabValue="investor" value={activeTab} onValueChange={setActiveTab}>
                    Investor
                  </TabsTrigger>
                  <TabsTrigger tabValue="other" value={activeTab} onValueChange={setActiveTab}>
                    Other Bussiness
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadCsv} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                <Image src="/icons/refill-prescription/csv.png" alt="CSV" width={28} height={28} />
              </Button>
              <Button onClick={handleDownloadXL} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                <Image src="/icons/refill-prescription/docs.png" alt="Excel" width={28} height={28} />
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline" size="icon" className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200">
                <Image src="/icons/refill-prescription/pdf.png" alt="PDF" width={28} height={28} className='w-8 h-8' />
              </Button>
            </div>
          </div>

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
  );
}