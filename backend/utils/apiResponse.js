/**
 * Standard API response helpers.
 * success(res, status, message, data, pagination?) -> { success:true, message, data, pagination? }
 * fail(res, status, message, error?)                -> { success:false, message, error? }
 *
 * Existing routes/controllers are NOT modified to use this (backward compatibility —
 * many existing responses use ad-hoc shapes like {message, data} or raw objects).
 * All NEW controllers added in this feature set use this helper for consistency.
 */

export const success = (res, status, message, data = null, pagination = null) => {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (pagination) body.pagination = pagination;
    return res.status(status).json(body);
};

export const fail = (res, status, message, error = null) => {
    const body = { success: false, message };
    if (error && process.env.NODE_ENV !== "production") {
        body.error = typeof error === "string" ? error : error.message;
    }
    return res.status(status).json(body);
};

export const buildPagination = (page, limit, total) => ({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
});

export const getPagination = (req) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 200);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const getDateRangeFilter = (req, field = "createdAt") => {
    const { dateFrom, dateTo } = req.query;
    if (!dateFrom && !dateTo) return {};
    const range = {};
    if (dateFrom) range.$gte = new Date(dateFrom);
    if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
    }
    return { [field]: range };
};
