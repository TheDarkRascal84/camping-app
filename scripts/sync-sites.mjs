import { config } from 'dotenv';
import { ingestionService } from '../server/ingestion.js';
import mysql from 'mysql2/promise';

config();

async function syncSites() {
  console.log('Syncing sites for sample campgrounds...\n');
  
  try {
    // Get first 5 campgrounds
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [campgrounds] = await conn.query('SELECT id, name FROM campgrounds LIMIT 5');
    await conn.end();
    
    for (const campground of campgrounds) {
      console.log(`\nSyncing sites for: ${campground.name} (ID: ${campground.id})`);
      const count = await ingestionService.syncSites(campground.id);
      console.log(`✓ Synced ${count} sites`);
    }
    
    console.log('\n✓ Sites sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Sites sync failed:', error);
    process.exit(1);
  }
}

syncSites();
