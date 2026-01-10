import Image from 'next/image';
import { Card } from '../ui/card';
import { ReactNode } from 'react';

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


export default StatCard;
