import Link from 'next/link';
import { VouchlyLogo } from '@/components/icons';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 justify-center text-center md:text-left">
                    <div className="md:col-span-1 flex flex-col items-center md:items-start mb-8 md:mb-0">
                        <Link href="/" className="flex items-center space-x-2 group mb-4" aria-label="Go to landing page">
                            <VouchlyLogo className="h-6 w-6 text-white group-hover:text-blue-400 transition-colors" />
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Vouchly</h3>
                        </Link>
                        <p className="text-sm max-w-xs">The accountability-first study platform for UK university students.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/how-it-works" className="hover:text-white">How it Works</Link></li>
                            <li><Link href="/features" className="hover:text-white">Features</Link></li>
                            <li><Link href="/universities" className="hover:text-white">Universities</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/help-center" className="hover:text-white">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                            <li><Link href="/community-guidelines" className="hover:text-white">Community Guidelines</Link></li>
                            <li><Link href="/safety" className="hover:text-white">Safety</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                    <p>&copy; 2025 Vouchly. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
} 