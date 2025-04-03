import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  department: text("department").default("general"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  department: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Status enum: "pending" | "processing" | "completed" | "rejected" | "waiting"
// Priority enum: "normal" | "medium" | "high" | "urgent"

export const paintRequests = pgTable("paint_requests", {
  id: serial("id").primaryKey(),
  requestCode: text("request_code").notNull().unique(),
  userId: integer("user_id").notNull(),
  workstation: text("workstation").notNull(), // Aggiunta della postazione
  partDescription: text("part_description").notNull(), // Cambiato da partType a partDescription
  partCode: text("part_code").notNull(),
  quantity: integer("quantity").notNull().default(1),
  priority: text("priority").notNull().default("normal"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  imagePath: text("image_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
});

export const insertPaintRequestSchema = createInsertSchema(paintRequests).omit({
  id: true,
  requestCode: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  status: true,
});

export type InsertPaintRequest = z.infer<typeof insertPaintRequestSchema>;
export type PaintRequest = typeof paintRequests.$inferSelect;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestId: integer("request_id"),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  type: text("type").notNull().default("info"), // info, success, warning, error
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
