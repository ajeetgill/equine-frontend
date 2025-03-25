import { downloadFile, listFilesInFolder } from "@/actions/supabase";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { FileObject } from "@supabase/storage-js";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderName: string }> }
) {
  try {
    // Verify user authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If no session exists, user is not authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const param = await params;
    const folderName = param.folderName;

    // List all files in the folder
    const files = await listFilesInFolder(folderName);

    if (!files.length) {
      return NextResponse.json(
        { error: "No Assessment found in this folder" },
        { status: 404 }
      );
    }

    // Create a new zip file
    const zip = new JSZip();

    // Helper function to download files and add to zip
    const downloadAndAddToZip = async (
      fileList: FileObject[],
      basePath: string,
      targetFolder?: JSZip
    ) => {
      return fileList.map(async (file) => {
        const filePath = `${basePath}/${file.name}`;
        const fileData = await downloadFile(filePath);

        if (fileData) {
          try {
            // For Blob objects (browser environment)
            const arrayBuffer = await (fileData as any).arrayBuffer();
            if (targetFolder) {
              targetFolder.file(file.name, arrayBuffer);
            } else {
              zip.file(file.name, arrayBuffer);
            }
          } catch (error) {
            // If arrayBuffer() method is not available, use as is
            if (targetFolder) {
              targetFolder.file(file.name, fileData);
            } else {
              zip.file(file.name, fileData);
            }
          }
          return true;
        }
        return false;
      });
    };

    // Recursive function to process folders and files
    const processFolder = async (path: string, zipFolder?: JSZip) => {
      const items = await listFilesInFolder(path);
      const downloadPromises: Promise<boolean>[] = [];

      for (const item of items) {
        if (item.metadata?.mimetype) {
          // This is a file
          const filePath = `${path}/${item.name}`;
          const fileData = await downloadFile(filePath);

          if (fileData) {
            try {
              // For Blob objects (browser environment)
              const arrayBuffer = await (fileData as any).arrayBuffer();
              if (zipFolder) {
                zipFolder.file(
                  item.name.replace(".json", ".docx"),
                  arrayBuffer
                );
              } else {
                zip.file(item.name.replace(".json", ".docx"), arrayBuffer);
              }
            } catch (error) {
              // If arrayBuffer() method is not available, use as is
              if (zipFolder) {
                zipFolder.file(item.name, fileData);
              } else {
                zip.file(item.name, fileData);
              }
            }
            downloadPromises.push(Promise.resolve(true));
          }
        } else {
          // This is a folder
          const subFolderPath = `${path}/${item.name}`;
          const subFolderName = item.name;
          const subZipFolder = zipFolder
            ? zipFolder.folder(subFolderName)
            : zip.folder(subFolderName);

          if (subZipFolder) {
            // Process the subfolder recursively
            const subPromises = await processFolder(
              subFolderPath,
              subZipFolder
            );
            downloadPromises.push(...subPromises);
          }
        }
      }

      return downloadPromises;
    };

    // Download main files
    const downloadPromises = await downloadAndAddToZip(files, folderName);

    // Process all subfolders recursively
    const allPromises = await processFolder(folderName, zip);

    // Wait for all files to be downloaded and added to the zip
    await Promise.all([...downloadPromises, ...allPromises]);

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: "uint8array" });

    // Return the zip file
    return new NextResponse(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${folderName}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error downloading folder:", error);
    return NextResponse.json(
      { error: "Failed to download folder" },
      { status: 500 }
    );
  }
}
