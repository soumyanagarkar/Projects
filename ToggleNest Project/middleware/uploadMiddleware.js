const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const isImage = typeof file?.mimetype === 'string' && file.mimetype.startsWith('image/');
        return {
            folder: 'togglenest_attachments',
            resource_type: isImage ? 'image' : 'raw'
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024
    }
});

module.exports = upload;
