"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useCreatedeliveryZoneMutation,
  useDeletedeliveryZoneMutation,
  useGetAlldeliveryZoneQuery
} from '../../../features/deliveryZone/deliveryZoneApi'; // Update path as needed
import { CustomLoading } from '../../../hooks/CustomLoading';

// Types
interface DeliveryZone {
  _id: string;
  email: string;
  zipCode: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RTKError {
  data?: {
    message?: string;
  };
}

const DeliveryZoneTable = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZone | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    zipCode: ''
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    zipCode: ''
  });

  // API hooks
  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch
  } = useGetAlldeliveryZoneQuery(currentPage);

  const totalPages = apiResponse?.meta?.totalPage || 1;

  const [createZone, { isLoading: isCreating }] = useCreatedeliveryZoneMutation();
  const [deleteZone, { isLoading: isDeleting }] = useDeletedeliveryZoneMutation();

  // Transform API data
  const deliveryZones: DeliveryZone[] = apiResponse?.data || [];

  // Filter zones based on search query
  const filteredZones = deliveryZones.filter(zone => {
    const searchLower = searchQuery.toLowerCase();
    return (
      zone.email.toLowerCase().includes(searchLower) ||
      zone.zipCode.includes(searchQuery)
    );
  });

  // Handle view details
  const handleViewDetails = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setIsViewDialogOpen(true);
  };

  // // Handle add zone button click
  // const handleAddZone = () => {
  //   setIsAddDialogOpen(true);
  // };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      email: '',
      zipCode: ''
    };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = 'Zip code is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.zipCode)) {
      errors.zipCode = 'Zip code must contain only numbers';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createZone(formData).unwrap();
      toast.success('Delivery Zone created successfully!');

      // Reset form and close modal
      setFormData({ email: '', zipCode: '' });
      setIsAddDialogOpen(false);

      // Refetch data
      refetch();
    } catch (error: unknown) {
      const err = error as RTKError;
      toast.error(err?.data?.message || 'Failed to create delivery zone');
    }
  };

  // Handle delete zone
  const handleDeleteZone = (zone: DeliveryZone) => {
    setZoneToDelete(zone);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!zoneToDelete) return;

    try {
      await deleteZone(zoneToDelete._id).unwrap();
      toast.success('Delivery Zone deleted successfully!');
      setIsDeleteDialogOpen(false);
      setZoneToDelete(null);

      // Refetch data
      refetch();
    } catch (error: unknown) {
      const err = error as RTKError;
      toast.error(err?.data?.message || 'Failed to delete delivery zone');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle close modals
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setFormData({ email: '', zipCode: '' });
    setFormErrors({ email: '', zipCode: '' });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                All Delivery Zones - Requested
              </h1>
              {/* <Button
                variant="outline"
                className="h-auto w-full sm:w-auto bg-[#9c4a8f] py-2.5 px-4 hover:bg-[#9c4a8f] border-[#9c4a8f] text-white flex items-center justify-center gap-2"
                onClick={handleAddZone}
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
                Add Delivery Zone
              </Button> */}
            </div>

            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by email or zip code..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 w-full"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <CustomLoading />
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load delivery zones</p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Zip Code</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
                    <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredZones.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                        {searchQuery ? 'No delivery zones found matching your search' : 'No delivery zones available'}
                      </td>
                    </tr>
                  ) : (
                    filteredZones.map((zone, index) => (
                      <tr key={zone._id} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500 font-mono">
                          {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-900 font-medium break-all max-w-[150px] md:max-w-none">
                          {zone.email}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600 font-mono">
                          {zone.zipCode}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-500 whitespace-nowrap">
                          {zone.createdAt ? formatDate(zone.createdAt).split(',')[0] : 'N/A'}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <button
                              onClick={() => handleViewDetails(zone)}
                              className="p-2 cursor-pointer hover:bg-purple-100 text-gray-400 hover:text-purple-600 rounded-lg transition-all"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            <button
                              onClick={() => handleDeleteZone(zone)}
                              className="p-2 cursor-pointer hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-all"
                              title="Delete zone"
                              disabled={isDeleting}
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
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !isError && filteredZones.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 font-medium">
              Showing <span className="text-purple-600 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, apiResponse?.meta?.total || 0)}</span> to <span className="text-purple-600 font-bold">{Math.min(currentPage * itemsPerPage, apiResponse?.meta?.total || 0)}</span> of <span className="text-purple-600 font-bold">{apiResponse?.meta?.total || 0}</span> zones
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:bg-gray-100 h-8 px-2 md:h-10 md:px-4"
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true;
                    if (page === 1 || page === totalPages) return true;
                    return page >= currentPage - 1 && page <= currentPage + 1;
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 text-gray-400 italic">...</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 md:h-10 md:w-10 p-0 text-xs md:text-sm ${currentPage === page
                          ? 'bg-[#9c4a8f] hover:bg-[#9c4a8f] hover:text-white text-white font-bold'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {String(page).padStart(2, '0')}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:bg-gray-100 h-8 px-2 md:h-10 md:px-4"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Delivery Zone Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-purple-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                New Delivery Zone
              </h3>
              <button
                onClick={handleCloseAddDialog}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
                disabled={isCreating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${formErrors.email ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="e.g. zone@pharmacy.com"
                    disabled={isCreating}
                  />
                  {formErrors.email && (
                    <p className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-wider">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zipCode" className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${formErrors.zipCode ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="e.g. 12345"
                    disabled={isCreating}
                  />
                  {formErrors.zipCode && (
                    <p className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-wider">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseAddDialog}
                  disabled={isCreating}
                  className="order-2 sm:order-1 font-semibold text-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="order-1 sm:order-2 bg-[#9c4a8f] hover:bg-[#9c4a8f] text-white font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Zone'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && zoneToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete Zone?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to delete the zone for <span className="font-bold text-gray-700">{zoneToDelete?.email}</span> ({zoneToDelete?.zipCode})? This cannot be undone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setZoneToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 font-semibold text-gray-500"
              >
                No, Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 font-bold shadow-lg shadow-red-100"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Yes, Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      {isViewDialogOpen && selectedZone && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-purple-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4">
                Zone Details
              </h3>
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white transition-all group">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400">Email Address</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 break-all">{selectedZone?.email}</p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white transition-all group">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400">Zip Code</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 font-mono italic">{selectedZone?.zipCode}</p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white transition-all group">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400">Created At</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {selectedZone?.createdAt ? formatDate(selectedZone.createdAt as string) : 'N/A'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white transition-all group">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-purple-400">Updated At</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {selectedZone?.updatedAt ? formatDate(selectedZone.updatedAt as string) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 shadow-inner">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Zone ID Reference</p>
                <p className="text-[11px] md:text-xs font-mono text-gray-500 break-all leading-relaxed">{selectedZone?._id}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="px-8 font-bold text-gray-500 hover:bg-gray-50 border-gray-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryZoneTable;
