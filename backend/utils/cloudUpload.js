import cloudinary from "../config/cloudinary.js";

/**
 * Cloudinary's resource_type:"auto" reliably detects images/PDF/video, but
 * misclassifies arbitrary binary formats like DWG/DXF (often rejected).
 * Those need resource_type:"raw" explicitly. Detection is extension-based
 * since DWG's mimetype is unreliable across OSes/browsers.
 */
const RAW_EXTENSIONS = ["dwg", "dxf"];

const resolveResourceType = (file) => {
    const ext = (file.originalname || "").split(".").pop()?.toLowerCase();
    if (RAW_EXTENSIONS.includes(ext)) return "raw";
    return "auto";
};

export const uploadToCloudinary = async (file, folder = "general") => {
    if (!file) return null;

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: resolveResourceType(file),
    });

    return result.secure_url;
};
