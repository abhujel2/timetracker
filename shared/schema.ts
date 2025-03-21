import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatar: true,
});

// Projects schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  color: text("color"),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
  color: true,
});

// Tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id"),
  status: text("status").notNull().default("pending"),
  estimatedTime: integer("estimated_time"),
  progress: integer("progress").default(0),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  userId: true,
  projectId: true,
  status: true,
  estimatedTime: true,
  progress: true,
  dueDate: true,
});

// Time entries schema
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  projectId: integer("project_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  description: text("description"),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  userId: true,
  taskId: true,
  projectId: true,
  startTime: true,
  endTime: true,
  duration: true,
  description: true,
});

// Files schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  projectId: integer("project_id"),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  userId: true,
  taskId: true,
  projectId: true,
  filename: true,
  path: true,
  size: true,
  type: true,
});

// Calendar events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  allDay: boolean("all_day").default(false),
  taskId: integer("task_id"),
  projectId: integer("project_id"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  allDay: true,
  taskId: true,
  projectId: true,
});

// Music tracks schema (for recently played or favorites)
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackId: text("track_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  albumCover: text("album_cover"),
  duration: integer("duration"),
  source: text("source").default("spotify"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  userId: true,
  trackId: true,
  title: true,
  artist: true,
  album: true,
  albumCover: true,
  duration: true,
  source: true,
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  theme: text("theme").default("dark"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  minimizeToTray: boolean("minimize_to_tray").default(true),
  preferences: jsonb("preferences"),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  theme: true,
  notificationsEnabled: true,
  minimizeToTray: true,
  preferences: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
