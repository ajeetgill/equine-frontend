import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deleteFile, listFilesInFolder } from "@/actions/supabase";

export async function DELETE(
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
        { error: "No files found in this folder" },
        { status: 404 }
      );
    }

    // Recursive function to delete folders and files
    const deleteFolder = async (path: string): Promise<string[]> => {
      const items = await listFilesInFolder(path);
      const deletedItems: string[] = [];

      // Process all files and subfolders
      for (const item of items) {
        const itemPath = `${path}/${item.name}`;

        if (item.metadata?.mimetype) {
          // This is a file - delete it directly
          const success = await deleteFile(itemPath);
          if (success) {
            deletedItems.push(itemPath);
          }
        } else {
          // This is a folder - process it recursively first
          const subFolderDeleted = await deleteFolder(itemPath);
          deletedItems.push(...subFolderDeleted);

          // After all contents are deleted, try to delete the folder itself
          // Note: Some storage providers automatically remove empty folders
          try {
            await deleteFile(itemPath);
            deletedItems.push(itemPath);
          } catch (error) {
            console.log(
              `Note: Folder ${itemPath} may have been automatically removed`
            );
          }
        }
      }

      return deletedItems;
    };

    // Start the recursive deletion process
    const deletedItems = await deleteFolder(folderName);

    // Try to delete the main folder itself at the end
    try {
      await deleteFile(folderName);
      deletedItems.push(folderName);
    } catch (error) {
      console.log(
        `Note: Main folder ${folderName} may have been automatically removed`
      );
    }

    // Return success response with list of deleted items
    return NextResponse.json({
      success: true,
      message: `Successfully deleted folder: ${folderName}`,
      deletedItems: deletedItems,
      count: deletedItems.length,
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
