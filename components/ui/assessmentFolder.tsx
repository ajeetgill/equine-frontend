"use client";
import { FileObject } from "@supabase/storage-js";
import { Download } from "lucide-react";
import { DeleteButton } from "./deleteBtn";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const AssessmentFolder = ({ item }: { item: FileObject }) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Show starting download toast
      const startingToast = toast({
        title: "Starting download",
        description: `Preparing to download ${item.name}`,
        className: "border-blue-500",
      });

      // Show preparing download toast with spinner
      const preparingToast = toast({
        title: "Preparing download",
        description: "Please wait while we prepare your file...",
        className: "border-yellow-500",
      });

      // Make the download request
      const response = await fetch(`/api/download/${item.name}`);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Dismiss the preparing toast

      // Show success toast
      toast({
        title: "Download complete",
        description: `Successfully downloaded ${item.name}`,
        variant: "success",
      });
      preparingToast.dismiss();
    } catch (error) {
      console.error("Download failed:", error);

      // Show error toast
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex justify-between shrink-1 basis-full md:basis-[47%] gap-2 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-md">
      <p>{item.name} </p>

      <div className="flex gap-2">
        <button
          className="border rounded-md 
          w-full py-2 px-4 h-min bg-none hover:bg-green-400 hover:text-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className={"h-5"} />
        </button>
        <DeleteButton folderToDelete={item.name} />
      </div>
    </div>
  );
};
