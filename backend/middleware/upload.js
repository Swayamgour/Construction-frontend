// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "projects");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // har field ka alag folder: uploads/projects/workOrderFile/
//     const dir = path.join(UPLOAD_ROOT, file.fieldname);
//     fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const base = path
//       .basename(file.originalname, ext)
//       .replace(/[^a-zA-Z0-9_-]/g, "_")
//       .slice(0, 50);
//     cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
// });

// export default upload;


import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const makeStorage = (resolveDir) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = resolveDir(file);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const base = path
                .basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9_-]/g, "_")
                .slice(0, 50);
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
        },
    });

// Project attachments -> uploads/projects/<fieldname>/
const upload = multer({
    storage: makeStorage((file) => path.join(UPLOAD_ROOT, "projects", file.fieldname)),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Attendance selfies -> uploads/attendance/selfies/  (images only)
export const selfieUpload = multer({
    storage: makeStorage(() => path.join(UPLOAD_ROOT, "attendance", "selfies")),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype?.startsWith("image/")) return cb(null, true);
        cb(new Error("Only image files are allowed for selfie"));
    },
});

export default upload;