import { saveData } from '../lib/arxivStorage';
import { ArxivEntry } from '../types/arxiv';
import { fetchArxivData } from '../lib/arxivFetcher';


export async function fetchArxivDaily() {
  try {
    console.log('Starting daily arXiv fetch...');
    let startIndex = 0;
    let allEntries: ArxivEntry[] = [];
    
    while (true) {
      const entries = await fetchArxivData(startIndex);
      if (entries.length === 0) break;
      
      allEntries = [...allEntries, ...entries];
      console.log(`Fetched ${entries.length} entries. Total: ${allEntries.length}`);
      
      if (entries.length < 100) break;
      startIndex += 100;
    }

    const totalEntries = await saveData(allEntries);
    console.log(`Successfully saved ${allEntries.length} new entries. Total entries: ${totalEntries}`);
  } catch (error) {
    console.error('Error fetching arXiv data:', error);
    process.exit(1);
  }
}
