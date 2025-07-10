import {withSentryConfig} from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDRHpxB2kdAlAia_UgDCEIbH497r9P2vBY",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "vouchly-vzaxv.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "vouchly-vzaxv",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "vouchly-vzaxv.firebasestorage.app",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "173371590648",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:173371590648:web:5990491ae883fad344780d"
    }
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "vouchly-zg",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});