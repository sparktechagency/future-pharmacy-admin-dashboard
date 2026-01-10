"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useCreateCMSMutation,
  useGetCMSQuery,
} from "../../../../features/CMS/CMSApi";
import TipTapEditor from "../../../../TipTapEditor/TipTapEditor";
import { RTKError } from '../../../../utils/types';

const AboutPage = () => {
  const [content, setContent] = useState<string>("");
  const [title] = useState<string>("HIPAA Policy");
  const [hasDataLoaded, setHasDataLoaded] = useState<boolean>(false);

  // Fetch CMS data
  const {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  } = useGetCMSQuery({});

  // Update mutation
  const [updateCMS, { isLoading: isUpdating }] = useCreateCMSMutation();

  useEffect(() => {
    if (data?.success && data?.data?.aboutUs) {
      setContent(data.data.aboutUs);
      setHasDataLoaded(true);
    }
  }, [data]);

  const isContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length === 0;
  };

  const handleUpdate = async () => {
    if (isContentEmpty(content)) {
      toast.error("HIPAA content cannot be empty");
      return;
    }

    try {
      const response = await updateCMS({
        aboutUs: content,
      }).unwrap();

      toast.success(response.message || "About updated successfully");
      refetch();
    } catch (error: unknown) {
      const err = error as RTKError;
      toast.error(err?.data?.message || 'Failed to delete blog');
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading Hipaa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col justify-center items-center h-64">
            <p className="text-red-500 mb-4">Failed to load About</p>
            <Button onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* ✅ Only render editor when data has loaded */}
            {hasDataLoaded ? (
              <TipTapEditor
                description={content}
                handleJobDescription={setContent}
                minHeight="400px"
                maxHeight="600px"
              />
            ) : (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading editor...</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isUpdating}
              >
                Back
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating || isContentEmpty(content)}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Privacy"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;