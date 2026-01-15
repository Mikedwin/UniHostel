const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Application = require('../models/Application');
const AdminLog = require('../models/AdminLog');
const { auth, checkRole } = require('../middleware/auth');

const checkAdmin = checkRole('admin');

const logAdminAction = async (adminId, action, targetType, targetId, details) => {
  try {
    await AdminLog.create({ adminId, action, targetType, targetId, details });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

router.get('/dashboard/stats', auth, checkAdmin, async (req, res) => {
  try {
    const [totalHostels, activeHostels, totalManagers, totalStudents, totalApplications, pendingApplications, approvedApplications] = await Promise.all([
      Hostel.countDocuments(),
      Hostel.countDocuments({ isActive: true, isAvailable: true }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'student' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' })
    ]);

    const hostels = await Hostel.find().lean();
    let roomStats = {
      '1 in a Room': { total: 0, occupied: 0, available: 0 },
      '2 in a Room': { total: 0, occupied: 0, available: 0 },
      '3 in a Room': { total: 0, occupied: 0, available: 0 },
      '4 in a Room': { total: 0, occupied: 0, available: 0 }
    };

    hostels.forEach(hostel => {
      hostel.roomTypes?.forEach(room => {
        if (roomStats[room.type]) {
          roomStats[room.type].total += room.totalCapacity;
          roomStats[room.type].occupied += room.occupiedCapacity || 0;
          roomStats[room.type].available += (room.totalCapacity - (room.occupiedCapacity || 0));
        }
      });
    });

    res.json({ overview: { totalHostels, activeHostels, totalManagers, totalStudents, totalApplications, pendingApplications, approvedApplications }, roomStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hostels', auth, checkAdmin, async (req, res) => {
  try {
    const { search, status, managerId } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'flagged') query.isFlagged = true;
    if (managerId) query.managerId = managerId;

    const hostels = await Hostel.find(query).populate('managerId', 'name email').sort({ createdAt: -1 }).lean();
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/hostels/:id/toggle-active', auth, checkAdmin, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });

    hostel.isActive = !hostel.isActive;
    await hostel.save();
    await logAdminAction(req.user.id, hostel.isActive ? 'ACTIVATE_HOSTEL' : 'DEACTIVATE_HOSTEL', 'hostel', hostel._id, `${hostel.isActive ? 'Activated' : 'Deactivated'} hostel: ${hostel.name}`);
    res.json({ message: `Hostel ${hostel.isActive ? 'activated' : 'deactivated'}`, hostel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/hostels/:id/flag', auth, checkAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });

    hostel.isFlagged = !hostel.isFlagged;
    hostel.flagReason = hostel.isFlagged ? reason : null;
    await hostel.save();
    await logAdminAction(req.user.id, hostel.isFlagged ? 'FLAG_HOSTEL' : 'UNFLAG_HOSTEL', 'hostel', hostel._id, reason || 'Unflagged hostel');
    res.json({ message: `Hostel ${hostel.isFlagged ? 'flagged' : 'unflagged'}`, hostel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/hostels/:hostelId/rooms/:roomType/reset-capacity', auth, checkAdmin, async (req, res) => {
  try {
    const { hostelId, roomType } = req.params;
    const { newOccupiedCapacity } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });

    const roomIndex = hostel.roomTypes.findIndex(r => r.type === decodeURIComponent(roomType));
    if (roomIndex === -1) return res.status(404).json({ error: 'Room type not found' });

    const oldCapacity = hostel.roomTypes[roomIndex].occupiedCapacity;
    hostel.roomTypes[roomIndex].occupiedCapacity = newOccupiedCapacity;
    hostel.roomTypes[roomIndex].available = newOccupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity;
    await hostel.save();
    await logAdminAction(req.user.id, 'RESET_ROOM_CAPACITY', 'room', hostel._id, `Reset ${roomType} capacity from ${oldCapacity} to ${newOccupiedCapacity} in ${hostel.name}`);
    res.json({ message: 'Room capacity reset successfully', hostel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/applications', auth, checkAdmin, async (req, res) => {
  try {
    const { status, hostelId, studentId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (hostelId) query.hostelId = hostelId;
    if (studentId) query.studentId = studentId;

    const applications = await Application.find(query).populate('hostelId', 'name location').populate('studentId', 'name email').sort({ createdAt: -1 }).lean();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/managers', auth, checkAdmin, async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('-password').sort({ createdAt: -1 }).lean();
    const managersWithStats = await Promise.all(managers.map(async (manager) => {
      const hostelCount = await Hostel.countDocuments({ managerId: manager._id });
      const applicationCount = await Application.countDocuments({ hostelId: { $in: await Hostel.find({ managerId: manager._id }).distinct('_id') } });
      return { ...manager, hostelCount, applicationCount };
    }));
    res.json(managersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/insights/room-demand', auth, checkAdmin, async (req, res) => {
  try {
    const applications = await Application.find().lean();
    const roomDemand = {};
    applications.forEach(app => { roomDemand[app.roomType] = (roomDemand[app.roomType] || 0) + 1; });
    res.json(roomDemand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/insights/full-rooms', auth, checkAdmin, async (req, res) => {
  try {
    const hostels = await Hostel.find().populate('managerId', 'name').lean();
    const fullRooms = [];
    hostels.forEach(hostel => {
      hostel.roomTypes?.forEach(room => {
        if (room.occupiedCapacity >= room.totalCapacity) {
          fullRooms.push({ hostelName: hostel.name, managerName: hostel.managerId?.name, roomType: room.type, capacity: room.totalCapacity });
        }
      });
    });
    res.json(fullRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logs', auth, checkAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AdminLog.find().populate('adminId', 'name email').sort({ timestamp: -1 }).limit(parseInt(limit)).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
