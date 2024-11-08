import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
      const query = db.prepare(`
        SELECT DISTINCT categories 
        FROM publications 
        WHERE categories IS NOT NULL
      `);

      //console.log(query.all());
      
      const categories = (query.all() as { categories: string }[])
        .map(row => row.categories.split(',').map(cat => cat.trim()))
        .flat()
        .filter((cat: string) => cat.length > 0);
      console.log(categories);
      return NextResponse.json(categories);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } 