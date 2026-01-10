"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";

import { Report } from "@/components/reports/report.type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import toast from 'react-hot-toast';
import DeleteConfirmationDialog from "../confirmation/deleteConfirmationDialog";

const ReportTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supportToDelete, setSupportToDelete] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);



  // Demo data
  const demoReports: Report[] = [
    {
      _id: "1",
      createdAt: "2024-01-15T10:30:00Z",
      message: "I'm having trouble accessing my prescription history. The page keeps loading indefinitely and I can't see my past medications. Can you please help me resolve this issue?",
      userId: {
        _id: "user1",
        name: "John Smith",
        email: "john.smith@example.com"
      }
    },
    {
      _id: "2",
      createdAt: "2024-01-14T14:45:00Z",
      message: "My pharmacy delivery was late yesterday. The driver said there was traffic but it arrived 2 hours past the scheduled time. I need my medication on time.",
      userId: {
        _id: "user2",
        name: "Emma Johnson",
        email: "emma.j@example.com"
      }
    },
    {
      _id: "3",
      createdAt: "2024-01-13T09:15:00Z",
      message: "The app is crashing every time I try to upload a prescription photo. I've tried on both iOS and Android devices with the same result.",
      userId: {
        _id: "user3",
        name: "Robert Chen",
        email: "robert.chen@example.com"
      }
    },
    {
      _id: "4",
      createdAt: "2024-01-12T16:20:00Z",
      message: "I was charged twice for my last prescription refill. Can you check my payment history and refund the duplicate charge?",
      userId: {
        _id: "user4",
        name: "Sarah Williams",
        email: "sarah.w@example.com"
      }
    },
    {
      _id: "5",
      createdAt: "2024-01-11T11:05:00Z",
      message: "The notification system isn't working properly. I'm not getting alerts when my prescription is ready for pickup.",
      userId: {
        _id: "user5",
        name: "Michael Brown",
        email: "michael.b@example.com"
      }
    },
    {
      _id: "6",
      createdAt: "2024-01-10T13:40:00Z",
      message: "Can you help me merge two accounts? I accidentally created a new account with my work email.",
      userId: {
        _id: "user6",
        name: "Lisa Rodriguez",
        email: "lisa.r@example.com"
      }
    },
    {
      _id: "7",
      createdAt: "2024-01-09T15:25:00Z",
      message: "The prescription search function is not returning accurate results. I'm searching for a specific medication but it's not showing up.",
      userId: {
        _id: "user7",
        name: "David Kim",
        email: "david.kim@example.com"
      }
    },
    {
      _id: "8",
      createdAt: "2024-01-08T12:10:00Z",
      message: "I need to update my insurance information but the form keeps resetting when I submit it.",
      userId: {
        _id: "user8",
        name: "Jennifer Lee",
        email: "jennifer.lee@example.com"
      }
    },
    {
      _id: "9",
      createdAt: "2024-01-07T17:55:00Z",
      message: "My prescription was marked as delivered but I never received it. Can you track the delivery status?",
      userId: {
        _id: "user9",
        name: "Thomas Wilson",
        email: "thomas.w@example.com"
      }
    },
    {
      _id: "10",
      createdAt: "2024-01-06T08:30:00Z",
      message: "The mobile app is very slow on my device. It takes almost 30 seconds to load the dashboard.",
      userId: {
        _id: "user10",
        name: "Amanda Taylor",
        email: "amanda.t@example.com"
      }
    },
    {
      _id: "11",
      createdAt: "2024-01-05T14:15:00Z",
      message: "I need to change my default pharmacy location. The current one is too far from my new address.",
      userId: {
        _id: "user11",
        name: "James Miller",
        email: "james.m@example.com"
      }
    },
    {
      _id: "12",
      createdAt: "2024-01-04T10:50:00Z",
      message: "The prescription refill request button is not working on the website. I've tried multiple browsers.",
      userId: {
        _id: "user12",
        name: "Patricia Davis",
        email: "patricia.d@example.com"
      }
    }
  ];

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const itemsPerPage = 10;
  const totalSupports = demoReports.length;
  const totalPages = Math.ceil(totalSupports / itemsPerPage);

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = demoReports.slice(startIndex, endIndex);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Handle delete button click
  const handleDeleteClick = (support: Report) => {
    setSupportToDelete(support);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!supportToDelete) return;

    setIsDeleting(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In a real app, you would call the API here
      // await deleteSupport(supportToDelete._id).unwrap();

      toast.success("Support request deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSupportToDelete(null);
    } catch (err: unknown) {
      console.error("Error deleting support request:", err);
      toast.error("Failed to delete support request. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSupportToDelete(null);
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "UN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="text-muted-foreground">Loading support requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedReports.length} of {totalSupports} support requests
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Date</TableHead>
              <TableHead className="">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="">Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReports.length > 0 ? (
              paginatedReports.map((support: Report) => (
                <TableRow
                  key={support._id}
                  className=""
                >
                  <TableCell className="font-medium">
                    {new Date(support.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {getInitials(support.userId?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {support.userId?.name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {support.userId?.email || "Unknown"}
                  </TableCell>

                  <TableCell>
                    <div className="break-words text-sm leading-relaxed">
                      {support.message && support.message.length > 150 ? (
                        <div>
                          <div className="line-clamp-3">
                            {support.message.substring(0, 120)}...
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-xs mt-1">
                            Read more
                          </button>
                        </div>
                      ) : (
                        support.message || "No message"
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteClick(support)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-orange-500" />
                        <span className="sr-only">Delete support request</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No support requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Support Request"
          itemName={supportToDelete?.userId?.name || "this support request"}
          itemType="support request"
          isLoading={isDeleting}
          confirmButtonText="Delete Support Request"
          cancelButtonText="Cancel"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default ReportTable;