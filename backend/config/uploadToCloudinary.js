import { uploadToCloudinary as utilUpload } from "../utils/cloudUpload.js";

const uploadToCloudinary = async (file, folder = "projects") => {
  const url = await utilUpload(file, folder);
  return { secure_url: url, url };
};

export default uploadToCloudinary;