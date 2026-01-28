import { config } from 'dotenv';
import { ingestionService } from '../server/ingestion.js';

config();

async function seed() {
  console.log('Starting database seed...');
  
  try {
    // Sync sample campgrounds from mock adapter for California
    console.log('\n1. Syncing California state parks...');
    const caCount = await ingestionService.syncCampgrounds('state_parks', {
      state: 'CA',
      limit: 10,
    });
    console.log(`✓ Synced ${caCount} California campgrounds`);
    
    // Sync sample campgrounds for Colorado
    console.log('\n2. Syncing Colorado state parks...');
    const coCount = await ingestionService.syncCampgrounds('state_parks', {
      state: 'CO',
      limit: 10,
    });
    console.log(`✓ Synced ${coCount} Colorado campgrounds`);
    
    // Sync sample campgrounds for Oregon
    console.log('\n3. Syncing Oregon state parks...');
    const orCount = await ingestionService.syncCampgrounds('state_parks', {
      state: 'OR',
      limit: 10,
    });
    console.log(`✓ Synced ${orCount} Oregon campgrounds`);
    
    console.log('\n✓ Database seed completed successfully!');
    console.log(`Total campgrounds: ${caCount + coCount + orCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  }
}

seed();
