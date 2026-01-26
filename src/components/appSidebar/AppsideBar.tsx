"use client";

import {
  Sidebar,
  SidebarContent,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  RefreshCw,
  Settings,
  Shield as ShieldIcon,
  ShoppingBag,
  Users,
  X
} from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
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

  const handleNavigation = (path: string) => {
    console.log("path :", path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isSettingsActive = () => {
    return pathname.startsWith("/settings");
  };

  const isComplianceActive = () => {
    return pathname.startsWith("/compliance");
  };

  const handleLogout = () => {
    console.log("Logging out...");
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push("/auth/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-none transition-all duration-300">
      <SidebarContent className="bg-[#9c4a8f] text-white flex flex-col h-full relative overflow-hidden">
        <TooltipProvider>
          {/* Toggle Button - Only show on desktop */}
          {!isMobile && (
            <div className={`flex ${isCollapsed ? 'justify-center ' : 'justify-end'} px-4 pt-4`}>
              <button
                onClick={toggleSidebar}
                className="text-white/80 hover:text-white cursor-pointer transition-colors p-1"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <Menu size={24} /> : <X size={24} />}
              </button>
            </div>
          )}

          {/* Logo Section */}
          <div className={`flex flex-col items-center justify-center px-6 ${isCollapsed ? 'py-4' : 'pb-6 pt-6 md:pt-2'}`}>
            {!isCollapsed ? (
              <div className="relative w-full max-w-[160px] h-[60px]">
                <Image
                  src="/icons/logo3.png"
                  alt="Dashboard Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                <span className="text-white font-black text-xl italic">O</span>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 ${isCollapsed ? '' : 'px-4'} py-4`}>
            <ul className="space-y-1">
              {sidebars.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                let isItemActive = isActive(item.path);

                if (item.name === "Settings") {
                  isItemActive = isItemActive || isSettingsActive();
                } else if (item.name === "Compliance") {
                  isItemActive = isItemActive || isComplianceActive();
                }

                const Icon = item.icon;
                const isSubMenuOpen = openDropdown === item.name;

                return (
                  <li key={item.name} className="relative group">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        {hasSubItems ? (
                          <button
                            onClick={() => toggleDropdown(item.name)}
                            className={`w-full h-11 flex items-center cursor-pointer transition-all duration-200 ${isCollapsed ? 'justify-center rounded-lg' : 'px-4 rounded-lg'
                              } ${isItemActive
                                ? "bg-white text-[#9c4a8f]"
                                : "text-white hover:bg-white/10"
                              }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className={`ml-3 text-[15px] flex-1 text-left font-medium`}>
                                  {item.name}
                                </span>
                                {isSubMenuOpen ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </>
                            )}
                          </button>
                        ) : (
                          <Link
                            href={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full h-11 flex items-center cursor-pointer transition-all duration-200 ${isCollapsed ? 'justify-center rounded-lg' : 'px-4 rounded-lg'
                              } ${isItemActive
                                ? "bg-white text-[#9c4a8f]"
                                : "text-white hover:bg-white/10"
                              }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                              <span className={`ml-3 text-[15px] flex-1 text-left font-medium`}>
                                {item.name}
                              </span>
                            )}
                          </Link>
                        )}
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-gray-800 text-white border-none">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>

                    {/* Submenu Items */}
                    {!isCollapsed && hasSubItems && isSubMenuOpen && (
                      <ul className="mt-1 space-y-1 ml-4 border-l border-white/20 pl-4 py-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = isActive(subItem.path);
                          const SubIcon = subItem.icon;
                          return (
                            <li key={subItem.path}>
                              <Link
                                href={subItem.path}
                                onClick={() => handleNavigation(subItem.path)}
                                className={`w-full h-9 flex items-center cursor-pointer transition-all duration-200 px-3 rounded-md ${isSubActive
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/80 hover:text-white hover:bg-white/10'
                                  }`}
                              >
                                <SubIcon className="h-4 w-4 mr-2 shrink-0" />
                                <span className="text-[14px]">{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer with Logout */}
          <div className={`mt-auto pb-6 ${isCollapsed ? 'px-2' : 'px-4'} space-y-2 pt-4 border-t border-white/10`}>
            <div className="relative group">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className={`w-full h-11 flex items-center cursor-pointer transition-all duration-200 ${isCollapsed ? 'justify-center rounded-lg' : 'px-4 rounded-lg'} bg-red-500/80 hover:bg-red-500 text-white`}
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="ml-3 text-[15px] font-medium">Logout</span>}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-gray-800 text-white border-none">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
            {!isCollapsed && (
              <p className="text-center text-[10px] text-white/40 uppercase tracking-widest mt-2">
                Optimus Health Solutions
              </p>
            )}
          </div>
        </TooltipProvider>
      </SidebarContent>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </Sidebar>
  );
}