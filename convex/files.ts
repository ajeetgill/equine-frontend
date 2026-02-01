import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for client
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file reference after upload
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    externalId: v.string(),
    parentType: v.string(),
    parentId: v.string(),
    mediaType: v.string(),
    creationDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mediaAttachments", args);
  },
});

// Get file URL
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get all media for a horse
export const getHorseMedia = query({
  args: { horseExternalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaAttachments")
      .withIndex("by_parent", (q) =>
        q.eq("parentType", "horse_photo").eq("parentId", args.horseExternalId)
      )
      .collect();
  },
});
