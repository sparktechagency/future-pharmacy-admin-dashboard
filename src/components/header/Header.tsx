"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useGetAllNotificationQuery } from '../../features/notification/notificationApi';
import { useGetMyProfileQuery } from '../../features/profile/profileApi';
import { baseURL } from '../../utils/BaseURL';
import { socket } from '../../utils/socket';

import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { data: notificationData, refetch: refetchNotifications } = useGetAllNotificationQuery({ page: 1, limit: 10 });
  const unreadCount = notificationData?.data?.unReadCount || 0;

  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    const handleNotification = (eventName: string, data: unknown) => {
      if (eventName.startsWith("notification")) {
        console.log(`🔔 Real-time notification received (${eventName}):`, data);
        refetchNotifications();
      }
    };

    // Listen to ALL events and filter for notification ones
    socket.onAny(handleNotification);

    socket.on("connect", () => {
      console.log("🌐 Socket connected/reconnected in Header. ID:", socket.id);
      refetchNotifications();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error in Header:", err.message);
    });

    return () => {
      socket.offAny(handleNotification);
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [refetchNotifications]);




  const userName = "Jane Cooper";
  const router = useRouter();
  const { logout } = useAuth();
  const { data: profileResponse } = useGetMyProfileQuery({});
  const profileData = profileResponse?.data;

  const [isBadgeVisible, setIsBadgeVisible] = useState(true);
  const prevCountRef = useRef(unreadCount);

  // Show badge again if new notifications arrive
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setIsBadgeVisible(true);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  const handleNotificationClick = () => {
    setIsBadgeVisible(false);
    router.push("/notifications");
  };

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
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <div className="w-full border-b">
      <header className="flex h-20 items-center justify-between px-4 md:px-8">
        {/* Left side - Welcome text and Mobile Trigger */}
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="md:hidden text-[#9c4a8f] w-10 h-10 border border-gray-100 rounded-lg hover:bg-gray-50 flex items-center justify-center" />
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 line-clamp-1">
              Welcome Back!
            </h1>
          </div>
        </div>

        {/* Right side - Notification and Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={handleNotificationClick} className="relative flex cursor-pointer h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
              {unreadCount > 0 && isBadgeVisible && (
                <Badge
                  className="absolute -top-1 -right-1 h-4 min-w-4 md:h-5 md:min-w-5 rounded-full px-1 text-[10px] md:text-xs font-semibold"
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
              className="flex items-center gap-2 md:gap-3 rounded-lg border border-gray-200 bg-white px-2 md:px-4 py-1.5 md:py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src={baseURL + "/" + profileData?.profile} alt={userName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xs md:text-base">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-1">
                  {profileData?.first_name} {profileData?.last_name}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{profileData?.role}</span>
              </div>
              <ChevronDown
                className={`h-3 w-3 md:h-4 md:w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
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