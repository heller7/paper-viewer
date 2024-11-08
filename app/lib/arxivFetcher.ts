import axios from 'axios';

export async function fetchArxivData(startIndex: number, maxResults: number = 100) {
  try {
    const response = await axios.get('http://export.arxiv.org/api/query', {
      params: {
        search_query: 'cat:cs.*',
        start: startIndex,
        max_results: maxResults,
        sortBy: 'submittedDate',
        sortOrder: 'descending'
      }
    });

    // Return the raw data for now
    return response.data;
  } catch (error) {
    console.error('Error fetching arXiv data:', error);
    return [];
  }
} 