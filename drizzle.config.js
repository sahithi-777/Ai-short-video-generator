import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  schema: './configs/schema.js',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Dad5AuZfl2QW@ep-rough-pine-ae8f6xea-pooler.c-2.us-east-2.aws.neon.tech/ai-short-video?sslmode=require&channel_binding=require'
  },
});
