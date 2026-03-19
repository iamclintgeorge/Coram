/**
 * Shared formatting utilities for the Coram admin panel.
 * Replaces duplicate helpers that were scattered across dashboard, billing, specList, vmPage.
 */

/**
 * Auto-scale bytes into human-readable form (B, KB, MB, GB, TB).
 * @param {number} bytes - Raw byte count
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} e.g. "4.25 GB"
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(decimals)} ${sizes[i]}`;
};

/**
 * Convert seconds into human-readable uptime (e.g. "2d 5h 30m").
 * @param {number} seconds
 * @returns {string}
 */
export const formatUptime = (seconds) => {
  if (!seconds || seconds <= 0) return "0m";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
};

/**
 * Convert a fraction (0–1) into a percentage string.
 * @param {number} fraction - e.g. 0.1234
 * @param {number} [decimals=1] - Decimal places
 * @returns {string} e.g. "12.3%"
 */
export const formatPercentage = (fraction, decimals = 1) => {
  if (fraction === null || fraction === undefined) return "0%";
  return `${(fraction * 100).toFixed(decimals)}%`;
};

/**
 * Format a numeric amount with a currency symbol.
 * @param {number} amount
 * @param {string} [currency="₹"] - Currency symbol or code
 * @param {number} [decimals=4]
 * @returns {string} e.g. "₹12.5000"
 */
export const formatCurrency = (amount, currency = "₹", decimals = 4) => {
  if (amount === null || amount === undefined) return `${currency}0`;
  return `${currency}${Number(amount).toFixed(decimals)}`;
};

/**
 * Get a human-readable time-ago string from a Date or timestamp.
 * @param {Date|number|string} date
 * @returns {string} e.g. "5s ago", "2m ago", "1h ago"
 */
export const timeAgo = (date) => {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
