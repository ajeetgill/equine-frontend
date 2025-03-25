"use server";

import { createClient } from "@/utils/supabase/server";
import { generateDoc } from "./docGeneration";
const BUCKET = process.env.ASSESSMENT_BUCKET_NAME!;

export const getBucketName = async () => {
  const supabase = await createClient();
  const { data: buckets, error } = await supabase.storage.getBucket(BUCKET);
  return buckets?.name ?? "bucket-not-found";
};

// List all files within a folder
export const listFilesInFolder = async (folderName: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(folderName);

  if (error) {
    console.error("Error listing files in folder:", error);
    return [];
  }

  return data || [];
};

// Get a signed URL for a file
export const getFileSignedUrl = async (filePath: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60);

  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }

  return data.signedUrl;
};

// Download a file's content
export const downloadFile = async (filePath: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(filePath);

  if (error) {
    console.error("Error downloading file:", error);
    return null;
  }
  // console.log("DONWLOAD FILE, filetype: ", data.type);
  if (data.type.includes("json")) {
    // so if the type of file blob is JSON, we use it to generate a file.docx as a blob
    const jsonBlobText = await data.text();
    return generateDoc(jsonBlobText);
  }

  return data;
};

export const downloadAssessmentURL = async (folderName: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(folderName, 60);

  if (error) return { url: null, success: false };
  else return { url: data, success: true };
};

// Download a folder by redirecting to the API
// export const downloadFolder = (folderName: string) => {
//   // Create the URL to the API route
//   const url = `/api/download/${folderName}`;

//   // Open in a new tab to start the download
//   window.open(url, "_blank");

//   return true;
// };

export async function deleteAssessmentFolder(folderName: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([folderName]);

  if (error) {
    console.error("Error deleting folder:", error);
    return { success: false };
  }

  return { success: true };
}

// Add this function to your actions/supabase.ts file
export async function deleteFile(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }

  return true;
}
