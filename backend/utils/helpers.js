const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { uploadBuffer } = require('./cloudinary');

// Utility: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Utility: Generate secure access code
const generateAccessCode = () => {
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
  return `UNI-${randomChars}`;
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const generatePasswordResetCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('UniHostel-login-placeholder-password', 12);

const normalizeImageArray = (images) => (
  Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim())
    : []
);

const normalizeRoomType = (room = {}) => {
  const normalizedRoom = { ...room };
  const numericPrice = Number(room.price);
  const numericCapacity = Number(room.totalCapacity);
  const numericOccupied = Number(room.occupiedCapacity);

  if (Number.isFinite(numericPrice)) {
    normalizedRoom.price = numericPrice;
  }

  if (Number.isFinite(numericCapacity)) {
    normalizedRoom.totalCapacity = numericCapacity;
  }

  if (Number.isFinite(numericOccupied)) {
    normalizedRoom.occupiedCapacity = numericOccupied;
  }

  normalizedRoom.roomImages = normalizeImageArray(room.roomImages);

  return normalizedRoom;
};

const groupFilesByField = (files = []) => files.reduce((accumulator, file) => {
  if (!accumulator[file.fieldname]) {
    accumulator[file.fieldname] = [];
  }

  accumulator[file.fieldname].push(file);
  return accumulator;
}, {});

const uploadFiles = async (files, folder) => Promise.all(
  (files || []).map((file) => uploadBuffer(file.buffer, folder, file.mimetype))
);

const processHostelMediaPayload = async (payload = {}, filesByField = {}) => {
  const roomTypes = Array.isArray(payload.roomTypes) ? payload.roomTypes : [];
  const processedRoomTypes = await Promise.all(roomTypes.map(async (room, index) => {
    const normalizedRoom = normalizeRoomType(room);
    const mainRoomFile = filesByField[`roomImage_${index}`]?.[0];
    const roomGalleryFiles = filesByField[`roomImages_${index}`] || [];

    if (mainRoomFile) {
      normalizedRoom.roomImage = await uploadBuffer(mainRoomFile.buffer, 'unihostel/rooms', mainRoomFile.mimetype);
    }

    if (roomGalleryFiles.length > 0) {
      const uploadedRoomImages = await uploadFiles(roomGalleryFiles, 'unihostel/rooms');
      normalizedRoom.roomImages = [...normalizeImageArray(normalizedRoom.roomImages), ...uploadedRoomImages];
    }

    return normalizedRoom;
  }));

  let hostelViewImage = typeof payload.hostelViewImage === 'string' ? payload.hostelViewImage.trim() : '';
  const hostelViewImageFile = filesByField.hostelViewImage?.[0];
  if (hostelViewImageFile) {
    hostelViewImage = await uploadBuffer(hostelViewImageFile.buffer, 'unihostel/hostels', hostelViewImageFile.mimetype);
  }

  const uploadedHostelImages = await uploadFiles(filesByField.hostelImages || [], 'unihostel/hostels');
  const hostelImages = [...normalizeImageArray(payload.hostelImages), ...uploadedHostelImages];

  return {
    ...payload,
    hostelViewImage,
    hostelImages,
    roomTypes: processedRoomTypes
  };
};

module.exports = {
  isValidObjectId,
  escapeRegex,
  generateAccessCode,
  hashResetToken,
  generatePasswordResetCode,
  DUMMY_PASSWORD_HASH,
  normalizeImageArray,
  normalizeRoomType,
  groupFilesByField,
  uploadFiles,
  processHostelMediaPayload
};
