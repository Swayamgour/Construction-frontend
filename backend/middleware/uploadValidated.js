import multer from "multer";

/**
 * Same memoryStorage strategy as middleware/upload.js (Cloudinary upload
 * happens in the controller), but with file-size and mimetype validation
 * as required for the new modules (stock request images, drawings, machine
 * documents, EOD/delay images, maintenance invoices). The original
 * `upload` export is untouched so existing routes keep their current
 * (unrestricted) behaviour.
 *
 * DWG support: browsers/OS send DWG files with an unreliable/blank
 * mimetype (often "application/octet-stream" or "" depending on OS), so
 * DWG is additionally allowed by file extension, not just mimetype.
 */
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
    "image/jpeg", "image/png", "image/webp", "image/jpg",
    "application/pdf",
    // DWG's registered mimetype (rarely sent correctly by clients, but allow it)
    "application/acad", "image/vnd.dwg", "application/dwg", "application/x-dwg",
    "application/octet-stream", // generic fallback many OSes use for DWG — extension check below narrows this
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".dwg", ".dxf"];

const imageAndDocFilter = (req, file, cb) => {
    const ext = "." + (file.originalname.split(".").pop() || "").toLowerCase();
    const extensionOk = ALLOWED_EXTENSIONS.includes(ext);
    const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);

    // application/octet-stream is only accepted when the extension itself
    // confirms it's a DWG/DXF — otherwise it's too generic to trust.
    if (file.mimetype === "application/octet-stream" && !(ext === ".dwg" || ext === ".dxf")) {
        return cb(new Error(`Unsupported file type for "${file.originalname}". Allowed: jpg, png, webp, pdf, dwg, dxf`));
    }

    if (mimeOk || extensionOk) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp, pdf, dwg, dxf`));
};

export const uploadValidated = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: imageAndDocFilter,
});

export default uploadValidated;
