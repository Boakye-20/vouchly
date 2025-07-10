import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const auth = getAuth();
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.endsWith('.ac.uk')) {
      return NextResponse.json(
        { error: 'Please use a valid UK university email address (.ac.uk)' },
        { status: 400 }
      );
    }

    // Check if email is already verified
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists() && userDoc.data()?.emailVerified) {
      return NextResponse.json(
        { error: 'This email is already verified' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    // Save verification code to Firestore
    await setDoc(doc(db, 'emailVerifications', email), {
      code: verificationCode,
      email,
      expiresAt,
      createdAt: serverTimestamp(),
      verified: false
    });

    // Extract university name from email
    const universityDomain = email.split('@')[1];
    const universityName = universityDomain.replace('.ac.uk', '').split('.')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Send verification email using Resend
    await sendVerificationEmail({
      to: email,
      name: email.split('@')[0],
      verificationCode,
      universityName
    });

    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully' 
    });

  } catch (error) {
    console.error('Error in verify-email API:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
