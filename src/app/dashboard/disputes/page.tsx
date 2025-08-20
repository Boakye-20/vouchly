import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface Dispute {
    id: string;
    sessionId: string;
    reportedBy: string;
    reportedAgainst: string;
    reason: string;
    description: string;
    evidenceUrls?: string[];
    status: string;
    adminNotes?: string;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
}

// Appeal Modal
function AppealModal({ isOpen, onClose, dispute, onAppealSubmitted }: { isOpen: boolean, onClose: () => void, dispute: Dispute, onAppealSubmitted: () => void }) {
    const [reason, setReason] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setReason('');
            setFiles([]);
            setEvidenceUrls([]);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

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
                // Reuse the dispute evidence upload endpoint if available, else skip for now
                const res = await fetch(`/api/sessions/${dispute.sessionId}/disputes/upload`, {
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
        if (!reason) {
            setError('Please provide an appeal reason.');
            return;
        }
        if (files.length > 0 && evidenceUrls.length === 0) {
            await handleUpload();
            if (error) return;
        }
        try {
            const res = await fetch(`/api/admin/disputes`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: dispute.id,
                    status: 'appealed',
                    appealReason: reason,
                    appealEvidenceUrls: evidenceUrls,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit appeal');
            }
            setSuccess(true);
            setReason('');
            setFiles([]);
            setEvidenceUrls([]);
            onAppealSubmitted();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit appeal');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-semibold mb-4 text-center">Appeal Dispute Decision</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Appeal Reason<span className="text-red-500">*</span></label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} required />
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
                    {success && <div className="text-green-600 text-sm">Appeal submitted successfully.</div>}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={uploading || !reason}>Submit Appeal</button>
                </form>
            </div>
        </div>
    );
}

export default function UserDisputesPage() {
    const { user } = useAuth();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appealModalOpen, setAppealModalOpen] = useState(false);
    const [appealDispute, setAppealDispute] = useState<Dispute | null>(null);

    useEffect(() => {
        if (!user?.uid) return;
        setLoading(true);
        setError(null);
        fetch('/api/admin/disputes')
            .then(res => res.json())
            .then(data => {
                // Filter disputes where user is reporter or reportedAgainst
                const filtered = (data.disputes || []).filter((d: Dispute) => d.reportedBy === user.uid || d.reportedAgainst === user.uid);
                setDisputes(filtered);
            })
            .catch(err => setError(err.message || 'Failed to load disputes'))
            .finally(() => setLoading(false));
    }, [user?.uid]);

    const handleAppealClick = (dispute: Dispute) => {
        setAppealDispute(dispute);
        setAppealModalOpen(true);
    };
    const handleAppealSubmitted = () => {
        // Refresh disputes after appeal
        if (user?.uid) {
            setLoading(true);
            setError(null);
            fetch('/api/admin/disputes')
                .then(res => res.json())
                .then(data => {
                    const filtered = (data.disputes || []).filter((d: Dispute) => d.reportedBy === user.uid || d.reportedAgainst === user.uid);
                    setDisputes(filtered);
                })
                .catch(err => setError(err.message || 'Failed to load disputes'))
                .finally(() => setLoading(false));
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 mx-auto text-center">My Disputes</h1>
            {!user ? <div>Loading user...</div> : loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : disputes.length === 0 ? <div className="text-gray-600">No disputes found.</div> : (
                <table className="w-full border text-sm">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-2 border">Session</th>
                            <th className="p-2 border">Role</th>
                            <th className="p-2 border">Reason</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Resolution</th>
                            <th className="p-2 border">Created</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.map(d => (
                            <tr key={d.id} className="hover:bg-blue-100">
                                <td className="p-2 border">
                                    <a href={`/dashboard/sessions/${d.sessionId}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{d.sessionId}</a>
                                </td>
                                <td className="p-2 border">{user && d.reportedBy === user.uid ? 'Reporter' : 'Reported Against'}</td>
                                <td className="p-2 border">{d.reason}</td>
                                <td className="p-2 border">{d.status}</td>
                                <td className="p-2 border">{d.resolution || <span className="text-gray-400">-</span>}</td>
                                <td className="p-2 border">{new Date(d.createdAt).toLocaleString()}</td>
                                <td className="p-2 border">
                                    <a href={`/dashboard/sessions/${d.sessionId}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View Session</a>
                                    {/* Appeal button for resolved/rejected disputes */}
                                    {(d.status === 'resolved' || d.status === 'rejected') && (user && (d.reportedBy === user.uid || d.reportedAgainst === user.uid)) && (
                                        <button
                                            className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                                            onClick={() => handleAppealClick(d)}
                                        >
                                            Appeal
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Appeal Modal */}
            {appealDispute && (
                <AppealModal
                    isOpen={appealModalOpen}
                    onClose={() => setAppealModalOpen(false)}
                    dispute={appealDispute}
                    onAppealSubmitted={handleAppealSubmitted}
                />
            )}
        </div>
    );
} 