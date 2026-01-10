"use client";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useReveniewResioQuery } from '../../features/overview/overviewApi';

interface RevenueData {
  month: number;
  totalIncome: number;
}

interface ChartData {
  name: string;
  revenue: number;
  monthNumber: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    color?: string;
  }>;
  label?: string;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function RevenueChart() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Generate last 3 years dynamically
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const { data, isLoading } = useReveniewResioQuery(selectedYear);

  const LoadingFc = () => {
    return (
      <div className="w-8 h-8 border-4 border-[#8E4484] border-t-transparent rounded-full animate-spin"></div>
    );
  };

  // Process API data for chart
  const processChartData = (apiData: RevenueData[]): ChartData[] => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map(item => ({
      name: monthNames[item.month - 1] || `Month ${item.month}`,
      revenue: item.totalIncome || 0,
      monthNumber: item.month
    }));
  };

  const chartData = data?.data ? processChartData(data.data) : [];

  // Get total revenue for the year
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="relative flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm min-w-[180px]">
          <div className="font-semibold text-gray-800 mb-1">{label}</div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#8E4484]" />
              <span className="text-gray-700 text-xs">Revenue:</span>
            </div>
            <span className="font-medium text-gray-900">
              ${payload[0].value.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Monthly Revenue</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Revenue ({selectedYear})</p>
            <p className="text-2xl font-bold text-[#8E4484]">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full h-[350px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingFc />
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <p className="text-gray-500 text-lg mb-2">No revenue data available</p>
            <p className="text-gray-400 text-sm">Select a different year or check back later</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8E4484"
                strokeWidth={3}
                dot={{ r: 4, fill: "#8E4484", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, stroke: "#8E4484", strokeWidth: 2 }}
                name="Monthly Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export default RevenueChart;