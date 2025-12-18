import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Users Table (Purana Code) ---
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;


// --- New Code: Leads Table (Jo Missing Tha) ---
export const leads = pgTable("leads", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  service: text("service"), // Kaunsi pooja/service ke liye lead hai
  createdAt: timestamp("created_at").defaultNow(), // Date apne aap save hogi
});

// Zod Schema (Validation ke liye)
export const insertLeadSchema = createInsertSchema(leads).pick({
  name: true,
  phone: true,
  service: true,
});

// Types Export (Jo storage.ts dhoond raha tha)
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;