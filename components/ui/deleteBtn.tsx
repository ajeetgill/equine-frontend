"use client";

import { Trash2 } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const DeleteButton = ({
  folderToDelete,
  onSuccess,
}: {
  folderToDelete: string;
  onSuccess?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    // Confirm deletion with the user
    const confirmed = window.confirm(
      `🚨 Are you sure you want to delete this assessment?\nThis action cannot be undone.\n\nDelete Assessment: ${folderToDelete}`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);

      // Show starting deletion toast
      const startingToast = toast({
        title: "Starting deletion",
        description: `Preparing to delete ${folderToDelete}`,
        className: "border-blue-500",
      });

      // Show preparing deletion toast
      const preparingToast = toast({
        title: "Preparing deletion",
        description: "Please wait while we process your request...",
        className: "border-yellow-500",
      });

      // Make a DELETE request to our API route
      const response = await fetch(`/api/folder/${folderToDelete}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Dismiss the preparing toast
        preparingToast.dismiss();

        // Show success toast
        toast({
          title: "Deletion complete",
          description: `Successfully deleted ${result.count} items from ${folderToDelete}`,
          className: "border-green-500",
        });

        // Call the success callback or reload the page
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(result.error || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);

      // Show error toast
      toast({
        title: "Deletion failed",
        description: "Failed to delete the folder. Please try again.",
        variant: "destructive",
        className: "border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isLoading}
      className="bg-transparent hover:bg-red-300 border text-red-400 hover:text-red-800"
      aria-label="Delete folder"
    >
      {isLoading ? (
        <span className="w-4 animate-spin">⏳</span>
      ) : (
        <Trash2 className="w-4" />
      )}
    </Button>
  );
};
