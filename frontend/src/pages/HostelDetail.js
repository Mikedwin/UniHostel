import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapPin, CheckCircle, MessageSquare, Wifi, Droplet, Zap, Shield, Car, Wind, Utensils, Tv, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';

const HostelDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState({ roomType: '', semester: 'First Semester', studentName: '', contactNumber: '' });
  const [applicationStats, setApplicationStats] = useState({});

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const [hostelRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/api/hostels/${id}`),
          axios.get(`${API_URL}/api/applications/hostel/${id}/stats`).catch(() => ({ data: {} }))
        ]);
        setHostel(hostelRes.data);
        setApplicationStats(statsRes.data || {});
        
        // Auto-select room if passed from filtered results
        if (location.state?.selectedRoom) {
          setAppData(prev => ({ ...prev, roomType: location.state.selectedRoom.type }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHostel();
  }, [id, location.state]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    try {
      await axios.post(`${API_URL}/api/applications`, {
        hostelId: id,
        ...appData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: 'Application Submitted!',
        text: 'Wait for manager approval before payment.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Go to Dashboard'
      });
      
      navigate('/student-dashboard');
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Application Failed',
        text: err.response?.data?.message || 'Application submission failed',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Facility icon mapping
  const getFacilityIcon = (facility) => {
    const icons = {
      'wifi': <Wifi className="w-4 h-4" />,
      'wi-fi': <Wifi className="w-4 h-4" />,
      'water': <Droplet className="w-4 h-4" />,
      'electricity': <Zap className="w-4 h-4" />,
      'security': <Shield className="w-4 h-4" />,
      'parking': <Car className="w-4 h-4" />,
      'ac': <Wind className="w-4 h-4" />,
      'air conditioning': <Wind className="w-4 h-4" />,
      'kitchen': <Utensils className="w-4 h-4" />,
      'tv': <Tv className="w-4 h-4" />,
      'television': <Tv className="w-4 h-4" />
    };
    const key = facility.toLowerCase();
    return icons[key] || <CheckCircle className="w-4 h-4" />;
  };

  // Calculate occupancy percentage
  const getOccupancyPercentage = (room) => {
    if (!room.totalCapacity) return 0;
    return Math.round((room.occupiedCapacity / room.totalCapacity) * 100);
  };

  // Get application count for room
  const getApplicationCount = (roomType) => {
    return applicationStats[roomType] || 0;
  };

  // Get last booking time
  const getLastBookingTime = (roomType) => {
    const lastBooking = applicationStats[`${roomType}_lastBooking`];
    if (!lastBooking) return null;
    const days = Math.floor((Date.now() - new Date(lastBooking)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return null;
  };

  if (loading) return <LoadingSpinner message="Loading hostel details..." fullScreen />;
  if (!hostel) return <div className="text-center py-20">Hostel not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Hostel View Image at the top */}
        <div className="mb-6 sm:mb-8 relative">
          <img 
            src={hostel.hostelViewImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'} 
            alt={`${hostel.name} - Hostel View`} 
            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg sm:rounded-xl shadow-sm"
            key={hostel._id}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg sm:rounded-b-xl p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{hostel.name}</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Hostel Information */}
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
              <div className="flex items-center text-gray-600 mb-4 sm:mb-6">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-base sm:text-lg">{hostel.location}</span>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Description</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{hostel.description}</p>
              </div>
            </div>

            {/* Available Room Types */}
            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Available Room Types</h2>
              
              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 gap-6">
                {hostel.roomTypes && hostel.roomTypes.length > 0 ? (
                  hostel.roomTypes.map((room, index) => {
                    const occupancyPercent = getOccupancyPercentage(room);
                    const isAlmostFull = occupancyPercent >= 80 && occupancyPercent < 100;
                    const appCount = getApplicationCount(room.type);
                    const lastBooking = getLastBookingTime(room.type);
                    
                    return (
                    <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src={room.roomImage || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'} 
                        alt={room.type} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{room.type}</h3>
                          <div className="flex gap-1">
                            {isAlmostFull && (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                                Almost Full
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {room.available ? 'Available' : 'Full'}
                            </span>
                          </div>
                        </div>
                        <div className="text-primary-600 font-bold text-2xl mb-2">
                          GH₵{room.price} <span className="text-sm text-gray-500 font-normal">/ semester</span>
                        </div>
                        
                        {/* Occupancy Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span className="font-medium">Approved Occupancy</span>
                            <span className="font-semibold">{room.occupiedCapacity || 0} / {room.totalCapacity} slots filled</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                occupancyPercent >= 90 ? 'bg-red-500' :
                                occupancyPercent >= 80 ? 'bg-orange-500' :
                                occupancyPercent >= 50 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Social Proof & Activity */}
                        <div className="flex flex-wrap gap-2 mb-3 text-xs">
                          {appCount > 0 && (
                            <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <Users className="w-3 h-3 mr-1" />
                              {appCount} {appCount === 1 ? 'student' : 'students'} applied
                            </span>
                          )}
                          {lastBooking && (
                            <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded">
                              <Clock className="w-3 h-3 mr-1" />
                              Last booked: {lastBooking}
                            </span>
                          )}
                        </div>
                        
                        {/* Facilities with Icons */}
                        {room.facilities && room.facilities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Facilities:</p>
                            <div className="flex flex-wrap gap-2">
                              {room.facilities.map((f, i) => (
                                <span key={i} className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded gap-1">
                                  {getFacilityIcon(f)}
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {room.available && user?.role === 'student' ? (
                          <button
                            onClick={() => setAppData({...appData, roomType: room.type})}
                            className="w-full bg-primary-600 text-white py-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
                          >
                            Apply for this Room
                          </button>
                        ) : !room.available ? (
                          <button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 py-4 rounded-md cursor-not-allowed font-medium"
                          >
                            Fully Booked
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                  })
                ) : (
                  <p className="text-gray-500 col-span-2">No room types available at the moment.</p>
                )}
              </div>
              
              {/* Mobile: Swipeable Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto scrollbar-hide -mx-6 px-6">
                <div className="flex gap-4 pb-4">
                  {hostel.roomTypes && hostel.roomTypes.length > 0 ? (
                    hostel.roomTypes.map((room, index) => {
                      const occupancyPercent = getOccupancyPercentage(room);
                      const isAlmostFull = occupancyPercent >= 80 && occupancyPercent < 100;
                      const appCount = getApplicationCount(room.type);
                      const lastBooking = getLastBookingTime(room.type);
                      
                      return (
                      <div key={index} className="flex-shrink-0 w-[85vw] border rounded-lg overflow-hidden shadow-md">
                        <img 
                          src={room.roomImage || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'} 
                          alt={room.type} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{room.type}</h3>
                            <div className="flex flex-col gap-1">
                              {isAlmostFull && (
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold text-center">
                                  Almost Full
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full text-center ${
                                room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {room.available ? 'Available' : 'Full'}
                              </span>
                            </div>
                          </div>
                          <div className="text-primary-600 font-bold text-2xl mb-3">
                            GH₵{room.price} <span className="text-sm text-gray-500 font-normal">/ semester</span>
                          </div>
                          
                          {/* Occupancy Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span className="font-medium">Approved Occupancy</span>
                              <span className="font-semibold">{room.occupiedCapacity || 0} / {room.totalCapacity} slots</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full transition-all ${
                                  occupancyPercent >= 90 ? 'bg-red-500' :
                                  occupancyPercent >= 80 ? 'bg-orange-500' :
                                  occupancyPercent >= 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${occupancyPercent}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Social Proof & Activity */}
                          <div className="flex flex-wrap gap-2 mb-3 text-xs">
                            {appCount > 0 && (
                              <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                <Users className="w-3 h-3 mr-1" />
                                {appCount} applied
                              </span>
                            )}
                            {lastBooking && (
                              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded">
                                <Clock className="w-3 h-3 mr-1" />
                                {lastBooking}
                              </span>
                            )}
                          </div>
                          
                          {/* Facilities with Icons */}
                          {room.facilities && room.facilities.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-700 mb-2">Facilities:</p>
                              <div className="flex flex-wrap gap-2">
                                {room.facilities.slice(0, 4).map((f, i) => (
                                  <span key={i} className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded gap-1">
                                    {getFacilityIcon(f)}
                                    {f}
                                  </span>
                                ))}
                                {room.facilities.length > 4 && (
                                  <span className="text-xs text-gray-500">+{room.facilities.length - 4}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {room.available && user?.role === 'student' ? (
                            <button
                              onClick={() => setAppData({...appData, roomType: room.type})}
                              className="w-full bg-primary-600 text-white py-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
                            >
                              Apply for this Room
                            </button>
                          ) : !room.available ? (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-500 py-4 rounded-md cursor-not-allowed font-medium"
                            >
                              Fully Booked
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                    })
                  ) : (
                    <p className="text-gray-500">No room types available at the moment.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            {appData.roomType ? (
              <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg border border-primary-100 xl:sticky xl:top-8">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Application Form</h2>
                <div className="mb-3 sm:mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs sm:text-sm text-gray-600">Applying for:</p>
                  <p className="text-sm sm:text-base font-bold text-primary-700">{appData.roomType}</p>
                </div>
                
                {(() => {
                  const room = hostel.roomTypes?.find(r => r.type === appData.roomType);
                  const isRoomFull = room && (room.occupiedCapacity >= room.totalCapacity);
                  
                  if (isRoomFull) {
                    return (
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                          <div className="flex justify-center mb-2">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <p className="font-bold text-lg mb-1">Room Fully Booked!</p>
                          <p className="text-sm">All {room.totalCapacity} slots have been approved.</p>
                        </div>
                        <button
                          onClick={() => setAppData({...appData, roomType: ''})}
                          className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                        >
                          Select Another Room
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <form onSubmit={handleApply} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                        <input 
                          type="text"
                          required
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your full name"
                          value={appData.studentName}
                          onChange={e => setAppData({...appData, studentName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                        <input 
                          type="tel"
                          required
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your phone number"
                          value={appData.contactNumber}
                          onChange={e => setAppData({...appData, contactNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                        <select 
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500"
                          value={appData.semester}
                          onChange={e => setAppData({...appData, semester: e.target.value})}
                        >
                          <option value="First Semester">First Semester</option>
                          <option value="Second Semester">Second Semester</option>
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-primary-600 text-white py-3 rounded-md font-bold hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Submit Application
                      </button>
                    </form>
                  );
                })()}

                <div className="pt-6 border-t border-gray-200 mt-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 h-12 w-12 rounded-full mr-3 flex items-center justify-center font-bold text-primary-700">
                      {hostel.managerId?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{hostel.managerId?.name || 'Manager'}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                        Verified Landlord
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 xl:sticky xl:top-8">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Select a Room Type</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Click "Apply for this Room" on any available room type to start your application.</p>
                
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 h-12 w-12 rounded-full mr-3 flex items-center justify-center font-bold text-primary-700">
                      {hostel.managerId?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{hostel.managerId?.name || 'Manager'}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                        Verified Landlord
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetail;
