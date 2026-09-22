const Hostel = require('../models/Hostel');
const User = require('../models/User');
const Application = require('../models/Application');
const logger = require('../config/logger');
const { getAdminCommissionPercent } = require('../config/payment');
const cache = require('../services/cache');
const { sendServerError } = require('../utils/serverError');
const {
  isValidObjectId,
  escapeRegex,
  groupFilesByField,
  processHostelMediaPayload
} = require('../utils/helpers');

const normalizePaystackSubaccountCode = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const subaccountCode = value.trim();
  if (!subaccountCode) {
    return null;
  }

  return /^ACCT_[A-Za-z0-9]+$/.test(subaccountCode) ? subaccountCode : undefined;
};

const getAllHostels = async (req, res) => {
  try {
    const { location, maxPrice, search } = req.query;
    let query = { isAvailable: true, isDeleted: { $ne: true } };
    
    if (location && typeof location === 'string' && location.length <= 100) {
      const escapedLocation = escapeRegex(location);
      query.location = { $regex: escapedLocation, $options: 'i' };
    }
    
    if (maxPrice) {
      const price = Number(maxPrice);
      if (!isNaN(price) && price > 0 && price < 1000000) {
        query.price = { $lte: price };
      }
    }
    
    if (search && typeof search === 'string' && search.length <= 100) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { location: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { facilities: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;

    const hostels = await Hostel.find(query)
      .select('name location hostelViewImage description roomTypes facilities isAvailable managerId createdAt')
      .populate('managerId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const lightHostels = hostels.map(h => ({
      ...h,
      roomImages: undefined,
      bathroomImages: undefined,
      kitchenImages: undefined,
      compoundImages: undefined
    }));
    
    res.json(lightHostels);
  } catch (err) {
    console.error('Error fetching hostels:', err);
    res.status(500).json({ error: 'Failed to fetch hostels' });
  }
};

const getHostelById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id)
      .select('name location hostelViewImage hostelImages virtualTourUrl description roomTypes facilities isAvailable managerId createdAt')
      .populate('managerId', 'name')
      .lean();
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (err) {
    console.error('Error fetching hostel:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch hostel' });
  }
};

const getMyListings = async (req, res) => {
  try {
    const hostels = await Hostel.find({ managerId: req.user.id, isDeleted: { $ne: true } })
      .select('name location hostelViewImage description roomTypes facilities isAvailable createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(hostels);
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to fetch manager hostels',
      logMessage: 'Error fetching manager hostels'
    });
  }
};

const getMyTrash = async (req, res) => {
  try {
    const hostels = await Hostel.find({ managerId: req.user.id, isDeleted: true })
      .select('name location hostelViewImage description roomTypes facilities deletedAt')
      .sort({ deletedAt: -1 })
      .lean();
    res.json(hostels);
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to fetch deleted hostels',
      logMessage: 'Error fetching deleted hostels'
    });
  }
};

const getPaymentSubaccount = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findOne({
      _id: req.params.id,
      managerId: req.user.id,
      isDeleted: { $ne: true }
    })
      .select('paystackSubaccountCode')
      .lean();

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.json({ paystackSubaccountCode: hostel.paystackSubaccountCode || '' });
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to fetch payment settings',
      logMessage: 'Error fetching hostel payment settings'
    });
  }
};

const createHostel = async (req, res) => {
  try {
    logger.info('Hostel creation request from manager:', req.user.id);
    
    const manager = await User.findById(req.user.id);
    if (!manager.isVerified || manager.accountStatus === 'pending_verification') {
      return res.status(403).json({ message: 'Your account is pending admin verification. You cannot create hostels yet.' });
    }
    
    logger.info('Processing hostel creation with image upload');
    
    const payload = req.hostelPayload || {};
    const filesByField = groupFilesByField(req.files);
    const { name, location, description, roomTypes } = payload;
    if (!name || !location || !description || !roomTypes || roomTypes.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (typeof name !== 'string' || name.length > 200 || typeof location !== 'string' || location.length > 200 || typeof description !== 'string' || description.length > 2000) {
      return res.status(400).json({ message: 'Input exceeds maximum length' });
    }

    const paystackSubaccountCode = normalizePaystackSubaccountCode(payload.paystackSubaccountCode);
    if (typeof paystackSubaccountCode === 'undefined') {
      return res.status(400).json({ message: 'Invalid Paystack subaccount code' });
    }
    
    const processedPayload = await processHostelMediaPayload(payload, filesByField);

    const hostelData = {
      ...processedPayload,
      paystackSubaccountCode,
      managerId: req.user.id
    };
    
    const newHostel = new Hostel(hostelData);
    const savedHostel = await newHostel.save();
    
    cache.invalidatePattern('cache:/api/hostels');
    
    logger.info(`Hostel created successfully: ${savedHostel._id}`);
    res.status(201).json(savedHostel);
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to create hostel',
      logMessage: 'Hostel creation error'
    });
  }
};

const updateHostel = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this hostel' });
    }
    
    const payload = req.hostelPayload || {};
    const filesByField = groupFilesByField(req.files);

    const updateData = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.location) updateData.location = payload.location;
    if (payload.description) updateData.description = payload.description;
    if (payload.facilities) updateData.facilities = payload.facilities;
    if (payload.isAvailable !== undefined) updateData.isAvailable = payload.isAvailable;
    if (payload.virtualTourUrl !== undefined) updateData.virtualTourUrl = payload.virtualTourUrl;
    if (payload.paystackSubaccountCode !== undefined) {
      const paystackSubaccountCode = normalizePaystackSubaccountCode(payload.paystackSubaccountCode);
      if (typeof paystackSubaccountCode === 'undefined') {
        return res.status(400).json({ message: 'Invalid Paystack subaccount code' });
      }
      updateData.paystackSubaccountCode = paystackSubaccountCode;
    }
    
    const processedPayload = await processHostelMediaPayload(payload, filesByField);

    if (processedPayload.hostelViewImage) {
      updateData.hostelViewImage = processedPayload.hostelViewImage;
    }

    if (payload.hostelImages || filesByField.hostelImages?.length) {
      updateData.hostelImages = processedPayload.hostelImages;
    }
    
    if (payload.roomTypes) {
      updateData.roomTypes = processedPayload.roomTypes.map((room) => {
        const processedRoom = { ...room };
        const occupiedCapacity = processedRoom.occupiedCapacity || 0;
        const totalCapacity = processedRoom.totalCapacity || 0;
        processedRoom.available = occupiedCapacity < totalCapacity;
        return processedRoom;
      });
    }
    
    const updatedHostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    
    cache.invalidatePattern('cache:/api/hostels');
    cache.del(`cache:/api/hostels/${req.params.id}`);
    
    logger.info(`Hostel updated: ${req.params.id}, room availability recalculated`);
    
    if (updateData.roomTypes) {
      const commissionPercent = getAdminCommissionPercent();
      
      for (const roomType of updateData.roomTypes) {
        const hostelFee = roomType.price;
        const adminCommission = Math.round(hostelFee * (commissionPercent / 100));
        const totalAmount = hostelFee + adminCommission;
        
        await Application.updateMany(
          {
            hostelId: req.params.id,
            roomType: roomType.type,
            status: { $in: ['pending', 'approved_for_payment'] },
            paymentStatus: 'pending'
          },
          {
            $set: { hostelFee, adminCommission, totalAmount }
          }
        );
      }
    }
    
    res.json(updatedHostel);
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to update hostel',
      logMessage: 'Error updating hostel'
    });
  }
};

const deleteHostel = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }
    
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this hostel' });
    }
    
    hostel.isDeleted = true;
    hostel.deletedAt = new Date();
    hostel.deletedBy = req.user.id;
    await hostel.save();
    
    cache.invalidatePattern('cache:/api/hostels');
    cache.del(`cache:/api/hostels/${req.params.id}`);
    
    res.json({ message: 'Hostel deleted successfully' });
  } catch (err) {
    return sendServerError(res, err, {
      field: 'message',
      clientMessage: 'Failed to delete hostel',
      logMessage: 'Error deleting hostel'
    });
  }
};

const restoreHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });
    if (hostel.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    hostel.isDeleted = false;
    hostel.deletedAt = null;
    hostel.deletedBy = null;
    await hostel.save();
    
    cache.invalidatePattern('cache:/api/hostels');
    cache.del(`cache:/api/hostels/${req.params.id}`);

    res.json({ message: 'Hostel restored successfully' });
  } catch (err) {
    return sendServerError(res, err, {
      clientMessage: 'Failed to restore hostel',
      logMessage: 'Error restoring hostel'
    });
  }
};

module.exports = {
  getAllHostels,
  getHostelById,
  getMyListings,
  getMyTrash,
  getPaymentSubaccount,
  createHostel,
  updateHostel,
  deleteHostel,
  restoreHostel
};
