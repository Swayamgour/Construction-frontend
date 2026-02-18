import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (file, folder = "general") => {
    if (!file) return null;

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "auto",
    });

    return result.secure_url;
};
