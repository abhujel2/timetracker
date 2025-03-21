import * as schema from './shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';

// Load environment variables
dotenv.config();

// Generate migrations
console.log('Generating migrations...');
exec('npx drizzle-kit generate:pg', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
  
  // After generating, run the migrations
  runMigrations();
});

// Run migrations
async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });
    
    const db = drizzle(pool);
    
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
    
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}