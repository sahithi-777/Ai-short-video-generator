"use strict";
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('NEXT_PUBLIC_DATABASE_URL is not set');
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

export { db };