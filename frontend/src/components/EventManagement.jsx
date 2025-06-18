import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/BlockchainContext';
import { db } from '../utils/firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    query,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { Calendar, MapPin, Users, Trophy, Plus, QrCode, Check, Clock, Star, Sparkles, Eye, X } from 'lucide-react';

const EventManagement = ({ isOwner }) => {
    const { account, mintPOAP, isInitialized } = useWeb3();

    const [events, setEvents] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upcoming');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        maxAttendees: '',
        category: 'academic'
    });

    // Load events from Firebase
    useEffect(() => {
        const loadEvents = async () => {
            try {
                const eventsRef = collection(db, 'events');
                const q = query(eventsRef, orderBy('createdAt', 'desc'));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const eventsList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setEvents(eventsList);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error loading events:', error);
            }
        };

        loadEvents();
    }, []);

    // Create new event
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!account) {
            alert('Please connect your wallet first');
            return;
        }

        setLoading(true);
        try {
            const eventData = {
                ...formData,
                createdBy: account,
                createdAt: new Date().toISOString(),
                attendees: [],
                checkedInAttendees: [],
                poapMinted: [],
                status: 'upcoming',
                maxAttendees: parseInt(formData.maxAttendees) || 0
            };

            await addDoc(collection(db, 'events'), eventData);

            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                maxAttendees: '',
                category: 'academic'
            });
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event');
        } finally {
            setLoading(false);
        }
    };

    // Register for event
    const handleRegister = async (eventId) => {
        if (!account) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                attendees: arrayUnion(account)
            });
            alert('Successfully registered for event!');
        } catch (error) {
            console.error('Error registering:', error);
            alert('Error registering for event');
        }
    };

    // Check-in attendee
    const handleCheckIn = async (eventId, attendeeAddress) => {
        try {
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                checkedInAttendees: arrayUnion(attendeeAddress)
            });
            alert('Attendee checked in successfully!');
        } catch (error) {
            console.error('Error checking in:', error);
            alert('Error checking in attendee');
        }
    };

    // Mint POAP for checked-in attendees
    const handleMintPOAP = async (eventId, eventTitle) => {
        if (!account) return;

        const event = events.find(e => e.id === eventId);
        if (!event) return;

        setLoading(true);
        try {
            const checkedInAttendees = event.checkedInAttendees || [];
            const alreadyMinted = event.poapMinted || [];

            for (const attendee of checkedInAttendees) {
                if (!alreadyMinted.includes(attendee)) {
                    await mintPOAP(attendee, eventTitle);

                    // Update Firebase
                    const eventRef = doc(db, 'events', eventId);
                    await updateDoc(eventRef, {
                        poapMinted: arrayUnion(attendee)
                    });
                }
            }

            alert('POAPs minted successfully!');
        } catch (error) {
            console.error('Error minting POAPs:', error);
            alert('Error minting POAPs');
        } finally {
            setLoading(false);
        }
    };

    // Filter events by status
    const getFilteredEvents = () => {
        const now = new Date();
        return events.filter(event => {
            const eventDate = new Date(event.date);
            const daysDiff = (eventDate - now) / (1000 * 60 * 60 * 24);

            switch (activeTab) {
                case 'upcoming':
                    return daysDiff > 0;
                case 'ongoing':
                    return Math.abs(daysDiff) <= 1;
                case 'completed':
                    return daysDiff < -1;
                default:
                    return true;
            }
        });
    };

    const EventCard = ({ event }) => (
        <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Sparkle effect */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                        {event.title}
                    </h3>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                        event.status === 'upcoming' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                        event.status === 'ongoing' 
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                            'bg-slate-500/20 text-slate-300 border border-slate-400/30'
                    }`}>
                        {event.status}
                    </span>
                </div>

                <p className="text-slate-300 mb-6 line-clamp-2">{event.description}</p>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                            <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                            <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        {event.location}
                    </div>
                    <div className="flex items-center text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-green-400" />
                        </div>
                        {event.attendees?.length || 0} registered
                        {event.maxAttendees > 0 && ` / ${event.maxAttendees} max`}
                    </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                    {!event.attendees?.includes(account) && event.status === 'upcoming' && (
                        <button
                            onClick={() => handleRegister(event.id)}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-semibold flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            <Star className="w-4 h-4" />
                            Register
                        </button>
                    )}

                    {event.createdBy === account && (
                        <>
                            <button
                                onClick={() => setSelectedEvent(event)}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 font-semibold hover:scale-105 active:scale-95"
                            >
                                <QrCode className="w-4 h-4" />
                                Manage
                            </button>
                            <button
                                onClick={() => handleMintPOAP(event.id, event.title)}
                                disabled={!event.checkedInAttendees?.length || loading}
                                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold hover:scale-105 active:scale-95 disabled:hover:scale-100"
                            >
                                <Trophy className="w-4 h-4" />
                                Mint POAPs
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Campus Events
                        </h1>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                    {!isOwner ? (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-yellow-300 p-4 rounded-xl text-sm backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Only contract owner can create events
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center gap-2 font-semibold hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Create Event
                        </button>
                    )}
                </div>

                {/* Enhanced Tabs */}
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-700/50">
                        {['upcoming', 'ongoing', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-xl capitalize transition-all duration-300 font-semibold relative overflow-hidden ${
                                    activeTab === tab
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                {activeTab === tab && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse opacity-30"></div>
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {getFilteredEvents().map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>

                {getFilteredEvents().length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No {activeTab} events</h3>
                        <p className="text-slate-500">Events will appear here once they're created.</p>
                    </div>
                )}

                {/* Enhanced Create Event Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    Create New Event
                                </h2>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Event Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                    required
                                />
                                <textarea
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 h-24 resize-none"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Max Attendees (optional)"
                                    value={formData.maxAttendees}
                                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                                    className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                >
                                    <option value="academic">Academic</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="sports">Sports</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="seminar">Seminar</option>
                                </select>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all duration-200 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateEvent}
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        {loading ? 'Creating...' : 'Create Event'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Event Management Modal */}
                {selectedEvent && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    Manage: {selectedEvent.title}
                                </h2>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                    <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        Registered Attendees ({selectedEvent.attendees?.length || 0})
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {selectedEvent.attendees?.map((attendee, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                                                <span className="text-sm font-mono text-slate-300">{attendee}</span>
                                                <button
                                                    onClick={() => handleCheckIn(selectedEvent.id, attendee)}
                                                    disabled={selectedEvent.checkedInAttendees?.includes(attendee)}
                                                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
                                                        selectedEvent.checkedInAttendees?.includes(attendee)
                                                            ? 'bg-green-500/20 text-green-300 border border-green-400/30 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:scale-105 active:scale-95'
                                                    }`}
                                                >
                                                    {selectedEvent.checkedInAttendees?.includes(attendee) ? (
                                                        <div className="flex items-center gap-2">
                                                            <Check className="w-4 h-4" />
                                                            Checked In
                                                        </div>
                                                    ) : (
                                                        'Check In'
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                        {(!selectedEvent.attendees || selectedEvent.attendees.length === 0) && (
                                            <div className="text-center py-8 text-slate-500">
                                                No attendees registered yet
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-green-400">
                                                {selectedEvent.checkedInAttendees?.length || 0}
                                            </div>
                                            <div className="text-sm text-slate-400">Checked In</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-purple-400">
                                                {selectedEvent.poapMinted?.length || 0}
                                            </div>
                                            <div className="text-sm text-slate-400">POAPs Minted</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventManagement;