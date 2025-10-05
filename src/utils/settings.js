const SETTINGS_KEY = 'image_converter_settings';

// Default settings
const DEFAULT_SETTINGS = {
  defaultFormat: 'png',
  defaultQuality: 0.9,
  fileNaming: {
    keepOriginalName: true,
    addTimestamp: false,
    addConvertedSuffix: true,
    customPrefix: '',
    customSuffix: '',
  },
  notifications: {
    showToast: true,
  },
  history: {
    autoSave: true,
  },
  theme: 'light', // 'light' or 'dark'
};

/**
 * Get all settings from localStorage
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        fileNaming: {
          ...DEFAULT_SETTINGS.fileNaming,
          ...(parsed.fileNaming || {}),
        },
        notifications: {
          ...DEFAULT_SETTINGS.notifications,
          ...(parsed.notifications || {}),
        },
        history: {
          ...DEFAULT_SETTINGS.history,
          ...(parsed.history || {}),
        },
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 * @returns {Object} Saved settings
 */
export function saveSettings(settings) {
  try {
    const merged = {
      ...DEFAULT_SETTINGS,
      ...settings,
      fileNaming: {
        ...DEFAULT_SETTINGS.fileNaming,
        ...(settings.fileNaming || {}),
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(settings.notifications || {}),
      },
      history: {
        ...DEFAULT_SETTINGS.history,
        ...(settings.history || {}),
      },
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return settings;
  }
}

/**
 * Reset settings to defaults
 * @returns {Object} Default settings
 */
export function resetSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to reset settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update specific setting
 * @param {string} key - Setting key (can use dot notation: 'fileNaming.keepOriginalName')
 * @param {any} value - New value
 * @returns {Object} Updated settings
 */
export function updateSetting(key, value) {
  const settings = getSettings();
  const keys = key.split('.');

  if (keys.length === 1) {
    settings[key] = value;
  } else if (keys.length === 2) {
    if (!settings[keys[0]]) {
      settings[keys[0]] = {};
    }
    settings[keys[0]][keys[1]] = value;
  }

  return saveSettings(settings);
}

/**
 * Generate filename based on settings
 * @param {string} originalName - Original file name
 * @param {string} format - Target format (jpg, png, webp)
 * @param {Object} settings - Settings object (optional, will load from localStorage if not provided)
 * @returns {string} Generated filename
 */
export function generateFileName(originalName, format, settings = null) {
  const config = settings || getSettings();
  const { fileNaming } = config;

  // Remove extension from original name
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

  let fileName = fileNaming.keepOriginalName ? nameWithoutExt : 'image';

  // Add custom prefix
  if (fileNaming.customPrefix) {
    fileName = fileNaming.customPrefix + fileName;
  }

  // Add converted suffix
  if (fileNaming.addConvertedSuffix) {
    fileName += '_converted';
  }

  // Add custom suffix
  if (fileNaming.customSuffix) {
    fileName += fileNaming.customSuffix;
  }

  // Add timestamp
  if (fileNaming.addTimestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    fileName += `_${timestamp}`;
  }

  // Add extension
  const extension = format === 'jpg' ? 'jpg' : format;
  fileName += `.${extension}`;

  return fileName;
}

/**
 * Get default settings object (for reference)
 * @returns {Object} Default settings
 */
export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}
