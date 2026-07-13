import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
    // Matches Assessment_Model.swift
    externalId: v.string(), // UUID from iOS
    vetName: v.string(),
    farmName: v.string(),
    visitDate: v.number(), // Unix timestamp
    isComplete: v.boolean(),
    sideNotes: v.optional(v.string()),
    syncedAt: v.number(), // When synced to Convex
    uploadedBy: v.optional(v.string()), // Clerk user ID of the uploader
  }).index("by_external_id", ["externalId"]),

  horses: defineTable({
    // Matches Horse_Model.swift
    externalId: v.string(), // UUID from iOS
    assessmentId: v.id("assessments"),
    name: v.string(),
    age: v.number(),
    color: v.string(),
    sex: v.string(),
    breed: v.string(),
    otherBreed: v.optional(v.string()),
    timeOnFarm: v.number(),
    bcsScore: v.number(),
    notes: v.optional(v.string()),
    ageUnit: v.string(), // "years" | "months" | "weeks" | "days"
    timeUnit: v.string(),
    isHorse: v.boolean(),
  }).index("by_assessment", ["assessmentId"])
    .index("by_external_id", ["externalId"]),

  sections: defineTable({
    // Matches Section_Model.swift
    assessmentId: v.id("assessments"),
    sectionNumber: v.number(), // 'id' in Swift model
    title: v.string(),
    isApplicable: v.boolean(),
    infoIconClicks: v.number(),
  }).index("by_assessment", ["assessmentId"]),

  subsections: defineTable({
    // Matches Subsection_Model.swift
    sectionId: v.id("sections"),
    name: v.string(),
  }).index("by_section", ["sectionId"]),

  requirements: defineTable({
    // Matches Requirement_Model.swift
    subsectionId: v.id("subsections"),
    text: v.string(),
    complianceStatus: v.optional(v.string()), // "Compliant" | "Not Compliant" | "N/A"
    nonComplianceReason: v.optional(v.string()),
  }).index("by_subsection", ["subsectionId"]),

  mediaAttachments: defineTable({
    // Matches MediaAttachment.swift
    externalId: v.string(), // UUID from iOS
    // Parent can be requirement or horse - use discriminated union
    parentType: v.string(), // "requirement" | "horse_photo" | "horse_front" | "horse_right" | "horse_back" | "horse_left" | "horse_abnormal"
    parentId: v.string(), // ID of parent (requirement or horse)
    storageId: v.id("_storage"), // Convex file storage ID
    mediaType: v.string(), // "image" | "video"
    creationDate: v.number(),
  }).index("by_parent", ["parentType", "parentId"])
    .index("by_parent_id", ["parentId"])
    .index("by_external_id", ["externalId"]),
});
