import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { TimezoneProvider } from '@/contexts/timezone-context';
import { GoogleAnalyticsProvider } from '@/components/analytics/GoogleAnalyticsProvider';
import { CookieConsent } from '@/components/ui/cookie-consent';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
    title: 'Vouchly',
    description: 'Find Reliable Partners for Accountable Co-Studying',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
            </head>
            <body className="font-body antialiased">
                <GoogleAnalyticsProvider>
                    <AuthProvider>
                        <TimezoneProvider>
                            {children}
                            <Footer />
                            <Toaster />
                            <CookieConsent />
                        </TimezoneProvider>
                    </AuthProvider>
                </GoogleAnalyticsProvider>
            </body>
        </html>
    );
}
