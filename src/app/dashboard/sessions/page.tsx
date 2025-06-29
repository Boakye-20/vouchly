"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockSessions, mockUsers, currentUser, Session } from "@/lib/mock-data";
import { Check, X, Clock, Calendar, Hash, MessageSquare, Video, AlertTriangle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adjustVouchScoreAction } from "@/lib/actions";

function SessionCard({ session }: { session: Session }) {
  const { toast } = useToast();
  const partner = mockUsers.find(u => u.id === (session.initiator_id === currentUser.id ? session.recipient_id : session.initiator_id));
  const isRecipient = session.recipient_id === currentUser.id;

  const scheduledStart = new Date(session.scheduled_start);
  const now = new Date();
  const timeDiffHours = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isLockedIn = timeDiffHours < 4 && timeDiffHours > -session.duration_minutes / 60;
  
  const videoJoinEnabledAt = session.video_join_enabled_at ? new Date(session.video_join_enabled_at) : null;
  const isVideoAccessTime = videoJoinEnabledAt && videoJoinEnabledAt < now;
  const canJoinVideo = (session.status === 'scheduled' || session.status === 'in_progress') && isVideoAccessTime && session.video_room_url;

  const handleAction = async (action: "accept" | "decline" | "start" | "complete_yes" | "complete_no" | "reschedule" | "cancel") => {
    let res;
    switch(action) {
        case "accept":
            toast({ title: "Session Accepted!", description: `Your study session with ${partner?.full_name} is scheduled. A video room has been created.` });
            break;
        case "decline":
            toast({ title: "Session Declined", variant: "destructive", description: `You have declined the session with ${partner?.full_name}.` });
            break;
        case "start":
            res = await adjustVouchScoreAction({ userId: currentUser.id, sessionId: session.id, eventType: 'START_CONFIRMED' });
            if(res.success) toast({ title: "Start Confirmed!", description: res.data?.message });
            else toast({ title: "Error", description: res.error, variant: 'destructive' });
            break;
        case "complete_yes":
            res = await adjustVouchScoreAction({ userId: currentUser.id, sessionId: session.id, eventType: 'COMPLETION_CONFIRMED' });
            if(res.success) toast({ title: "Session Completed!", description: res.data?.message });
            else toast({ title: "Error", description: res.error, variant: 'destructive' });
            break;
        case "complete_no":
            res = await adjustVouchScoreAction({ userId: currentUser.id, sessionId: session.id, eventType: 'COMPLETION_REPORTED_ISSUE' });
            if(res.success) toast({ title: "Report Submitted", description: res.data?.message });
            else toast({ title: "Error", description: res.error, variant: 'destructive' });
            break;
        case "reschedule":
            res = await adjustVouchScoreAction({ userId: currentUser.id, sessionId: session.id, eventType: 'RESCHEDULED_WITH_NOTICE' });
            if(res.success) toast({ title: "Session Rescheduled", description: res.data?.message });
            else toast({ title: "Error", description: res.error, variant: 'destructive' });
            break;
        case "cancel":
            if (isLockedIn) {
                 res = await adjustVouchScoreAction({ userId: currentUser.id, sessionId: session.id, eventType: 'CANCELLED_LOCKED_IN' });
                 if(res.success) toast({ title: "Cancelled (No-Show)", description: res.data?.message, variant: 'destructive' });
                 else toast({ title: "Error", description: res.error, variant: 'destructive' });
            } else {
                toast({ title: "Session Cancelled", description: `You have cancelled the session with ${partner?.full_name}.` });
            }
            break;
    }
  };

  if (!partner) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://placehold.co/40x40.png?text=${partner.full_name.charAt(0)}`} />
            <AvatarFallback>{partner.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-lg">
              {session.status === 'requested' && isRecipient ? `Request from ${partner.full_name}` : `Session with ${partner.full_name}`}
            </CardTitle>
            <CardDescription>{partner.course} • {partner.university}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {new Date(session.scheduled_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
        <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {session.duration_minutes} minutes</div>
        <div className="flex items-center"><Hash className="w-4 h-4 mr-2" /> Focus: {session.focus_topic}</div>
        {session.initial_message && <div className="flex items-start"><MessageSquare className="w-4 h-4 mr-2 mt-1" /> <p className="italic">"{session.initial_message}"</p></div>}
        
        { (session.status === 'scheduled' || session.status === 'in_progress') && session.video_room_url && (
            <div className="pt-2">
                {canJoinVideo ? (
                     <Button 
                      onClick={() => window.open(session.video_room_url, '_blank')}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {session.status === 'in_progress' ? 'Re-join Video Call' : 'Join Video Call'}
                    </Button>
                ) : (
                    <>
                        <Button disabled className="w-full cursor-not-allowed">
                          <Video className="w-4 h-4 mr-2" />
                          Video opens 5 mins before start
                        </Button>
                        {videoJoinEnabledAt && (
                           <p className="text-xs text-muted-foreground text-center mt-1">
                               Video access available at {videoJoinEnabledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        )}
                    </>
                )}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {session.status === 'requested' && isRecipient && (
          <>
            <Button variant="outline" size="sm" onClick={() => handleAction('decline')}><X className="w-4 h-4 mr-2" />Decline</Button>
            <Button size="sm" onClick={() => handleAction('accept')}><Check className="w-4 h-4 mr-2" />Accept</Button>
          </>
        )}
        {session.status === 'scheduled' && (
           <>
            <Button variant="outline" size="sm" onClick={() => handleAction('reschedule')} disabled={isLockedIn}>
              {isLockedIn ? <Lock className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
              {isLockedIn ? 'Reschedule Locked' : 'Reschedule'}
            </Button>
             <Button variant="destructive" size="sm" onClick={() => handleAction('cancel')}>
                <X className="w-4 h-4 mr-2" />
                {isLockedIn ? 'Cancel (No-Show)' : 'Cancel Session'}
            </Button>
            <Button size="sm" onClick={() => handleAction('start')}><Clock className="w-4 h-4 mr-2" />Start Session in Vouchly</Button>
           </>
        )}
        {session.status === 'in_progress' && (
            <>
                <p className="text-sm text-muted-foreground mr-auto">Did the session go well?</p>
                <Button variant="outline" size="sm" onClick={() => handleAction('complete_no')}><AlertTriangle className="w-4 h-4 mr-2" />Report Issue</Button>
                <Button size="sm" onClick={() => handleAction('complete_yes')}><Check className="w-4 h-4 mr-2" />Confirm Completion</Button>
            </>
        )}
      </CardFooter>
    </Card>
  )
}

export default function SessionsPage() {
  const [sessions] = useState(mockSessions);

  const incoming = sessions.filter(s => s.status === 'requested' && s.recipient_id === currentUser.id);
  const scheduled = sessions.filter(s => ['scheduled', 'in_progress'].includes(s.status) && (s.recipient_id === currentUser.id || s.initiator_id === currentUser.id));
  const past = sessions.filter(s => ['completed', 'cancelled'].includes(s.status) && (s.recipient_id === currentUser.id || s.initiator_id === currentUser.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Sessions</h1>
        <p className="text-muted-foreground">Manage your study requests and scheduled sessions.</p>
      </div>
      <Tabs defaultValue="scheduled">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incoming">
            Incoming Requests <Badge className="ml-2">{incoming.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled <Badge className="ml-2">{scheduled.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
            {incoming.length > 0 ? (
                <div className="space-y-4 pt-4">
                    {incoming.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
            ) : (
                <div className="text-center py-16"><p>No incoming requests.</p></div>
            )}
        </TabsContent>
        <TabsContent value="scheduled">
            {scheduled.length > 0 ? (
                <div className="space-y-4 pt-4">
                    {scheduled.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
            ) : (
                <div className="text-center py-16"><p>No scheduled sessions. Go find a partner!</p></div>
            )}
        </TabsContent>
        <TabsContent value="past">
            {past.length > 0 ? (
                 <div className="space-y-4 pt-4">
                    {past.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
            ) : (
                <div className="text-center py-16"><p>No past sessions yet.</p></div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
