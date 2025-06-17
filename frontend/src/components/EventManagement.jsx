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
import { Calendar, MapPin, Users, Trophy, Plus, QrCode, Check, Clock } from 'lucide-react';

const EventManagement = () => {
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
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
          event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {event.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {event.date} at {event.time}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {event.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          {event.attendees?.length || 0} registered
          {event.maxAttendees > 0 && ` / ${event.maxAttendees} max`}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!event.attendees?.includes(account) && event.status === 'upcoming' && (
          <button
            onClick={() => handleRegister(event.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        )}
        
        {event.createdBy === account && (
          <>
            <button
              onClick={() => setSelectedEvent(event)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Manage
            </button>
            <button
              onClick={() => handleMintPOAP(event.id, event.title)}
              disabled={!event.checkedInAttendees?.length || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Mint POAPs
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Campus Events</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {['upcoming', 'ongoing', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredEvents().map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg h-24"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Max Attendees (optional)"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({...formData, maxAttendees: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
              </select>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateEvent}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Management Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Manage: {selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Registered Attendees ({selectedEvent.attendees?.length || 0})</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedEvent.attendees?.map((attendee, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{attendee}</span>
                      <button
                        onClick={() => handleCheckIn(selectedEvent.id, attendee)}
                        disabled={selectedEvent.checkedInAttendees?.includes(attendee)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {selectedEvent.checkedInAttendees?.includes(attendee) ? 'Checked In' : 'Check In'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Checked In: {selectedEvent.checkedInAttendees?.length || 0} | 
                  POAPs Minted: {selectedEvent.poapMinted?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;