"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";


import { FiPlus } from "react-icons/fi";
import PushNotificationAddEditModal from "./PushNotificationAddEditModal";
import PaginationComponent from "../ui/pagination-component";

function PushNotification() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableData = [
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Draft",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Draft",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Draft",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Draft",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
    {
      type: "Email",
      title: "New Feature Release",
      recipientGroup: "All Users",
      dateSent: "04/08/2025",
      status: "Sent",
    },
  ];
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex justify-between w-full">
        <CardTitle className="flex items-center justify-between gap-2 w-full">
          <h1>Notification List</h1>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger>Recipient Type</SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">All Users</SelectItem>
                <SelectItem value="specific_group">Specific Group</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="flex items-center gap-2 bg-amber-400 text-black hover:bg-yellow-500"
              onClick={() => setIsModalOpen(true)}
            >
              <FiPlus />
              New Notification
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full rounded-md border whitespace-nowrap">
          <Table className="bg-white ">
            <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/6">Title</TableHead>
                <TableHead className="w-1/6">Recipient Group</TableHead>
                <TableHead className="w-1/6">Date Sent</TableHead>
                <TableHead className="w-1/6">Status</TableHead>
                <TableHead className="w-1/6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium w-1/6">
                    {data.type}
                  </TableCell>
                  <TableCell className="w-1/6">{data.title}</TableCell>
                  <TableCell className="w-1/6">{data.recipientGroup}</TableCell>
                  <TableCell className="w-1/6">{data.dateSent}</TableCell>
                  <TableCell className="w-1/6">
                    <span
                      className={`p-2 rounded-lg text-center font-medium text-xs inline-block w-20 ${
                        data.status === "Sent"
                          ? "bg-[#f6fafb] text-[#00705d]"
                          : "bg-[#fcfaff] text-sky-500"
                      }`}
                    >
                      {data.status}
                    </span>
                  </TableCell>
                  <TableCell className="w-1/6 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-white border-none shadow-none hover:bg-lime-100"
                        onClick={() => setIsModalOpen(true)}
                      >
                        {/* {provideIcon({ name: "edit" })} */}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-white border-none shadow-none hover:bg-red-50"
                      >
                        {/* {provideIcon({ name: "trash" })} */}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter></TableFooter>
          </Table>
        </ScrollArea>
        <div className="mt-6">
          <PaginationComponent
            totalItems={tableData.length}
            itemsPerPage={5}
            showInfo={true}
            onPageChange={(page) => {
              console.log(`Page changed to: ${page}`);
              // You can add additional logic here if needed
            }}
          />
        </div>
      </CardContent>

      {/* Modal */}
      <PushNotificationAddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}

export default PushNotification;
