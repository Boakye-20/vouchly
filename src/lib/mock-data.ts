export interface User {
  id: number;
  email: string;
  full_name: string;
  university: string;
  course: string;
  subject_group: string;
  year_of_study: string;
  vouch_score: number;
  sessions_completed: number;
  last_active: string;
  availability: Record<string, string[]>;
  study_atmosphere: "Silent & Independent" | "Quietly Co-working" | "Motivational & Social";
  camera_preference: "Camera always on" | "Camera on for check-ins" | "Camera always off" | "Flexible";
  bio: string;
  weekly_goal: number;
  consecutive_reschedules: number;
}

export interface Session {
  id: number;
  initiator_id: number;
  recipient_id: number;
  scheduled_start: string;
  duration_minutes: number;
  focus_topic: string;
  initial_message?: string;
  status: "requested" | "scheduled" | "completed" | "cancelled" | "in_progress";
  my_start_confirmed?: boolean;
  partner_start_confirmed?: boolean;
  video_room_name?: string;
  video_room_url?: string;
  video_join_enabled_at?: string;
}

export const mockUsers: User[] = [
  {
    id: 1,
    email: "a.lovelace@ox.ac.uk",
    full_name: "Ada Lovelace",
    university: "University of Oxford",
    course: "MSc Advanced Computer Science",
    subject_group: "STEM",
    year_of_study: "Postgraduate",
    vouch_score: 95,
    sessions_completed: 25,
    last_active: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    availability: { monday: ["evening"], wednesday: ["afternoon", "evening"], friday: ["morning"] },
    study_atmosphere: "Quietly Co-working",
    camera_preference: "Camera on for check-ins",
    bio: "Focused on algorithms and theoretical computer science. Looking for a dedicated partner for problem-solving sessions.",
    weekly_goal: 4,
    consecutive_reschedules: 0,
  },
  {
    id: 2,
    email: "c.babbage@cam.ac.uk",
    full_name: "Charles Babbage",
    university: "University of Cambridge",
    course: "BEng Engineering",
    subject_group: "STEM",
    year_of_study: "Year 3",
    vouch_score: 88,
    sessions_completed: 18,
    last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    availability: { tuesday: ["morning", "afternoon"], thursday: ["morning"] },
    study_atmosphere: "Silent & Independent",
    camera_preference: "Camera always on",
    bio: "Mechanical engineering student. Need someone to keep me accountable for textbook readings.",
    weekly_goal: 3,
    consecutive_reschedules: 1,
  },
  {
    id: 3,
    email: "m.curie@ucl.ac.uk",
    full_name: "Marie Curie",
    university: "University College London",
    course: "BSc Chemistry",
    subject_group: "STEM",
    year_of_study: "Year 2",
    vouch_score: 98,
    sessions_completed: 35,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    availability: { monday: ["morning"], wednesday: ["morning"], friday: ["morning", "afternoon"] },
    study_atmosphere: "Quietly Co-working",
    camera_preference: "Flexible",
    bio: "Passionate about organic chemistry. Let's review lecture notes and tackle practice problems together!",
    weekly_goal: 5,
    consecutive_reschedules: 0,
  },
  {
    id: 4,
    email: "i.newton@imperial.ac.uk",
    full_name: "Isaac Newton",
    university: "Imperial College London",
    course: "MSci Physics",
    subject_group: "STEM",
    year_of_study: "Year 4+",
    vouch_score: 75,
    sessions_completed: 12,
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    availability: { tuesday: ["evening"], thursday: ["evening"], saturday: ["afternoon"] },
    study_atmosphere: "Silent & Independent",
    camera_preference: "Camera always off",
    bio: "Deep diving into quantum mechanics and relativity. Prefer silent sessions to focus on complex equations.",
    weekly_goal: 2,
    consecutive_reschedules: 0,
  },
  {
    id: 5,
    email: "a.smith@lse.ac.uk",
    full_name: "Adam Smith",
    university: "London School of Economics",
    course: "BSc Economics",
    subject_group: "Business & Economics",
    year_of_study: "Year 2",
    vouch_score: 82,
    sessions_completed: 22,
    last_active: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    availability: { monday: ["afternoon"], tuesday: ["evening"], wednesday: ["afternoon"] },
    study_atmosphere: "Motivational & Social",
    camera_preference: "Camera always on",
    bio: "Enjoy discussing economic theories and their real-world applications. Let's motivate each other!",
    weekly_goal: 3,
    consecutive_reschedules: 0,
  },
];

const session102_start = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
const session103_start = new Date(Date.now() + 1000 * 60 * 10);
const session104_start = new Date(Date.now() - 1000 * 60 * 30);


export const mockSessions: Session[] = [
  {
    id: 101,
    initiator_id: 2,
    recipient_id: 1, // Current user is recipient
    scheduled_start: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    duration_minutes: 60,
    focus_topic: "Differential Equations",
    initial_message: "Hey Ada, I saw we have similar availability. I'd love to review Chapter 3 with you.",
    status: "requested",
  },
  {
    id: 102,
    initiator_id: 1, // Current user is initiator
    recipient_id: 3,
    scheduled_start: session102_start.toISOString(),
    duration_minutes: 90,
    focus_topic: "Quantum Chemistry",
    status: "scheduled",
    my_start_confirmed: false,
    partner_start_confirmed: false,
    video_room_name: "vouchly-session-102",
    video_room_url: "https://meet.jit.si/vouchly-session-102",
    video_join_enabled_at: new Date(session102_start.getTime() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 103,
    initiator_id: 4,
    recipient_id: 1,
    scheduled_start: session103_start.toISOString(), // Starts soon
    duration_minutes: 120,
    focus_topic: "General Relativity Problems",
    status: "scheduled",
    my_start_confirmed: false,
    partner_start_confirmed: true,
    video_room_name: "vouchly-session-103",
    video_room_url: "https://meet.jit.si/vouchly-session-103",
    video_join_enabled_at: new Date(session103_start.getTime() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 104,
    initiator_id: 1,
    recipient_id: 5,
    scheduled_start: session104_start.toISOString(), // In progress
    duration_minutes: 60,
    focus_topic: "Microeconomics",
    status: "in_progress",
    my_start_confirmed: true,
    partner_start_confirmed: true,
    video_room_name: "vouchly-session-104",
    video_room_url: "https://meet.jit.si/vouchly-session-104",
    video_join_enabled_at: new Date(session104_start.getTime() - 5 * 60 * 1000).toISOString(),
  },
    {
    id: 105,
    initiator_id: 5,
    recipient_id: 1, 
    scheduled_start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    duration_minutes: 45,
    focus_topic: "Macroeconomic Policy",
    initial_message: "Hi Ada, want to discuss the latest fiscal policies? I think we could have a great discussion.",
    status: "requested",
  },
];

export const mockVouchHistory = [
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), change: 2, reason: "Session completed successfully" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), change: 2, reason: "Session completed successfully" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), change: -5, reason: "Rescheduled session less than 24h before" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), change: 2, reason: "Session completed successfully" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), change: 2, reason: "Session completed successfully" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), change: -10, reason: "No-show at session start" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), change: 2, reason: "Session completed successfully" },
];

export const currentUser: User = mockUsers[0];
