'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CookieConsentProps {
    onAccept?: (analytics: boolean) => void;
    onDecline?: () => void;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [analyticsAccepted, setAnalyticsAccepted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = (includeAnalytics: boolean) => {
        localStorage.setItem('cookie-consent', JSON.stringify({
            essential: true,
            analytics: includeAnalytics,
            timestamp: new Date().toISOString()
        }));

        if (onAccept) {
            onAccept(includeAnalytics);
        }

        setIsVisible(false);
        toast({
            title: "Preferences saved",
            description: "Your cookie preferences have been saved.",
        });
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', JSON.stringify({
            essential: true,
            analytics: false,
            timestamp: new Date().toISOString()
        }));

        if (onDecline) {
            onDecline();
        }

        setIsVisible(false);
        toast({
            title: "Preferences saved",
            description: "Essential cookies only will be used.",
        });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                We use cookies to improve your experience
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                We use essential cookies to keep you logged in and remember your preferences.
                                Analytics cookies help us improve the platform and are optional.
                            </p>

                            {showDetails && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h4 className="font-medium mb-3">Cookie Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <h5 className="font-medium text-green-700">Essential Cookies (Required)</h5>
                                            <p className="text-gray-600">Authentication, security, and basic functionality</p>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-blue-700">Analytics Cookies (Optional)</h5>
                                            <p className="text-gray-600">Google Analytics and Sentry for improving the platform</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => handleAccept(true)}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept All
                                </Button>
                                <Button
                                    onClick={() => handleAccept(false)}
                                    variant="outline"
                                >
                                    Essential Only
                                </Button>
                                <Button
                                    onClick={() => setShowDetails(!showDetails)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    {showDetails ? 'Hide Details' : 'Show Details'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleDecline}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 