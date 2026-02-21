import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { User, MapPin, Leaf, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';

const CROP_OPTIONS = [
    'Tomato', 'Potato', 'Wheat', 'Rice', 'Corn', 'Cotton',
    'Soybean', 'Sugarcane', 'Apple', 'Grape', 'Banana', 'Mango',
    'Onion', 'Garlic', 'Pepper', 'Cucumber', 'Lettuce', 'Cabbage'
];

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [fieldLocation, setFieldLocation] = useState('');
    const [crops, setCrops] = useState([]);
    const [showCropSelector, setShowCropSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await api.get('/user/profile');
            const data = response.data;
            setName(data.name || '');
            setLocation(data.location || '');
            setFieldLocation(data.field_location || '');
            setCrops(data.crops || []);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/user/profile', { name, location, field_location: fieldLocation });
            const data = response.data;
            updateUser(data);
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCrop = async (cropType) => {
        try {
            const response = await api.post('/user/crops', { cropType });
            const newCrop = response.data;
            setCrops([...crops, newCrop]);
            setShowCropSelector(false);
            setMessage({ type: 'success', text: `${cropType} added successfully!` });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add crop' });
        }
    };

    const handleRemoveCrop = async (cropId) => {
        try {
            await api.delete(`/user/crops/${cropId}`);
            setCrops(crops.filter(c => c.id !== cropId));
            setMessage({ type: 'success', text: 'Crop removed successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove crop' });
        }
    };

    const availableCrops = CROP_OPTIONS.filter(
        crop => !crops.some(c => c.type === crop)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Breadcrumbs />

                <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

                {/* Message */}
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-card border border-gray-200 p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full border-4 border-green-100"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-gray-600">{user?.email}</p>
                            </div>
                        </div>

                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <Edit2 size={18} />
                                <span className="font-semibold">Edit</span>
                            </button>
                        )}
                    </div>

                    {/* Profile Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Name
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-brand-main focus:outline-none text-gray-900"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{name || 'Not set'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="inline w-4 h-4 mr-1" />
                                Location
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Puducherry"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-brand-main focus:outline-none text-gray-900"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{location || 'Not set'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="inline w-4 h-4 mr-1" />
                                Field Location <span className="text-gray-500 text-xs">(Optional)</span>
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={fieldLocation}
                                    onChange={(e) => setFieldLocation(e.target.value)}
                                    placeholder="e.g., Lawspet or Villianur"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-brand-main focus:outline-none text-gray-900"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{fieldLocation || 'Not set'}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {editing && (
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    loadProfile();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-brand-gradient text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Crops Card */}
                <div className="bg-white rounded-3xl shadow-card border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-6 h-6 text-brand-main" />
                            <h3 className="text-xl font-bold text-gray-900">My Crops</h3>
                        </div>
                        <button
                            onClick={() => setShowCropSelector(!showCropSelector)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                        >
                            <Plus size={18} />
                            <span className="font-semibold">Add Crop</span>
                        </button>
                    </div>

                    {/* Crop Selector */}
                    {showCropSelector && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-gray-50 rounded-xl"
                        >
                            <p className="text-sm font-semibold text-gray-700 mb-3">Select a crop to add:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {availableCrops.map(crop => (
                                    <button
                                        key={crop}
                                        onClick={() => handleAddCrop(crop)}
                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-sm font-semibold"
                                    >
                                        {crop}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Crops List */}
                    {crops.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {crops.map(crop => (
                                <div
                                    key={crop.id}
                                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl"
                                >
                                    <span className="font-semibold text-green-900">{crop.type}</span>
                                    <button
                                        onClick={() => handleRemoveCrop(crop.id)}
                                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No crops added yet</p>
                            <p className="text-sm text-gray-500">Click "Add Crop" to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
