/* eslint-disable */
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || '';

  try {
    //console.log('Search params:', { search, filter });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const filters = filter ? filter.split(',') : [];
    const filterConditions = filters.map(f => 'arxiv_category LIKE ?').join(' OR ');
    
    const query = db.prepare(`
      SELECT * FROM publications 
      WHERE (title LIKE ? OR authors LIKE ? OR abstract LIKE ?)
      ${filters.length > 0 ? `AND (${filterConditions})` : ''}
      ORDER BY publication_date DESC
      LIMIT ? OFFSET ?
    `);

    const searchParam = `%${search}%`;
    const params = [
      searchParam, 
      searchParam, 
      searchParam, 
      ...filters.map(f => `%${f}%`),
      limit,
      offset
    ];
    
    //console.log('SQL params:', params);
    
    const testQuery = db.prepare('SELECT COUNT(*) as count FROM publications');
    const count = testQuery.get();
    //console.log('Total records:', count);

    const items = query.all(params);
    //console.log('Results count:', items.length);
    
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 