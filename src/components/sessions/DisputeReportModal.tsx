import React, { useState, useEffect } from 'react';

interface DisputeReportModalProps {
    sessionId: string;
    reportedBy: string;
    reportedAgainst: string;
    isOpen: boolean;
    onClose: () => void;
    reason?: string;
    sentryEventId?: string;
}

const REASONS = [
    { value: 'no-show', label: 'No-show' },
    { value: 'inappropriate behaviour', label: 'Inappropriate Behaviour' },
    { value: 'technical issue', label: 'Technical Issue' },
    { value: 'other', label: 'Other' },
];

export const DisputeReportModal: React.FC<DisputeReportModalProps> = ({ sessionId, reportedBy, reportedAgainst, isOpen, onClose, reason: initialReason, sentryEventId }) => {
    const [reason, setReason] = useState(initialReason || '');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason(initialReason || '');
        }
    }, [isOpen, initialReason]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        setUploadProgress(Array(files.length).fill(0));
        setEvidenceUrls([]);
        setError(null);
        try {
            const urls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(`/api/sessions/${sessionId}/disputes/upload`, {
                    method: 'POST',
                    body: formData,
                });
                if (!res.ok) {
                    throw new Error(`Upload failed: ${file.name}`);
                }
                const data = await res.json();
                if (data.urls && data.urls.length > 0) {
                    urls.push(...data.urls);
                }
                setUploadProgress((prev) => {
                    const next = [...prev];
                    next[i] = 100;
                    return next;
                });
            }
            setEvidenceUrls(urls);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        if (!reason || !description) {
            setError('Please fill in all required fields.');
            return;
        }
        if (files.length > 0 && evidenceUrls.length === 0) {
            await handleUpload();
            if (error) return;
        }
        try {
            const res = await fetch(`/api/sessions/${sessionId}/disputes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportedBy,
                    reportedAgainst,
                    reason,
                    description,
                    evidenceUrls,
                    sentryEventId,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit dispute');
            }
            setSuccess(true);
            setReason('');
            setDescription('');
            setFiles([]);
            setEvidenceUrls([]);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit dispute');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-semibold mb-4 text-center">Report a Dispute</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {sentryEventId && <input type="hidden" name="sentryEventId" value={sentryEventId} />}
                    <div>
                        <label className="block text-sm font-medium mb-1">Reason<span className="text-red-500">*</span></label>
                        <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border rounded px-3 py-2">
                            <option value="">Select a reason</option>
                            {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description<span className="text-red-500">*</span></label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Evidence (optional, images/PDFs)</label>
                        <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} />
                        {files.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {files.map((file, i) => (
                                    <li key={file.name} className="text-sm flex items-center gap-2">
                                        {file.name}
                                        {uploading && <span className="ml-2 text-blue-600">Uploading...</span>}
                                        {uploadProgress[i] === 100 && <span className="ml-2 text-green-600">Uploaded</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">Dispute submitted successfully.</div>}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={uploading || !reason || !description}>Submit Dispute</button>
                </form>
            </div>
        </div>
    );
}; 