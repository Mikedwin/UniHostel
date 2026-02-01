import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';
import API_URL from '../config';

const EditHostel = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(true);
    
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [hostelViewImage, setHostelViewImage] = useState('');
    const [roomTypes, setRoomTypes] = useState([]);
    const [currentRoom, setCurrentRoom] = useState({
        type: '1 in a Room',
        price: '',
        roomImage: '',
        facilities: [],
        totalCapacity: ''
    });

    const commonFacilities = {
        'Basic Amenities': ['WiFi', 'AC', 'Hot Water', 'Furnished'],
        'Security': ['Security', 'CCTV', 'Secure Entry'],
        'Shared Spaces': ['Kitchen', 'Study Room', 'Common Area', 'Gym'],
        'Services': ['Laundry', 'Cleaning Service', 'Parking']
    };

    useEffect(() => {
        const fetchHostel = async () => {
            try {
                console.log('Fetching hostel:', id);
                const response = await axios.get(`${API_URL}/api/hostels/${id}?light=true`, {
                    timeout: 10000
                });
                const hostel = response.data;
                console.log('Hostel data:', hostel);
                setName(hostel.name);
                setLocation(hostel.location);
                setDescription(hostel.description);
                // Don't load hostelViewImage - too large, manager can upload new one
                setHostelViewImage('');
                // Load room types but without images
                const roomsWithoutImages = (hostel.roomTypes || []).map(room => ({
                    type: room.type,
                    price: room.price,
                    totalCapacity: room.totalCapacity || 1,
                    occupiedCapacity: room.occupiedCapacity || 0,
                    facilities: room.facilities || [],
                    roomImage: '' // Manager can upload new image if needed
                }));
                setRoomTypes(roomsWithoutImages);
                setFetchLoading(false);
            } catch (err) {
                console.error('Error fetching hostel:', err);
                console.error('Error details:', err.response?.data || err.message);
                setError(err.response?.data?.error || err.message || 'Failed to load hostel data');
                setFetchLoading(false);
            }
        };
        if (id) {
            fetchHostel();
        }
    }, [id]);

    const addFacility = (facility) => {
        if (facility && !currentRoom.facilities.includes(facility)) {
            setCurrentRoom({...currentRoom, facilities: [...currentRoom.facilities, facility]});
        }
    };

    const removeFacility = (facility) => {
        setCurrentRoom({...currentRoom, facilities: currentRoom.facilities.filter(f => f !== facility)});
    };

    const isRoomValid = () => {
        return currentRoom.price && currentRoom.price > 0 && currentRoom.roomImage && currentRoom.totalCapacity && currentRoom.totalCapacity > 0;
    };

    const addRoomType = () => {
        if (!isRoomValid()) {
            alert('Please complete all required room fields');
            return;
        }
        setRoomTypes([...roomTypes, currentRoom]);
        setCurrentRoom({
            type: '1 in a Room',
            price: '',
            roomImage: '',
            facilities: [],
            totalCapacity: ''
        });
    };

    const removeRoomType = (index) => {
        setRoomTypes(roomTypes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (roomTypes.length === 0) {
            setError('Please add at least one room type');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const formData = {
                name: name.trim(),
                location: location.trim(),
                description: description.trim(),
                hostelViewImage,
                roomTypes
            };
            
            await axios.put(`${API_URL}/api/hostels/${id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            
            navigate('/manager-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-xl font-semibold mb-2">Loading hostel data...</div>
                {error && <div className="text-red-600 mt-4">{error}</div>}
            </div>
        );
    }

    if (error && !name) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-red-600 text-xl mb-4">{error}</div>
                <button 
                    onClick={() => navigate('/manager-dashboard')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Hostel Listing</h1>
                
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hostel Information */}
                    <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Hostel Information</h2>
                            <p className="text-sm text-gray-600">Update basic details about your hostel</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name *</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea 
                                required 
                                className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-2 focus:ring-blue-500" 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hostel View Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 500000) {
                                            alert('Image too large! Please use images under 500KB');
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (event) => setHostelViewImage(event.target.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 mb-3"
                            />
                            {hostelViewImage && (
                                <div className="relative group border-2 border-blue-200 rounded-lg overflow-hidden">
                                    <img src={hostelViewImage} alt="Hostel View" className="w-full h-64 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setHostelViewImage('')}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Room Types */}
                    <div className="bg-white p-8 rounded-lg shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-1">Room Types</h2>
                            <p className="text-sm text-gray-600">Manage room categories</p>
                        </div>
                        
                        {/* Current Room Form */}
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 mb-6">
                            <h3 className="font-semibold text-lg mb-4">Add Room Type</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 bg-white" 
                                        value={currentRoom.type}
                                        onChange={e => setCurrentRoom({...currentRoom, type: e.target.value})}
                                    >
                                        <option value="1 in a Room">1 in a Room</option>
                                        <option value="2 in a Room">2 in a Room</option>
                                        <option value="3 in a Room">3 in a Room</option>
                                        <option value="4 in a Room">4 in a Room</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Semester (GH₵) *</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                        value={currentRoom.price}
                                        onChange={e => setCurrentRoom({...currentRoom, price: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Student Capacity *</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Enter the total number of students that can be accommodated in this room type.
                                </p>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                    placeholder="e.g., 20 students"
                                    value={currentRoom.totalCapacity}
                                    onChange={e => setCurrentRoom({...currentRoom, totalCapacity: e.target.value})}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Room Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 500000) {
                                                alert('Image too large! Please use images under 500KB');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = (event) => setCurrentRoom({...currentRoom, roomImage: event.target.result});
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 mb-2 bg-white"
                                />
                                {currentRoom.roomImage && (
                                    <div className="relative group border rounded-lg overflow-hidden">
                                        <img src={currentRoom.roomImage} alt="Room" className="w-full h-48 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setCurrentRoom({...currentRoom, roomImage: ''})}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Room Facilities</label>
                                {Object.entries(commonFacilities).map(([category, items]) => (
                                    <div key={category} className="mb-4">
                                        <p className="text-xs font-medium text-gray-600 mb-2">{category}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {items.map(facility => (
                                                <button
                                                    key={facility}
                                                    type="button"
                                                    onClick={() => addFacility(facility)}
                                                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                                        currentRoom.facilities.includes(facility)
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                                    }`}
                                                >
                                                    {facility}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {currentRoom.facilities.length > 0 && (
                                    <div className="mt-3 p-3 bg-white rounded-md border">
                                        <p className="text-xs font-medium text-gray-600 mb-2">Selected:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {currentRoom.facilities.map(facility => (
                                                <span key={facility} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                    {facility}
                                                    <button type="button" onClick={() => removeFacility(facility)} className="ml-2">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                type="button"
                                onClick={addRoomType}
                                disabled={!isRoomValid()}
                                className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add This Room Type
                            </button>
                        </div>

                        {/* Added Room Types */}
                        {roomTypes.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Current Room Types ({roomTypes.length})</h3>
                                <div className="space-y-3">
                                    {roomTypes.map((room, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img src={room.roomImage} alt={room.type} className="w-16 h-16 object-cover rounded" />
                                                <div>
                                                    <p className="font-medium">{room.type}</p>
                                                    <p className="text-sm text-gray-600">GH₵{room.price} / semester</p>
                                                    <p className="text-xs text-gray-500">{room.facilities?.length || 0} facilities • Capacity: {room.totalCapacity} students</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeRoomType(index)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate('/manager-dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || roomTypes.length === 0}
                            className="px-8 py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditHostel;
