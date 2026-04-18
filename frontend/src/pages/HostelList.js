import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Filter, MapPin } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
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

  const getImageUrl = (imageData, uniqueId) => {
    if (!imageData) return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
    return `${imageData}#${uniqueId}-${Math.random().toString(36).substring(7)}`;
  };

  const fetchHostels = async (priceFilter = maxPrice, searchFilter = searchQuery) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(API_ENDPOINTS.HOSTELS);

      let filteredData = res.data;
      let isRoomTypeSearch = false;

      if (searchFilter && searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const roomTypes = ['1 in a room', '2 in a room', '3 in a room', '4 in a room'];
        isRoomTypeSearch = roomTypes.some((type) => type.includes(query) || query.includes(type.replace(' in a room', '')));
      }

      if (isRoomTypeSearch && searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const allMatchingRooms = [];

        filteredData.forEach((hostel) => {
          if (hostel.roomTypes && hostel.roomTypes.length > 0) {
            hostel.roomTypes.forEach((room) => {
              if (room.type.toLowerCase().includes(query)) {
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

      if (searchFilter && searchFilter.trim() && !isRoomTypeSearch) {
        const query = searchFilter.toLowerCase().trim();
        filteredData = filteredData.filter((hostel) => hostel.name.toLowerCase().includes(query));
      }

      if (!priceFilter || priceFilter <= 0) {
        setHostels(filteredData);
        setRooms([]);
        setShowRooms(false);
      } else {
        const allRooms = [];
        filteredData.forEach((hostel) => {
          if (hostel.roomTypes && hostel.roomTypes.length > 0) {
            hostel.roomTypes.forEach((room) => {
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

  const getHostelStats = (hostel) => {
    const totalCapacity = hostel.roomTypes?.reduce((sum, r) => sum + r.totalCapacity, 0) || 0;
    const totalOccupied = hostel.roomTypes?.reduce((sum, r) => sum + (r.occupiedCapacity || 0), 0) || 0;
    const availableSlots = totalCapacity - totalOccupied;
    const prices = hostel.roomTypes?.map((r) => r.price) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const isAvailable = availableSlots > 0;
    return { totalCapacity, totalOccupied, availableSlots, minPrice, maxPrice, isAvailable };
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fbf9_0%,#ffffff_30%,#f8fbfb_100%)]">
      <div className="relative overflow-hidden border-b border-emerald-100/70">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(108deg, rgba(9,37,34,0.9) 0%, rgba(18,89,82,0.78) 45%, rgba(35,129,122,0.58) 100%), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(188,255,239,0.14),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-50">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Browse verified hostels
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Discover student accommodation with a cleaner, approval-first flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-teal-50/92 sm:text-base sm:leading-8">
              Compare verified hostel options, search by room type, and move through the booking process with clearer expectations from application to payment.
            </p>
            <div className="mt-5 inline-flex rounded-2xl border border-emerald-200/30 bg-white/10 px-4 py-3 text-sm text-white/95 backdrop-blur-md">
              <span className="font-semibold">Prices shown are room fees only.</span>
              <span className="ml-2 text-teal-50/85">Platform service fee applies at checkout.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden mb-4 flex w-full items-center justify-center rounded-2xl bg-primary-600 px-4 py-4 font-medium text-white shadow-lg shadow-primary-700/20 transition-colors duration-200 hover:bg-primary-700"
        >
          <Filter className="mr-2 h-5 w-5" />
          Filters & Search
        </button>

        <div className="sticky top-24 z-10 mb-8 hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl md:block">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Search by Hostel Name or Room Type</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    placeholder="e.g., Sunrise Hostel or 2 in a Room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Search by hostel name or room type (1, 2, 3, or 4 in a room)</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Maximum Price (per semester)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-medium text-gray-400">GH¢</span>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-3 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      placeholder="Enter budget..."
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="submit"
                className="flex items-center justify-center rounded-2xl bg-primary-600 px-8 py-4 font-medium text-white transition-colors duration-200 hover:bg-primary-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Search Hostels
              </button>
              <button
                type="button"
                onClick={clearFilter}
                className="rounded-2xl bg-slate-100 px-8 py-4 font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200"
              >
                Clear Filter
              </button>
            </div>
          </form>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
            <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl animate-slide-up">
              <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                <h3 className="text-lg font-bold">Filters & Search</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => { handleSearch(e); setShowMobileFilters(false); }} className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Search by Hostel Name or Room Type</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    placeholder="e.g., Sunrise Hostel or 2 in a Room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">Search by hostel name or room type (1, 2, 3, or 4 in a room)</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Maximum Price (per semester)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-4 font-medium text-gray-400">GH¢</span>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-3 shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      placeholder="Enter budget..."
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-2xl bg-primary-600 px-8 py-4 font-medium text-white transition-colors duration-200 hover:bg-primary-700"
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => { clearFilter(); setShowMobileFilters(false); }}
                    className="w-full rounded-2xl bg-slate-100 px-8 py-4 font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200"
                  >
                    Clear All
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <HostelCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rooms.map((room, index) => (
                  <div
                    key={`${room.hostelId}-${index}`}
                    className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)]"
                  >
                    <img
                      src={getImageUrl(room.roomImage || room.hostelImage, `${room.hostelId}-${index}`)}
                      alt={room.type}
                      className="h-48 w-full object-cover"
                      loading="eager"
                      key={`${room.hostelId}-${index}`}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{room.type}</h3>
                          {room.gender && room.gender !== 'Not Specified' && (
                            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              {room.gender} Only
                            </span>
                          )}
                        </div>
                        <span className="text-xl font-bold text-primary-600">GH¢{room.price}</span>
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-700">{room.hostelName}</p>
                      <div className="mb-3 flex items-center text-xs text-gray-500">
                        <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{room.hostelLocation}</span>
                      </div>
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((f, i) => (
                            <span key={i} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{f}</span>
                          ))}
                          {room.facilities.length > 3 && (
                            <span className="text-xs text-gray-500">+{room.facilities.length - 3}</span>
                          )}
                        </div>
                      )}
                      <Link
                        to={`/hostels/${room.hostelId}`}
                        state={{ selectedRoom: room }}
                        className="block w-full rounded-2xl bg-primary-600 py-3 text-center font-medium text-white transition-colors hover:bg-primary-700"
                      >
                        Apply for this Room
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {hostels.map((hostel) => {
                  const stats = getHostelStats(hostel);
                  return (
                    <Link
                      to={`/hostels/${hostel._id}`}
                      key={hostel._id}
                      className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)]"
                    >
                      <div className="relative">
                        <img
                          src={getImageUrl(hostel.hostelViewImage, hostel._id)}
                          alt={hostel.name}
                          className="h-48 w-full object-cover"
                          loading="eager"
                          key={`${hostel._id}-${Math.random()}`}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute right-3 top-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold text-white shadow-md ${
                            stats.isAvailable ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {stats.isAvailable ? 'Available' : 'Full'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 text-lg font-bold text-gray-900">{hostel.name}</h3>
                        <div className="mb-2 flex items-center text-sm text-gray-600">
                          <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{hostel.location}</span>
                        </div>

                        {stats.minPrice > 0 && (
                          <div className="mb-2">
                            <span className="text-lg font-bold text-primary-600">
                              GH¢{stats.minPrice}
                              {stats.maxPrice !== stats.minPrice && ` – GH¢${stats.maxPrice}`}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">/semester</span>
                          </div>
                        )}

                        {stats.isAvailable && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-green-600">
                              {stats.availableSlots} {stats.availableSlots === 1 ? 'slot' : 'slots'} available
                            </span>
                          </div>
                        )}

                        <p className="line-clamp-2 text-sm text-gray-600">{hostel.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!loading && showRooms && rooms.length === 0 && !error && (
          <div className="py-20 text-center">
            <div className="mb-2 text-lg text-gray-500">No rooms found within your budget.</div>
            <p className="mb-4 text-gray-400">Try increasing your maximum price or browse all available hostels.</p>
            <button
              onClick={clearFilter}
              className="rounded-2xl bg-primary-600 px-6 py-3 text-white transition-colors duration-200 hover:bg-primary-700"
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
