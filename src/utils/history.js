import i18n from '../i18n';

const HISTORY_KEY = 'image_converter_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get all conversion history from localStorage
 * @returns {Array} Array of history items
 */
export function getHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Add a new conversion to history
 * @param {Object} item - History item to add
 * @param {string} item.fileName - Original file name
 * @param {string} item.originalFormat - Original image format
 * @param {string} item.convertedFormat - Converted image format
 * @param {number} item.originalSize - Original file size in bytes
 * @param {number} item.convertedSize - Converted file size in bytes
 * @param {string} item.timestamp - ISO timestamp
 */
export function addToHistory(item) {
  try {
    const history = getHistory();

    // Add new item at the beginning
    const newHistory = [
      {
        ...item,
        timestamp: item.timestamp || new Date().toISOString(),
        id: Date.now() + Math.random(), // Unique ID
      },
      ...history,
    ];

    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    return trimmedHistory;
  } catch (error) {
    console.error('Failed to add to history:', error);
    return getHistory();
  }
}

/**
 * Delete a specific history item by ID
 * @param {number|string} id - ID of the item to delete
 * @returns {Array} Updated history array
 */
export function deleteHistoryItem(id) {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Failed to delete history item:', error);
    return getHistory();
  }
}

/**
 * Clear all history
 * @returns {Array} Empty array
 */
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch (error) {
    console.error('Failed to clear history:', error);
    return getHistory();
  }
}

/**
 * Calculate relative time from timestamp
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string (e.g., "5 minutes ago", "2 hours ago")
 */
export function getRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  const t = i18n.t.bind(i18n);

  if (diffSec < 60) return t('imageConverter:time.justNow');
  if (diffMin < 60) return t('imageConverter:time.minutesAgo', { count: diffMin });
  if (diffHour < 24) return t('imageConverter:time.hoursAgo', { count: diffHour });
  if (diffDay < 7) return t('imageConverter:time.daysAgo', { count: diffDay });
  if (diffDay < 30) return t('imageConverter:time.weeksAgo', { count: diffWeek });
  if (diffMonth < 12) return t('imageConverter:time.monthsAgo', { count: diffMonth });
  return t('imageConverter:time.yearsAgo', { count: diffYear });
}

/**
 * Calculate file size reduction percentage
 * @param {number} originalSize - Original file size in bytes
 * @param {number} convertedSize - Converted file size in bytes
 * @returns {number} Reduction percentage (negative if size increased)
 */
export function calculateSizeReduction(originalSize, convertedSize) {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - convertedSize) / originalSize) * 100);
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
