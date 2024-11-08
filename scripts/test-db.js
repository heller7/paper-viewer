import { saveData } from '../app/lib/arxivStorage';

async function testDatabase() {
    const testEntries = [{
        id: 'test123',
        title: 'Test Paper',
        abstract: 'This is a test abstract',
        published: new Date().toISOString(),
        authors: ['Test Author'],
        link: 'https://example.com',
        doi: '10.1234/test',
        categories: ['cs.AI']
    }];

    try {
        const savedCount = await saveData(testEntries);
        console.log(`Successfully saved ${savedCount} entries`);
    } catch (error) {
        console.error('Error during save:', error);
    }
}

testDatabase(); 