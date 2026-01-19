"use client";

import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from '@/components/ui/switch';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetMyProfileQuery, useResetPasswordProfileMutation, useTwoStepVerificationMutation, useUpdateProfileMutation } from "../../../features/profile/profileApi";
import { baseURL } from '../../../utils/BaseURL';

// Helper function to format relative time
const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const updateTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - updateTime.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

export default function UserProfilePage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState({ oldPassword: '', newPassword: '' });

  // API hooks
  const { data: profileResponse, isLoading, refetch } = useGetMyProfileQuery({});
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordProfileMutation();
  const [twoFactor, { isLoading: isEnabling2FA }] = useTwoStepVerificationMutation();

  const profileData = profileResponse?.data;

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    profile: null as File | null,
    phone: '',
    location: '',
    dateOfBirth: '' as string | Date
  });

  // Activity log with dynamic timestamps
  const [activityLog, setActivityLog] = useState<Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    timestamp: string;
    bgColor: string;
    iconColor: string;
  }>>([]);

  // Initialize form data when profile data loads
  useEffect(() => {
    if (profileData) {
      // Parse dateOfBirth string to Date object if it exists
      let dobDate: Date | string = '';
      if (profileData.dateOfBirth) {
        const parsedDate = new Date(profileData.dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          dobDate = parsedDate;
        }
      }

      setEditFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        profile: null,
        phone: profileData.phone || '',
        location: profileData.location || '',
        dateOfBirth: dobDate
      });

      // Create activity log based on profile data
      const activities = [];

      if (profileData.updatedAt) {
        activities.push({
          icon: User,
          title: 'Profile Updated',
          description: 'Profile information was updated',
          timestamp: profileData.updatedAt,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600'
        });
      }

      if (profileData.twoStepVerification) {
        activities.push({
          icon: Shield,
          title: 'Security Settings Updated',
          description: 'Enabled Two-Factor Authentication',
          timestamp: profileData.updatedAt,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600'
        });
      }

      setActivityLog(activities);
    }
  }, [profileData]);

  // Add new activity to log
  const addActivityLog = (title: string, description: string, icon: React.ComponentType<{ className?: string }>) => {
    const newActivity = {
      icon,
      title,
      description,
      timestamp: new Date().toISOString(),
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    };
    setActivityLog(prev => [newActivity, ...prev]);
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append('first_name', editFormData.first_name);
      formData.append('last_name', editFormData.last_name);
      if (editFormData.profile) {
        formData.append('profile', editFormData.profile);
      }
      formData.append('phone', editFormData.phone);
      formData.append('location', editFormData.location);

      // Format date to ISO string if it's a Date object
      if (editFormData.dateOfBirth) {
        let dateValue = '';
        if (editFormData.dateOfBirth instanceof Date) {
          dateValue = editFormData.dateOfBirth.toISOString().split('T')[0]; // YYYY-MM-DD format
        } else {
          dateValue = editFormData.dateOfBirth;
        }
        formData.append('dateOfBirth', dateValue);
      }

      const result = await updateProfile(formData).unwrap();
      console.log("update profile", result)

      if (result.success) {
        toast.success(result.message || 'Profile updated successfully');
        addActivityLog('Profile Updated', 'Profile information was updated', User);
        setIsEditDialogOpen(false);
        setPreviewImage(null);
        refetch();
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const err = error as { data?: { message?: string } };
        toast.error(err.data?.message || 'Failed to update profile');
      } else {
        toast.error('Failed to update profile');
      }
      console.error('Update profile error:', error);
    }
  };

  const validatePasswordFields = () => {
    const errors = { oldPassword: '', newPassword: '' };
    let isValid = true;

    if (!oldPassword.trim()) {
      errors.oldPassword = 'Old password is required';
      isValid = false;
    }

    if (!newPassword.trim()) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordFields()) {
      return;
    }

    try {
      const result = await resetPassword({
        oldPassword,
        newPassword
      }).unwrap();

      console.log("result Password", result)

      if (result.success) {
        toast.success(result.message || 'Password changed successfully');
        addActivityLog('Security Settings Updated', 'Password was changed', Shield);
        setOldPassword('');
        setNewPassword('');
        setPasswordErrors({ oldPassword: '', newPassword: '' });
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const err = error as { data?: { message?: string } };
        toast.error(err.data?.message || 'Failed to change password');
      } else {
        toast.error('Failed to change password');
      }
      console.error('Password change error:', error);
    }
  };

  const handle2FAToggle = async (checked: boolean) => {
    try {
      const result = await twoFactor({}).unwrap();

      if (result.success) {
        toast.success(result.message || '2FA settings updated successfully');
        const action = checked ? 'Enabled' : 'Disabled';
        addActivityLog('Security Settings Updated', `${action} Two-Factor Authentication`, Shield);
        refetch();
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const err = error as { data?: { message?: string } };
        toast.error(err.data?.message || 'Failed to update 2FA settings');
      } else {
        toast.error('Failed to update 2FA settings');
      }
      console.error('2FA toggle error:', error);
    }
  };

  const getProfileImageUrl = (profilePath: string) => {
    if (!profilePath) return '';

    // If it's already a full URL, return as is
    if (profilePath.startsWith('http')) return profilePath;

    // Convert Windows path to URL path
    const normalizedPath = profilePath.replace(/\\/g, '/');
    // Remove 'uploads' prefix if it exists in the path

    // Return the full URL
    return `${baseURL}/${normalizedPath}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData({ ...editFormData, profile: file });

      // Create preview URL
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Clear password errors when user starts typing
  useEffect(() => {
    if (oldPassword && passwordErrors.oldPassword) {
      setPasswordErrors(prev => ({ ...prev, oldPassword: '' }));
    }
  }, [oldPassword, passwordErrors.oldPassword]);

  useEffect(() => {
    if (newPassword && passwordErrors.newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
    }
  }, [newPassword, passwordErrors.newPassword]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  // Get profile image URL
  const profileImageUrl = getProfileImageUrl(profileData?.profile || '');
  console.log("Profile Image URL:", profileImageUrl);

  return (
    <div className="">
      <div className="">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 relative">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="object-cover h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Profile Info Grid */}
              <div className="grid grid-cols-3 gap-x-16 gap-y-6 flex-1">
                <div>
                  <div className="text-sm text-gray-500 mb-1">First Name</div>
                  <div className="text-base font-medium text-gray-900">{profileData?.first_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Last Name</div>
                  <div className="text-base font-medium text-gray-900">{profileData?.last_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Role</div>
                  <div className="text-base font-medium text-gray-900 capitalize">{profileData?.role}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email Address</div>
                  <div className="text-base font-medium text-gray-900">{profileData?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                  <div className="text-base font-medium text-gray-900">{profileData?.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="text-base font-medium text-gray-900">{profileData?.location || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="text-white px-6"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-4 w-full mr-4">
              <div className='grid grid-cols-2 gap-6'>
                <div className='w-full'>
                  <div className="text-base font-semibold mb-3">Old Password</div>
                  <Input
                    type="password"
                    placeholder="Enter your old password here..."
                    className={`w-full ${passwordErrors.oldPassword ? 'border-red-500' : ''}`}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.oldPassword}</p>
                  )}
                </div>
                <div className='w-full'>
                  <div className="text-base font-semibold mb-3">New Password</div>
                  <Input
                    type="password"
                    placeholder="Enter your new password here..."
                    className={`w-full ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
              </div>
            </div>
            <Button
              className="text-white px-6 mt-10 shrink-0"
              onClick={handlePasswordChange}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? 'Changing...' : 'Change password'}
            </Button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-base font-semibold mb-4">Security</div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-900 mb-1">Two-Factor Authentication (2FA)</div>
              <div className="text-sm text-gray-500">Enable 2FA for enhanced security</div>
            </div>
            <Switch
              checked={profileData?.twoStepVerification}
              onCheckedChange={handle2FAToggle}
              disabled={isEnabling2FA}
              className="data-[state=checked]:bg-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-base font-semibold mb-6">Activity Log</div>
          {activityLog.length > 0 ? (
            <div className="space-y-6">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center shrink-0`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{activity.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{activity.description}</div>
                    <div className="text-xs text-gray-400">{getRelativeTime(activity.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No recent activity</div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-600 mb-4">
            Update your profile information below
          </div>

          <div className="space-y-4">
            {/* First Name and Last Name in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  className="w-full"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="w-full"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Profile Picture with Preview */}
            <div>
              <Label htmlFor="profile" className="text-sm font-medium mb-2 block">
                Profile Picture
              </Label>

              {/* Show current image if no preview */}
              {!previewImage && profileImageUrl && (
                <div className="mb-3 relative w-24 h-24">
                  <img
                    src={profileImageUrl}
                    alt="Current Profile"
                    className="rounded-full h-full border-2 border-gray-200"
                  />
                </div>
              )}

              {/* Show preview if exists */}
              {previewImage && (
                <div className="mb-3 relative w-24 h-24">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="rounded-full h-full object-cover border-2 border-gray-200"
                  />
                </div>
              )}

              <Input
                id="profile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a new profile picture (optional)</p>
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full"
                placeholder="e.g., +1234567890"
              />
            </div>

            {/* Location and Date of Birth Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                  Location
                </Label>
                <Input
                  id="location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full"
                  placeholder="e.g., bangladesh"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium mb-2 block">
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editFormData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editFormData.dateOfBirth ? (
                        format(
                          editFormData.dateOfBirth instanceof Date
                            ? editFormData.dateOfBirth
                            : new Date(editFormData.dateOfBirth),
                          "PPP"
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editFormData.dateOfBirth
                          ? (editFormData.dateOfBirth instanceof Date
                            ? editFormData.dateOfBirth
                            : new Date(editFormData.dateOfBirth))
                          : undefined
                      }
                      onSelect={(date) =>
                        setEditFormData({ ...editFormData, dateOfBirth: date || '' })
                      }
                      initialFocus
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Dialog Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                className="px-6"
                disabled={isUpdatingProfile}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="text-white px-6"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}