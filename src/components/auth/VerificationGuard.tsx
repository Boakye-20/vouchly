'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmailVerification } from './EmailVerification';
import { Loader2 } from 'lucide-react';

interface VerificationGuardProps {
  children: React.ReactNode;
}

export function VerificationGuard({ children }: VerificationGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const user = auth.currentUser;
        
        if (!user) {
          router.push('/auth');
          return;
        }

        // Check if email is verified in Firebase Auth
        if (!user.emailVerified) {
          setNeedsVerification(true);
          return;
        }

        // Check if email is verified in Firestore (for additional verification)
        const userDoc = await getDoc(doc(db, 'users', user.email || ''));
        if (!userDoc.exists() || !userDoc.data()?.emailVerified) {
          setNeedsVerification(true);
          return;
        }

        setNeedsVerification(false);
      } catch (error) {
        console.error('Error checking verification status:', error);
        // In case of error, allow access but log the issue
        setNeedsVerification(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerification();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-md">
          <EmailVerification />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
