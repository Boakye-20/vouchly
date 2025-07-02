'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UK_UNIVERSITIES } from '@/lib/universities';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PartnerCard } from '@/components/partners/partner-card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// --- NEW: Data structure for subject data, same as on setup page ---
const SUBJECT_DATA = {
    "Business & Economics": [
        "Accounting and Finance",
        "Business and Management Studies",
        "Economics",
        "Events Management",
        "Finance",
        "Hospitality, Leisure and Tourism",
        "Marketing",
        "PR and Communications"
    ],
    "Engineering & Technology": [
        "Aeronautical and Aerospace Engineering",
        "Chemical Engineering",
        "Civil Engineering",
        "Computer Games and Animation",
        "Computer Science",
        "Digital Media, Production and Technology",
        "Electrical and Electronic Engineering",
        "Engineering and Technology",
        "Manufacturing Engineering",
        "Materials Science and Engineering",
        "Mechanical Engineering",
        "Software Engineering"
    ],
    "Arts & Humanities": [
        "Art",
        "Classics",
        "Dance",
        "Drama",
        "English Language",
        "English Literature and Creative Writing",
        "Film Studies",
        "Graphic Design",
        "History",
        "History of Art",
        "Journalism",
        "Languages",
        "Media Studies",
        "Music",
        "Philosophy",
        "Photography"
    ],
    "Health & Life Sciences": [
        "Agriculture and Related Sciences",
        "Biology",
        "Biomedical Sciences",
        "Dentistry",
        "Food Science and Nutrition",
        "Forensic Science",
        "Health",
        "Medicine",
        "Midwifery",
        "Nursing",
        "Optometry",
        "Paramedic Science",
        "Pharmacy, Pharmacology and Toxicology",
        "Physiotherapy, Physiology and Pathology",
        "Radiography and Medical Technology",
        "Sport and Exercise Science",
        "Veterinary Science",
        "Zoology"
    ],
    "Social Sciences": [
        "Anthropology",
        "Archaeology",
        "Counselling, Psychotherapy and Occupational Therapy",
        "Criminology",
        "Geography",
        "Law",
        "Policing",
        "Politics",
        "Psychology",
        "Religion and Theology",
        "Social Work, Childhood and Youth Studies",
        "Sociology"
    ],
    "Built Environment & Design": [
        "Architecture and Planning",
        "Building and Construction",
        "Fashion, Textiles and Jewellery",
        "Product Design"
    ],
    "Sciences & Mathematics": [
        "Chemistry",
        "Environmental and Earth Sciences",
        "Mathematics and Statistics",
        "Physics and Astronomy"
    ],
    "Education": [
        "Education",
        "Teaching"
    ]
};

const calculateScheduleOverlap = (userAvailability: any, partnerAvailability: any): number => {
    if (!userAvailability || !partnerAvailability) return 0;
    let userTotalSlots = 0;
    let commonSlots = 0;
    const periods = ['morning', 'afternoon', 'evening'];
    for (const period of periods) {
        const userDays = userAvailability[period] || [];
        const partnerDays = partnerAvailability[period] || [];
        userTotalSlots += userDays.length;
        for (const day of userDays) {
            if (partnerDays.includes(day)) commonSlots++;
        }
    }
    if (userTotalSlots === 0) return 0;
    return (commonSlots / userTotalSlots) * 100;
};

// --- UPDATED: Matching algorithm to use new faculty/subject fields ---
const calculateMatchScore = (user: any, partner: any): number => {
    let totalScore = 0;
    // 1. Schedule overlap (40%)
    totalScore += (calculateScheduleOverlap(user.availability, partner.availability) / 100) * 40;
    // 2. Vouch Score similarity (30%)
    const vouchDiff = Math.abs((user.vouchScore || 80) - (partner.vouchScore || 80));
    totalScore += (Math.max(0, 100 - vouchDiff * 5) / 100) * 30;
    // 3. Course compatibility (15%) - Now more granular
    if (user.subject && user.subject === partner.subject) {
        totalScore += 15; // Exact subject match gets full points
    } else if (user.faculty && user.faculty === partner.faculty) {
        totalScore += 5; // Same faculty but different subject gets partial points
    }
    // 4. Study atmosphere (10%)
    if (user.coStudyingAtmosphere === partner.coStudyingAtmosphere) totalScore += 10;
    // 5. Same university (5%)
    if (user.university === partner.university) totalScore += 5;

    return Math.round(Math.min(100, totalScore));
};

export default function BrowsePartnersPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [filteredPartners, setFilteredPartners] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- UPDATED: Filters state with faculty/subject ---
    const [filters, setFilters] = useState({
        university: 'All',
        faculty: 'All',
        subject: 'All',
        studyAtmosphere: 'Any',
        minVouchScore: 0,
    });

    // --- This useEffect for fetching data remains the same ---
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeUser = onSnapshot(userDocRef, (snapshot: DocumentSnapshot) => {
                    if (snapshot.exists()) setCurrentUser({ id: snapshot.id, ...snapshot.data() });
                });
                const partnersQuery = query(collection(db, 'users'), where('uid', '!=', user.uid));
                const unsubscribePartners = onSnapshot(partnersQuery, (snapshot: QuerySnapshot) => {
                    const partnersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPartners(partnersData);
                    setLoading(false);
                });
                return () => { unsubscribeUser(); unsubscribePartners(); };
            } else { setLoading(false); }
        });
        return () => unsubscribeAuth();
    }, []);

    // --- UPDATED: This useEffect handles all filtering logic ---
    useEffect(() => {
        let tempPartners = [...partners];

        // Apply new faculty and subject filters
        if (filters.faculty !== 'All') {
            tempPartners = tempPartners.filter(p => p.faculty === filters.faculty);
            // Only apply subject filter if a faculty is also selected
            if (filters.subject !== 'All') {
                tempPartners = tempPartners.filter(p => p.subject === filters.subject);
            }
        }
        if (filters.university !== 'All') {
            tempPartners = tempPartners.filter(p => p.university === filters.university);
        }
        if (filters.studyAtmosphere !== 'Any') {
            tempPartners = tempPartners.filter(p => p.coStudyingAtmosphere === filters.studyAtmosphere);
        }
        if (filters.minVouchScore > 0) {
            tempPartners = tempPartners.filter(p => (p.vouchScore || 80) >= filters.minVouchScore);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            tempPartners = tempPartners.filter(p => p.name?.toLowerCase().includes(lowercasedQuery) || p.course?.toLowerCase().includes(lowercasedQuery));
        }

        if (currentUser) {
            const scoredAndSortedPartners = tempPartners.map(partner => ({
                ...partner,
                matchScore: calculateMatchScore(currentUser, partner)
            })).sort((a, b) => b.matchScore - a.matchScore);
            setFilteredPartners(scoredAndSortedPartners);
        } else {
            setFilteredPartners(tempPartners);
        }
    }, [partners, filters, searchQuery, currentUser]);

    const handleFacultyChange = (value: string) => {
        setFilters(f => ({ ...f, faculty: value, subject: 'All' })); // Reset subject when faculty changes
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Browse Partners</h1>
                <p className="text-muted-foreground mt-2">Find the perfect study buddy to achieve your goals.</p>
            </div>

            {/* --- UPDATED: Advanced Filters Bar with Two-Tiered Subjects --- */}
            <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    {/* Faculty Filter */}
                    <div className="space-y-2">
                        <Label>Faculty</Label>
                        <Select onValueChange={handleFacultyChange} value={filters.faculty}>
                            <SelectTrigger><SelectValue placeholder="Select Faculty..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Faculties</SelectItem>
                                {Object.keys(SUBJECT_DATA).map(faculty => <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Subject Filter (Dependent) */}
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select onValueChange={(value) => setFilters(f => ({ ...f, subject: value }))} value={filters.subject} disabled={filters.faculty === 'All'}>
                            <SelectTrigger><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Subjects</SelectItem>
                                {filters.faculty !== 'All' && SUBJECT_DATA[filters.faculty as keyof typeof SUBJECT_DATA].map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* University Filter */}
                    <div className="space-y-2">
                        <Label>University</Label>
                        <SearchableSelect
                            options={["All Universities", ...UK_UNIVERSITIES]}
                            value={filters.university === "All" ? "All Universities" : filters.university}
                            onValueChange={(value) => setFilters(f => ({
                                ...f,
                                university: value === "All Universities" ? "All" : value
                            }))}
                            placeholder="All Universities"
                            searchPlaceholder="Search universities..."
                            emptyText="No university found."
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-end">
                    {/* Study Atmosphere Filter */}
                    <div className="space-y-2">
                        <Label>Study Atmosphere</Label>
                        <Select onValueChange={(value) => setFilters(f => ({ ...f, studyAtmosphere: value }))} defaultValue="Any">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Any">Any Atmosphere</SelectItem>
                                <SelectItem value="Silent & Independent">Silent & Independent</SelectItem>
                                <SelectItem value="Quietly Co-working">Quietly Co-working</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Vouch Score Slider */}
                    <div className="space-y-2">
                        <Label>Min. Vouch Score: <span className="font-bold text-primary">{filters.minVouchScore}%</span></Label>
                        <input type="range" min="0" max="100" step="5" value={filters.minVouchScore} onChange={(e) => setFilters(f => ({ ...f, minVouchScore: parseInt(e.target.value) }))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or course..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full" />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
            ) : filteredPartners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPartners.map((partner) => (
                        <PartnerCard key={partner.id} partner={partner} currentUser={currentUser} />))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">No partners found matching your criteria.</div>
            )}

        </div>
    );
}