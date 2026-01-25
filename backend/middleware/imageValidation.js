const logger = require('../config/logger');

const MAX_IMAGE_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB) || 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES_PER_HOSTEL = parseInt(process.env.MAX_IMAGES_PER_HOSTEL) || 20;
const ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');

const isValidBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') return false;
  const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
  return base64Regex.test(base64String);
};

const getImageMimeType = (base64String) => {
  const match = base64String.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : null;
};

const getBase64Size = (base64String) => {
  const base64Data = base64String.split(',')[1] || base64String;
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 0.75) - padding;
};

const validateImageUpload = (req, res, next) => {
  try {
    const images = [];
    
    // Collect all image fields
    if (req.body.hostelViewImage) images.push({ name: 'hostelViewImage', data: req.body.hostelViewImage });
    if (req.body.roomImages) images.push(...req.body.roomImages.map((img, i) => ({ name: `roomImage${i}`, data: img })));
    if (req.body.bathroomImages) images.push(...req.body.bathroomImages.map((img, i) => ({ name: `bathroomImage${i}`, data: img })));
    if (req.body.kitchenImages) images.push(...req.body.kitchenImages.map((img, i) => ({ name: `kitchenImage${i}`, data: img })));
    if (req.body.compoundImages) images.push(...req.body.compoundImages.map((img, i) => ({ name: `compoundImage${i}`, data: img })));

    // Check total image count
    if (images.length > MAX_IMAGES_PER_HOSTEL) {
      logger.warn(`Image upload rejected: Too many images (${images.length}/${MAX_IMAGES_PER_HOSTEL})`);
      return res.status(400).json({ 
        message: `Maximum ${MAX_IMAGES_PER_HOSTEL} images allowed per hostel. You uploaded ${images.length}.` 
      });
    }

    // Validate each image
    for (const image of images) {
      // Check if valid base64
      if (!isValidBase64Image(image.data)) {
        logger.warn(`Image upload rejected: Invalid format for ${image.name}`);
        return res.status(400).json({ 
          message: `Invalid image format for ${image.name}. Only JPEG, PNG, and WebP images are allowed.` 
        });
      }

      // Check MIME type
      const mimeType = getImageMimeType(image.data);
      if (!ALLOWED_TYPES.includes(mimeType)) {
        logger.warn(`Image upload rejected: Invalid type ${mimeType} for ${image.name}`);
        return res.status(400).json({ 
          message: `Invalid image type for ${image.name}. Allowed types: JPEG, PNG, WebP.` 
        });
      }

      // Check file size
      const sizeBytes = getBase64Size(image.data);
      if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        logger.warn(`Image upload rejected: ${image.name} too large (${sizeMB}MB/${MAX_IMAGE_SIZE_MB}MB)`);
        return res.status(400).json({ 
          message: `Image ${image.name} is too large (${sizeMB}MB). Maximum size is ${MAX_IMAGE_SIZE_MB}MB.` 
        });
      }
    }

    logger.info(`Image validation passed: ${images.length} images validated`);
    next();
  } catch (error) {
    logger.error('Image validation error:', error);
    return res.status(500).json({ message: 'Image validation failed' });
  }
};

module.exports = { validateImageUpload };
