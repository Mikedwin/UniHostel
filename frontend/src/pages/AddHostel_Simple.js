import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';

const AddHostel = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [roomType, setRoomType] = useState('Single');
    const [facilities, setFacilities] = useState([]);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [imageInput, setImageInput] = useState('');

    const addImage = () => {
        if (imageInput.trim()) {
            setImages([...images, imageInput.trim()]);
            setImageInput('');
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const formData = {
                name,
                location,
                price: Number(price),
                roomType,
                facilities,
                description,
                images
            };
            
            await axios.post('http://localhost:5000/api/hostels', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            navigate('/manager-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Hostel</h1>
                
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name *</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full border border-gray-300 rounded-md p-3" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full border border-gray-300 rounded-md p-3" 
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Semester ($) *</label>
                            <input 
                                type="number" 
                                required 
                                className="w-full border border-gray-300 rounded-md p-3" 
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md p-3" 
                                value={roomType}
                                onChange={e => setRoomType(e.target.value)}
                            >
                                <option value="Single">Single Room</option>
                                <option value="Double">Double Room</option>
                                <option value="Shared">Shared Room</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Images</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="url"
                                className="flex-1 border border-gray-300 rounded-md p-2"
                                placeholder="Enter image URL"
                                value={imageInput}
                                onChange={e => setImageInput(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Add Image
                            </button>
                        </div>
                        
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={img} 
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea 
                            required 
                            className="w-full border border-gray-300 rounded-md p-3 h-32" 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
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
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Publishing...' : 'Publish Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHostel;