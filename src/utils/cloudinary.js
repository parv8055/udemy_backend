const fs = require('fs');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async localfilepath => {
  try {
    if (!localfilepath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.v2.uploader.upload(localfilepath, {
      resource_type: 'auto',
      folder: 'udemybackend'
    });
    //file have been uploaded successfull
    console.log(`📷 File is uploaded on cloudinary`);
    return response;
  } catch (err) {
    throw err;
  } finally {
    //remove the locally saved temporary file as the upload opertion got failed
    fs.unlinkSync(localfilepath);
  }
};

module.exports = uploadOnCloudinary;
