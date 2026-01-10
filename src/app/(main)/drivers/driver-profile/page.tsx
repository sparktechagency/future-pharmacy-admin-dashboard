"use client";



import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const DeliveryDriverProfile = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const deliveryHistory = [
    { date: '08/15/2025', requestId: 'REQ12345', patientName: 'David Lee', status: 'Completed' },
    { date: '08/15/2025', requestId: 'REQ12345', patientName: 'David Lee', status: 'Completed' },
    { date: '08/15/2025', requestId: 'REQ12345', patientName: 'David Lee', status: 'Completed' },
    { date: '08/15/2025', requestId: 'REQ12345', patientName: 'David Lee', status: 'Cancelled' },
    { date: '08/15/2025', requestId: 'REQ12345', patientName: 'David Lee', status: 'Completed' },
  ];

  const totalPages = 14;

  const renderPageNumbers = () => {
    const pages = [];

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
        >
          Prev
        </button>
      );
    }

    for (let i = 1; i <= 5; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 text-sm font-medium cursor-pointer rounded ${i === currentPage
            ? 'bg-[#8E4585] text-white'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          {String(i).padStart(2, '0')}
        </button>
      );
    }

    pages.push(
      <span key="ellipsis" className="px-2 text-gray-400">
        ...
      </span>
    );

    pages.push(
      <button
        key={totalPages}
        onClick={() => setCurrentPage(totalPages)}
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
      >
        {totalPages}
      </button>
    );

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
        >
          Next
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="">
      <div className="">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                {/* Profile Picture */}
                <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                    alt="Profile"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">First Name</p>
                    <p className="text-base font-semibold">John</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="text-base">demo@demogmail.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Coverage Area/Region</p>
                    <p className="text-base">Manhattan <span className="text-gray-500">(New York County)</span></p>
                  </div>
                </div>

                {/* Vehicle & Contact Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Name</p>
                    <p className="text-base font-semibold">Doe</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-base">706-455-5214</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vehicle Type</p>
                    <p className="text-base">2010 Toyota camry LE</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License ID</p>
                    <p className="text-base">DL7890123</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button className=" text-white">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-6">
              <Card className='px-10'>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                    <Image src="/icons/driver/total-deliveries.png" alt="view details" width={50} height={50} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Deliveries Completed</p>
                    <p className="text-3xl font-bold">250</p>
                  </div>
                </div>

              </Card>

              <Card className='px-10'>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-[#8E4585]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <p className="text-3xl font-bold">4.8 / 5.0</p>
                  </div>
                </div>

              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Delivery History */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery History</h2>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryHistory.map((delivery, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${delivery.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing 1 to 10 of 14 entries
              </p>
              <div className="flex items-center gap-1">
                {renderPageNumbers()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDriverProfile;