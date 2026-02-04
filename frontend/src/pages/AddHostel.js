import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import API_URL from '../config';
import imageCompression from 'browser-image-compression';

const AddHostel = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    
    // Step 1: Hostel Information
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [hostelViewImage, setHostelViewImage] = useState('');
    const [hostelImages, setHostelImages] = useState([]);
    const [virtualTourUrl, setVirtualTourUrl] = useState('');
    
    // Step 2: Room Types
    const [roomTypes, setRoomTypes] = useState([]);
    const [currentRoom, setCurrentRoom] = useState({
        type: '1 in a Room',
        price: '',
        gender: 'Male',
        roomImage: '',
        roomImages: [],
        virtualTourUrl: '',
        facilities: [],
        totalCapacity: ''
    });
    const [expandedRoom, setExpandedRoom] = useState(null);

    const commonFacilities = {
        'Basic Amenities': ['WiFi', 'AC', 'Hot Water', 'Furnished'],
        'Security': ['Security', 'CCTV', 'Secure Entry'],
        'Shared Spaces': ['Kitchen', 'Study Room', 'Common Area', 'Gym'],
        'Services': ['Laundry', 'Cleaning Service', 'Parking']
    };

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error('Compression error:', error);
            return file;
        }
    };

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
            alert('Please complete all required room fields (Price and Room Image)');
            return;
        }
        setRoomTypes([...roomTypes, currentRoom]);
        setCurrentRoom({
            type: '1 in a Room',
            price: '',
            gender: 'Male',
            roomImage: '',
            roomImages: [],
            virtualTourUrl: '',
            facilities: [],
            totalCapacity: ''
        });
    };

    const removeRoomType = (index) => {
        setRoomTypes(roomTypes.filter((_, i) => i !== index));
    };

    const canProceedToStep2 = () => {
        return name.trim() && location.trim() && description.trim();
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
                hostelImages,
                virtualTourUrl: virtualTourUrl.trim(),
                roomTypes
            };
            
            await axios.post(`${API_URL}/api/hostels`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            navigate('/manager-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Hostel</h1>
                <p className="text-gray-600 mb-8">Follow the steps below to create your hostel listing</p>
                
                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-center space-x-4">
                    <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                            1
                        </div>
                        <span className="ml-2 font-medium hidden sm:inline">Hostel Info</span>
                    </div>
                    <div className="w-16 h-1 bg-gray-300"></div>
                    <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                            2
                        </div>
                        <span className="ml-2 font-medium hidden sm:inline">Room Types</span>
                    </div>
                </div>
                
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Hostel Information */}
                    {step === 1 && (
                        <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Hostel Information</h2>
                                <p className="text-sm text-gray-600">Provide basic details about your hostel</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hostel Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="e.g., Sunrise Student Hostel"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="e.g., Near University Campus, City Center"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hostel Description <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    required 
                                    className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="Describe your hostel, nearby amenities, rules, etc."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hostel View Image
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    📸 Take a photo of your hostel exterior or upload from gallery
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            console.log('Hostel View Image - Selected file:', file.name, file.size, 'bytes');
                                            const compressed = await compressImage(file);
                                            console.log('Hostel View Image - After compression:', compressed.size, 'bytes');
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                console.log('Hostel View Image - Loaded, length:', event.target.result.length);
                                                setHostelViewImage(event.target.result);
                                            };
                                            reader.readAsDataURL(compressed);
                                        }
                                    }}
                                    className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 mb-3 text-base file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {hostelViewImage && (
                                    <div className="relative group border-2 border-blue-200 rounded-lg overflow-hidden">
                                        <img src={hostelViewImage} alt="Hostel View" className="w-full h-64 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setHostelViewImage('')}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Hostel Photos (Optional)
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    📸 Upload multiple photos of your hostel (common areas, facilities, etc.)
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files);
                                        if (files.length > 0) {
                                            const newImages = [];
                                            for (const file of files) {
                                                const compressed = await compressImage(file);
                                                const reader = new FileReader();
                                                await new Promise((resolve) => {
                                                    reader.onload = (event) => {
                                                        newImages.push(event.target.result);
                                                        resolve();
                                                    };
                                                    reader.readAsDataURL(compressed);
                                                });
                                            }
                                            setHostelImages([...hostelImages, ...newImages]);
                                        }
                                    }}
                                    className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 mb-3 text-base file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {hostelImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {hostelImages.map((img, idx) => (
                                            <div key={idx} className="relative group border rounded-lg overflow-hidden">
                                                <img src={img} alt={`Hostel ${idx + 1}`} className="w-full h-24 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setHostelImages(hostelImages.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    360° Virtual Tour URL (Optional)
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    🌐 Paste a link to your 360° virtual tour (e.g., Matterport, Google Street View)
                                </p>
                                <input 
                                    type="url" 
                                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                    placeholder="https://..."
                                    value={virtualTourUrl}
                                    onChange={e => setVirtualTourUrl(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate('/manager-dashboard')}
                                    className="w-full sm:w-auto px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-base active:scale-95 transition-transform"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!canProceedToStep2()}
                                    className="w-full sm:w-auto px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-transform"
                                >
                                    Next: Add Room Types →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Room Types */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-lg shadow-sm">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-1">Room Types</h2>
                                    <p className="text-sm text-gray-600">Add different room categories available in your hostel</p>
                                </div>
                                
                                {/* Current Room Form */}
                                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
                                    <h3 className="font-semibold text-lg mb-4">Add Room Type</h3>
                                    
                                    <div className="grid grid-cols-1 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Room Type <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                className="w-full border border-gray-300 rounded-md p-4 text-base focus:ring-2 focus:ring-blue-500 bg-white" 
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select 
                                                className="w-full border border-gray-300 rounded-md p-4 text-base focus:ring-2 focus:ring-blue-500 bg-white" 
                                                value={currentRoom.gender}
                                                onChange={e => setCurrentRoom({...currentRoom, gender: e.target.value})}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price per Semester (GH₵) <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full border border-gray-300 rounded-md p-4 text-base focus:ring-2 focus:ring-blue-500" 
                                                placeholder="Enter price"
                                                value={currentRoom.price}
                                                onChange={e => setCurrentRoom({...currentRoom, price: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total Student Capacity <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Enter the total number of students that can be accommodated in this room type.
                                        </p>
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="w-full border border-gray-300 rounded-md p-4 text-base focus:ring-2 focus:ring-blue-500" 
                                            placeholder="e.g., 20 students"
                                            value={currentRoom.totalCapacity}
                                            onChange={e => setCurrentRoom({...currentRoom, totalCapacity: e.target.value})}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Image <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">
                                            📸 Take a photo or upload from gallery
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    console.log('Room Image - Selected file:', file.name, file.size, 'bytes');
                                                    const compressed = await compressImage(file);
                                                    console.log('Room Image - After compression:', compressed.size, 'bytes');
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        console.log('Room Image - Loaded, length:', event.target.result.length);
                                                        setCurrentRoom({...currentRoom, roomImage: event.target.result});
                                                    };
                                                    reader.readAsDataURL(compressed);
                                                }
                                            }}
                                            className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 mb-2 bg-white text-base file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {currentRoom.roomImage && (
                                            <div className="relative group border rounded-lg overflow-hidden">
                                                <img src={currentRoom.roomImage} alt="Room" className="w-full h-48 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentRoom({...currentRoom, roomImage: ''})}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 shadow-lg"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Additional Room Photos (Optional)
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">
                                            📸 Upload multiple photos of this room type
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) {
                                                    const newImages = [];
                                                    for (const file of files) {
                                                        const compressed = await compressImage(file);
                                                        const reader = new FileReader();
                                                        await new Promise((resolve) => {
                                                            reader.onload = (event) => {
                                                                newImages.push(event.target.result);
                                                                resolve();
                                                            };
                                                            reader.readAsDataURL(compressed);
                                                        });
                                                    }
                                                    setCurrentRoom({...currentRoom, roomImages: [...currentRoom.roomImages, ...newImages]});
                                                }
                                            }}
                                            className="w-full border-2 border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 mb-2 bg-white text-base file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {currentRoom.roomImages.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {currentRoom.roomImages.map((img, idx) => (
                                                    <div key={idx} className="relative group border rounded-lg overflow-hidden">
                                                        <img src={img} alt={`Room ${idx + 1}`} className="w-full h-20 object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentRoom({...currentRoom, roomImages: currentRoom.roomImages.filter((_, i) => i !== idx)})}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-lg"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            360° Virtual Tour URL (Optional)
                                        </label>
                                        <input 
                                            type="url" 
                                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500" 
                                            placeholder="https://..."
                                            value={currentRoom.virtualTourUrl}
                                            onChange={e => setCurrentRoom({...currentRoom, virtualTourUrl: e.target.value})}
                                        />
                                    </div>
                                    
                                    {/* Facilities */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Room Facilities (Tap to select)</label>
                                        
                                        {Object.entries(commonFacilities).map(([category, items]) => (
                                            <div key={category} className="mb-4">
                                                <p className="text-xs font-medium text-gray-600 mb-2">{category}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {items.map(facility => (
                                                        <button
                                                            key={facility}
                                                            type="button"
                                                            onClick={() => addFacility(facility)}
                                                            className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                                                                currentRoom.facilities.includes(facility)
                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 active:scale-95'
                                                            }`}
                                                        >
                                                            {currentRoom.facilities.includes(facility) && '✓ '}{facility}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {currentRoom.facilities.length > 0 && (
                                            <div className="mt-3 p-3 bg-white rounded-md border">
                                                <p className="text-xs font-medium text-gray-600 mb-2">Selected Facilities:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {currentRoom.facilities.map(facility => (
                                                        <span key={facility} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                            {facility}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFacility(facility)}
                                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                            >
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
                                        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md active:scale-95 transition-transform"
                                    >
                                        <Plus className="w-6 h-6 mr-2" />
                                        Add This Room Type
                                    </button>
                                </div>

                                {/* Added Room Types */}
                                {roomTypes.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-lg mb-3">Added Room Types ({roomTypes.length})</h3>
                                        <div className="space-y-3">
                                            {roomTypes.map((room, index) => (
                                                <div key={index} className="border rounded-lg overflow-hidden">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50">
                                                        <div className="flex items-center space-x-4">
                                                            <img src={room.roomImage} alt={room.type} className="w-16 h-16 object-cover rounded" />
                                                            <div>
                                                                <p className="font-medium">{room.type} • {room.gender}</p>
                                                                <p className="text-sm text-gray-600">GH₵{room.price} / semester</p>
                                                                <p className="text-xs text-gray-500">{room.facilities.length} facilities • Capacity: {room.totalCapacity} students</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedRoom(expandedRoom === index ? null : index)}
                                                                className="text-gray-600 hover:bg-gray-200 p-2 rounded"
                                                            >
                                                                {expandedRoom === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRoomType(index)}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {expandedRoom === index && (
                                                        <div className="p-4 border-t">
                                                            <p className="text-sm font-medium mb-2">Facilities:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {room.facilities.map((f, i) => (
                                                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{f}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full sm:w-auto px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-base active:scale-95 transition-transform"
                                >
                                    ← Back
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || roomTypes.length === 0}
                                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-transform"
                                >
                                    {loading ? 'Publishing...' : '✓ Submit Hostel Listing'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddHostel;
