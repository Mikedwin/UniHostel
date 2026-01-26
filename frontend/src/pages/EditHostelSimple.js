import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import API_URL from '../config';

const EditHostelSimple = () => {
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
                const response = await axios.get(`${API_URL}/api/hostels/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const hostel = response.data;
                console.log('Hostel loaded successfully');
                setName(hostel.name);
                setLocation(hostel.location);
                setDescription(hostel.description);
                // Don't load existing image to avoid size issues
                setHostelViewImage('');
                // Load room types without images
                const roomsWithoutImages = (hostel.roomTypes || []).map(room => ({
                    type: room.type,
                    price: room.price,
                    totalCapacity: room.totalCapacity || 1,
                    occupiedCapacity: room.occupiedCapacity || 0,
                    available: room.available,
                    facilities: room.facilities || [],
                    roomImage: '' // Don't load existing image
                }));
                setRoomTypes(roomsWithoutImages);
                setFetchLoading(false);
            } catch (err) {
                console.error('Error fetching hostel:', err);
                setError(err.response?.data?.error || err.message || 'Failed to load hostel');
                setFetchLoading(false);
            }
        };
        if (id && token) fetchHostel();
    }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await axios.put(`${API_URL}/api/hostels/${id}`, {
                name: name.trim(),
                location: location.trim(),
                description: description.trim(),
                hostelViewImage,
                roomTypes
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            
            navigate('/manager-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-xl font-semibold text-gray-700">Loading hostel data...</div>
                <div className="text-sm text-gray-500 mt-2">This may take a few seconds</div>
            </div>
        );
    }

    if (error && !name) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Hostel</h1>
                <p className="text-gray-600 mb-8">Update your hostel information, room details, and pricing</p>
                
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hostel View Image
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Upload a main image of your hostel (optional, max 500KB)</p>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer border border-gray-300">
                                    <Upload className="w-4 h-4" />
                                    Choose Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
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
                                    />
                                </label>
                                {hostelViewImage && (
                                    <button
                                        type="button"
                                        onClick={() => setHostelViewImage('')}
                                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove
                                    </button>
                                )}
                            </div>
                            {hostelViewImage && (
                                <div className="mt-3 relative group border-2 border-blue-200 rounded-lg overflow-hidden">
                                    <img src={hostelViewImage} alt="Hostel View" className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Room Types & Pricing</h2>
                        <p className="text-sm text-gray-600 mb-4">Update pricing, capacity, and facilities for each room type</p>
                        <div className="space-y-6">
                            {roomTypes.map((room, index) => (
                                <div key={index} className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900">{room.type}</h3>
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                            room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {room.occupiedCapacity || 0}/{room.totalCapacity} Occupied
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price per Semester (GH₵) *
                                            </label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                required
                                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                                value={room.price}
                                                onChange={e => {
                                                    const updated = [...roomTypes];
                                                    updated[index].price = e.target.value;
                                                    setRoomTypes(updated);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Total Capacity *
                                            </label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                required
                                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                                value={room.totalCapacity}
                                                onChange={e => {
                                                    const updated = [...roomTypes];
                                                    updated[index].totalCapacity = parseInt(e.target.value) || 1;
                                                    setRoomTypes(updated);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Room Facilities</label>
                                        {Object.entries(commonFacilities).map(([category, items]) => (
                                            <div key={category} className="mb-3">
                                                <p className="text-xs font-medium text-gray-600 mb-2">{category}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {items.map(facility => {
                                                        const isSelected = room.facilities?.includes(facility);
                                                        return (
                                                            <button
                                                                key={facility}
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...roomTypes];
                                                                    if (!updated[index].facilities) {
                                                                        updated[index].facilities = [];
                                                                    }
                                                                    if (isSelected) {
                                                                        updated[index].facilities = updated[index].facilities.filter(f => f !== facility);
                                                                    } else {
                                                                        updated[index].facilities.push(facility);
                                                                    }
                                                                    setRoomTypes(updated);
                                                                }}
                                                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                                                    isSelected
                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                                                }`}
                                                            >
                                                                {facility}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                        {room.facilities && room.facilities.length > 0 && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                                                <p className="text-xs font-medium text-blue-900 mb-2">Selected Facilities ({room.facilities.length}):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {room.facilities.map(facility => (
                                                        <span key={facility} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                                            {facility}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate('/manager-dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditHostelSimple;
