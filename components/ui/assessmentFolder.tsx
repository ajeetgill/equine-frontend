"use client";
import { FileObject } from "@supabase/storage-js";
import { Download } from "lucide-react";

export const AssessmentFolder = ({ item }: { item: FileObject }) => {
  return (
    <a
      className="text-foreground flex p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 w-96 justify-between"
      href={`/api/download/${item.name}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {item.name} <Download />
    </a>
  );
};
