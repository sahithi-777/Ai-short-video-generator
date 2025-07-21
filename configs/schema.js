import { boolean } from "drizzle-orm/gel-core";
import { pgTable } from "drizzle-orm/pg-core";

export const Users = pgTable('users',{
    id: pgTable.serial('id').primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull().unique(),
    imageUrl: varchar('image_url'),
    subscription:boolean('subscription').default(false),
});