"use client";

import { Card } from "@/components/ui/card";
import Image from 'next/image';
import { ReactNode } from 'react';
import { useDashboardTopCardQuery } from "../../features/overview/overviewApi";

interface StatCardProps {
  icon: string | ReactNode;
  value: string | number;
  label: string;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  textColor: string;
}

function StatCard({
  icon,
  value,
  label,
  bgColor,
  iconBgColor,
  iconColor,
  textColor,
}: StatCardProps) {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Image src={icon} height={27} width={27} alt={label} />;
    }
    return <div className={iconColor}>{icon}</div>;
  };

  return (
    <Card className={`${bgColor} border-none shadow-sm p-0`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-8">
          <div
            className={`${iconBgColor} w-14 h-14 rounded-full flex items-center justify-center`}
          >
            {renderIcon()}
          </div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div className={`${textColor} text-base font-medium`}>{label}</div>
      </div>
    </Card>
  );
}

function DashboardStats() {

  const { data, isLoading } = useDashboardTopCardQuery({});

  const LoadingFc = () => {
    return (
      <div className="w-8 h-8 border-4 border-[#8E4484] border-t-transparent rounded-full animate-spin"></div>
    )
  }



  const stats = [
    {
      icon: "/icons/overview/incoming.png",
      value: isLoading ? LoadingFc() : data?.data?.orderPending,
      label: "Incoming Requests",
      bgColor: "bg-[#FFDEE7]",
      iconBgColor: "bg-white",
      iconColor: "text-pink-500",
      textColor: "text-pink-600",
    },
    {
      icon: "/icons/overview/driver.png",
      value: isLoading ? LoadingFc() : data?.data?.allUsers,
      label: "Active Drivers",
      bgColor: "bg-[#D6F2E4]",
      iconBgColor: "bg-white",
      iconColor: "text-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      icon: "/icons/overview/active-users.png",
      value: isLoading ? LoadingFc() : data?.data?.allActiveUsers,
      label: "Active Users",
      bgColor: "bg-[#FFF0D9]",
      iconBgColor: "bg-white",
      iconColor: "text-amber-500",
      textColor: "text-amber-600",
    },
    {
      icon: "/icons/overview/today-payment.png",
      value: isLoading ? LoadingFc() : `$${data?.data?.todayPaymentAmount.toFixed(2)}`,
      label: "Today's Payments",
      bgColor: "bg-[#DEF6F8]",
      iconBgColor: "bg-white",
      iconColor: "text-cyan-500",
      textColor: "text-cyan-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

export default DashboardStats;