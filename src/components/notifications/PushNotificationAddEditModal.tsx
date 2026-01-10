"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ArrowRight } from "lucide-react";
import TipTapEditor from "@/TipTapEditor/TipTapEditor";

interface PushNotificationAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PushNotificationAddEditModal({
  isOpen,
  onClose,
}: PushNotificationAddEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    recipientType: "",
    deliveryMethod: "",
    description: "",
  });

  const handleDescriptionChange = (description: string) => {
    setFormData((prev) => ({
      ...prev,
      description,
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData);
    onClose();
  };

  const handleSendNotification = () => {
    console.log("Sending notification:", formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Create New Notification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Notification Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Notification Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-[#f5f5f5] border-gray-300"
            />
          </div>

          {/* Recipient Type and Delivery Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientType" className="text-sm font-medium">
                Recipient Type
              </Label>
              <Select
                value={formData.recipientType}
                onValueChange={(value) =>
                  handleInputChange("recipientType", value)
                }
              >
                <SelectTrigger className="bg-[#f5f5f5] border-gray-300 w-full">
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="specific_group">Specific Group</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMethod" className="text-sm font-medium">
                Delivery Method
              </Label>
              <Select
                value={formData.deliveryMethod}
                onValueChange={(value) =>
                  handleInputChange("deliveryMethod", value)
                }
              >
                <SelectTrigger className="bg-[#f5f5f5] border-gray-300 w-full">
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Write a brief description <span className="text-red-500">*</span>
            </Label>
            <div className="bg-[#f5f5f5] border border-gray-300 rounded-md">
              <TipTapEditor
                handleJobDescription={handleDescriptionChange}
                description={formData.description}
                minHeight="150px"
                maxHeight="300px"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSaveAsDraft}
              className="border-[#00705d] rounded-md border-2 bg-[#f6fafb] text-[#00705d] hover:bg-[#00705d]/10"
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSendNotification}
              className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2"
            >
              Send Notification
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PushNotificationAddEditModal;
