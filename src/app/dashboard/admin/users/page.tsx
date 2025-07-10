'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Edit, Shield, ShieldOff, Loader2, Users, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AdminUser {
    uid: string;
    email: string;
    name: string;
    university: string;
    course: string;
    subjectGroup: string;
    yearOfStudy: string;
    vouchScore: number;
    sessionsCompleted: number;
    status: 'available' | 'busy' | 'offline';
    accountStatus: 'active' | 'suspended' | 'pending';
    createdAt: Date;
    lastActive?: Date;
    earlyEndingCount?: number;
    lastEarlyEnding?: Date;
    earlyEndingPercentage?: number;
}

interface UserManagementData {
    users: AdminUser[];
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
}

function AdminUsersPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch users data
    const { data: userData, error, mutate } = useSWR<UserManagementData>('/api/admin/users', fetcher);
    const loading = !userData && !error;

    // Filter users based on search and status
    const filteredUsers = userData?.users?.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.university.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast({
                    title: 'Status Updated',
                    description: `User account status changed to ${newStatus}`,
                });
                mutate(); // Refresh data
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update user status',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVouchScoreUpdate = async (userId: string, newScore: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}/vouch-score`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vouchScore: newScore }),
            });

            if (response.ok) {
                toast({
                    title: 'Vouch Score Updated',
                    description: `User vouch score updated to ${newScore}`,
                });
                mutate(); // Refresh data
            } else {
                throw new Error('Failed to update vouch score');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update vouch score',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-500">
                <p>Error loading user data: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage user accounts, status, and vouch scores</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.totalUsers || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.activeUsers || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.suspendedUsers || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or university..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>University</TableHead>
                                <TableHead>Vouch Score</TableHead>
                                <TableHead>Sessions</TableHead>
                                <TableHead>Early Endings</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Account Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{user.university}</div>
                                            <div className="text-sm text-muted-foreground">{user.course}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.vouchScore >= 80 ? 'default' : user.vouchScore >= 60 ? 'secondary' : 'destructive'}>
                                            {user.vouchScore}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.sessionsCompleted}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {user.earlyEndingCount || 0}
                                            </span>
                                            {user.earlyEndingCount && user.earlyEndingCount > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Last: {user.lastEarlyEnding ? new Date(user.lastEarlyEnding).toLocaleDateString() : 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.status === 'available' ? 'default' :
                                                user.status === 'busy' ? 'secondary' : 'outline'
                                        }>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.accountStatus === 'active' ? 'default' :
                                                user.accountStatus === 'suspended' ? 'destructive' : 'secondary'
                                        }>
                                            {user.accountStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>User Details</DialogTitle>
                                                    </DialogHeader>
                                                    <UserDetailsDialog user={user} onVouchScoreUpdate={handleVouchScoreUpdate} />
                                                </DialogContent>
                                            </Dialog>

                                            {user.accountStatus === 'active' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(user.uid, 'suspended')}
                                                    disabled={isLoading}
                                                >
                                                    <ShieldOff className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(user.uid, 'active')}
                                                    disabled={isLoading}
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// User Details Dialog Component
function UserDetailsDialog({ user, onVouchScoreUpdate }: { user: AdminUser; onVouchScoreUpdate: (userId: string, score: number) => void }) {
    const [newVouchScore, setNewVouchScore] = useState(user.vouchScore.toString());
    const [isUpdating, setIsUpdating] = useState(false);

    const handleVouchScoreSubmit = async () => {
        const score = parseInt(newVouchScore);
        if (score < 0 || score > 100) {
            return;
        }
        setIsUpdating(true);
        await onVouchScoreUpdate(user.uid, score);
        setIsUpdating(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">University</label>
                    <p className="text-sm text-muted-foreground">{user.university}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Course</label>
                    <p className="text-sm text-muted-foreground">{user.course}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Subject Group</label>
                    <p className="text-sm text-muted-foreground">{user.subjectGroup}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Year of Study</label>
                    <p className="text-sm text-muted-foreground">{user.yearOfStudy}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Sessions Completed</label>
                    <p className="text-sm text-muted-foreground">{user.sessionsCompleted}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Early Endings</label>
                    <p className="text-sm text-muted-foreground">
                        {user.earlyEndingCount || 0} total
                        {user.earlyEndingPercentage && ` (avg: ${user.earlyEndingPercentage}% of scheduled time)`}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium">Last Early Ending</label>
                    <p className="text-sm text-muted-foreground">
                        {user.lastEarlyEnding ? new Date(user.lastEarlyEnding).toLocaleDateString() : 'Never'}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium">Account Status</label>
                    <Badge variant={
                        user.accountStatus === 'active' ? 'default' :
                            user.accountStatus === 'suspended' ? 'destructive' : 'secondary'
                    }>
                        {user.accountStatus}
                    </Badge>
                </div>
            </div>

            <div className="border-t pt-4">
                <label className="text-sm font-medium">Vouch Score Adjustment</label>
                <div className="flex gap-2 mt-2">
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newVouchScore}
                        onChange={(e) => setNewVouchScore(e.target.value)}
                        className="w-24"
                    />
                    <Button
                        onClick={handleVouchScoreSubmit}
                        disabled={isUpdating || parseInt(newVouchScore) < 0 || parseInt(newVouchScore) > 100}
                        size="sm"
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Current score: {user.vouchScore} | Range: 0-100
                </p>
            </div>
        </div>
    );
}

export default AdminUsersPage; 