import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Filter } from 'lucide-react';
import API_URL from '../config';
import { HostelCardSkeleton } from '../components/SkeletonLoaders';

const HostelList = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRooms, setShowRooms] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchHostels = async (priceFilter = maxPrice, searchFilter = searchQuery) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/api/hostels`);
      
      let filteredData = res.data;
      let isRoomTypeSearch = false;
      
      // Check if search is for room type
      if (searchFilter && searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const roomTypes = ['1 in a room', '2 in a room', '3 in a room', '4 in a room'];
        isRoomTypeSearch = roomTypes.some(type => type.includes(query) || query.includes(type.replace(' in a room', '')));
      }
      
      // If searching for room type, show all matching rooms globally
      if (isRoomTypeSearch && searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        let allMatchingRooms = [];
        
        filteredData.forEach(hostel => {
          if (hostel.roomTypes && hostel.roomTypes.length > 0) {
            hostel.roomTypes.forEach(room => {
              if (room.type.toLowerCase().includes(query)) {
                // Apply price filter if set
                if (!priceFilter || priceFilter <= 0 || room.price <= Number(priceFilter)) {
                  allMatchingRooms.push({
                    ...room,
                    hostelId: hostel._id,
                    hostelName: hostel.name,
                    hostelLocation: hostel.location,
                    hostelImage: hostel.roomTypes?.[0]?.roomImage || ''
                  });
                }
              }
            });
          }
        });
        
        setRooms(allMatchingRooms);
        setHostels([]);
        setShowRooms(true);
        return;
      }
      
      // Apply hostel name search filter
      if (searchFilter && searchFilter.trim() && !isRoomTypeSearch) {
        const query = searchFilter.toLowerCase().trim();
        filteredData = filteredData.filter(hostel => 
          hostel.name.toLowerCase().includes(query)
        );
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
                  hostelImage: room.roomImage || hostel.roomTypes?.[0]?.roomImage || ''
                });
              }
            });
          }
        });
        
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Calculate hostel stats
  const getHostelStats = (hostel) => {
    const totalCapacity = hostel.roomTypes?.reduce((sum, r) => sum + r.totalCapacity, 0) || 0;
    const totalOccupied = hostel.roomTypes?.reduce((sum, r) => sum + (r.occupiedCapacity || 0), 0) || 0;
    const availableSlots = totalCapacity - totalOccupied;
    const prices = hostel.roomTypes?.map(r => r.price) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const isAvailable = availableSlots > 0;
    return { totalCapacity, totalOccupied, availableSlots, minPrice, maxPrice, isAvailable };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Hostel</h1>
          <p className="text-sm sm:text-base text-gray-600">Discover verified student accommodation within your budget</p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden w-full mb-4 bg-primary-600 text-white px-4 py-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center font-medium shadow-md"
        >
          <Filter className="w-5 h-5 mr-2" />
          Filters & Search
        </button>

        {/* Desktop Filter Bar (Sticky) */}
        <div className="hidden md:block sticky top-0 z-10 mb-8 bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search by Hostel Name or Room Type</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Sunrise Hostel or 2 in a Room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Search by hostel name or room type (1, 2, 3, or 4 in a room)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price (per semester)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 font-medium">GH₵</span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter budget..."
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                type="submit" 
                className="bg-primary-600 text-white px-8 py-4 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Search Hostels
              </button>
              <button 
                type="button"
                onClick={clearFilter}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Clear Filter
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Bottom Sheet Filter */}
        {showMobileFilters && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
            <div className="relative bg-white w-full rounded-t-2xl shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">Filters & Search</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => { handleSearch(e); setShowMobileFilters(false); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search by Hostel Name or Room Type</label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Sunrise Hostel or 2 in a Room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Search by hostel name or room type (1, 2, 3, or 4 in a room)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price (per semester)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-4 text-gray-400 font-medium">GH₵</span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-3 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter budget..."
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-primary-600 text-white px-8 py-4 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center font-medium"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Apply Filters
                  </button>
                  <button 
                    type="button"
                    onClick={() => { clearFilter(); setShowMobileFilters(false); }}
                    className="w-full bg-gray-200 text-gray-700 px-8 py-4 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <HostelCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {showRooms ? (
                  searchQuery && searchQuery.trim() ? (
                    <>{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} found matching "{searchQuery}"</>
                  ) : (
                    <>{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} found within your budget</>
                  )
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
                      src={(room.roomImage || room.hostelImage) ? `${room.roomImage || room.hostelImage}#${room.hostelId}-${index}` : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                      alt={room.type} 
                      className="h-48 w-full object-cover"
                      loading="eager"
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
                {hostels.map(hostel => {
                  const stats = getHostelStats(hostel);
                  return (
                    <Link 
                      to={`/hostels/${hostel._id}`} 
                      key={hostel._id} 
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img 
                          src={hostel.roomTypes?.[0]?.roomImage ? `${hostel.roomTypes[0].roomImage}#${hostel._id}` : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                          alt={hostel.name} 
                          className="h-48 w-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {/* Availability Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                            stats.isAvailable 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {stats.isAvailable ? 'Available' : 'Full'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{hostel.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{hostel.location}</span>
                        </div>
                        
                        {/* Price Range */}
                        {stats.minPrice > 0 && (
                          <div className="mb-2">
                            <span className="text-primary-600 font-bold text-lg">
                              GH₵{stats.minPrice}
                              {stats.maxPrice !== stats.minPrice && ` – GH₵${stats.maxPrice}`}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">/semester</span>
                          </div>
                        )}
                        
                        {/* Room Capacity */}
                        {stats.isAvailable && (
                          <div className="mb-3">
                            <span className="text-sm text-green-600 font-semibold">
                              {stats.availableSlots} {stats.availableSlots === 1 ? 'slot' : 'slots'} available
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 line-clamp-2">{hostel.description}</p>
                      </div>
                    </Link>
                  );
                })}
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
