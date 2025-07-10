import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Get the verification record
    const verificationRef = doc(db, 'emailVerifications', email);
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists()) {
      return NextResponse.json(
        { error: 'No verification request found. Please request a new verification email.' },
        { status: 404 }
      );
    }

    const verificationData = verificationDoc.data();
    const now = new Date();
    const expiresAt = verificationData.expiresAt.toDate();

    // Check if code is expired
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (verificationData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark email as verified in users collection
    const userRef = doc(db, 'users', email);
    await setDoc(userRef, {
      email,
      emailVerified: true,
      university: email.split('@')[1].replace('.ac.uk', ''),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Mark verification as used
    await updateDoc(verificationRef, {
      verified: true,
      verifiedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Error in verify-code API:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
