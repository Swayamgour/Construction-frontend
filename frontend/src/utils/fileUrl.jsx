let backendUrl = "https://backendapi.ssconstructionsup.in";
// let backendUrl = "http://localhost:5002";


try {
    if (typeof process !== "undefined" && process.env?.REACT_APP_BACKEND_URL) {
        backendUrl = process.env.REACT_APP_BACKEND_URL;
    }
} catch (_) { }

const BASE_URL = backendUrl.replace(/\/$/, "");

/**
 * DB stores "/uploads/projects/field/name.png".
 * Cloudinary records store full "https://..." URLs, so keep those as-is.
 */
export const getFileUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    const clean = path.replace(/\\/g, "/").trim();

    if (/^https?:\/\//i.test(clean)) return clean;

    return `${BASE_URL}${clean.startsWith("/") ? "" : "/"}${clean}`;
};

export const isImageFile = (path) => {
    if (!path || typeof path !== "string") return false;
    if (/\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i.test(path)) return true;
    if (path.includes("/image/upload/")) return true;
    return false;
};

export const isPdfFile = (path) =>
    /\.(pdf)(\?.*)?$/i.test(path || "");

export const getFileName = (path) =>
    decodeURIComponent((path || "").split("/").pop() || "file");

// Always returns an array (old records may hold a single string)
export const toFileArray = (value) => {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).filter(Boolean);
};