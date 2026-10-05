import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

/**
 * Cloudinary's resource_type:"auto" reliably detects images/PDF/video, but
 * misclassifies arbitrary binary formats like DWG/DXF (often rejected).
 * Those need resource_type:"raw" explicitly. Detection is extension-based
 * since DWG's mimetype is unreliable across OSes/browsers.
 */
const RAW_EXTENSIONS = ["dwg", "dxf"];

const resolveResourceType = (file) => {
    const filename = file?.originalname || (typeof file === "string" ? file : "");
    const ext = filename.split(".").pop()?.toLowerCase();
    if (RAW_EXTENSIONS.includes(ext)) return "raw";
    return "auto";
};

export const uploadToCloudinary = async (file, folder = "general") => {
    if (!file) return null;

    let source = null;
    let hasLocalDiskFile = false;

    if (file.buffer) {
        const mime = file.mimetype || "application/octet-stream";
        source = `data:${mime};base64,${file.buffer.toString("base64")}`;
    } else if (file.path && fs.existsSync(file.path)) {
        hasLocalDiskFile = true;
        const fileData = fs.readFileSync(file.path);
        const mime = file.mimetype || "application/octet-stream";
        source = `data:${mime};base64,${fileData.toString("base64")}`;
    } else if (typeof file === "string") {
        source = file;
    } else {
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(source, {
            folder,
            resource_type: resolveResourceType(file),
        });

        // Cloud upload succeeded, clean up temporary local disk file if it was created
        if (hasLocalDiskFile && file?.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (_) {}
        }

        return result.secure_url;
    } catch (err) {
        console.warn(`[Cloudinary] Upload failed for ${folder}:`, err.message);

        // Fallback: If we have a local disk file saved by multer, serve it via /uploads
        if (hasLocalDiskFile && file?.path && fs.existsSync(file.path)) {
            const uploadsRoot = path.join(process.cwd(), "uploads");
            const relPath = path.relative(uploadsRoot, file.path).replace(/\\/g, "/");
            const localUrl = `/uploads/${relPath}`;
            console.log(`[Cloudinary] Falling back to local static file: ${localUrl}`);
            return localUrl;
        }

        throw err;
    }
};

export default uploadToCloudinary;
