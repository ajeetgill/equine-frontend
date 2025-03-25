"use client";
// Used this btn to test the dummyJsonObject to .docx conversion.
// DID NOT DELETE, as I might need it to test AssessmentJSOBBlob to docx conversion

// When deleting, also uninstall `file-saver` package
import { FileText } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";
// import { generateDoc } from "@/actions/docGeneration";
import { saveAs } from "file-saver";

export const GenerateDocBtn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGen = async () => {
    try {
      setIsLoading(true);

      //   const result: Blob = await generateDoc();
      const result = "s";

      if (result) {
        saveAs(result, "Horse-table.docx");
      } else {
        throw new Error("Failed to generate horse table");
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGen}
      disabled={isLoading}
      className="bg-transparent border rounded-md 
          w-full py-2 px-4 h-min bg-none hover:bg-green-400 text-green-800 transition-all"
      aria-label="Delete folder"
    >
      {isLoading ? (
        <span className="w-4 animate-spin">⏳</span>
      ) : (
        <FileText className="w-4" />
      )}
    </Button>
  );
};
