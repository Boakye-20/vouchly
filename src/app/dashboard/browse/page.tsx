'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, DocumentSnapshot, QuerySnapshot, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UK_UNIVERSITIES } from '@/lib/universities';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PartnerCard } from '@/components/partners/partner-card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';

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

// Returns the count of shared availability slots between two users (max 15*3 = 45 theoretically)
const calculateSharedSlots = (userAvailability: any, partnerAvailability: any): number => {
    if (!userAvailability || !partnerAvailability) return 0;
    let shared = 0;
    const periods = ['morning', 'afternoon', 'evening'];
    for (const period of periods) {
        const userDays: string[] = userAvailability[period] || [];
        const partnerDays: string[] = partnerAvailability[period] || [];
        for (const day of userDays) {
            if (partnerDays.includes(day)) shared++;
        }
    }
    return shared; // each shared slot equates to 8 points up to 40
};

// --- UPDATED: Matching algorithm to use new faculty/subject fields ---
const calculateMatchScore = (user: any, partner: any): number => {
    let total = 0;

    // 1. 🗓️ Schedule Overlap (Max 40 pts, 8 pts per shared slot)
    const sharedSlots = calculateSharedSlots(user.availability, partner.availability);
    const schedulePoints = Math.min(sharedSlots * 8, 40);
    total += schedulePoints;

    // 2. ✅ Reliability – Vouch Score similarity (Max 30 pts)
    const vouchDiff = Math.abs((user.vouchScore ?? 80) - (partner.vouchScore ?? 80));
    let vouchPoints = 0;
    if (vouchDiff <= 5) vouchPoints = 30;
    else if (vouchDiff <= 10) vouchPoints = 20;
    else if (vouchDiff <= 20) vouchPoints = 10;
    total += vouchPoints;

    // 3. 📚 Subject Compatibility (Max 15 pts)
    let subjectPoints = 0;
    if (user.subject && partner.subject && user.subject === partner.subject) {
        subjectPoints = 15;
    } else if (user.faculty && partner.faculty && user.faculty === partner.faculty) {
        subjectPoints = 10;
    }
    total += subjectPoints;

    // 4. 🤝 Co-studying Atmosphere Preference (Max 10 pts)
    const atmospherePoints = user.coStudyingAtmosphere && user.coStudyingAtmosphere === partner.coStudyingAtmosphere ? 10 : 0;
    total += atmospherePoints;

    // 5. 🎓 Same University Bonus (Max 5 pts)
    const uniPoints = user.university && user.university === partner.university ? 5 : 0;
    total += uniPoints;

    return Math.min(100, Math.round(total));
};

export default function BrowsePartnersPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [filteredPartners, setFilteredPartners] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // --- UPDATED: Filters state with faculty/subject ---
    const [filters, setFilters] = useState({
        university: 'All',
        faculty: 'All',
        subject: 'All',
        studyAtmosphere: 'Any',
        minVouchScore: 0,
    });

    // Fetch first page of partners
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeUser = onSnapshot(userDocRef, (snapshot: DocumentSnapshot) => {
                    if (snapshot.exists()) setCurrentUser({ id: snapshot.id, ...snapshot.data() });
                });
                // Initial fetch
                const fetchPartners = async () => {
                    setLoading(true);
                    try {
                        const partnersQuery = query(
                            collection(db, 'users'),
                            where('uid', '!=', user.uid),
                            orderBy('createdAt'),
                            limit(20)
                        );
                        const snapshot = await getDocs(partnersQuery);
                        const partnersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setPartners(partnersData);
                        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
                        setHasMore(snapshot.docs.length === 20);
                    } catch (error) {
                        console.error('Error fetching partners:', error);
                        setPartners([]);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchPartners();
                return () => { unsubscribeUser(); };
            } else { setLoading(false); }
        });
        return () => unsubscribeAuth();
    }, []);

    // Load more partners
    const loadMorePartners = async () => {
        if (!currentUser || !lastDoc) return;
        setLoading(true);
        try {
            const partnersQuery = query(
                collection(db, 'users'),
                where('uid', '!=', currentUser.id),
                orderBy('createdAt'),
                startAfter(lastDoc),
                limit(20)
            );
            const snapshot = await getDocs(partnersQuery);
            const partnersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPartners(prev => [...prev, ...partnersData]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === 20);
        } catch (error) {
            console.error('Error loading more partners:', error);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 inline-block border-b-4 border-blue-600 pb-2">Browse Partners</h1>
                <p className="text-xl text-slate-500 mt-4">Find the perfect study buddy to achieve your goals.</p>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    {/* Faculty Filter */}
                    <div className="space-y-2">
                        <label className="text-base font-medium text-gray-900">Faculty</label>
                        <Select onValueChange={handleFacultyChange} value={filters.faculty}>
                            <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                                <SelectValue placeholder="Select Faculty..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Faculties</SelectItem>
                                {Object.keys(SUBJECT_DATA).map(faculty => <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Subject Filter (Dependent) */}
                    <div className="space-y-2">
                        <label className="text-base font-medium text-gray-900">Subject</label>
                        <Select onValueChange={(value) => setFilters(f => ({ ...f, subject: value }))} value={filters.subject} disabled={filters.faculty === 'All'}>
                            <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                                <SelectValue placeholder="Select Subject..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Subjects</SelectItem>
                                {filters.faculty !== 'All' && SUBJECT_DATA[filters.faculty as keyof typeof SUBJECT_DATA].map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* University Filter */}
                    <div className="space-y-2">
                        <label className="text-base font-medium text-gray-900">University</label>
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
                        <label className="text-base font-medium text-gray-900">Study Atmosphere</label>
                        <Select onValueChange={(value) => setFilters(f => ({ ...f, studyAtmosphere: value }))} defaultValue="Any">
                            <SelectTrigger className="border-gray-200 focus:border-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Any">Any Atmosphere</SelectItem>
                                <SelectItem value="Silent & Independent">
                                    <span className="text-blue-600">Silent & Independent</span>
                                </SelectItem>
                                <SelectItem value="Quietly Co-working">
                                    <span className="text-amber-600">Quietly Co-working</span>
                                </SelectItem>
                                <SelectItem value="Motivational & Social">
                                    <span className="text-green-600">Motivational & Social</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Vouch Score Slider */}
                    <div className="space-y-2">
                        <label className="text-base font-medium text-gray-900">Min. Vouch Score: <span className="font-bold text-blue-600 flex items-center gap-1"><ShieldCheck className="inline h-4 w-4 text-blue-600" />{filters.minVouchScore}</span></label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={filters.minVouchScore}
                            onChange={(e) => setFilters(f => ({ ...f, minVouchScore: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                        placeholder="Search by name or course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full border-gray-200 focus:border-blue-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 h-48 animate-pulse"></div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 h-48 animate-pulse"></div>
                </div>
            ) : filteredPartners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPartners.map((partner) => (
                        <PartnerCard key={partner.id} partner={partner} currentUser={currentUser} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
                    <p className="text-slate-500">Try adjusting your filters to find more study partners.</p>
                </div>
            )}

            {hasMore && !loading && (
                <button onClick={loadMorePartners} className="mt-4 px-6 py-3 bg-gray-900 hover:bg-blue-900 text-white rounded-lg text-base font-medium transition-colors">Load More</button>
            )}
            {loading && <div className="mt-4 text-center text-slate-500">Loading...</div>}

        </div>
    );
}