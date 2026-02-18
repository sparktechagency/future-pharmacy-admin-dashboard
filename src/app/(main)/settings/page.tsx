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
import { CalendarIcon, Clock, Shield, User } from 'lucide-react';
import Image from 'next/image';
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
    <div className="flex flex-col gap-6">
      <div className="">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 flex-1 w-full">
              {/* Profile Image */}
              <div className="relative shrink-0 group">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg border-4 border-purple-50 transition-transform duration-300 group-hover:scale-105">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile"
                      width={1000}
                      height={1000}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>

              </div>

              {/* Profile Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 w-full pb-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Name</div>
                  <div className="text-sm md:text-base font-bold text-gray-900">{profileData?.first_name || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</div>
                  <div className="text-sm md:text-base font-bold text-gray-900">{profileData?.last_name || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Role</div>
                  <div className="text-xs md:text-sm font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-lg w-fit capitalize">
                    {profileData?.role}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</div>
                  <div className="text-sm md:text-base font-bold text-gray-900 break-all">{profileData?.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</div>
                  <div className="text-sm md:text-base font-bold text-gray-900">{profileData?.phone || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Office Location</div>
                  <div className="text-sm md:text-base font-bold text-gray-900">{profileData?.location || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="w-full lg:w-auto bg-[#9c4a8f] hover:bg-[#9c4a8f]/80 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#9c4a8f]/20 transition-all active:scale-95 shrink-0"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-6 mt-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row items-end gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full flex-1">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Current Password</div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl ${passwordErrors.oldPassword ? 'border-red-500 focus:ring-red-500 bg-red-50' : ''}`}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider pl-1">{passwordErrors.oldPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">New Secure Password</div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500 bg-red-50' : ''}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider pl-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
              </div>
              <Button
                className="w-full lg:w-auto bg-[#9c4a8f] border-none hover:bg-[#9c4a8f]/80 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#9c4a8f]/20 transition-all active:scale-95 shrink-0"
                onClick={handlePasswordChange}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Changing...</span>
                  </div>
                ) : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-6 border-l-4 border-purple-600 pl-4">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Security Protocol</h2>
          </div>

          <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all hover:bg-white hover:shadow-md">
            <div className="text-center sm:text-left">
              <div className="font-bold text-gray-900 mb-0.5">Two-Factor Authentication (2FA)</div>
              <div className="text-xs font-medium text-gray-500 max-w-sm">Enhance your account security by requiring a specialized verification code during login.</div>
            </div>
            <Switch
              checked={profileData?.twoStepVerification}
              onCheckedChange={handle2FAToggle}
              disabled={isEnabling2FA}
              className="data-[state=checked]:bg-purple-600 shadow-sm outline-none border-none shrink-0"
            />
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 mb-8 border-l-4 border-[#9c4a8f] pl-4">
            <Clock className="w-5 h-5 text-[#9c4a8f]" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">System Activity Log</h2>
          </div>

          {activityLog.length > 0 ? (
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex gap-4 relative">
                  <div className={`w-10 h-10 rounded-xl ${activity.bgColor} flex items-center justify-center shrink-0 shadow-sm z-10 border-2 border-white`}>
                    <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <div className="font-bold text-gray-900 text-sm md:text-base">{activity.title}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded sm:bg-transparent sm:px-0 sm:py-0">
                        {getRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">{activity.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No recent security events logged</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
          <DialogHeader className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
            <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4">Update Profile</DialogTitle>
            <p className="text-sm font-medium text-gray-500 mt-1 pl-5">Configure your account identity and contact details</p>
          </DialogHeader>

          <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
            {/* First Name and Last Name in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  className="h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                  placeholder="e.g. John"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            {/* Profile Picture with Preview */}
            <div className="bg-purple-50/30 p-5 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white">
                  {previewImage ? (
                    <Image src={previewImage} width={1000} height={1000} alt="Preview" className="w-full h-full object-cover" />
                  ) : profileImageUrl ? (
                    <Image src={profileImageUrl} width={1000} height={1000} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="profile" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Profile Identity Image</Label>
                <Input
                  id="profile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-white border-purple-100 cursor-pointer text-xs h-10 py-2 w-full"
                />
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-tight pl-1 italic">Recommended: Square JPG/PNG, Max 2MB</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                Mobile Number
              </Label>
              <Input
                id="phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Location and Date of Birth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Primary Location
                </Label>
                <Input
                  id="location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                  placeholder="e.g. New York, USA"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-11 justify-start text-left font-bold rounded-xl bg-gray-50 border-gray-100 hover:bg-white transition-all",
                        !editFormData.dateOfBirth && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-purple-600" />
                      {editFormData.dateOfBirth ? (
                        format(
                          editFormData.dateOfBirth instanceof Date
                            ? editFormData.dateOfBirth
                            : new Date(editFormData.dateOfBirth),
                          "PPP"
                        )
                      ) : (
                        <span className="text-sm font-medium">Select Birthday</span>
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
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="ghost"
              onClick={handleDialogClose}
              className="px-8 font-bold text-gray-500 order-2 sm:order-1 h-11"
              disabled={isUpdatingProfile}
            >
              Cancel Update
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="px-8 bg-[#9c4a8f] hover:bg-[#9c4a8f]/80 text-white font-bold order-1 sm:order-2 h-11 shadow-lg shadow-[#9c4a8f]/20 transition-all active:scale-95"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : 'Commit Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}