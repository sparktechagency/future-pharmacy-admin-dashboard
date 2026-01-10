"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Info as AboutIcon,
  ArrowRightLeft,
  Bell,
  Building,
  Calendar,
  Car,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText as FileTextIcon,
  LayoutDashboard,
  MapPin,
  Newspaper,
  RefreshCw,
  Settings,
  Shield as ShieldIcon,
  ShoppingBag,
  Users
} from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; path: string; icon: React.ComponentType<{ className?: string }> }[];
};

const sidebars: SidebarItem[] = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Users", path: "/users", icon: Users },
  { name: "Prescription Requests", path: "/prescription-requests", icon: ClipboardList },
  { name: "Refill Rx", path: "/refill-prescription", icon: RefreshCw },
  { name: "Transfer Rx", path: "/transfer-prescription", icon: ArrowRightLeft },
  { name: "Schedule Essential", path: "/schedule-essential", icon: Calendar },
  { name: "Partner Pharmacies", path: "/partner-pharmacy", icon: Building },
  { name: "Business", path: "/business", icon: ShoppingBag },
  { name: "Delivery Zone", path: "/delivery-zone", icon: MapPin },
  { name: "Drivers", path: "/drivers", icon: Car },
  { name: "Blog", path: "/blogs", icon: Newspaper },
  { name: "Payments", path: "/payments", icon: DollarSign },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
  {
    name: "Compliance",
    path: "/compliance",
    icon: ShieldIcon,
    subItems: [
      { name: "Terms & Conditions", path: "/compliance/terms", icon: FileTextIcon },
      { name: "Privacy Policy", path: "/compliance/privacy", icon: ShieldIcon },
      { name: "Hipaa Policy", path: "/compliance/hipaa", icon: AboutIcon },
    ]
  },
];

export default function OptimusSidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const isSettingsActive = () => {
    return pathname.startsWith("/settings");
  };

  const isComplianceActive = () => {
    return pathname.startsWith("/compliance");
  };

  return (
    <Sidebar className="border-none">
      <SidebarContent className="bg-[#9c4a8f] text-white relative">
        {/* Custom scrollbar container */}
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 scrollbar-thumb-rounded-full hover:scrollbar-thumb-white/30">
          <SidebarGroup>
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center px-6 pt-8 pb-6 sticky top-0 bg-[#9c4a8f] z-10">
              <div className="relative w-full max-w-[180px] h-[70px]">
                <Image
                  src="/icons/logo3.png"
                  alt="Dashboard Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100px, 500px"
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <SidebarGroupContent className="px-3 pt-4 pb-8">
              <SidebarMenu className="space-y-1">
                {sidebars.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  let isItemActive = isActive(item.path);

                  // Check for specific dropdown active states
                  if (item.name === "Settings") {
                    isItemActive = isItemActive || isSettingsActive();
                  } else if (item.name === "Compliance") {
                    isItemActive = isItemActive || isComplianceActive();
                  }

                  return (
                    <React.Fragment key={item.name}>
                      <SidebarMenuItem>
                        {hasSubItems ? (
                          <button
                            onClick={() => toggleDropdown(item.name)}
                            className={`w-full h-11 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between ${isItemActive
                              ? "bg-white text-[#9c4a8f] hover:bg-white/90"
                              : "text-white hover:bg-white/10"
                              }`}
                            aria-expanded={openDropdown === item.name}
                            aria-label={`Toggle ${item.name} dropdown`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 shrink-0" />
                              <span className="text-[15px] font-medium">{item.name}</span>
                            </div>
                            {openDropdown === item.name ? (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                            )}
                          </button>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            className={`h-11 px-4 rounded-lg transition-colors duration-200 ${isItemActive
                              ? "bg-white text-[#9c4a8f] hover:bg-white/90"
                              : "text-white hover:bg-white/10"
                              }`}
                            isActive={isItemActive}
                          >
                            <Link
                              href={item.path}
                              className="flex items-center gap-3 w-full"
                              aria-current={isItemActive ? "page" : undefined}
                            >
                              <item.icon className="h-5 w-5 shrink-0" />
                              <span className="text-[15px] font-medium">{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>

                      {/* Dropdown Sub-items */}
                      {hasSubItems && openDropdown === item.name && (
                        <div className="ml-8 space-y-1 mt-1 mb-2">
                          {item.subItems?.map((subItem) => {
                            const isSubItemActive = isActive(subItem.path);
                            return (
                              <SidebarMenuItem key={subItem.path}>
                                <SidebarMenuButton
                                  asChild
                                  className={`h-10 px-4 rounded-lg transition-colors duration-200 ${isSubItemActive
                                    ? "bg-white/20 text-white hover:bg-white/30"
                                    : "text-white/80 hover:bg-white/10"
                                    }`}
                                  isActive={isSubItemActive}
                                >
                                  <Link
                                    href={subItem.path}
                                    className="flex items-center gap-3 w-full"
                                    aria-current={isSubItemActive ? "page" : undefined}
                                  >
                                    <subItem.icon className="h-4 w-4 shrink-0" />
                                    <span className="text-[14px] font-medium">{subItem.name}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      {/* Add custom scrollbar styles to global styles */}
      <style jsx global>{`
        /* For Webkit browsers (Chrome, Safari, Edge) */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* For Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        
        /* Smooth scrolling */
        .scrollbar-thin {
          scroll-behavior: smooth;
        }
      `}</style>
    </Sidebar>
  );
}