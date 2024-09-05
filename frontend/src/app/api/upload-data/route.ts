import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';  // Using server-side Firebase Admin

export async function POST(request: NextRequest) {
  try {
    const { idToken, ...data } = await request.json();

    // Verify the ID token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Add the data to Firestore using Firebase Admin
    const docRef = await adminDb.collection('game_results').add({
      userId: uid,
      timestamp: new Date(),
      ...data
    });

    return NextResponse.json({ message: 'Data uploaded successfully', id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error('Error uploading data:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}