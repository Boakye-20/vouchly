import React, { useEffect, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';

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
    appealReason?: string;
    appealEvidenceUrls?: string[];
    appealedAt?: string;
    sentryEventId?: string; // Added for Sentry event ID
}

const STATUS_OPTIONS = [
    'all',
    'open',
    'under_review',
    'resolved',
    'rejected',
    'appealed',
    'technical_issue', // custom filter for technical issues
];

export default function AdminDisputesPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Dispute | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [resolution, setResolution] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [auditTrail, setAuditTrail] = useState<any[]>([]);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(false);
    const [techIssueCount, setTechIssueCount] = useState(0);

    const fetchDisputes = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/admin/disputes';
            let filterTech = false;
            if (statusFilter === 'technical_issue') {
                filterTech = true;
            } else if (statusFilter !== 'all') {
                url = `/api/admin/disputes?status=${statusFilter}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch disputes');
            let disputes = (await res.json()).disputes || [];
            if (filterTech) {
                disputes = disputes.filter((d: any) => d.reason === 'technical issue');
            }
            setDisputes(disputes);
            setTechIssueCount(disputes.filter((d: any) => d.reason === 'technical issue').length);
        } catch (err: any) {
            setError(err.message || 'Failed to load disputes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/auth');
                return;
            }
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const adminEmails = ['admin@vouchly.com', 'pkwarts@gmail.com']; // Keep in sync with dashboard layout
            const userData = userDoc.exists() ? userDoc.data() : {};
            const isUserAdmin = adminEmails.includes(user.email || '') || userData?.isAdmin === true;
            setIsAdmin(isUserAdmin);
            setCheckingAdmin(false);
        });
        return () => unsubscribe();
    }, [router]);

    // --- Block UI for non-admins or while checking ---
    if (checkingAdmin) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (!isAdmin) {
        return <div className="max-w-xl mx-auto mt-24 p-8 text-center border border-red-200 bg-red-50 rounded-lg text-red-700 text-lg font-medium">Access denied: Admins only</div>;
    }

    useEffect(() => { fetchDisputes(); }, [statusFilter]);

    const openDetail = async (d: Dispute) => {
        setSelected(d);
        setAdminNotes(d.adminNotes || '');
        setResolution(d.resolution || '');
        setNewStatus(d.status);
        setLoadingAudit(true);
        try {
            const res = await fetch(`/api/admin/disputes/audit?id=${d.id}`);
            if (res.ok) {
                const data = await res.json();
                setAuditTrail(data.auditTrail || []);
            } else {
                setAuditTrail([]);
            }
        } catch {
            setAuditTrail([]);
        } finally {
            setLoadingAudit(false);
        }
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setPendingUpdate(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/disputes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selected.id,
                    status: newStatus,
                    adminNotes,
                    resolution,
                }),
            });
            if (!res.ok) throw new Error('Failed to update dispute');
            setSelected(null);
            fetchDisputes();
            setShowConfirm(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update dispute');
        } finally {
            setPendingUpdate(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-light tracking-tight text-gray-900 border-b-4 border-blue-600 inline-block pb-2 mb-8 mx-auto text-center">Dispute Management</h1>
            {/* Analytics summary */}
            <div className="mb-6 flex flex-wrap gap-6 items-center justify-center text-sm">
                <div className="bg-blue-50 border border-blue-100 rounded px-4 py-2">Total disputes: <b>{disputes.length}</b></div>
                <div className="bg-yellow-50 border border-yellow-200 rounded px-4 py-2">Technical issues: <b>{techIssueCount}</b> ({disputes.length > 0 ? Math.round((techIssueCount / disputes.length) * 100) : 0}%)</div>
            </div>
            <div className="mb-4 flex gap-4 items-center">
                <label className="font-medium">Filter by status:</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'technical_issue' ? 'Technical Issue' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
            </div>
            {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
                <table className="w-full border text-sm">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Session</th>
                            <th className="p-2 border">Reported By</th>
                            <th className="p-2 border">Against</th>
                            <th className="p-2 border">Reason</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Created</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.map(d => (
                            <tr key={d.id} className={`hover:bg-blue-100 ${d.status === 'appealed' ? 'bg-yellow-100' : ''} ${d.reason === 'technical issue' ? 'ring-2 ring-yellow-400' : ''}`}>
                                <td className="p-2 border font-mono">{d.id.slice(0, 8)}...</td>
                                <td className="p-2 border">
                                    <a href={`/dashboard/sessions/${d.sessionId}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{d.sessionId}</a>
                                </td>
                                <td className="p-2 border">
                                    <a href={`/dashboard/admin/users/${d.reportedBy}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{d.reportedBy}</a>
                                </td>
                                <td className="p-2 border">
                                    <a href={`/dashboard/admin/users/${d.reportedAgainst}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{d.reportedAgainst}</a>
                                </td>
                                <td className="p-2 border">
                                    {d.reason}
                                    {d.reason === 'technical issue' && (
                                        <span className="ml-2 inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-200">Technical Issue</span>
                                    )}
                                </td>
                                <td className="p-2 border">{d.status}</td>
                                <td className="p-2 border">{new Date(d.createdAt).toLocaleString()}</td>
                                <td className="p-2 border">
                                    <button className="text-blue-600 underline" onClick={() => openDetail(d)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}>&times;</button>
                        <h2 className="text-xl font-semibold mb-2">Dispute Details</h2>
                        <div className="mb-2"><b>ID:</b> <span className="font-mono">{selected.id}</span></div>
                        <div className="mb-2"><b>Session:</b> <a href={`/dashboard/sessions/${selected.sessionId}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{selected.sessionId}</a></div>
                        <div className="mb-2"><b>Reported By:</b> <a href={`/dashboard/admin/users/${selected.reportedBy}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{selected.reportedBy}</a></div>
                        <div className="mb-2"><b>Against:</b> <a href={`/dashboard/admin/users/${selected.reportedAgainst}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{selected.reportedAgainst}</a></div>
                        <div className="mb-2"><b>Reason:</b> {selected.reason}
                            {selected.reason === 'technical issue' && (
                                <span className="ml-2 inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-200">Technical Issue</span>
                            )}
                            {selected.sentryEventId && (
                                <a
                                    href={`https://sentry.io/organizations/<your-org-slug>/issues/?query=${selected.sentryEventId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 underline"
                                >
                                    View Sentry Event
                                </a>
                            )}
                        </div>
                        <div className="mb-2"><b>Description:</b> {selected.description}</div>
                        <div className="mb-2"><b>Status:</b> {selected.status}</div>
                        {/* Appeal section */}
                        {selected.status === 'appealed' && (
                            <div className="mb-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <div className="font-semibold text-yellow-800 mb-1">Appeal Submitted</div>
                                {selected.appealReason && <div className="mb-1"><b>Appeal Reason:</b> {selected.appealReason}</div>}
                                {selected.appealEvidenceUrls && selected.appealEvidenceUrls.length > 0 && (
                                    <div className="mb-1"><b>Appeal Evidence:</b>
                                        <ul className="list-disc ml-6 space-y-2">
                                            {selected.appealEvidenceUrls.map((url, i) => {
                                                const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
                                                const isPdf = url.match(/\.pdf$/i);
                                                return (
                                                    <li key={url} className="flex items-center gap-2">
                                                        {isImage ? (
                                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                                <img src={url} alt={`Appeal Evidence ${i + 1}`} className="h-12 w-12 object-cover rounded border border-blue-100" />
                                                            </a>
                                                        ) : isPdf ? (
                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 underline">
                                                                <FileText className="h-5 w-5 text-blue-600" />PDF Evidence
                                                            </a>
                                                        ) : (
                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                                {selected.appealedAt && <div className="text-xs text-yellow-700">Appealed at: {new Date(selected.appealedAt).toLocaleString()}</div>}
                            </div>
                        )}
                        <div className="mb-2"><b>Created:</b> {new Date(selected.createdAt).toLocaleString()}</div>
                        <div className="mb-2"><b>Evidence:</b>
                            {selected.evidenceUrls && selected.evidenceUrls.length > 0 ? (
                                <ul className="list-disc ml-6 space-y-2">
                                    {selected.evidenceUrls.map((url, i) => {
                                        const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
                                        const isPdf = url.match(/\.pdf$/i);
                                        return (
                                            <li key={url} className="flex items-center gap-2">
                                                {isImage ? (
                                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                                        <img src={url} alt={`Evidence ${i + 1}`} className="h-12 w-12 object-cover rounded border border-blue-100" />
                                                    </a>
                                                ) : isPdf ? (
                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 underline">
                                                        <FileText className="h-5 w-5 text-blue-600" />PDF Evidence
                                                    </a>
                                                ) : (
                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <span className="text-gray-500">None</span>}
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium mb-1">Update Status</label>
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="border rounded px-2 py-1">
                                {STATUS_OPTIONS.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium mb-1">Admin Notes</label>
                            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium mb-1">Resolution</label>
                            <textarea value={resolution} onChange={e => setResolution(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} />
                        </div>
                        <div className="mb-4 mt-6">
                            <h3 className="font-semibold mb-2">Audit Trail</h3>
                            {loadingAudit ? <div>Loading audit trail...</div> : auditTrail.length === 0 ? <div className="text-gray-500">No audit history.</div> : (
                                <ul className="space-y-2 text-xs">
                                    {auditTrail.map((entry, i) => (
                                        <li key={i} className="border-b pb-2 mb-2">
                                            <div><b>Admin:</b> {entry.admin}</div>
                                            <div><b>Time:</b> {new Date(entry.timestamp).toLocaleString()}</div>
                                            <div><b>Status:</b> {entry.oldStatus} → {entry.newStatus}</div>
                                            <div><b>Notes:</b> {entry.oldAdminNotes || '-'} → {entry.newAdminNotes || '-'}</div>
                                            <div><b>Resolution:</b> {entry.oldResolution || '-'} → {entry.newResolution || '-'}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" onClick={() => setShowConfirm(true)} disabled={updating || pendingUpdate}>Update</button>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setSelected(null)}>Cancel</button>
                        </div>
                        {error && <div className="text-red-600 mt-2">{error}</div>}
                    </div>
                </div>
            )}
            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative flex flex-col items-center">
                        <Loader2 className={`h-8 w-8 text-blue-600 mb-4 animate-spin ${pendingUpdate ? '' : 'hidden'}`} />
                        <h3 className="text-lg font-semibold mb-2 text-center">Confirm Update</h3>
                        <p className="mb-4 text-center">Are you sure you want to update this dispute's status or notes?</p>
                        <div className="flex gap-4 mt-2">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" onClick={handleUpdate} disabled={pendingUpdate}>Yes, Update</button>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowConfirm(false)} disabled={pendingUpdate}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Loading Spinner for main table */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            )}
        </div>
    );
} 