'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initGA, trackPageView } from '@/lib/google-analytics';

export function GoogleAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize GA when component mounts
    initGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      const url = searchParams.toString() ? `${pathname}?${searchParams}` : pathname;
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
