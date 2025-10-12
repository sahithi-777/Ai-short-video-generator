import { pgTable, serial, varchar, boolean, json, timestamp } from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", 255).notNull(),
    email: varchar("email", 255).notNull().unique(),
    imageUrl: varchar("image_url", 1024),
    subscription: boolean("subscription").default(false),
});

export const VideoData = pgTable("videoData", {
    id: serial('id').primaryKey(),
    script: json('script').notNull(),
    audioFileUrl: varchar('audioFileUrl', 1024).notNull(),
    captions: json('captions').notNull(),
    imageList: varchar('imageList', 1024).array(), // ← KEEP THIS AS IS
    createdBy: varchar('createdBy', 255).notNull(),
    createdAt: timestamp('createdAt').defaultNow()
});