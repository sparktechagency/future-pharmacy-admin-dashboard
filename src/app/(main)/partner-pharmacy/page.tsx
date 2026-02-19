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
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import toast from 'react-hot-toast';
import CreatePharmacyDialog from '../../../components/pharmacy/CreatePharmacyDialog';
import DeletePharmacyDialog from '../../../components/pharmacy/DeletePharmacyDialog';
import UpdatePharmacyDialog from '../../../components/pharmacy/UpdatePharmacyDialog';
import { useCreatePharmacyMutation, useDeletePharmacyMutation, useGetAllPharmacyQuery, useUpdatePharmacyMutation } from '../../../features/fharmacy/fharmacyApi';

import { Pharmacy, PharmacyFormData } from '../../../components/pharmacy';
import { CustomLoading } from '../../../hooks/CustomLoading';
import { useCSVDownload } from '../../../hooks/useCSVDownload';
import { useDownloadPDF } from '../../../hooks/useDownloadPDF';
import { useDownloadXlShit } from '../../../hooks/useDownloadXlShit';
import { baseURL } from '../../../utils/BaseURL';
import { RTKError } from '../../../utils/types';

const PartnerPharmacyTable = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pharmacyFilter, setPharmacyFilter] = useState<string>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);


  const { data: apiResponse, isLoading, error, refetch } = useGetAllPharmacyQuery(currentPage, { pollingInterval: 5000 });
  const [createPharmacy] = useCreatePharmacyMutation();
  const [updatePharmacy] = useUpdatePharmacyMutation();
  const [deletePharmacy] = useDeletePharmacyMutation();
  const { downloadCSV } = useCSVDownload();
  const { downloadPDF } = useDownloadPDF();
  const { downloadExcel } = useDownloadXlShit();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  const totalPages = apiResponse?.meta?.totalPage || 1;


  useEffect(() => {
    if (apiResponse?.success && apiResponse.data) {
      setPharmacies(apiResponse.data);
    }
  }, [apiResponse]);

  const [formData, setFormData] = useState<PharmacyFormData>({
    name: '',
    address: '',
    phone: '',
    zipCode: '',
    email: '',
    contactPerson: '',
    title: '',
    yearofBusiness: '',
    message: '',
    status: 'pending',
    licenseNumber: '',
    businessPhoneNumber: '',
    latitude: '',
    longitude: '',
    logo: null
  });

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      zipCode: '',
      email: '',
      contactPerson: '',
      title: '',
      yearofBusiness: '',
      message: '',
      status: 'pending',
      licenseNumber: '',
      businessPhoneNumber: '',
      latitude: '',
      longitude: '',
      logo: null
    });
  };

  // Handle view details
  const handleViewDetails = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsViewDialogOpen(true);
  };

  // Handle add pharmacy
  const handleAddPharmacy = () => {
    resetFormData();
    setIsAddDialogOpen(true);
  };

  // Handle edit pharmacy
  const handleEditPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      email: pharmacy.email,
      contactPerson: pharmacy.contactPerson,
      title: pharmacy.title,
      yearofBusiness: pharmacy.yearofBusiness,
      message: pharmacy.message,
      status: pharmacy.status,
      zipCode: pharmacy.zipCode,
      licenseNumber: pharmacy.licenseNumber,
      businessPhoneNumber: pharmacy.businessPhoneNumber,
      latitude: pharmacy.latitude.toString(),
      longitude: pharmacy.longitude.toString(),
      logo: null
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete pharmacy
  const handleDeletePharmacy = (pharmacy: Pharmacy) => {
    setPharmacyToDelete(pharmacy);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (pharmacyToDelete) {
      try {
        await deletePharmacy(pharmacyToDelete._id).unwrap();
        setPharmacies(pharmacies.filter(p => p._id !== pharmacyToDelete._id));
        setIsDeleteDialogOpen(false);
        setPharmacyToDelete(null);
        toast.success('Pharmacy deleted successfully');
      } catch (error) {
        console.error('Failed to delete pharmacy:', error);
        toast.error('Failed to delete pharmacy');
      }
    }
  };

  // Handle form submission for add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const validData = new FormData();
    validData.append('name', formData.name);
    validData.append('address', formData.address);
    validData.append('phone', formData.phone);
    validData.append('email', formData.email);
    validData.append('zipCode', formData.zipCode);
    validData.append('contactPerson', formData.contactPerson);
    validData.append('title', formData.title);
    validData.append('yearofBusiness', formData.yearofBusiness);
    validData.append('message', formData.message);
    validData.append('status', formData.status);
    validData.append('licenseNumber', formData.licenseNumber);
    validData.append('businessPhoneNumber', formData.businessPhoneNumber);
    validData.append('latitude', formData.latitude);
    validData.append('longitude', formData.longitude);
    if (formData.logo) {
      validData.append('logo', formData.logo);
    }

    try {
      const response = await createPharmacy(validData).unwrap();
      toast.success(response.message || "Pharmacy created successfully");

      if (response.success) {
        setIsAddDialogOpen(false);
        resetFormData();
        refetch();
      }
    } catch (error: unknown) {
      const err = error as RTKError;
      toast.error(err?.data?.message || 'Failed to create pharmacy');
    }
  };

  // Handle form submission for edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validData = new FormData();
    validData.append('name', formData.name);
    validData.append('address', formData.address);
    validData.append('phone', formData.phone);
    validData.append('email', formData.email);
    validData.append('zipCode', formData.zipCode);
    validData.append('contactPerson', formData.contactPerson);
    validData.append('title', formData.title);
    validData.append('yearofBusiness', formData.yearofBusiness);
    validData.append('message', formData.message);
    validData.append('status', formData.status);
    validData.append('licenseNumber', formData.licenseNumber);
    validData.append('businessPhoneNumber', formData.businessPhoneNumber);
    validData.append('latitude', formData.latitude);
    validData.append('longitude', formData.longitude);
    if (formData.logo) {
      validData.append('logo', formData.logo);
    }

    if (selectedPharmacy) {
      try {
        const response = await updatePharmacy({
          id: selectedPharmacy._id,
          data: validData
        }).unwrap();

        if (response.success && response.data) {
          const updatedPharmacies = pharmacies.map(p =>
            p._id === selectedPharmacy._id ? response.data : p
          );
          setPharmacies(updatedPharmacies);
          setIsEditDialogOpen(false);
          setSelectedPharmacy(null);
          resetFormData();
          toast.success('Pharmacy updated successfully');
        }
      } catch (error: unknown) {
        const err = error as RTKError;
        console.error('Failed to update pharmacy:', error);
        toast.error(err?.data?.message || 'Failed to update pharmacy');
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  // Handle export functions
  const handleExportCSV = () => {
    const dataToExport = filteredPharmacies.map(request => ({
      Name: request.name,
      Address: request.address,
      Phone: request.phone,
      Email: request.email,
    }));
    downloadCSV(dataToExport);
  };

  const handleExportDocs = () => {
    const dataToExport = filteredPharmacies.map(request => ({
      Name: request.name,
      Address: request.address,
      Phone: request.phone,
      Email: request.email,
    }));
    downloadExcel(dataToExport);
  };

  const handleExportPDF = () => {
    const dataToExport = filteredPharmacies.map(request => ({
      Name: request.name,
      Address: request.address,
      Phone: request.phone,
      Email: request.email,
    }));
    downloadPDF(dataToExport);
  };

  // Filter pharmacies based on search and status
  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = searchQuery === '' ||
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pharmacy.contactPerson && pharmacy.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pharmacy.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || pharmacy.status === statusFilter;
    const matchesPharmacy = pharmacyFilter === 'all' || pharmacy._id === pharmacyFilter;

    return matchesSearch && matchesStatus && matchesPharmacy;
  });

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

  // Loading state
  if (isLoading) {
    return (
      <CustomLoading />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error loading pharmacies</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPharmacy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Pharmacy Details</span>
                </DialogTitle>
                <DialogDescription>
                  View complete details of the pharmacy
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 md:space-y-6 py-2 md:py-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Pharmacy Information</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Name</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium break-words">{selectedPharmacy.name}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Contact Person</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium underline underline-offset-4 decoration-purple-200">{selectedPharmacy.contactPerson || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Title</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedPharmacy.title || 'N/A'}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Address</p>
                      <p className="text-sm md:text-base text-gray-900 break-words">{selectedPharmacy.address}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Zip Code</p>
                      <p className="text-sm md:text-base text-gray-900 break-words">{selectedPharmacy.zipCode}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedPharmacy.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Business Phone</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedPharmacy.businessPhoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm md:text-base text-gray-900 break-all">{selectedPharmacy.email}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">License Number</p>
                      <p className="text-sm md:text-base text-gray-900 font-mono font-medium">{selectedPharmacy.licenseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Year of Business</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedPharmacy.yearofBusiness || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</p>
                      <Badge
                        variant="secondary"
                        className={
                          `mt-1 border-none px-2 py-0.5 text-xs font-medium capitalize ${selectedPharmacy.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : selectedPharmacy.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`
                        }
                      >
                        {selectedPharmacy.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Location & Media</h3>
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Latitude</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedPharmacy.latitude}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Longitude</p>
                      <p className="text-sm md:text-base text-gray-900">{selectedPharmacy.longitude}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Message</p>
                      <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap">{selectedPharmacy.message || 'No additional message'}</p>
                    </div>
                    {selectedPharmacy.logo && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Pharmacy Logo</p>
                        <div className="w-24 h-24 md:w-32 md:h-32 relative bg-gray-50 rounded-lg p-2 border border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                          <Image
                            src={`${baseURL}/${selectedPharmacy.logo}`}
                            alt={selectedPharmacy.name}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 96px, 128px"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Pharmacy Dialog */}
      <CreatePharmacyDialog
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        formData={formData}
        handleSubmitAdd={handleSubmitAdd}
        resetFormData={resetFormData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        setFormData={setFormData}
      />

      {/* Edit Pharmacy Dialog */}
      <UpdatePharmacyDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        formData={formData}
        handleSubmitEdit={handleSubmitEdit}
        setSelectedPharmacy={setSelectedPharmacy}
        resetFormData={resetFormData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        setFormData={setFormData}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePharmacyDialog
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        pharmacyToDelete={pharmacyToDelete}
        setPharmacyToDelete={setPharmacyToDelete}
        confirmDelete={confirmDelete}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters Section */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              All Partner Pharmacies
            </h1>
            <div className="flex gap-3 md:gap-5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-gray-100 hover:bg-gray-200 border-gray-200 flex-1 sm:flex-none"
                onClick={handleExportCSV}
              >
                <Image src="/icons/refill-prescription/csv.png" alt="Export CSV" width={24} height={24} className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-gray-100 hover:bg-gray-200 border-gray-200 flex-1 sm:flex-none"
                onClick={handleExportDocs}
              >
                <Image src="/icons/refill-prescription/docs.png" alt="Export Docs" width={24} height={24} className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-gray-100 hover:bg-gray-200 border-gray-200 flex-1 sm:flex-none"
                onClick={handleExportPDF}
              >
                <Image src="/icons/refill-prescription/pdf.png" alt="Export PDF" width={24} height={24} className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Button
                variant="outline"
                className="h-auto w-full md:w-auto bg-[#9c4a8f] hover:text-white py-2.5 px-4 hover:bg-[#8e4484] border-[#8e4484] text-white font-medium shadow-sm transition-all active:scale-95"
                onClick={handleAddPharmacy}
              >
                Add Partner Pharmacy
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 lg:max-w-4xl">
              <div className="relative lg:col-span-1 sm:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search pharmacies..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 w-full focus:bg-white transition-colors"
                />
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-50 w-full border-gray-200 focus:bg-white transition-colors">
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

              <div>
                <Select value={pharmacyFilter} onValueChange={setPharmacyFilter}>
                  <SelectTrigger className="bg-gray-50 w-full border-gray-200 focus:bg-white transition-colors">
                    <SelectValue placeholder="Pharmacy: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Pharmacy: All</SelectItem>
                    {pharmacies.map(pharmacy => (
                      <SelectItem key={pharmacy._id} value={pharmacy._id}>
                        {pharmacy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Pharmacy Name</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Address</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Contact Person</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Zip Code</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Phone</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPharmacies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                    No pharmacies found
                  </td>
                </tr>
              ) : (
                filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm font-medium text-gray-900">
                      {pharmacy.name}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600 max-w-[150px] md:max-w-xs truncate">
                      {pharmacy.address}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600">
                      {pharmacy.contactPerson || 'N/A'}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      {pharmacy.zipCode}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      {pharmacy.phone}
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() => handleViewDetails(pharmacy)}
                          className="p-2 cursor-pointer hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <button
                          onClick={() => handleEditPharmacy(pharmacy)}
                          className="p-2 hover:bg-green-50 cursor-pointer text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                          title="Edit pharmacy"
                        >
                          <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <button
                          onClick={() => handleDeletePharmacy(pharmacy)}
                          className="p-2 hover:bg-red-50 cursor-pointer text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete pharmacy"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-600 font-medium order-2 md:order-1">
              Showing page <span className="text-purple-600 font-bold">{currentPage}</span> of <span className="text-purple-600 font-bold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2 order-1 md:order-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 px-3 text-gray-500 hover:bg-white hover:shadow-sm font-bold text-xs uppercase tracking-widest disabled:opacity-30"
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 py-1 text-gray-300 text-xs">...</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className={`h-9 w-9 p-0 text-xs font-bold transition-all ${currentPage === page
                          ? 'bg-[#9c4a8f] hover:text-white py-2.5 px-4 hover:bg-[#8e4484] border-[#8e4484] text-white font-medium shadow-sm transition-all active:scale-95'
                          : 'text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-sm'
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
                disabled={currentPage === totalPages}
                className="h-9 px-3 text-gray-500 hover:bg-white hover:shadow-sm font-bold text-xs uppercase tracking-widest disabled:opacity-30"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPharmacyTable;