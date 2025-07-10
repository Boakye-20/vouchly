"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{ padding: 48, textAlign: "center" }}>
                    <h1>Something went wrong</h1>
                    <p>{error?.message || "An unexpected error occurred."}</p>
                </div>
            </body>
        </html>
    );
}