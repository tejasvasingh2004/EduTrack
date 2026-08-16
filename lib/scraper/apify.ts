import { ApifyClient } from 'apify-client';

export async function scrapeLinkedInProfile(linkedinUrl: string) {
  const token = process.env.APIFY_API_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID;
  
  if (!token || !actorId) {
    throw new Error('APIFY_API_TOKEN or APIFY_ACTOR_ID not set');
  }

  const client = new ApifyClient({ token });

  try {
    // Run the actor and wait for it to finish
    const run = await client.actor(actorId).call({
      urls: [linkedinUrl] // Most Apify linkedin actors take 'urls' or 'profileUrls'
    });

    // Fetch the results from the default dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      console.warn(`[Apify Scraper] No data returned for ${linkedinUrl}`);
      return null; // Graceful fallback
    }

    const profileData: any = items[0];

    // Generic mapping (this may need adjustment depending on the specific Actor's output schema)
    // Most standard actors output 'headline' or 'jobTitle' and an 'experience' array.
    let jobTitle = profileData.headline || profileData.jobTitle || 'Unknown Title';
    let company = profileData.company || 'Unknown Company';
    
    // Attempt to extract from experience array if present
    if (profileData.experience && profileData.experience.length > 0) {
      const currentExp = profileData.experience[0];
      jobTitle = currentExp.title || jobTitle;
      company = currentExp.companyName || currentExp.company || company;
    }

    return {
      jobTitle,
      company,
      location: profileData.location || profileData.city || 'Remote',
    };
  } catch (error) {
    console.error(`[Apify Scraper] Error scraping ${linkedinUrl}:`, error);
    return null; // Graceful fallback
  }
}
