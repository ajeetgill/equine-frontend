"use client";
import { FileObject } from "@supabase/storage-js";
import { Download } from "lucide-react";
import { DeleteButton } from "./deleteBtn";

export const AssessmentFolder = ({ item }: { item: FileObject }) => {
  return (
    <div className="flex justify-between shrink-1 basis-full md:basis-[47%] gap-2 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-md">
      <p>{item.name} </p>

      <div className="flex gap-2">
        <a
          className="border rounded-md 
          w-full py-2 px-4 h-min bg-none hover:bg-green-400 hover:text-green-800 transition-all"
          href={`/api/download/${item.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className={"h-5"} />
        </a>
        <DeleteButton folderToDelete={item.name} />
      </div>
    </div>
  );
};
