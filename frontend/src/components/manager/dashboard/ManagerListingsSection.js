import React from 'react';
import { Edit, Home, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const roomOrder = {
  '1 in a Room': 1,
  '2 in a Room': 2,
  '3 in a Room': 3,
  '4 in a Room': 4
};

const ManagerListingsSection = ({ hostels, onDeleteHostel }) => (
  <div className="lg:col-span-3">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">My Listings</h2>
      {hostels.length > 0 && (
        <span className="text-xs text-gray-500">
          {hostels.length} {hostels.length === 1 ? 'Hostel' : 'Hostels'}
        </span>
      )}
    </div>
    {hostels.length === 0 ? (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">No hostels listed yet</p>
        <Link to="/add-hostel" className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          List Your First Hostel
        </Link>
      </div>
    ) : (
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {hostels.map((hostel) => {
          const totalCapacity = hostel.roomTypes?.reduce((sum, room) => sum + room.totalCapacity, 0) || 0;
          const totalOccupied = hostel.roomTypes?.reduce((sum, room) => sum + (room.occupiedCapacity || 0), 0) || 0;
          const occupancyPercent = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(0) : 0;

          return (
            <div key={hostel._id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              {hostel.hostelViewImage && (
                <div className="relative h-32 overflow-hidden rounded-t-lg">
                  <img src={hostel.hostelViewImage} alt={hostel.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Link
                      to={`/edit-hostel/${hostel._id}`}
                      className="bg-white text-blue-600 hover:bg-blue-50 p-2 rounded-full shadow-md"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDeleteHostel(hostel._id, hostel.name)}
                      className="bg-white text-red-600 hover:bg-red-50 p-2 rounded-full shadow-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{hostel.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {hostel.location}
                    </p>
                  </div>
                  {!hostel.hostelViewImage && (
                    <div className="flex gap-2">
                      <Link
                        to={`/edit-hostel/${hostel._id}`}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onDeleteHostel(hostel._id, hostel.name)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Occupancy</span>
                    <span className="font-semibold">
                      {totalOccupied}/{totalCapacity} ({occupancyPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPercent >= 90
                          ? 'bg-red-500'
                          : occupancyPercent >= 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {hostel.roomTypes
                    ?.slice()
                    .sort((left, right) => (roomOrder[left.type] || 99) - (roomOrder[right.type] || 99))
                    .map((room, index) => {
                      const roomOccupancy = room.totalCapacity > 0
                        ? ((room.occupiedCapacity || 0) / room.totalCapacity * 100).toFixed(0)
                        : 0;

                      return (
                        <div key={`${hostel._id}-${index}`} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{room.type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {room.available ? 'Available' : 'Full'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {room.occupiedCapacity || 0}/{room.totalCapacity} occupied ({roomOccupancy}%)
                              </p>
                            </div>
                            <span className="text-primary-700 font-bold text-sm whitespace-nowrap">GHS {room.price}/sem</span>
                          </div>
                          {room.facilities && room.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {room.facilities.slice(0, 4).map((facility, facilityIndex) => (
                                <span key={`${hostel._id}-${room.type}-${facilityIndex}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {facility}
                                </span>
                              ))}
                              {room.facilities.length > 4 && (
                                <span className="text-xs text-gray-500">+{room.facilities.length - 4} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default ManagerListingsSection;
