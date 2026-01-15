import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Filter } from 'lucide-react';
import API_URL from '../config';

const HostelList = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRooms, setShowRooms] = useState(false);

  const fetchHostels = async (priceFilter = maxPrice, searchFilter = searchQuery) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/api/hostels`);
      
      let filteredData = res.data;
      
      // Apply search filter
      if (searchFilter && searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        filteredData = filteredData.filter(hostel => {
          const nameMatch = hostel.name.toLowerCase().includes(query);
          const roomTypeMatch = hostel.roomTypes?.some(room => 
            room.type.toLowerCase().includes(query)
          );
          return nameMatch || roomTypeMatch;
        });
      }
      
      // If no price filter, show hostels
      if (!priceFilter || priceFilter <= 0) {
        setHostels(filteredData);
        setRooms([]);
        setShowRooms(false);
      } else {
        // If price filter is active, show filtered rooms
        let allRooms = [];
        filteredData.forEach(hostel => {
          if (hostel.roomTypes && hostel.roomTypes.length > 0) {
            hostel.roomTypes.forEach(room => {
              if (room.price <= Number(priceFilter)) {
                allRooms.push({
                  ...room,
                  hostelId: hostel._id,
                  hostelName: hostel.name,
                  hostelLocation: hostel.location,
                  hostelImage: hostel.hostelViewImage
                });
              }
            });
          }
        });
        
        allRooms.sort((a, b) => b.price - a.price);
        
        setRooms(allRooms);
        setHostels([]);
        setShowRooms(true);
      }
    } catch (err) {
      setError('Failed to load hostels. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels('', '');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHostels(maxPrice, searchQuery);
  };

  const clearFilter = () => {
    setMaxPrice('');
    setSearchQuery('');
    setShowRooms(false);
    fetchHostels('', '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Hostel</h1>
          <p className="text-gray-600">Discover verified student accommodation within your budget</p>
        </div>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Search by Hostel Name or Room Type</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  placeholder="e.g., Sunrise Hostel or 2 in a Room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Filter by Maximum Price (per semester)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400 font-medium">GH₵</span>
                  <input
                    type="number"
                    className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                    placeholder="Enter your maximum budget..."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                type="submit" 
                className="flex-1 sm:flex-none bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Search Hostels
              </button>
              <button 
                type="button"
                onClick={clearFilter}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Clear Filter
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading hostels...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {showRooms ? (
                  <>{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} found within your budget</>
                ) : (
                  <>{hostels.length} {hostels.length === 1 ? 'hostel' : 'hostels'} available</>
                )}
              </p>
            </div>
            
            {showRooms ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map((room, index) => (
                  <div
                    key={`${room.hostelId}-${index}`} 
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <img 
                      src={room.roomImage || room.hostelImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                      alt={room.type} 
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{room.type}</h3>
                        <span className="text-primary-600 font-bold text-xl">GH₵{room.price}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{room.hostelName}</p>
                      <div className="flex items-center text-gray-500 text-xs mb-3">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{room.hostelLocation}</span>
                      </div>
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {room.facilities.slice(0, 3).map((f, i) => (
                            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{f}</span>
                          ))}
                          {room.facilities.length > 3 && (
                            <span className="text-xs text-gray-500">+{room.facilities.length - 3}</span>
                          )}
                        </div>
                      )}
                      <Link
                        to={`/hostels/${room.hostelId}`}
                        state={{ selectedRoom: room }}
                        className="block w-full bg-primary-600 text-white text-center py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
                      >
                        Apply for this Room
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hostels.map(hostel => (
                  <Link 
                    to={`/hostels/${hostel._id}`} 
                    key={hostel._id} 
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <img 
                      src={hostel.hostelViewImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                      alt={hostel.name} 
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{hostel.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{hostel.location}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{hostel.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        
        {!loading && showRooms && rooms.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-gray-500 text-lg mb-2">No rooms found within your budget.</div>
            <p className="text-gray-400 mb-4">Try increasing your maximum price or browse all available hostels.</p>
            <button 
              onClick={clearFilter}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
            >
              View All Hostels
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelList;
