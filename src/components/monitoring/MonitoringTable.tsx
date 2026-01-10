"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import DeleteConfirmationDialog from "../confirmation/deleteConfirmationDialog";
import { Button } from "../ui/button";
import PaginationComponent from "../ui/pagination-component";
import { ScrollArea } from "../ui/scroll-area";
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

function MonitoringTable() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (campaignId: string, organizerName: string) => {
    setSelectedCampaign({ id: campaignId, name: organizerName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCampaign) {
      console.log(
        `Deleting campaign: ${selectedCampaign.id} - ${selectedCampaign.name}`
      );
      // Here you would typically make an API call to delete the campaign
      // For now, we'll just close the modal
      setIsDeleteModalOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedCampaign(null);
  };

  const tableData = [
    {
      campaignId: "#c-1045",
      organizerName: "Hope School",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1046",
      organizerName: "Green Valley School",
      submissionDate: "04/08/2025",
      status: "Pending",
    },
    {
      campaignId: "#c-1047",
      organizerName: "Sunshine Academy",
      submissionDate: "04/08/2025",
      status: "Rejected",
    },
    {
      campaignId: "#c-1048",
      organizerName: "Mountain View School",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1049",
      organizerName: "Ocean Side School",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1050",
      organizerName: "Forest Hill Academy",
      submissionDate: "04/08/2025",
      status: "Pending",
    },
    {
      campaignId: "#c-1051",
      organizerName: "City Center School",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1052",
      organizerName: "Riverside Academy",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1053",
      organizerName: "Hilltop School",
      submissionDate: "04/08/2025",
      status: "Rejected",
    },
    {
      campaignId: "#c-1054",
      organizerName: "Valley View School",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1055",
      organizerName: "Pine Tree Academy",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1056",
      organizerName: "Golden Gate School",
      submissionDate: "04/08/2025",
      status: "Pending",
    },
    {
      campaignId: "#c-1057",
      organizerName: "Blue Sky Academy",
      submissionDate: "04/08/2025",
      status: "Active",
    },
    {
      campaignId: "#c-1058",
      organizerName: "Redwood School",
      submissionDate: "04/08/2025",
      status: "Rejected",
    },
    {
      campaignId: "#c-1059",
      organizerName: "Silver Lake Academy",
      submissionDate: "04/08/2025",
      status: "Active",
    },
  ];
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex justify-between w-full">
        <CardTitle className="flex items-center justify-between gap-2 w-full">
          <h1>Campaign Approval</h1>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger>Last weeks</SelectTrigger>
              <SelectContent>
                <SelectItem value="Lastweek">Last weeks</SelectItem>
                <SelectItem value="Lastmonth">Last month</SelectItem>
                <SelectItem value="Lastyear">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>Status</SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full rounded-md border whitespace-nowrap">
          <Table className="bg-white ">
            <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead className="w-1/6">Campaign ID</TableHead>
                <TableHead className="w-1/6">Organizer Name</TableHead>
                <TableHead className="w-1/6">Submission Date</TableHead>
                <TableHead className="w-1/6">Status</TableHead>
                <TableHead className="w-1/6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium w-1/6">
                    {data.campaignId}
                  </TableCell>
                  <TableCell className="w-1/6">{data.organizerName}</TableCell>
                  <TableCell className="w-1/6">{data.submissionDate}</TableCell>
                  <TableCell className="w-1/6">
                    <span
                      className={`p-2 rounded-lg text-center font-medium text-xs inline-block w-20 ${data.status === "Active"
                          ? "bg-[#f6fafb] text-[#00705d]"
                          : data.status === "Pending"
                            ? "bg-[#fdfef7] text-yellow-500"
                            : "bg-[#fef8f8] text-red-500"
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
                      >
                        {/* {provideIcon({ name: "check" })} */}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-white border-none shadow-none hover:bg-red-50"
                        onClick={() =>
                          handleDeleteClick(data.campaignId, data.organizerName)
                        }
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

        {/* Pagination Component using Shadcn UI */}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Campaign"
        itemName={selectedCampaign?.name}
        itemType="campaign"
        confirmButtonText="Delete Campaign"
        cancelButtonText="Cancel"
        variant="destructive"
      />
    </Card>
  );
}

export default MonitoringTable;
