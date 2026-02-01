import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Type definitions for parsed JSON data
interface AssessmentData {
  externalId: string;
  vetName: string;
  farmName: string;
  visitDate: number;
  isComplete: boolean;
  sideNotes?: string;
}

interface HorseData {
  externalId: string;
  name: string;
  age: number;
  color: string;
  sex: string;
  breed: string;
  otherBreed?: string;
  timeOnFarm: number;
  bcsScore: number;
  notes?: string;
  ageUnit: string;
  timeUnit: string;
  isHorse: boolean;
}

interface RequirementData {
  text: string;
  complianceStatus?: string;
  nonComplianceReason?: string;
}

interface SubsectionData {
  name: string;
  requirements: RequirementData[];
}

interface SectionData {
  sectionNumber: number;
  title: string;
  isApplicable: boolean;
  infoIconClicks: number;
  subsections: SubsectionData[];
}

// Sync a complete assessment from iOS
// Uses JSON strings for iOS Swift SDK compatibility
export const syncAssessment = mutation({
  args: {
    assessmentJson: v.string(),
    horsesJson: v.string(),
    sectionsJson: v.string(),
  },
  handler: async (ctx, args) => {
    // Parse JSON strings
    const assessment: AssessmentData = JSON.parse(args.assessmentJson);
    const horses: HorseData[] = JSON.parse(args.horsesJson);
    const sections: SectionData[] = JSON.parse(args.sectionsJson);

    // Check if assessment already exists
    const existing = await ctx.db
      .query("assessments")
      .withIndex("by_external_id", (q) => q.eq("externalId", assessment.externalId))
      .first();

    if (existing) {
      throw new Error("Assessment already synced. Duplicate uploads not allowed.");
    }

    // Create assessment
    const assessmentId = await ctx.db.insert("assessments", {
      externalId: assessment.externalId,
      vetName: assessment.vetName,
      farmName: assessment.farmName,
      visitDate: assessment.visitDate,
      isComplete: assessment.isComplete,
      sideNotes: assessment.sideNotes || "",
      syncedAt: Date.now(),
    });

    // Create horses
    for (const horse of horses) {
      await ctx.db.insert("horses", {
        externalId: horse.externalId,
        name: horse.name,
        age: horse.age,
        color: horse.color,
        sex: horse.sex,
        breed: horse.breed,
        otherBreed: horse.otherBreed || "",
        timeOnFarm: horse.timeOnFarm,
        bcsScore: horse.bcsScore,
        notes: horse.notes || "",
        ageUnit: horse.ageUnit,
        timeUnit: horse.timeUnit,
        isHorse: horse.isHorse,
        assessmentId,
      });
    }

    // Create sections, subsections, requirements
    for (const section of sections) {
      const sectionId = await ctx.db.insert("sections", {
        assessmentId,
        sectionNumber: section.sectionNumber,
        title: section.title,
        isApplicable: section.isApplicable,
        infoIconClicks: section.infoIconClicks,
      });

      for (const subsection of section.subsections) {
        const subsectionId = await ctx.db.insert("subsections", {
          sectionId,
          name: subsection.name,
        });

        for (const requirement of subsection.requirements) {
          await ctx.db.insert("requirements", {
            subsectionId,
            text: requirement.text,
            complianceStatus: requirement.complianceStatus || "",
            nonComplianceReason: requirement.nonComplianceReason || "",
          });
        }
      }
    }

    return assessmentId;
  },
});

// List all assessments
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("assessments").order("desc").collect();
  },
});

// Get assessment with all related data
export const getWithDetails = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.id);
    if (!assessment) return null;

    const horses = await ctx.db
      .query("horses")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", args.id))
      .collect();

    const sections = await ctx.db
      .query("sections")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", args.id))
      .collect();

    // Get subsections and requirements for each section
    const sectionsWithDetails = await Promise.all(
      sections.map(async (section) => {
        const subsections = await ctx.db
          .query("subsections")
          .withIndex("by_section", (q) => q.eq("sectionId", section._id))
          .collect();

        const subsectionsWithReqs = await Promise.all(
          subsections.map(async (subsection) => {
            const requirements = await ctx.db
              .query("requirements")
              .withIndex("by_subsection", (q) => q.eq("subsectionId", subsection._id))
              .collect();
            return { ...subsection, requirements };
          })
        );

        return { ...section, subsections: subsectionsWithReqs };
      })
    );

    return { ...assessment, horses, sections: sectionsWithDetails };
  },
});

// Get media attachments with download URLs for an assessment
export const getAssessmentMedia = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.id);
    if (!assessment) return { horseMedia: [], requirementMedia: [] };

    // Horse media
    const horses = await ctx.db
      .query("horses")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", args.id))
      .collect();

    const horseMedia: { horseName: string; files: { name: string; url: string }[] }[] = [];

    for (const horse of horses) {
      const attachments = await ctx.db
        .query("mediaAttachments")
        .withIndex("by_parent_id", (q) => q.eq("parentId", horse.externalId))
        .collect();

      const files: { name: string; url: string }[] = [];
      let abnormalCount = 0;
      for (const att of attachments) {
        if (!att.parentType.startsWith("horse_")) continue;
        const url = await ctx.storage.getUrl(att.storageId);
        if (url) {
          const photoType = att.parentType.replace("horse_", "");
          const ext = att.mediaType === "video" ? "mp4" : "jpg";
          // Handle multiple abnormal photos with sequential naming
          if (photoType === "abnormal") {
            abnormalCount++;
            files.push({ name: `abnormal_${abnormalCount}.${ext}`, url });
          } else {
            files.push({ name: `${photoType}.${ext}`, url });
          }
        }
      }

      if (files.length > 0) {
        horseMedia.push({ horseName: horse.name, files });
      }
    }

    // Requirement media (parentId starts with assessment externalId)
    const allMedia = await ctx.db.query("mediaAttachments").collect();
    const reqAttachments = allMedia.filter(
      (m) =>
        m.parentType === "requirement" &&
        m.parentId.startsWith(assessment.externalId)
    );

    const requirementMedia: { name: string; url: string }[] = [];
    for (const att of reqAttachments) {
      const url = await ctx.storage.getUrl(att.storageId);
      if (url) {
        const ext = att.mediaType === "video" ? "mp4" : "jpg";
        requirementMedia.push({
          name: `requirement_${requirementMedia.length + 1}.${ext}`,
          url,
        });
      }
    }

    return { horseMedia, requirementMedia };
  },
});

// Delete assessment and all related data
export const remove = mutation({
  args: { id: v.id("assessments") },
  handler: async (ctx, args) => {
    // Delete in reverse order of dependencies
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", args.id))
      .collect();

    for (const section of sections) {
      const subsections = await ctx.db
        .query("subsections")
        .withIndex("by_section", (q) => q.eq("sectionId", section._id))
        .collect();

      for (const subsection of subsections) {
        const requirements = await ctx.db
          .query("requirements")
          .withIndex("by_subsection", (q) => q.eq("subsectionId", subsection._id))
          .collect();

        for (const req of requirements) {
          await ctx.db.delete(req._id);
        }
        await ctx.db.delete(subsection._id);
      }
      await ctx.db.delete(section._id);
    }

    // Delete horses and their media
    const horses = await ctx.db
      .query("horses")
      .withIndex("by_assessment", (q) => q.eq("assessmentId", args.id))
      .collect();

    for (const horse of horses) {
      const media = await ctx.db
        .query("mediaAttachments")
        .withIndex("by_parent_id", (q) => q.eq("parentId", horse.externalId))
        .collect();
      for (const m of media) {
        await ctx.storage.delete(m.storageId);
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(horse._id);
    }

    // Delete requirement media (parentId starts with assessment externalId)
    const assessment = await ctx.db.get(args.id);
    if (assessment) {
      const allMedia = await ctx.db.query("mediaAttachments").collect();
      const reqMedia = allMedia.filter(
        (m) =>
          m.parentType === "requirement" &&
          m.parentId.startsWith(assessment.externalId)
      );
      for (const m of reqMedia) {
        await ctx.storage.delete(m.storageId);
        await ctx.db.delete(m._id);
      }
    }

    // Delete assessment
    await ctx.db.delete(args.id);
  },
});
