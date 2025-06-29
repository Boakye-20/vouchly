"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { mockUsers, User, currentUser } from '@/lib/mock-data';
import { Check, Clock, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';


function calculate_match_score(user1: User, user2: User) {
    const score_breakdown = {
        schedule: 0, reliability: 0, atmosphere: 0, course: 0, university: 0
    };
    if (user1.availability && user2.availability) {
        const user1_slots = new Set(Object.entries(user1.availability).flatMap(([day, times]) => times.map(time => `${day}_${time}`)));
        const user2_slots = new Set(Object.entries(user2.availability).flatMap(([day, times]) => times.map(time => `${day}_${time}`)));
        const overlap_count = [...user1_slots].filter(slot => user2_slots.has(slot)).length;
        score_breakdown['schedule'] = Math.min(overlap_count * 8, 40);
    }
    const vouch_diff = Math.abs(user1.vouch_score - user2.vouch_score);
    if (vouch_diff <= 5) score_breakdown['reliability'] = 30;
    else if (vouch_diff <= 10) score_breakdown['reliability'] = 20;
    else if (vouch_diff <= 20) score_breakdown['reliability'] = 10;
    if (user1.study_atmosphere === user2.study_atmosphere) score_breakdown['atmosphere'] = 10;
    if (user1.course === user2.course) score_breakdown['course'] = 15;
    else if (user1.subject_group === user2.subject_group) score_breakdown['course'] = 10;
    if (user1.university === user2.university) score_breakdown['university'] = 5;
    const total = Object.values(score_breakdown).reduce((a, b) => a + b, 0);
    const tier = total >= 80 ? 'Gold' : total >= 60 ? 'Silver' : 'Bronze';
    return { ...score_breakdown, total, tier };
}

function PartnerCard({ partner, onSelect }: { partner: User & { match: any }, onSelect: (partner: User & { match: any }) => void }) {
    const tierColors = {
        Gold: 'border-yellow-400 bg-yellow-50',
        Silver: 'border-gray-400 bg-gray-50',
        Bronze: 'border-orange-400 bg-orange-50',
    };
    
    return (
        <Card className={`flex flex-col ${tierColors[partner.match.tier]}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-lg">{partner.full_name}</CardTitle>
                        <CardDescription>{partner.course}</CardDescription>
                    </div>
                    <Badge variant="outline" className={`font-bold ${tierColors[partner.match.tier]}`}>{partner.match.tier}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Vouch Score: <span className="font-bold text-foreground ml-1">{partner.vouch_score}%</span>
                </div>
                 <div className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2 text-accent" /> Match: <span className="font-bold text-foreground ml-1">{partner.match.total}%</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" /> {new Date(partner.last_active).toLocaleDateString()}
                </div>
                <p className="text-sm line-clamp-2">{partner.bio}</p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => onSelect(partner)} className="w-full font-headline">View Profile</Button>
            </CardFooter>
        </Card>
    );
}

function RequestDialog({ partner, open, onOpenChange }: { partner: (User & { match: any }) | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    if (!partner) return null;

    const chartData = [
        { name: 'Schedule', value: partner.match.schedule, fill: '#8884d8' },
        { name: 'Vouch', value: partner.match.reliability, fill: '#82ca9d' },
        { name: 'Atmosphere', value: partner.match.atmosphere, fill: '#ffc658' },
        { name: 'Course', value: partner.match.course, fill: '#ff8042' },
        { name: 'Uni', value: partner.match.university, fill: '#0088FE' },
    ];

    const handleSendRequest = () => {
        toast({
            title: 'Request Sent!',
            description: `Your study request has been sent to ${partner.full_name}.`,
            action: <Button variant="ghost">Undo</Button>
        });
        onOpenChange(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Study Request for {partner.full_name}</DialogTitle>
                    <DialogDescription>
                        {partner.course} • {partner.year_of_study} • {partner.university}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <h4 className="font-semibold mb-2 font-headline">Match Breakdown ({partner.match.total}%)</h4>
                         <div style={{ width: '100%', height: 150 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}/>
                                    <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm mt-4">{partner.bio}</p>
                        <div className="mt-4 space-y-1 text-sm">
                            <p><strong>Atmosphere:</strong> {partner.study_atmosphere}</p>
                            <p><strong>Camera:</strong> {partner.camera_preference}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <h4 className="font-semibold font-headline">Session Details</h4>
                        <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        <Input type="time" defaultValue="14:00" />
                        <Select defaultValue="60">
                            <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                                <SelectItem value="90">90 minutes</SelectItem>
                                <SelectItem value="120">120 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Focus Topic (e.g., Chapter 5 Review)" />
                        <Textarea placeholder="Optional message..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSendRequest} className="font-headline">
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BrowsePage() {
    const [filters, setFilters] = useState({
        university: 'all',
        subject_group: 'all',
        min_vouch_score: 70,
    });
    const [hiddenPartners, setHiddenPartners] = useState<number[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<(User & { match: any }) | null>(null);

    const handleSelectPartner = (partner: User & { match: any }) => {
        setSelectedPartner(partner);
    };

    const handleHidePartner = (partnerId: number) => {
        setHiddenPartners(prev => [...prev, partnerId]);
        toast({
            title: "Partner Hidden",
            description: "They will no longer appear in your search results.",
        });
    }

    const matchedUsers = useMemo(() => {
        return mockUsers
            .filter(user => user.id !== currentUser.id && !hiddenPartners.includes(user.id))
            .map(user => ({
                ...user,
                match: calculate_match_score(currentUser, user),
            }))
            .filter(user => 
                (filters.university === 'all' || user.university === filters.university) &&
                (filters.subject_group === 'all' || user.subject_group === filters.subject_group) &&
                user.vouch_score >= filters.min_vouch_score
            )
            .sort((a, b) => b.match.total - a.match.total);
    }, [filters, hiddenPartners]);

    const universities = [...new Set(mockUsers.map(u => u.university))];
    const subjectGroups = [...new Set(mockUsers.map(u => u.subject_group))];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Browse Partners</h1>
                <p className="text-muted-foreground">Find the perfect study buddy to achieve your goals.</p>
            </div>

            <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Select value={filters.university} onValueChange={value => setFilters(f => ({ ...f, university: value }))}>
                        <SelectTrigger><SelectValue placeholder="University" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Universities</SelectItem>
                            {universities.map(uni => <SelectItem key={uni} value={uni}>{uni}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.subject_group} onValueChange={value => setFilters(f => ({ ...f, subject_group: value }))}>
                        <SelectTrigger><SelectValue placeholder="Subject Group" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subject Groups</SelectItem>
                            {subjectGroups.map(sg => <SelectItem key={sg} value={sg}>{sg}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="space-y-2">
                        <label className="text-sm">Min. Vouch Score: {filters.min_vouch_score}%</label>
                        <Slider
                            defaultValue={[70]}
                            max={100}
                            step={1}
                            value={[filters.min_vouch_score]}
                            onValueChange={value => setFilters(f => ({ ...f, min_vouch_score: value[0] }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {matchedUsers.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchedUsers.map(user => (
                        <PartnerCard key={user.id} partner={user} onSelect={handleSelectPartner} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="font-semibold">No matches found</p>
                    <p className="text-muted-foreground">Try adjusting your filters to find more partners.</p>
                </div>
            )}
            
            <RequestDialog partner={selectedPartner} open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)} />

        </div>
    );
}
