'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircleIcon, ClockIcon, PackageIcon, SearchIcon, TruckIcon, UserIcon } from 'lucide-react';

export default function TrackPrescriptionPage() {
  return (
    <div className="p-3 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Track Prescription Delivery</h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter your Request ID to See real-time Updates.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Type Something"
          className="pl-10 w-full max-w-md"
        />
      </div>

      {/* Main Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Driver Details */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Delivery Expert</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <UserIcon className="h-4 w-4" />
                <span className="text-xs">4.9 Rating</span>
              </div>
            </div>
            <p className="text-sm text-purple-700">
              Contact: <span className="font-medium">+1(234) 567-890</span>
            </p>
          </CardContent>
        </Card>

        {/* Delivery Status */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-purple-700">35 min</div>
            <p className="text-sm text-gray-500">Estimated Time of Arrival</p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TruckIcon className="h-4 w-4" />
              <span>Current Location: main St, San Francisco</span>
            </div>
          </CardContent>
        </Card>

        {/* Package Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Package Contents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <PackageIcon className="h-4 w-4 text-purple-700 mt-0.5" />
              <span className="text-sm">Aspirin 9500mg0 - 30 tables</span>
            </div>
            <div className="flex items-start gap-2">
              <PackageIcon className="h-4 w-4 text-purple-700 mt-0.5" />
              <span className="text-sm">Amoxicillin (250mg) -20 capsules</span>
            </div>
            <div className="flex items-start gap-2">
              <PackageIcon className="h-4 w-4 text-purple-700 mt-0.5" />
              <span className="text-sm">Insulin Syringes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Request Timelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Confirmed */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-white" />
                </div>
                <div className="w-0.5 h-12 bg-purple-700"></div>
              </div>
              <div>
                <p className="font-medium">Request Confirmed</p>
                <p className="text-xs text-gray-500">10:30 AM</p>
              </div>
            </div>

            {/* Assigned */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="w-0.5 h-12 bg-purple-700"></div>
              </div>
              <div>
                <p className="font-medium">Driver Assigned</p>
                <p className="text-xs text-gray-500">10:35 AM</p>
              </div>
            </div>

            {/* On the Way */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                  <TruckIcon className="h-4 w-4 text-white" />
                </div>
                <div className="w-0.5 h-12 bg-gray-300"></div>
              </div>
              <div>
                <p className="font-medium">On the Way</p>
                <p className="text-xs text-gray-500">10:40 AM</p>
              </div>
            </div>

            {/* Delivered (Pending) */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-600">Delivered</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}