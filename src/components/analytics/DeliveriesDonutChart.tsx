"use client";
import { Card } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieLabel } from "recharts/types/polar/Pie";
import { useDashboardTopCardQuery } from '../../features/overview/overviewApi';

interface DeliveryData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface COLORS_TYPE {
  [key: string]: string;
}

// Added "Failed" color to COLORS object
const COLORS: COLORS_TYPE = {
  Completed: "#75D1A4",
  Pending: "#FCCA80",
  Failed: "#FF6B6B", // Added color for Failed status
};

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
  value?: number;
}

interface LegendPayloadItem {
  value: string;
  color: string;
  type?: string;
  payload?: DeliveryData;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: DeliveryData;
}

function DeliveriesDonutChart() {
  const { data, isLoading } = useDashboardTopCardQuery({});

  const LoadingFc = () => {
    return (
      <div className="w-8 h-8 border-4 border-[#8E4484] border-t-transparent rounded-full animate-spin"></div>
    );
  };

  // Extract data from API response with fallback to 0
  const pending = data?.data?.orderPending || 0;
  const completed = data?.data?.orderComplete || 0;
  const failed = data?.data?.orderCancelled || 0;

  // Create delivery data from API response - Added Failed status
  // Filter out categories with 0 value for better visualization
  const deliveryData: DeliveryData[] = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "Failed", value: failed },
  ].filter(item => item.value > 0); // Only show categories with values > 0

  // But for legend, we want to show all categories even if 0
  const allCategories = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "Failed", value: failed },
  ];

  const renderCustomizedLabel: PieLabel = (props: CustomLabelProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent,value } = props;

    // Add null checks for all required values
    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      percent === undefined ||
      value === undefined ||
      value === 0
    ) {
      return null;
    }

    // Only show label if value > 0
    if (value === 0) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({
    payload,
  }: {
    payload?: LegendPayloadItem[];
  }) => {
    if (!payload || payload.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
        {allCategories.map((category, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[category.name] }}
            />
            <span className="text-sm font-medium text-gray-700">
              {category.name} {category.value > 0 ? `(${category.value})` : '(0)'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600">
            Orders: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Card className="h-full p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">
          Pending vs. Completed vs. Failed Deliveries
        </h1>
        <div className="w-full h-[500px] flex items-center justify-center">
          <LoadingFc />
        </div>
      </Card>
    );
  }

  // Check if there's any data to display
  // Include failed orders in the total for checking if data exists
  const totalOrders = pending + completed + failed;
  const hasData = totalOrders > 0;

  return (
    <Card className="h-full p-6 flex flex-col gap-4">
      {/* Updated title to include "Failed" */}
      <h1 className="text-xl font-semibold">
        Delivery Status Overview
      </h1>
      <div className="w-full h-[500px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deliveryData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={130}
                innerRadius={80}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="#ffffff"
                startAngle={90}
                endAngle={-270}
                paddingAngle={deliveryData.length > 1 ? 2 : 0} // Add padding only if more than 1 segment
              >
                {deliveryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || "#D1D5DB"}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Empty donut chart visualization */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                  strokeDasharray="251.2"
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-lg font-medium">No Data</p>
                <p className="text-gray-300 text-sm">No delivery data available</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              {allCategories.map((category, index: number) => (
                <div key={`empty-legend-${index}`} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[category.name] }}
                  />
                  <span className="text-sm font-medium text-gray-400">
                    {category.name} (0)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default DeliveriesDonutChart;