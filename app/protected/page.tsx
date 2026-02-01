"use client";

import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexErrorMessage } from "@/components/providers";
import { useEffect, useState } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import generateDocument from "@/actions/docxReport";
import { generateHorseDoc } from "@/actions/docGeneration";

const CONVEX_TIMEOUT_MS = 10000;

export default function ProtectedPage() {
  const { user } = useUser();
  const convex = useConvex();
  const assessments = useQuery(api.assessments.list);
  const deleteAssessment = useMutation(api.assessments.remove);
  const [timedOut, setTimedOut] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (assessments !== undefined) return;
    const timer = setTimeout(() => setTimedOut(true), CONVEX_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [assessments]);

  if (!assessments) {
    if (timedOut) {
      return (
        <ConvexErrorMessage message="Could not connect to the Convex backend. The dev server may not be running." />
      );
    }
    return (
      <div className="flex flex-col gap-6 w-11/12 max-w-3xl">
        <h2>Loading...</h2>
      </div>
    );
  }

  const handleDelete = async (id: Id<"assessments">) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      await deleteAssessment({ id });
    }
  };

  const handleDownload = async (
    id: Id<"assessments">,
    farmName: string
  ) => {
    setDownloadingId(id);
    try {
      // Fetch assessment details and media in parallel
      const [details, media] = await Promise.all([
        convex.query(api.assessments.getWithDetails, { id }),
        convex.query(api.assessments.getAssessmentMedia, { id }),
      ]);

      if (!details) {
        throw new Error("Assessment not found");
      }

      const zip = new JSZip();

      // 1. Generate assessment report .docx
      const horses = details.horses.filter((h) => h.isHorse);
      const donkeys = details.horses.filter((h) => !h.isHorse);
      const avgHorseBCS =
        horses.length > 0
          ? (
              horses.reduce((sum, h) => sum + h.bcsScore, 0) / horses.length
            ).toFixed(1)
          : "";
      const avgDonkeyBCS =
        donkeys.length > 0
          ? (
              donkeys.reduce((sum, h) => sum + h.bcsScore, 0) / donkeys.length
            ).toFixed(1)
          : "";

      const nonCompliantSections = details.sections
        .map((section) => ({
          id: section.sectionNumber,
          title: section.title,
          subsections: section.subsections
            .map((sub) => ({
              name: sub.name,
              requirements: sub.requirements
                .filter((req) => req.complianceStatus === "Not Compliant")
                .map((req) => ({
                  text: req.text,
                  complianceStatus: req.complianceStatus || "",
                  findings: req.nonComplianceReason || undefined,
                })),
            }))
            .filter((sub) => sub.requirements.length > 0),
        }))
        .filter((section) => section.subsections.length > 0);

      const reportData = {
        metadata: {
          displayName: details.vetName,
          farmName: details.farmName,
          id: details.externalId,
          vetName: details.vetName,
          visitDate: new Date(details.visitDate).toLocaleDateString(),
          averageHorseBCS: avgHorseBCS,
          averageDonkeyBCS: avgDonkeyBCS,
        },
        nonCompliantFindings: {
          sections: nonCompliantSections,
        },
        sideNotes: details.sideNotes || "",
      };

      const reportDoc = generateDocument(reportData);
      const reportBlob = await Packer.toBlob(reportDoc);
      zip.file("assessment-report.docx", reportBlob);

      // 2. Generate horse table .docx
      const horseTableBlob = await generateHorseDoc(details.horses);
      zip.file("horse-table.docx", horseTableBlob);

      // 3. Add horse media folders
      for (const horse of media.horseMedia) {
        const folder = zip.folder(horse.horseName);
        if (!folder) continue;

        const downloads = horse.files.map(async (file) => {
          const response = await fetch(file.url);
          const blob = await response.blob();
          folder.file(file.name, blob);
        });
        await Promise.all(downloads);
      }

      // 4. Add requirement media folder
      if (media.requirementMedia.length > 0) {
        const reqFolder = zip.folder("requirement-media");
        if (reqFolder) {
          const downloads = media.requirementMedia.map(async (file) => {
            const response = await fetch(file.url);
            const blob = await response.blob();
            reqFolder.file(file.name, blob);
          });
          await Promise.all(downloads);
        }
      }

      // 5. Generate and download zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${farmName}-assessment.zip`);
    } catch (error) {
      alert(
        `Download failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-11/12 max-w-3xl">
      <h2>Hey, {user?.emailAddresses[0]?.emailAddress}!</h2>
      <h2 className="font-medium text-xl mb-4">Your Assessments</h2>

      {assessments.length === 0 ? (
        <p className="text-gray-500">
          No assessments yet. Sync from the iOS app to see them here.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-between">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="flex justify-between shrink-1 basis-full md:basis-[47%] gap-2 hover:bg-slate-200 dark:hover:bg-slate-800 p-4 rounded-md border"
            >
              <div>
                <p className="font-medium">
                  {assessment.vetName} - {assessment.farmName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(assessment.visitDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {assessment.isComplete ? "Complete" : "In Progress"}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  onClick={() =>
                    handleDownload(assessment._id, assessment.farmName)
                  }
                  disabled={downloadingId === assessment._id}
                  className="border rounded-md py-2 px-4 h-min bg-none hover:bg-green-400 hover:text-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download report"
                >
                  {downloadingId === assessment._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(assessment._id)}
                  className="border rounded-md py-2 px-4 h-min bg-none hover:bg-red-400 hover:text-red-800 transition-all"
                  title="Delete assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
