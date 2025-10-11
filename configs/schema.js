// ...existing code...
import { pgTable, serial, varchar, boolean } from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", 255).notNull(),
    email: varchar("email", 255).notNull().unique(),
    imageUrl: varchar("image_url", 1024),
    subscription: boolean("subscription").default(false),
});


// ...existing code...
