// Backend origin (WITHOUT /api). Files are served by express.static("/uploads").
// Vite: add VITE_BACKEND_URL=http://localhost:5000 in .env
// (CRA users: replace import.meta.env.VITE_BACKEND_URL with process.env.REACT_APP_BACKEND_URL)
const BASE_URL = (
    import.meta.env?.VITE_BACKEND_URL || "http://localhost:5002"
).replace(/\/$/, "");

/**
 * DB stores "/uploads/projects/field/name.png".
 * Old Cloudinary records store full "https://..." URLs, so keep those as-is.
 */
export const getFileUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    const clean = path.replace(/\\/g, "/");

    if (/^https?:\/\//i.test(clean)) return clean;

    return `${BASE_URL}${clean.startsWith("/") ? "" : "/"}${clean}`;
};

export const isImageFile = (path) =>
    /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i.test(path || "");

export const getFileName = (path) =>
    decodeURIComponent((path || "").split("/").pop() || "file");

// Always returns an array (old records may hold a single string)
export const toFileArray = (value) => {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).filter(Boolean);
};