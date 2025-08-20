// @ts-expect-error: No types for 'busboy' in this project. If needed, run: npm i --save-dev @types/busboy
declare module 'busboy';

import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import Busboy from 'busboy';
import { Readable } from 'stream';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper to convert a web ReadableStream to a Node.js Readable
async function webStreamToNode(stream: ReadableStream<Uint8Array>): Promise<Readable> {
    const reader = stream.getReader();
    const nodeStream = new Readable({
        read() { }
    });
    async function push() {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            nodeStream.push(Buffer.from(value));
        }
        nodeStream.push(null);
    }
    push();
    return nodeStream;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { sessionId } = await params;
        const contentType = req.headers.get('content-type') || '';
        if (!contentType.startsWith('multipart/form-data')) {
            return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
        }

        const busboy = Busboy({ headers: { 'content-type': contentType } });
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        let hasFile = false;
        const uploadPromises: Promise<string>[] = [];

        return new Promise(async (resolve, reject) => {
            busboy.on('file', (fieldname: any, file: any, filename: any, encoding: any, mimetype: any) => {
                if (!allowedTypes.includes(mimetype)) {
                    file.resume();
                    return reject(NextResponse.json({ error: 'Invalid file type' }, { status: 400 }));
                }
                let fileSize = 0;
                const storagePath = `disputes/${sessionId}/${Date.now()}-${filename}`;
                const bucket = adminStorage.bucket();
                const uploadStream = bucket.file(storagePath).createWriteStream({
                    metadata: { contentType: mimetype },
                    resumable: false,
                });
                file.on('data', (data: any) => {
                    fileSize += data.length;
                    if (fileSize > maxSize) {
                        file.unpipe(uploadStream);
                        uploadStream.end();
                        file.resume();
                        return reject(NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 }));
                    }
                });
                file.pipe(uploadStream);
                uploadStream.on('finish', async () => {
                    hasFile = true;
                    await bucket.file(storagePath).makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
                    uploadPromises.push(Promise.resolve(publicUrl));
                });
                uploadStream.on('error', (err: any) => {
                    return reject(NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 }));
                });
            });
            busboy.on('finish', async () => {
                if (!hasFile) {
                    return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
                }
                const urls = await Promise.all(uploadPromises);
                resolve(NextResponse.json({ success: true, urls }));
            });
            // Convert web stream to Node.js stream for Busboy
            const nodeStream = await webStreamToNode(req.body as any);
            nodeStream.pipe(busboy);
        });
    } catch (error) {
        console.error('Evidence upload error:', error);
        return NextResponse.json({ error: 'Failed to upload evidence' }, { status: 500 });
    }
} 