const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Application = require('../models/Application');
const AdminLog = require('../models/AdminLog');
const UserActivity = require('../models/UserActivity');
const ImpersonationLog = require('../models/ImpersonationLog');
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

router.delete('/hostels/:id', auth, checkAdmin, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });

    await Hostel.findByIdAndDelete(req.params.id);
    await logAdminAction(req.user.id, 'DELETE_HOSTEL', 'hostel', hostel._id, `Deleted hostel: ${hostel.name}`);
    res.json({ message: 'Hostel deleted successfully' });
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
    const { status, hostelId, studentId, hasDispute, disputeStatus, search, page = 1, limit = 50 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (hostelId) query.hostelId = hostelId;
    if (studentId) query.studentId = studentId;
    if (hasDispute === 'true') query.hasDispute = true;
    if (disputeStatus) query.disputeStatus = disputeStatus;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('hostelId', 'name location')
        .populate('studentId', 'name email')
        .populate('overriddenBy', 'name email')
        .populate('adminNotes.adminId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query)
    ]);
    res.json({ applications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
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

// USER MANAGEMENT ENDPOINTS
router.get('/users', auth, checkAdmin, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    let query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    if (status) query.accountStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password -temporaryPassword').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(query)
    ]);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -temporaryPassword').populate('suspendedBy', 'name email').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id/activity', auth, checkAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const activities = await UserActivity.find({ userId: req.params.id }).sort({ timestamp: -1 }).limit(parseInt(limit)).lean();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/suspend', auth, checkAdmin, async (req, res) => {
  try {
    const { reason, note } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot suspend admin users' });

    user.accountStatus = 'suspended';
    user.suspensionReason = reason;
    user.suspensionNote = note;
    user.suspendedBy = req.user.id;
    user.suspendedAt = new Date();
    await user.save();
    await logAdminAction(req.user.id, 'SUSPEND_USER', 'user', user._id, `Suspended ${user.role}: ${user.name} - Reason: ${reason}`);
    res.json({ message: 'User suspended successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/ban', auth, checkAdmin, async (req, res) => {
  try {
    const { reason, note } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot ban admin users' });

    user.accountStatus = 'banned';
    user.suspensionReason = reason;
    user.suspensionNote = note;
    user.suspendedBy = req.user.id;
    user.suspendedAt = new Date();
    await user.save();
    await logAdminAction(req.user.id, 'BAN_USER', 'user', user._id, `Banned ${user.role}: ${user.name} - Reason: ${reason}`);
    res.json({ message: 'User banned successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/activate', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.accountStatus = 'active';
    user.suspensionReason = null;
    user.suspensionNote = null;
    user.suspendedBy = null;
    user.suspendedAt = null;
    await user.save();
    await logAdminAction(req.user.id, 'ACTIVATE_USER', 'user', user._id, `Activated ${user.role}: ${user.name}`);
    res.json({ message: 'User activated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/verify', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'manager') return res.status(400).json({ error: 'Only managers require verification' });

    user.isVerified = true;
    user.accountStatus = 'active';
    await user.save();
    await logAdminAction(req.user.id, 'VERIFY_MANAGER', 'user', user._id, `Verified manager: ${user.name}`);
    res.json({ message: 'Manager verified successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/reject', auth, checkAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'manager') return res.status(400).json({ error: 'Only managers can be rejected' });

    user.isVerified = false;
    user.accountStatus = 'banned';
    user.suspensionReason = reason || 'Manager verification rejected';
    user.suspendedBy = req.user.id;
    user.suspendedAt = new Date();
    await user.save();
    await logAdminAction(req.user.id, 'REJECT_MANAGER', 'user', user._id, `Rejected manager: ${user.name} - Reason: ${reason}`);
    res.json({ message: 'Manager rejected successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/reset-password', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    user.temporaryPassword = tempPassword;
    user.passwordResetRequired = true;
    await user.save();
    await logAdminAction(req.user.id, 'RESET_PASSWORD', 'user', user._id, `Reset password for ${user.role}: ${user.name}`);
    res.json({ message: 'Password reset successfully', temporaryPassword: tempPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', auth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin users' });

    await User.findByIdAndDelete(req.params.id);
    await logAdminAction(req.user.id, 'DELETE_USER', 'user', user._id, `Deleted ${user.role}: ${user.name} (${user.email})`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/bulk-action', auth, checkAdmin, async (req, res) => {
  try {
    const { userIds, action, reason, note } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs required' });
    }

    const results = { success: [], failed: [] };
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user) { results.failed.push({ userId, error: 'User not found' }); continue; }
        if (user.role === 'admin') { results.failed.push({ userId, error: 'Cannot modify admin users' }); continue; }

        if (action === 'suspend') {
          user.accountStatus = 'suspended';
          user.suspensionReason = reason;
          user.suspensionNote = note;
          user.suspendedBy = req.user.id;
          user.suspendedAt = new Date();
        } else if (action === 'ban') {
          user.accountStatus = 'banned';
          user.suspensionReason = reason;
          user.suspensionNote = note;
          user.suspendedBy = req.user.id;
          user.suspendedAt = new Date();
        } else if (action === 'activate') {
          user.accountStatus = 'active';
          user.suspensionReason = null;
          user.suspensionNote = null;
          user.suspendedBy = null;
          user.suspendedAt = null;
        } else if (action === 'delete') {
          await User.findByIdAndDelete(userId);
          results.success.push(userId);
          await logAdminAction(req.user.id, 'BULK_DELETE_USER', 'user', userId, `Bulk deleted user: ${user.name}`);
          continue;
        }

        await user.save();
        results.success.push(userId);
        await logAdminAction(req.user.id, `BULK_${action.toUpperCase()}_USER`, 'user', userId, `Bulk ${action} user: ${user.name}`);
      } catch (err) {
        results.failed.push({ userId, error: err.message });
      }
    }

    res.json({ message: 'Bulk action completed', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/impersonate', auth, checkAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.role === 'admin') return res.status(403).json({ error: 'Cannot impersonate admin users' });

    const impersonationLog = await ImpersonationLog.create({
      adminId: req.user.id,
      targetUserId: targetUser._id,
      reason: reason || 'Troubleshooting',
      startTime: new Date()
    });

    await logAdminAction(req.user.id, 'START_IMPERSONATION', 'user', targetUser._id, `Started impersonating ${targetUser.role}: ${targetUser.name}`);
    res.json({ message: 'Impersonation started', impersonationId: impersonationLog._id, targetUser: { id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/impersonate/exit', auth, checkAdmin, async (req, res) => {
  try {
    const { impersonationId } = req.body;
    const log = await ImpersonationLog.findById(impersonationId);
    if (!log) return res.status(404).json({ error: 'Impersonation session not found' });

    log.endTime = new Date();
    await log.save();
    await logAdminAction(req.user.id, 'END_IMPERSONATION', 'user', log.targetUserId, 'Ended impersonation session');
    res.json({ message: 'Impersonation ended successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// APPLICATION INTERVENTION ENDPOINTS
router.get('/applications/:id', auth, checkAdmin, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('hostelId', 'name location roomTypes')
      .populate('studentId', 'name email contactNumber')
      .populate('overriddenBy', 'name email')
      .populate('disputeResolvedBy', 'name email')
      .populate('adminNotes.adminId', 'name email')
      .lean();
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/applications/:id/override', auth, checkAdmin, async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    if (!reason) return res.status(400).json({ error: 'Override reason required' });

    const app = await Application.findById(req.params.id).populate('hostelId');
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (!app.hostelId) return res.status(404).json({ error: 'Associated hostel not found or has been deleted' });

    const oldStatus = app.status;
    const hostel = await Hostel.findById(app.hostelId._id);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });
    
    const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);

    if (roomIndex === -1) return res.status(404).json({ error: 'Room type not found' });

    // Update capacity based on status change
    if (status === 'approved' && oldStatus !== 'approved') {
      if (hostel.roomTypes[roomIndex].occupiedCapacity >= hostel.roomTypes[roomIndex].totalCapacity) {
        return res.status(400).json({ error: 'Room is at full capacity' });
      }
      hostel.roomTypes[roomIndex].occupiedCapacity += 1;
    } else if (status === 'rejected' && oldStatus === 'approved') {
      if (hostel.roomTypes[roomIndex].occupiedCapacity > 0) {
        hostel.roomTypes[roomIndex].occupiedCapacity -= 1;
      }
    }

    hostel.roomTypes[roomIndex].available = hostel.roomTypes[roomIndex].occupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity;
    await hostel.save();

    app.status = status;
    app.adminOverride = true;
    app.overriddenBy = req.user.id;
    app.overrideReason = reason;
    app.overrideTimestamp = new Date();
    await app.save();

    await logAdminAction(req.user.id, 'OVERRIDE_APPLICATION', 'application', app._id, `Overrode application status to ${status} - Reason: ${reason}`);
    res.json({ message: 'Application status overridden successfully', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/applications/:id/note', auth, checkAdmin, async (req, res) => {
  try {
    const { note, visibleToManager = false } = req.body;
    if (!note) return res.status(400).json({ error: 'Note content required' });

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.adminNotes.push({ adminId: req.user.id, note, visibleToManager, timestamp: new Date() });
    await app.save();

    await logAdminAction(req.user.id, 'ADD_APPLICATION_NOTE', 'application', app._id, `Added note to application`);
    res.json({ message: 'Note added successfully', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/applications/:id/dispute', auth, checkAdmin, async (req, res) => {
  try {
    const { disputeReason, disputeDetails } = req.body;
    if (!disputeReason) return res.status(400).json({ error: 'Dispute reason required' });

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.hasDispute = true;
    app.disputeReason = disputeReason;
    app.disputeDetails = disputeDetails;
    app.disputeStatus = 'under_review';
    await app.save();

    await logAdminAction(req.user.id, 'CREATE_DISPUTE', 'application', app._id, `Created dispute: ${disputeReason}`);
    res.json({ message: 'Dispute created successfully', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/applications/:id/dispute/resolve', auth, checkAdmin, async (req, res) => {
  try {
    const { resolution, newStatus } = req.body;
    if (!resolution) return res.status(400).json({ error: 'Resolution details required' });

    const app = await Application.findById(req.params.id).populate('hostelId');
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (!app.hasDispute) return res.status(400).json({ error: 'No active dispute' });
    if (!app.hostelId) return res.status(404).json({ error: 'Associated hostel not found or has been deleted' });

    // Handle status change if provided
    if (newStatus && ['approved', 'rejected', 'pending'].includes(newStatus)) {
      const oldStatus = app.status;
      const hostel = await Hostel.findById(app.hostelId._id);
      if (!hostel) return res.status(404).json({ error: 'Hostel not found' });
      
      const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);

      if (roomIndex !== -1) {
        if (newStatus === 'approved' && oldStatus !== 'approved') {
          if (hostel.roomTypes[roomIndex].occupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity) {
            hostel.roomTypes[roomIndex].occupiedCapacity += 1;
          }
        } else if (newStatus !== 'approved' && oldStatus === 'approved') {
          if (hostel.roomTypes[roomIndex].occupiedCapacity > 0) {
            hostel.roomTypes[roomIndex].occupiedCapacity -= 1;
          }
        }
        hostel.roomTypes[roomIndex].available = hostel.roomTypes[roomIndex].occupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity;
        await hostel.save();
      }
      app.status = newStatus;
    }

    app.disputeStatus = 'resolved';
    app.disputeResolution = resolution;
    app.disputeResolvedBy = req.user.id;
    app.disputeResolvedAt = new Date();
    await app.save();

    await logAdminAction(req.user.id, 'RESOLVE_DISPUTE', 'application', app._id, `Resolved dispute: ${resolution}`);
    res.json({ message: 'Dispute resolved successfully', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/applications/bulk-action', auth, checkAdmin, async (req, res) => {
  try {
    const { applicationIds, action, reason } = req.body;
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: 'Application IDs required' });
    }
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    if (!reason) return res.status(400).json({ error: 'Reason required for bulk action' });

    const results = { success: [], failed: [] };
    for (const appId of applicationIds) {
      try {
        const app = await Application.findById(appId).populate('hostelId');
        if (!app) { results.failed.push({ appId, error: 'Application not found' }); continue; }
        if (!app.hostelId) { results.failed.push({ appId, error: 'Associated hostel not found' }); continue; }

        const oldStatus = app.status;
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        const hostel = await Hostel.findById(app.hostelId._id);
        if (!hostel) { results.failed.push({ appId, error: 'Hostel not found' }); continue; }
        
        const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);

        if (roomIndex !== -1) {
          if (newStatus === 'approved' && oldStatus !== 'approved') {
            if (hostel.roomTypes[roomIndex].occupiedCapacity >= hostel.roomTypes[roomIndex].totalCapacity) {
              results.failed.push({ appId, error: 'Room at full capacity' });
              continue;
            }
            hostel.roomTypes[roomIndex].occupiedCapacity += 1;
          } else if (newStatus === 'rejected' && oldStatus === 'approved') {
            if (hostel.roomTypes[roomIndex].occupiedCapacity > 0) {
              hostel.roomTypes[roomIndex].occupiedCapacity -= 1;
            }
          }
          hostel.roomTypes[roomIndex].available = hostel.roomTypes[roomIndex].occupiedCapacity < hostel.roomTypes[roomIndex].totalCapacity;
          await hostel.save();
        }

        app.status = newStatus;
        app.adminOverride = true;
        app.overriddenBy = req.user.id;
        app.overrideReason = reason;
        app.overrideTimestamp = new Date();
        await app.save();

        results.success.push(appId);
        await logAdminAction(req.user.id, `BULK_${action.toUpperCase()}_APPLICATION`, 'application', appId, `Bulk ${action}: ${reason}`);
      } catch (err) {
        results.failed.push({ appId, error: err.message });
      }
    }

    res.json({ message: 'Bulk action completed', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/applications/:id/refund', auth, checkAdmin, async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({ error: 'Valid refund amount required' });
    }

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (app.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'No payment to refund' });
    }

    app.refundStatus = 'completed';
    app.refundAmount = refundAmount;
    app.refundProcessedBy = req.user.id;
    app.refundProcessedAt = new Date();
    app.paymentStatus = 'refunded';
    await app.save();

    await logAdminAction(req.user.id, 'PROCESS_REFUND', 'application', app._id, `Processed refund of ${refundAmount} - Reason: ${reason || 'N/A'}`);
    res.json({ message: 'Refund processed successfully', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ANALYTICS & REPORTING ENDPOINTS
router.get('/analytics/overview', auth, checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    const [totalUsers, totalStudents, totalManagers, totalApplications, approvedApps, rejectedApps, totalHostels, activeHostels] = await Promise.all([
      User.countDocuments(dateQuery),
      User.countDocuments({ ...dateQuery, role: 'student' }),
      User.countDocuments({ ...dateQuery, role: 'manager' }),
      Application.countDocuments(dateQuery),
      Application.countDocuments({ ...dateQuery, status: 'approved' }),
      Application.countDocuments({ ...dateQuery, status: 'rejected' }),
      Hostel.countDocuments(dateQuery),
      Hostel.countDocuments({ ...dateQuery, isActive: true })
    ]);

    const approvalRate = totalApplications > 0 ? ((approvedApps / totalApplications) * 100).toFixed(2) : 0;
    const rejectionRate = totalApplications > 0 ? ((rejectedApps / totalApplications) * 100).toFixed(2) : 0;

    res.json({ totalUsers, totalStudents, totalManagers, totalApplications, approvedApps, rejectedApps, approvalRate, rejectionRate, totalHostels, activeHostels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/growth', auth, checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const groupFormat = interval === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const [studentGrowth, managerGrowth, hostelGrowth, applicationGrowth] = await Promise.all([
      User.aggregate([{ $match: { role: 'student', createdAt: { $gte: start, $lte: end } } }, { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      User.aggregate([{ $match: { role: 'manager', createdAt: { $gte: start, $lte: end } } }, { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Hostel.aggregate([{ $match: { createdAt: { $gte: start, $lte: end } } }, { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Application.aggregate([{ $match: { createdAt: { $gte: start, $lte: end } } }, { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);

    res.json({ studentGrowth, managerGrowth, hostelGrowth, applicationGrowth });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/locations', auth, checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    const locationData = await Hostel.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$location', hostelCount: { $sum: 1 }, totalApplications: { $sum: 0 } } },
      { $sort: { hostelCount: -1 } },
      { $limit: 10 }
    ]);

    for (let loc of locationData) {
      const hostels = await Hostel.find({ location: loc._id }).select('_id');
      const hostelIds = hostels.map(h => h._id);
      loc.totalApplications = await Application.countDocuments({ hostelId: { $in: hostelIds } });
    }

    res.json(locationData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/peak-seasons', auth, checkAdmin, async (req, res) => {
  try {
    const peakData = await Application.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json(peakData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/analytics/export', auth, checkAdmin, async (req, res) => {
  try {
    const { reportType, startDate, endDate, format } = req.body;
    await logAdminAction(req.user.id, 'EXPORT_ANALYTICS', 'report', null, `Exported ${reportType} report as ${format} for ${startDate} to ${endDate}`);
    res.json({ message: 'Export logged successfully', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MANAGER REGISTRATION BY ADMIN
router.post('/managers/create', auth, checkAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, hostelName, securityQuestion, securityAnswer, paystackSubaccountCode } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    if (paystackSubaccountCode && !paystackSubaccountCode.startsWith('ACCT_')) {
      return res.status(400).json({ error: 'Invalid subaccount code format. Must start with ACCT_' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = securityAnswer ? await bcrypt.hash(securityAnswer.toLowerCase().trim(), 12) : null;
    
    const newManager = new User({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
      phone,
      hostelName,
      isVerified: true,
      accountStatus: 'active',
      securityQuestion: securityQuestion || 'What is your email address?',
      securityAnswer: hashedAnswer || await bcrypt.hash(email.toLowerCase().trim(), 12),
      paystackSubaccountCode: paystackSubaccountCode || null,
      payoutEnabled: paystackSubaccountCode ? true : false
    });
    
    await newManager.save();
    await logAdminAction(req.user.id, 'CREATE_MANAGER', 'user', newManager._id, `Created manager account: ${name} (${email})${paystackSubaccountCode ? ' with subaccount: ' + paystackSubaccountCode : ''}`);
    
    res.status(201).json({ 
      message: 'Manager account created successfully', 
      manager: { 
        id: newManager._id, 
        name: newManager.name, 
        email: newManager.email,
        phone: newManager.phone,
        hostelName: newManager.hostelName,
        paystackSubaccountCode: newManager.paystackSubaccountCode,
        payoutEnabled: newManager.payoutEnabled
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STUDENT REGISTRATION BY ADMIN
router.post('/students/create', auth, checkAdmin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      phone,
      isVerified: true,
      accountStatus: 'active'
    });
    
    await newStudent.save();
    await logAdminAction(req.user.id, 'CREATE_STUDENT', 'user', newStudent._id, `Created student account: ${name} (${email})`);
    
    res.status(201).json({ 
      message: 'Student account created successfully', 
      student: { 
        id: newStudent._id, 
        name: newStudent.name, 
        email: newStudent.email,
        phone: newStudent.phone
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE MANAGER'S PAYSTACK SUBACCOUNT CODE
router.patch('/managers/:id/subaccount', auth, checkAdmin, async (req, res) => {
  try {
    const { paystackSubaccountCode } = req.body;
    
    if (!paystackSubaccountCode) {
      return res.status(400).json({ error: 'Paystack subaccount code is required' });
    }
    
    if (!paystackSubaccountCode.startsWith('ACCT_')) {
      return res.status(400).json({ error: 'Invalid subaccount code format. Must start with ACCT_' });
    }
    
    const manager = await User.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }
    
    if (manager.role !== 'manager') {
      return res.status(400).json({ error: 'User is not a manager' });
    }
    
    manager.paystackSubaccountCode = paystackSubaccountCode;
    manager.payoutEnabled = true;
    await manager.save();
    
    await logAdminAction(
      req.user.id, 
      'UPDATE_SUBACCOUNT', 
      'user', 
      manager._id, 
      `Updated Paystack subaccount for ${manager.name}: ${paystackSubaccountCode}`
    );
    
    res.json({ 
      message: 'Subaccount code updated successfully', 
      manager: { 
        id: manager._id, 
        name: manager.name, 
        email: manager.email,
        paystackSubaccountCode: manager.paystackSubaccountCode,
        payoutEnabled: manager.payoutEnabled
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
