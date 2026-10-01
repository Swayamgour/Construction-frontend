// brand.js
// Single source of truth for branding text used across Sidebar, Header
// and the app footer. Previously "S S Construction", "Construction ERP"
// and the credit line were hardcoded separately in 2–3 different
// components — now every component reads from here, so a rebrand is a
// one-line change instead of a find-and-replace across the codebase.

export const APP_NAME = "S S Construction";
export const APP_TAGLINE = "Construction ERP";

export const CREDIT_NAME = "Riveyra Infotech Pvt Ltd.";
export const CREDIT_URL = "https://riveyrainfotech.com/";
