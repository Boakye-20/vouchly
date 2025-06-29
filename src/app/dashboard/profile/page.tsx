"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { currentUser, User } from "@/lib/mock-data";
import { useToast } from '@/hooks/use-toast';
import { UserCircle, BookOpen, University, CalendarDays, ShieldCheck, CheckSquare, Camera, Edit } from 'lucide-react';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeEmojis = { morning: "🌅", afternoon: "☀️", evening: "🌙" };

export default function ProfilePage() {
    const [user, setUser] = useState<User>(currentUser);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        // In a real app, this would be an API call
        setIsEditing(false);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    };
    
    const handleAvailabilityChange = (day: string, time: string, checked: boolean) => {
        const dayLower = day.toLowerCase();
        setUser(prevUser => {
            const newAvailability = { ...prevUser.availability };
            const dayTimes = newAvailability[dayLower] || [];
            if (checked) {
                if (!dayTimes.includes(time)) {
                    newAvailability[dayLower] = [...dayTimes, time];
                }
            } else {
                newAvailability[dayLower] = dayTimes.filter(t => t !== time);
            }
            return { ...prevUser, availability: newAvailability };
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Profile</h1>
                <p className="text-muted-foreground">View and manage your account details and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-headline text-xl">Your Information</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={user.full_name} disabled={!isEditing} onChange={(e) => setUser({...user, full_name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email} disabled />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="course">Course</Label>
                            <Input id="course" value={user.course} disabled={!isEditing} onChange={(e) => setUser({...user, course: e.target.value})} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="university">University</Label>
                            <Input id="university" value={user.university} disabled />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="year">Year of Study</Label>
                            <Input id="year" value={user.year_of_study} disabled={!isEditing} onChange={(e) => setUser({...user, year_of_study: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" value={user.bio} disabled={!isEditing} onChange={(e) => setUser({...user, bio: e.target.value})} />
                        </div>
                    </div>
                     {isEditing && <Button onClick={handleSave} className="font-headline">Save Changes</Button>}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle className="font-headline text-xl">Availability</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {days.map(day => (
                            <div key={day} className="space-y-2">
                                <h4 className="font-semibold text-center">{day.substring(0, 3)}</h4>
                                {Object.entries(timeEmojis).map(([time, emoji]) => (
                                    <div key={time} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${day}-${time}`}
                                            checked={user.availability[day.toLowerCase()]?.includes(time)}
                                            onCheckedChange={(checked) => handleAvailabilityChange(day, time, !!checked)}
                                        />
                                        <label htmlFor={`${day}-${time}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {emoji} {time.charAt(0).toUpperCase() + time.slice(1)}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
