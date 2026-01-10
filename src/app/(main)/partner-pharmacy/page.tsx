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


  const { data: apiResponse, isLoading, error, refetch } = useGetAllPharmacyQuery({});
  const [createPharmacy] = useCreatePharmacyMutation();
  const [updatePharmacy] = useUpdatePharmacyMutation();
  const [deletePharmacy] = useDeletePharmacyMutation();
  const { downloadCSV } = useCSVDownload();
  const { downloadPDF } = useDownloadPDF();
  const { downloadExcel } = useDownloadXlShit();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  console.log("pharmacies", pharmacies);



  useEffect(() => {
    if (apiResponse?.success && apiResponse.data) {
      setPharmacies(apiResponse.data);
    }
  }, [apiResponse]);

  const [formData, setFormData] = useState<PharmacyFormData>({
    name: '',
    address: '',
    phone: '',
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

  // Confirm delete - এখন API কল করবো
  const confirmDelete = async () => {
    if (pharmacyToDelete) {
      try {
        await deletePharmacy(pharmacyToDelete._id).unwrap();
        // API সফল হলে লোকালি আপডেট করবো
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

  // Handle form submission for add - এখন API কল করবো
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const validData = new FormData();
    validData.append('name', formData.name);
    validData.append('address', formData.address);
    validData.append('phone', formData.phone);
    validData.append('email', formData.email);
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
      console.log("create response", response);
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

  // Handle form submission for edit - এখন API কল করবো
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validData = new FormData();
    validData.append('name', formData.name);
    validData.append('address', formData.address);
    validData.append('phone', formData.phone);
    validData.append('email', formData.email);
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
          // API সফল হলে লোকালি আপডেট করবো
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

              <div className="space-y-6 py-4">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Pharmacy Information</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Name:</span>
                        <span className="text-gray-900">{selectedPharmacy.name}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Address:</span>
                        <span className="text-gray-900">{selectedPharmacy.address}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Phone:</span>
                        <span className="text-gray-900">{selectedPharmacy.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Email:</span>
                        <span className="text-gray-900">{selectedPharmacy.email}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Bussiness Number: </span>
                        <span className="text-gray-900"> {selectedPharmacy.businessPhoneNumber}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">License Number:</span>
                        <span className="text-gray-900">{selectedPharmacy.licenseNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Contact Person:</span>
                        <span className="text-gray-900">{selectedPharmacy.contactPerson}</span>
                      </div>

                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Title:</span>
                        <span className="text-gray-900">{selectedPharmacy.title}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Year of Business:</span>
                        <span className="text-gray-900">{selectedPharmacy.yearofBusiness}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Status:</span>
                        <Badge
                          variant="secondary"
                          className={
                            selectedPharmacy.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : selectedPharmacy.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {selectedPharmacy.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="md:col-span-1  space-y-4">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Latitude:</span>
                        <span className="text-gray-900">{selectedPharmacy.latitude}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Longitude:</span>
                        <span className="text-gray-900">{selectedPharmacy.longitude}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-32">Message:</span>
                        <span className="text-gray-900">{selectedPharmacy.message}</span>
                      </div>
                      {selectedPharmacy.logo && (
                        <div className="flex items-start">
                          <span className="font-medium text-gray-700 min-w-32">Logo:</span>
                          <div className="w-24 h-24 relative">
                            <Image
                              src={`${baseURL}/${selectedPharmacy.logo}`}
                              alt={selectedPharmacy.name}
                              fill
                              className="object-contain"
                              sizes="96px"
                            />
                          </div>
                        </div>
                      )}

                    </div>
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

      <div className="">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              All Partner Pharmacies
            </h1>
            <div className="flex gap-5">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200"
                onClick={handleExportCSV}
              >
                <Image src="/icons/refill-prescription/csv.png" alt="Export CSV" width={28} height={28} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200"
                onClick={handleExportDocs}
              >
                <Image src="/icons/refill-prescription/docs.png" alt="Export Docs" width={28} height={28} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 bg-gray-100 hover:bg-gray-100 border-gray-200"
                onClick={handleExportPDF}
              >
                <Image src="/icons/refill-prescription/pdf.png" alt="Export PDF" width={28} height={28} className='w-8 h-8' />
              </Button>
            </div>
          </div>

          <div className='pb-3 flex justify-between'>
            <div className='w-full'></div>
            <Button
              variant="outline"
              className="h-auto w-auto bg-purple-600 py-2.5 px-4 hover:bg-purple-700 border-purple-600 text-white"
              onClick={handleAddPharmacy}
            >
              Add Partner Pharmacy
            </Button>
          </div>

          <div className="pb-4">
            <div className="flex items-center justify-between gap-5">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, address, contact person or phone"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>

              <div className='w-full'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
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

              <div className='w-full'>
                <Select value={pharmacyFilter} onValueChange={setPharmacyFilter}>
                  <SelectTrigger className="bg-white w-full border-gray-300">
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                    Pharmacy Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                    Phone
                  </th>
                  {/* <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                    Status
                  </th> */}
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPharmacies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No pharmacies found
                    </td>
                  </tr>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pharmacy.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pharmacy.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pharmacy.contactPerson}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pharmacy.phone}
                      </td>
                      {/* <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={
                            pharmacy.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : pharmacy.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {pharmacy.status}
                        </Badge>
                      </td> */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(pharmacy)}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>

                          <button
                            onClick={() => handleEditPharmacy(pharmacy)}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                            title="Edit pharmacy"
                          >
                            <Pencil className="w-5 h-5 text-green-600" />
                          </button>

                          <button
                            onClick={() => handleDeletePharmacy(pharmacy)}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                            title="Delete pharmacy"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPharmacyTable;