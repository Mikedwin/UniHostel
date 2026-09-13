const logger = require('../config/logger');
const multer = require('multer');

const MAX_IMAGE_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB) || 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES_PER_HOSTEL = parseInt(process.env.MAX_IMAGES_PER_HOSTEL) || 20;
const ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');

const isValidBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
  return base64Regex.test(base64String);
};

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGES_PER_HOSTEL
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error(`Invalid image type for ${file.fieldname}. Allowed types: JPEG, PNG, WebP.`));
      return;
    }

    cb(null, true);
  }
});

const hostelUpload = (req, res, next) => {
  imageUpload.any()(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: `An uploaded image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`
        });
      }

      return res.status(400).json({ message: error.message });
    }

    return res.status(400).json({ message: error.message || 'Image upload failed' });
  });
};

const countExistingImages = (payload, uploadedFiles = []) => {
  if (!payload || typeof payload !== 'object') {
    return 0;
  }

  const uploadedFieldNames = new Set(uploadedFiles.map((file) => file.fieldname));
  let total = 0;

  if (!uploadedFieldNames.has('hostelViewImage') && typeof payload.hostelViewImage === 'string' && payload.hostelViewImage.trim()) {
    total += 1;
  }

  if (Array.isArray(payload.hostelImages)) {
    total += payload.hostelImages.filter((img) => typeof img === 'string' && img.trim()).length;
  }

  if (Array.isArray(payload.roomTypes)) {
    payload.roomTypes.forEach((room, index) => {
      if (!uploadedFieldNames.has(`roomImage_${index}`) && typeof room?.roomImage === 'string' && room.roomImage.trim()) {
        total += 1;
      }

      if (Array.isArray(room?.roomImages)) {
        total += room.roomImages.filter((img) => typeof img === 'string' && img.trim()).length;
      }
    });
  }

  return total;
};

const hasInlineBase64Images = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (isValidBase64Image(payload.hostelViewImage)) {
    return true;
  }

  if (Array.isArray(payload.hostelImages) && payload.hostelImages.some((img) => isValidBase64Image(img))) {
    return true;
  }

  if (!Array.isArray(payload.roomTypes)) {
    return false;
  }

  return payload.roomTypes.some((room) => {
    if (isValidBase64Image(room?.roomImage)) {
      return true;
    }

    return Array.isArray(room?.roomImages) && room.roomImages.some((img) => isValidBase64Image(img));
  });
};

const validateImageUpload = (req, res, next) => {
  try {
    const payload = req.hostelPayload || req.body || {};
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    if (hasInlineBase64Images(payload)) {
      logger.warn('Image upload rejected: inline base64 payload sent to hostel endpoints');
      return res.status(400).json({
        message: 'Image uploads must use multipart/form-data. Please re-upload your images and try again.'
      });
    }

    const invalidField = uploadedFiles.find((file) => {
      if (file.fieldname === 'hostelViewImage' || file.fieldname === 'hostelImages') {
        return false;
      }

      return !/^roomImage_\d+$/.test(file.fieldname) && !/^roomImages_\d+$/.test(file.fieldname);
    });

    if (invalidField) {
      logger.warn(`Image upload rejected: Unexpected field ${invalidField.fieldname}`);
      return res.status(400).json({ message: `Unexpected image field ${invalidField.fieldname}.` });
    }

    if (payload.hostelImages && !Array.isArray(payload.hostelImages)) {
      return res.status(400).json({ message: 'hostelImages must be an array.' });
    }

    if (payload.roomTypes && !Array.isArray(payload.roomTypes)) {
      return res.status(400).json({ message: 'roomTypes must be an array.' });
    }

    if (Array.isArray(payload.roomTypes)) {
      const invalidRoomGallery = payload.roomTypes.find((room) => room.roomImages && !Array.isArray(room.roomImages));
      if (invalidRoomGallery) {
        return res.status(400).json({ message: 'Each roomImages field must be an array.' });
      }
    }

    const totalImages = uploadedFiles.length + countExistingImages(payload, uploadedFiles);
    if (totalImages > MAX_IMAGES_PER_HOSTEL) {
      logger.warn(`Image upload rejected: Too many images (${totalImages}/${MAX_IMAGES_PER_HOSTEL})`);
      return res.status(400).json({
        message: `Maximum ${MAX_IMAGES_PER_HOSTEL} images allowed per hostel. You uploaded ${totalImages}.`
      });
    }

    logger.info(`Image validation passed: ${uploadedFiles.length} uploaded image(s), ${totalImages} total reference(s)`);
    next();
  } catch (error) {
    logger.error('Image validation error:', error);
    return res.status(500).json({ message: 'Image validation failed' });
  }
};

module.exports = {
  validateImageUpload,
  hostelUpload
};
