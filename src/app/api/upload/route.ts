import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || '.jpg';
    const base = path.basename(file.name, ext).replace(/[^a-z0-9-_]/gi, '_');
    const filename = `${base}_${Date.now()}${ext.toLowerCase()}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}


