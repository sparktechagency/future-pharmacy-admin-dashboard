"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useGetMyProfileQuery } from '../../features/profile/profileApi';
import { baseURL } from '../../utils/BaseURL';

export default function Header() {
  const unreadCount = 1; // Example unread count
  const userName = "Jane Cooper";
  const userRole = "Admin";
  const userImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane";
  const router = useRouter();
  const { data: profileResponse, isLoading, refetch } = useGetMyProfileQuery({});
  const profileData = profileResponse?.data;
  console.log("Profile Data:", profileData);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMyProfile = () => {
    router.push("/settings");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    setIsDropdownOpen(false);
    router.push("/auth/login");
  };

  return (
    <div className="w-full border-b">
      <header className="flex h-20 items-center justify-between px-8">
        {/* Left side - Welcome text */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome Back!
          </h1>
        </div>

        {/* Right side - Notification and Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => router.push("/notifications")} className="relative flex cursor-pointer h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <Bell className="h-6 w-6 text-gray-700" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1.5 text-xs font-semibold"
                  variant="destructive"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </button>
          </div>

          {/* User Profile with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={baseURL + "/" + profileData?.profile} alt={userName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">
                  {profileData?.first_name} {profileData?.last_name}
                </span>
                <span className="text-xs text-gray-500">{profileData?.role}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-50">
                <button
                  onClick={handleMyProfile}
                  className="flex w-full px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full px-4 py-2 text-sm cursor-pointer text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}