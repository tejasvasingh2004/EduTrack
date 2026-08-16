import 'dotenv/config';
import { scrapeLinkedInProfile } from '../lib/scraper/apify';

// Standalone manual test script
// Run with: node scripts/test-apify.js
async function runTest() {
  const testUrl = 'https://www.linkedin.com/in/williamhgates'; // Example URL
  console.log(`Testing Apify scraping against: ${testUrl}`);
  
  try {
    const result = await scrapeLinkedInProfile(testUrl);
    if (result) {
      console.log('✅ Success! Extracted Data:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('⚠️ Actor ran but returned no dataset items or encountered an error.');
    }
  } catch (error) {
    console.error('❌ Failed to run script:', error);
  }
}

runTest();
