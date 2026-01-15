import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapPin, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const HostelDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState({ roomType: '', semester: 'First Semester', studentName: '', contactNumber: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/hostels/${id}`);
        setHostel(res.data);
        
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
      setSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading hostel details...</div>;
  if (!hostel) return <div className="text-center py-20">Hostel not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hostel View Image at the top */}
        <div className="mb-8 relative">
          <img 
            src={hostel.hostelViewImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'} 
            alt={`${hostel.name} - Hostel View`} 
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl shadow-sm"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{hostel.name}</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {/* Hostel Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{hostel.location}</span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{hostel.description}</p>
              </div>
            </div>

            {/* Available Room Types */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Available Room Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostel.roomTypes && hostel.roomTypes.length > 0 ? (
                  hostel.roomTypes.map((room, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src={room.roomImage || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'} 
                        alt={room.type} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{room.type}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {room.available ? 'Available' : 'Full'}
                          </span>
                        </div>
                        <div className="text-primary-600 font-bold text-2xl mb-2">
                          GH₵{room.price} <span className="text-sm text-gray-500 font-normal">/ semester</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Capacity:</span> {room.totalCapacity - room.occupiedCapacity} / {room.totalCapacity} spots available
                        </div>
                        {room.facilities && room.facilities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Facilities:</p>
                            <div className="flex flex-wrap gap-1">
                              {room.facilities.map((f, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {room.available && user?.role === 'student' ? (
                          <button
                            onClick={() => setAppData({...appData, roomType: room.type})}
                            className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
                          >
                            Apply for this Room
                          </button>
                        ) : !room.available ? (
                          <button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 py-2 rounded-md cursor-not-allowed"
                          >
                            Fully Booked
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No room types available at the moment.</p>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            {appData.roomType ? (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-100 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Application Form</h2>
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">Applying for:</p>
                  <p className="font-bold text-primary-700">{appData.roomType}</p>
                </div>
                
                {(() => {
                  const selectedRoom = hostel.roomTypes?.find(r => r.type === appData.roomType);
                  const isRoomFull = selectedRoom && selectedRoom.occupiedCapacity >= selectedRoom.totalCapacity;
                  
                  if (isRoomFull) {
                    return (
                      <div className="bg-red-100 text-red-700 p-4 rounded-md text-center mb-6">
                        <p className="font-medium">This room is fully booked!</p>
                        <p className="text-sm">Please select another room type.</p>
                      </div>
                    );
                  }
                  
                  if (success) {
                    return (
                      <div className="bg-green-100 text-green-700 p-4 rounded-md text-center mb-6">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-medium">Application submitted successfully!</p>
                        <p className="text-sm">Check your dashboard for updates.</p>
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
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Select a Room Type</h2>
                <p className="text-gray-600 text-sm">Click "Apply for this Room" on any available room type to start your application.</p>
                
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
