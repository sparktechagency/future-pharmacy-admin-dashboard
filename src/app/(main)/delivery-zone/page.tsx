"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Plus, Search, Trash2, X } from 'lucide-react';
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
  } = useGetAlldeliveryZoneQuery(undefined);

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

  // Handle add zone button click
  const handleAddZone = () => {
    setIsAddDialogOpen(true);
  };

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              All Delivery Zones
            </h1>
          </div>

          <div className='pb-3 flex justify-between'>
            <div className='w-full'></div>
            <Button
              variant="outline"
              className="h-auto w-auto bg-purple-600 py-2.5 px-4 hover:bg-purple-700 border-purple-600 text-white flex items-center gap-2"
              onClick={handleAddZone}
              disabled={isCreating}
            >
              <Plus className="w-4 h-4" />
              Add Delivery Zone
            </Button>
          </div>

          <div className="pb-4">
            <div className="flex items-center justify-between gap-5">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by email or zip code"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Zip Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredZones.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        {searchQuery ? 'No delivery zones found matching your search' : 'No delivery zones available'}
                      </td>
                    </tr>
                  ) : (
                    filteredZones.map((zone) => (
                      <tr key={zone._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {zone.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {zone.zipCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {zone.createdAt ? formatDate(zone.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(zone)}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-5 h-5 text-gray-600" />
                            </button>

                            <button
                              onClick={() => handleDeleteZone(zone)}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                              title="Delete zone"
                              disabled={isDeleting}
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
          )}
        </div>
      </div>

      {/* Add Delivery Zone Modal */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Add New Delivery Zone
              </h3>
              <button
                onClick={handleCloseAddDialog}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                disabled={isCreating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                    disabled={isCreating}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                    Zip Code *
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`mt-1 ${formErrors.zipCode ? 'border-red-500' : ''}`}
                    placeholder="Enter zip code"
                    disabled={isCreating}
                  />
                  {formErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseAddDialog}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Delivery Zone'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && zoneToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Delivery Zone
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the delivery zone for <strong>{zoneToDelete.email}</strong> with zip code <strong>{zoneToDelete.zipCode}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setZoneToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      {isViewDialogOpen && selectedZone && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Delivery Zone Details
              </h3>
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-xl px-3 cursor-pointer hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedZone.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Zip Code</p>
                  <p className="font-medium text-gray-900">{selectedZone.zipCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">
                    {selectedZone.createdAt ? formatDate(selectedZone.createdAt) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Updated At</p>
                  <p className="font-medium text-gray-900">
                    {selectedZone.updatedAt ? formatDate(selectedZone.updatedAt) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Zone ID</p>
                <p className="font-medium text-gray-900 text-sm break-all">{selectedZone._id}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
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