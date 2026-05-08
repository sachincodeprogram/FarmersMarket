const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "products",
    resource_type: "auto"
  })
});

module.exports = multer({
  storage,
  limits:{
    fileSize: 50 * 1024 * 1024
  }
});
