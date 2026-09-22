const Application = require('../models/Application');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const logger = require('../config/logger');
const { getAdminCommissionPercent } = require('../config/payment');
const { sendServerError } = require('../utils/serverError');
const { isValidObjectId, generateAccessCode } = require('../utils/helpers');
const {
  sendApplicationSubmittedEmail,
  sendNewApplicationNotificationToManager,
  sendApplicationApprovedForPaymentEmail,
  sendApplicationRejectedEmail,
  sendFinalApprovalEmail
} = require('../utils/emailService');

const createApplication = async (req, res) => {
  try {
    const { hostelId, roomType, semester, studentName, contactNumber } = req.body;
    
    if (!isValidObjectId(hostelId)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    const room = hostel.roomTypes.find(r => r.type === roomType);
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    const hostelFee = room.price;
    const commissionPercent = getAdminCommissionPercent();
    const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
    const totalAmount = hostelFee + adminCommission;
    
    const application = new Application({
      hostelId,
      studentId: req.user.id,
      roomType,
      semester,
      studentName,
      contactNumber,
      status: 'pending',
      paymentStatus: 'pending',
      hostelFee,
      adminCommission,
      totalAmount
    });
    await application.save();
    
    logger.info('Application created', { applicationId: application._id, hostelFee, adminCommission, totalAmount });
    
    const student = await User.findById(req.user.id);
    const manager = await User.findById(hostel.managerId);
    
    res.status(201).json(application);
    
    setImmediate(async () => {
      try {
        if (student) {
          await sendApplicationSubmittedEmail(student.email, student.name, hostel.name, roomType, semester);
        }
        if (manager) {
          await sendNewApplicationNotificationToManager(manager.email, manager.name, student ? student.name : studentName, hostel.name, roomType);
        }
      } catch (emailErr) {
        logger.error('Email notification error:', emailErr);
      }
    });
  } catch (err) {
    console.error('Error creating application:', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    const { archived } = req.query;
    const query = { studentId: req.user.id };
    
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }
    
    const apps = await Application.find(query)
      .select('-__v -adminNotes')
      .populate('hostelId', 'name location managerId')
      .sort({ createdAt: -1 })
      .lean();
    
    const managerIds = [
      ...new Set(
        apps
          .filter((app) => app.status === 'approved' && app.hostelId?.managerId)
          .map((app) => app.hostelId.managerId.toString())
      )
    ];

    if (managerIds.length > 0) {
      const managers = await User.find({ _id: { $in: managerIds } })
        .select('name email phone')
        .lean();

      const managerMap = new Map(
        managers.map((manager) => [manager._id.toString(), manager])
      );

      apps.forEach((app) => {
        if (app.status === 'approved' && app.hostelId?.managerId) {
          app.managerContact = managerMap.get(app.hostelId.managerId.toString()) || null;
        }
      });
    }
    
    res.json(apps);
  } catch (err) {
    console.error('Error fetching student applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

const getManagerApplications = async (req, res) => {
  try {
    const { archived } = req.query;
    
    const managerHostels = await Hostel.find({ managerId: req.user.id }).select('_id').lean();
    const hostelIds = managerHostels.map(h => h._id);
    
    const query = { 
      hostelId: { $in: hostelIds },
      isArchived: archived === 'true'
    };
    
    const apps = await Application.find(query)
      .select('-__v -adminNotes')
      .populate('hostelId', 'name location')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(apps);
  } catch (err) {
    console.error('Error fetching manager applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

const getHostelStats = async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    if (!isValidObjectId(hostelId)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const applications = await Application.find({ hostelId, status: { $in: ['pending', 'approved'] } }).lean();
    
    const stats = {
      commissionPercent: getAdminCommissionPercent()
    };
    applications.forEach(app => {
      if (!stats[app.roomType]) {
        stats[app.roomType] = 0;
      }
      stats[app.roomType]++;
      
      const lastBookingKey = `${app.roomType}_lastBooking`;
      if (!stats[lastBookingKey] || new Date(app.createdAt) > new Date(stats[lastBookingKey])) {
        stats[lastBookingKey] = app.createdAt;
      }
    });
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    const app = await Application.findById(req.params.id).lean();
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const hostel = await Hostel.findById(app.hostelId).lean();
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to manage this application' });
    }
    
    const roomIndex = hostel.roomTypes.findIndex(r => r.type === app.roomType);
    
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    const room = hostel.roomTypes[roomIndex];
    
    if (action === 'approve_for_payment') {
      if (app.status !== 'pending') {
        return res.status(400).json({ error: `Can only approve pending applications. Current status: ${app.status}` });
      }
      
      await Application.updateOne({ _id: req.params.id }, { $set: { status: 'approved_for_payment' } });
      
      res.json({ message: 'Application approved for payment', application: { ...app, status: 'approved_for_payment' } });
      
      setImmediate(async () => {
        try {
          const student = await User.findById(app.studentId).lean();
          if (student) {
            await sendApplicationApprovedForPaymentEmail(student.email, student.name, hostel.name, app.roomType, app.totalAmount);
          }
        } catch (emailErr) {
          logger.error('Email notification error:', emailErr);
        }
      });
      
      return;
    }
    
    if (action === 'reject') {
      await Application.updateOne({ _id: req.params.id }, { $set: { status: 'rejected' } });
      
      res.json({ message: 'Application rejected', application: { ...app, status: 'rejected' } });
      
      setImmediate(async () => {
        try {
          const student = await User.findById(app.studentId).lean();
          if (student) {
            await sendApplicationRejectedEmail(student.email, student.name, hostel.name, app.roomType);
          }
        } catch (emailErr) {
          logger.error('Email notification error:', emailErr);
        }
      });
      
      return;
    }
    
    if (action === 'final_approve') {
      if (app.status !== 'paid_awaiting_final') {
        return res.status(400).json({ error: `Can only final approve paid applications. Current status: ${app.status}` });
      }
      
      const accessCode = generateAccessCode();
      const now = new Date();
      const capacityUpdate = await Hostel.updateOne(
        {
          _id: app.hostelId,
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$roomTypes',
                    as: 'room',
                    cond: {
                      $and: [
                        { $eq: ['$$room.type', app.roomType] },
                        {
                          $lt: [
                            { $ifNull: ['$$room.occupiedCapacity', 0] },
                            '$$room.totalCapacity'
                          ]
                        }
                      ]
                    }
                  }
                }
              },
              0
            ]
          }
        },
        [{
          $set: {
            roomTypes: {
              $map: {
                input: '$roomTypes',
                as: 'room',
                in: {
                  $cond: [
                    { $eq: ['$$room.type', app.roomType] },
                    {
                      $mergeObjects: [
                        '$$room',
                        {
                          occupiedCapacity: { $add: [{ $ifNull: ['$$room.occupiedCapacity', 0] }, 1] },
                          available: {
                            $lt: [
                              { $add: [{ $ifNull: ['$$room.occupiedCapacity', 0] }, 1] },
                              '$$room.totalCapacity'
                            ]
                          }
                        }
                      ]
                    },
                    '$$room'
                  ]
                }
              }
            }
          }
        }]
      );

      if (capacityUpdate.modifiedCount !== 1) {
        return res.status(409).json({ error: 'Cannot approve: Room is at full capacity' });
      }

      const applicationUpdate = await Application.updateOne(
        { _id: req.params.id, status: 'paid_awaiting_final' },
        {
          $set: {
            status: 'approved',
            accessCode,
            accessCodeIssuedAt: now,
            finalApprovedAt: now
          }
        }
      );

      if (applicationUpdate.modifiedCount !== 1) {
        await Hostel.updateOne(
          { _id: app.hostelId, 'roomTypes.type': app.roomType },
          [{
            $set: {
              roomTypes: {
                $map: {
                  input: '$roomTypes',
                  as: 'room',
                  in: {
                    $cond: [
                      { $eq: ['$$room.type', app.roomType] },
                      {
                        $mergeObjects: [
                          '$$room',
                          {
                            occupiedCapacity: {
                              $max: [{ $subtract: [{ $ifNull: ['$$room.occupiedCapacity', 0] }, 1] }, 0]
                            },
                            available: true
                          }
                        ]
                      },
                      '$$room'
                    ]
                  }
                }
              }
            }
          }]
        );
        return res.status(409).json({ error: 'Application status changed. Please refresh and try again.' });
      }

      const updatedHostel = await Hostel.findById(app.hostelId).select('roomTypes').lean();
      const updatedRoom = updatedHostel?.roomTypes.find((currentRoom) => currentRoom.type === app.roomType);
      
      res.json({ 
        message: 'Application finally approved', 
        application: { ...app, status: 'approved', accessCode },
        accessCode,
        roomStatus: {
          occupiedCapacity: updatedRoom?.occupiedCapacity,
          totalCapacity: updatedRoom?.totalCapacity,
          available: updatedRoom?.available
        }
      });
      
      setImmediate(async () => {
        try {
          const student = await User.findById(app.studentId).lean();
          if (student) {
            await sendFinalApprovalEmail(student.email, student.name, hostel.name, app.roomType, accessCode);
          }
        } catch (emailErr) {
          logger.error('Email notification error:', emailErr);
        }
      });
      
      return;
    }
    
    res.status(400).json({ error: `Invalid action: ${action}. Valid actions are: approve_for_payment, reject, final_approve` });
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to update application status',
      logMessage: 'Error updating application status'
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }
    
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    if (app.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this application' });
    }
    
    app.isArchived = true;
    app.archivedAt = new Date();
    app.archivedBy = req.user.id;
    await app.save();
    
    res.json({ message: 'Application moved to history' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

const recalculateApplication = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const app = await Application.findById(req.params.id).populate('hostelId');
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isHostelManager = req.user.role === 'manager'
      && app.hostelId?.managerId?.toString() === req.user.id;

    if (!isAdmin && !isHostelManager) {
      return res.status(403).json({ error: 'Not authorized to recalculate this application' });
    }

    if (!['pending', 'approved_for_payment'].includes(app.status)) {
      return res.status(400).json({ error: 'Cannot recalculate paid or completed applications' });
    }
    
    const hostel = await Hostel.findById(app.hostelId._id);
    const room = hostel.roomTypes.find(r => r.type === app.roomType);
    
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    const hostelFee = room.price;
    const commissionPercent = getAdminCommissionPercent();
    const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
    const totalAmount = hostelFee + adminCommission;
    
    app.hostelFee = hostelFee;
    app.adminCommission = adminCommission;
    app.totalAmount = totalAmount;
    await app.save();
    
    logger.info('Application payment recalculated', { applicationId: app._id, hostelFee, adminCommission, totalAmount });
    
    res.json({ 
      message: 'Payment amounts recalculated', 
      application: app,
      commissionPercent
    });
  } catch (err) {
    console.error('Error recalculating application:', err);
    res.status(500).json({ error: 'Failed to recalculate application' });
  }
};

const archiveApplication = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const { archive } = req.body;
    const app = await Application.findById(req.params.id).populate('hostelId');
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const isManager = req.user.role === 'manager';
    const isStudent = req.user.role === 'student' && app.studentId.toString() === req.user.id;
    
    if (isManager) {
      const hostel = await Hostel.findById(app.hostelId._id);
      if (hostel.managerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (!isStudent) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    app.isArchived = archive;
    app.archivedAt = archive ? new Date() : null;
    app.archivedBy = archive ? req.user.id : null;
    await app.save();
    
    res.json({ message: archive ? 'Application archived' : 'Application restored', application: app });
  } catch (err) {
    console.error('Error archiving application:', err);
    res.status(500).json({ error: 'Failed to archive application' });
  }
};

const permanentDeleteApplication = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    const app = await Application.findById(req.params.id).lean();
    
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    if (!app.isArchived) {
      return res.status(400).json({ error: 'Can only permanently delete archived applications' });
    }
    
    const isManager = req.user.role === 'manager';
    const isStudent = req.user.role === 'student' && app.studentId.toString() === req.user.id;
    
    if (isManager) {
      const hostel = await Hostel.findById(app.hostelId).lean();
      if (!hostel || hostel.managerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (!isStudent) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Application.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Application permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting application:', err);
    res.status(500).json({ error: 'Failed to permanently delete application' });
  }
};

module.exports = {
  createApplication,
  getStudentApplications,
  getManagerApplications,
  getHostelStats,
  updateApplicationStatus,
  deleteApplication,
  recalculateApplication,
  archiveApplication,
  permanentDeleteApplication
};
