/* eslint-disable */
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const query = db.prepare(`
      SELECT DISTINCT arxiv_category 
      FROM publications 
      WHERE arxiv_category IS NOT NULL 
      ORDER BY arxiv_category
    `);
    
    const categories = (query.all() as { arxiv_category: string }[])
      .map(row => row.arxiv_category);
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 