import React, { useState } from 'react';
import { format, parseISO, isBefore } from 'date-fns';

export default function EventList() {
  // State for events with more detailed data
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'AI Webinar: Future of Machine Learning', 
      date: '2024-06-10', 
      status: 'Approved',
      attendees: 45,
      description: 'A comprehensive webinar about emerging trends in AI and ML technologies.'
    },
    { 
      id: 2, 
      title: 'Data Science Seminar: Big Data Analytics', 
      date: '2024-06-15', 
      status: 'Pending Approval',
      attendees: 0,
      description: 'Learn how to process and analyze large datasets effectively.'
    },
    { 
      id: 3, 
      title: 'Machine Learning Fundamentals Course', 
      date: '2024-05-01', 
      status: 'Expired',
      attendees: 32,
      description: 'Beginner-friendly introduction to core ML concepts and algorithms.'
    },
    {
      id: 4,
      title: 'Cloud Computing Workshop',
      date: '2024-07-20',
      status: 'Draft',
      attendees: 0,
      description: 'Hands-on workshop for deploying applications on cloud platforms.'
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Format date to be more readable
  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  // Check if event is in the past
  const isPastEvent = (dateString) => {
    return isBefore(parseISO(dateString), new Date());
  };

  // Filter events based on search and status filter
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle delete event
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  // Handle archive event
  const handleArchive = (id) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, status: 'Archived' } : event
    ));
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending Approval': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-red-100 text-red-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Archived': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => setShowModal(true)}
        >
          Create New Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <select
          className="w-full md:w-48 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Draft">Draft</option>
          <option value="Expired">Expired</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 font-medium text-gray-700">Event Title</th>
              <th className="px-6 py-3 font-medium text-gray-700">Date</th>
              <th className="px-6 py-3 font-medium text-gray-700">Attendees</th>
              <th className="px-6 py-3 font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <tr 
                  key={event.id} 
                  className={`hover:bg-gray-50 ${isPastEvent(event.date) ? 'text-gray-400' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{event.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(event.date)}
                    {isPastEvent(event.date) && (
                      <span className="ml-2 text-xs text-red-500">(Past)</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span>{event.attendees}</span>
                      {event.status === 'Approved' && !isPastEvent(event.date) && (
                        <button 
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => alert('Promote event functionality would go here')}
                        >
                          Promote
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button 
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowModal(true);
                      }}
                    >
                      View/Edit
                    </button>
                    <button 
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                    {event.status === 'Expired' && (
                      <button 
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                        onClick={() => handleArchive(event.id)}
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No events found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Event Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedEvent?.title || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={selectedEvent?.date || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={selectedEvent?.status || 'Draft'}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Approved">Approved</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedEvent?.description || ''}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedEvent(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {selectedEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}