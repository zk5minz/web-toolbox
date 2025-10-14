import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Filters({ onFilterChange }) {
  const { t } = useTranslation('imageConverter');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Manual adjustments
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [hue, setHue] = useState(0);

  const [selectedPreset, setSelectedPreset] = useState('original');

  const presets = [
    {
      id: 'original',
      label: t('filters.original'),
      icon: '🔄',
      values: { brightness: 0, contrast: 0, saturation: 0, hue: 0 }
    },
    {
      id: 'grayscale',
      label: t('filters.grayscale'),
      icon: '⚫',
      values: { brightness: 0, contrast: 0, saturation: -100, hue: 0 }
    },
    {
      id: 'sepia',
      label: t('filters.sepia'),
      icon: '🟤',
      values: { brightness: 10, contrast: -10, saturation: -20, hue: 30, sepia: true }
    },
    {
      id: 'vivid',
      label: t('filters.vivid'),
      icon: '🌈',
      values: { brightness: 5, contrast: 15, saturation: 40, hue: 0 }
    },
    {
      id: 'vintage',
      label: t('filters.vintage'),
      icon: '📷',
      values: { brightness: 5, contrast: -15, saturation: -30, hue: 20, sepia: true }
    },
    {
      id: 'cool',
      label: t('filters.cool'),
      icon: '❄️',
      values: { brightness: 0, contrast: 5, saturation: 10, hue: 200 }
    },
    {
      id: 'warm',
      label: t('filters.warm'),
      icon: '🔥',
      values: { brightness: 5, contrast: 5, saturation: 15, hue: 30 }
    },
  ];

  useEffect(() => {
    if (isEnabled && onFilterChange) {
      const hasChanges = brightness !== 0 || contrast !== 0 || saturation !== 0 || hue !== 0;

      if (!hasChanges) {
        onFilterChange(null);
        return;
      }

      const preset = presets.find(p => p.id === selectedPreset);

      onFilterChange({
        enabled: true,
        brightness,
        contrast,
        saturation,
        hue,
        sepia: preset?.values?.sepia || false,
      });
    } else if (onFilterChange) {
      onFilterChange(null);
    }
  }, [isEnabled, brightness, contrast, saturation, hue, selectedPreset]);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.id);
    setBrightness(preset.values.brightness);
    setContrast(preset.values.contrast);
    setSaturation(preset.values.saturation);
    setHue(preset.values.hue);
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setHue(0);
    setSelectedPreset('original');
  };

  const handleSliderChange = () => {
    // When user manually adjusts sliders, deselect preset
    setSelectedPreset('custom');
  };

  const hasChanges = brightness !== 0 || contrast !== 0 || saturation !== 0 || hue !== 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('filters.title')}</h2>
            {isEnabled && hasChanges && (
              <span className="ml-3 px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                {t('padding.active')}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-4 sm:px-6 pb-6">
            {/* Enable Filter Checkbox */}
            <div className="mb-4 sm:mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700 font-medium">{t('filters.enable')}</span>
              </label>
            </div>

            {isEnabled && (
              <>
                {/* Preset Filters */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('filters.presetFilters')}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        className={`p-3 sm:p-4 border-2 rounded-lg font-medium text-xs sm:text-sm transition-all min-h-[70px] flex flex-col items-center justify-center ${
                          selectedPreset === preset.id
                            ? 'border-pink-600 bg-pink-50 text-pink-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-pink-400'
                        }`}
                      >
                        <span className="text-2xl mb-1">{preset.icon}</span>
                        <span className="text-xs">{preset.label}</span>
                      </button>
                    ))}
                    {selectedPreset === 'custom' && (
                      <button
                        className="p-3 sm:p-4 border-2 border-pink-600 bg-pink-50 text-pink-700 rounded-lg font-medium text-xs sm:text-sm transition-all min-h-[70px] flex flex-col items-center justify-center"
                      >
                        <span className="text-2xl mb-1">⚙️</span>
                        <span className="text-xs">{t('filters.custom')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Manual Adjustments */}
                <div className="mb-6 space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('filters.manualAdjustments')}</label>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-600">{t('filters.brightness')}</label>
                      <span className="text-sm font-semibold text-gray-800">{brightness > 0 ? '+' : ''}{brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={brightness}
                      onChange={(e) => {
                        setBrightness(parseInt(e.target.value));
                        handleSliderChange();
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{t('filters.darker')}</span>
                      <span>{t('filters.brighter')}</span>
                    </div>
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-600">{t('filters.contrast')}</label>
                      <span className="text-sm font-semibold text-gray-800">{contrast > 0 ? '+' : ''}{contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={contrast}
                      onChange={(e) => {
                        setContrast(parseInt(e.target.value));
                        handleSliderChange();
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{t('filters.low')}</span>
                      <span>{t('filters.high')}</span>
                    </div>
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-600">{t('filters.saturation')}</label>
                      <span className="text-sm font-semibold text-gray-800">{saturation > 0 ? '+' : ''}{saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => {
                        setSaturation(parseInt(e.target.value));
                        handleSliderChange();
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{t('filters.grayscaleLabel')}</span>
                      <span>{t('filters.vividLabel')}</span>
                    </div>
                  </div>

                  {/* Hue */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-600">{t('filters.hue')}</label>
                      <span className="text-sm font-semibold text-gray-800">{hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hue}
                      onChange={(e) => {
                        setHue(parseInt(e.target.value));
                        handleSliderChange();
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mb-6 bg-pink-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">{t('filters.guideTitle')}</p>
                      <ul className="space-y-1 text-xs">
                        <li>• {t('filters.guide1')}</li>
                        <li>• {t('filters.guide2')}</li>
                        <li>• {t('filters.guide3')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-base transition-all min-h-[44px] ${
                      hasChanges
                        ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t('buttons.reset')}
                  </button>
                </div>
              </>
            )}

            {!isEnabled && (
              <div className="text-center py-8 text-gray-500">
                {t('filters.instruction')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
