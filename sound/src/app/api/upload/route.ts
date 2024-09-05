import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure the upload directory exists
  const uploadDir = join(process.cwd(), 'uploads');
  try {
    await writeFile(join(uploadDir, 'test.txt'), 'test');
  } catch (error) {
    console.error('Error accessing upload directory:', error);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Save the file
  const filePath = join(uploadDir, file.name);
  try {
    await writeFile(filePath, buffer);
    console.log(`File saved to ${filePath}`);

    // Here you would add code to send the file to the Pico
    // For now, we'll just simulate this with a success message
    
    return NextResponse.json({ message: 'File uploaded successfully and ready for Pico' });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};