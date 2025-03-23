"use client";

import { Trash2 } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";

export const DeleteButton = ({
  folderToDelete,
  onSuccess,
}: {
  folderToDelete: string;
  onSuccess?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    // Confirm deletion with the user
    const confirmed = window.confirm(
      `🚨 Are you sure you want to delete this assessment?\nThis action cannot be undone.\n\nDelete Assessment: ${folderToDelete}`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);

      // Make a DELETE request to our API route
      const response = await fetch(`/api/folder/${folderToDelete}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        //    toast?.({
        //      title: "Folder deleted",
        //      description: `Successfully deleted ${result.count} items from ${folderToDelete}`,
        //      variant: "default",
        //    });

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

      // Show error message
      //  toast?.({
      //    title: "Error",
      //    description: "Failed to delete the folder. Please try again.",
      //    variant: "destructive",
      //  });
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
