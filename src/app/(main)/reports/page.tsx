"use client";

import { Card, CardContent } from '@/components/ui/card';
import { ArrowRightLeft, Calendar, Pill, UserCheck, Users } from 'lucide-react';
import Image from 'next/image';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../../../components/ui/button';

// Sales Trend Data
const salesData = [
  { day: 'Mon', successful: 65, failed: 0 },
  { day: 'Tue', successful: 55, failed: 0 },
  { day: 'Wed', successful: 48, failed: 0 },
  { day: 'Thu', successful: 92, failed: 0 },
  { day: 'Fri', successful: 85, failed: 0 },
  { day: 'Sat', successful: 70, failed: 0 },
  { day: 'Sun', successful: 55, failed: 0 },
];

// Delivery Performance Data
const deliveryData = [
  { name: 'Completed', value: 65, color: '#6ee7b7' },
  { name: 'Pending', value: 35, color: '#fcd34d' },
];

// Partner vs Non-Partner Pharmacy Data
const pharmacyComparisonData = [
  { day: 'Mon', partner: 65, nonPartner: 55 },
  { day: 'Tue', partner: 55, nonPartner: 48 },
  { day: 'Wed', partner: 50, nonPartner: 52 },
  { day: 'Thu', partner: 95, nonPartner: 70 },
  { day: 'Fri', partner: 88, nonPartner: 65 },
  { day: 'Sat', partner: 75, nonPartner: 58 },
  { day: 'Sun', partner: 60, nonPartner: 50 },
];

// Top Pharmacies Data
const topPharmaciesData = [
  { name: 'City Care', volume: 920 },
  { name: 'Medplus', volume: 850 },
  { name: 'GreenPharm', volume: 780 },
  { name: 'HealthMart', volume: 720 },
  { name: 'PharmaLine', volume: 650 },
  { name: 'CVSPharma', volume: 580 },
  { name: 'MedPharma', volume: 480 },
];

const Dashboard = () => {
  return (
    <div className="">
      <div className="space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Refills */}
          <Card className="bg-[#C6F2F7]  border-0">
            <CardContent className="flex flex-col p-6 justify-center">
              <div className="flex items-start justify-between">
                <div className="bg-white rounded-xl p-3">
                  <Pill className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-4xl font-bold text-gray-800">78</span>
              </div>
              <p className="text-lg font-medium text-cyan-500 mt-4">Total Refills</p>
            </CardContent>
          </Card>

          {/* Total Transfers Processed */}
          <Card className="bg-[#FFF0D9] border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-white rounded-xl p-3">
                  <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-4xl font-bold text-gray-800">44</span>
              </div>
              <p className="text-lg font-medium text-amber-500 mt-4">Total Transfers Processed</p>
            </CardContent>
          </Card>

          {/* Appointments Scheduled */}
          <Card className="bg-[#D6F2E4] border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-white rounded-xl p-3">
                  <Calendar className="w-6 h-6 text-pink-500" />
                </div>
                <span className="text-4xl font-bold text-gray-800">36</span>
              </div>
              <p className="text-lg font-medium text-emerald-500 mt-4">Appointments Scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Registered Users */}
          <Card className="bg-[#FFC4D8] border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-white rounded-xl p-3">
                  <Users className="w-6 h-6 text-pink-500" />
                </div>
                <span className="text-4xl font-bold text-gray-800">5,000</span>
              </div>
              <p className="text-lg font-medium text-pink-500 mt-4">Total Registered users</p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-[#C8C1FF] border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-white rounded-xl p-3">
                  <UserCheck className="w-6 h-6 text-indigo-500" />
                </div>
                <span className="text-4xl font-bold text-gray-800">3,500</span>
              </div>
              <p className="text-lg font-medium text-indigo-500 mt-4">Active Users</p>
            </CardContent>
          </Card>

          {/* File Icons Card */}
          <Card className="bg-[#8E4585] border-0">
            <CardContent className="p-6">
              <div className="flex justify-center items-center gap-4 h-full">
                <Button variant="outline" size="icon" className="h-16 w-16 bg-gray-100 hover:bg-gray-100 border-gray-200">
                  <Image src="/icons/refill-prescription/csv.png" alt="view details" width={40} height={40} />
                </Button>
                <Button variant="outline" size="icon" className="h-16 w-16 bg-gray-100 hover:bg-gray-100 border-gray-200">
                  <Image src="/icons/refill-prescription/docs.png" alt="view details" width={40} height={40} />
                </Button>
                <Button variant="outline" size="icon" className="h-16 w-16 bg-gray-100 hover:bg-gray-100 border-gray-200">
                  <Image src="/icons/refill-prescription/pdf.png" alt="view details" width={40} height={40} className='w-8 h-8' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="successful"
                    stroke="#67e8f9"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 6 }}
                    name="Successful Deliveries"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#f472b6"
                    strokeWidth={2}
                    name="Failed Deliveries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Delivery Performance */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {deliveryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partner Pharmacy vs Non Partner Pharmacy */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Partner Pharmacy vs Non Partner Pharmacy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pharmacyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="partner"
                    stroke="#6ee7b7"
                    strokeWidth={3}
                    dot={false}
                    name="Partner Pharmacy"
                  />
                  <Line
                    type="monotone"
                    dataKey="nonPartner"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    dot={false}
                    name="Non Partner Pharmacy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Pharmacies by Delivery Volume */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Pharmacies by Delivery Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPharmaciesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#a78bfa" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;