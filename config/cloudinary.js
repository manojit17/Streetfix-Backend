
//  config/cloudinary.js
//  PURPOSE : Configure the Cloudinary SDK using credentials from .env
//  WHY     : Render's local filesystem gets wiped on every redeploy
//            or sleep/wake cycle, which deleted uploaded photos.
//            Cloudinary stores images permanently in the cloud,
//            completely independent of your server's lifecycle.
// ─────────────────────────────────────────────────────────────
 
const cloudinary = require('cloudinary').v2;
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key   : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 
module.exports = cloudinary;