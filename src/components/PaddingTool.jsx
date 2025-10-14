import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function PaddingTool({ originalWidth, originalHeight, onPaddingChange }) {
  const { t } = useTranslation('imageConverter');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaddingEnabled, setIsPaddingEnabled] = useState(false);
  const [uniformPadding, setUniformPadding] = useState(false);
  const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [customColor, setCustomColor] = useState('#FFFFFF');

  const backgroundOptions = [
    { value: 'transparent', label: t('padding.transparent', 'Transparent'), color: 'transparent' },
    { value: 'white', label: t('padding.white', 'White'), color: '#FFFFFF' },
    { value: 'black', label: t('padding.black', 'Black'), color: '#000000' },
    { value: 'custom', label: t('padding.custom', 'Custom'), color: customColor },
  ];

  useEffect(() => {
    if (isPaddingEnabled && onPaddingChange) {
      onPaddingChange({
        enabled: true,
        padding,
        backgroundColor: backgroundColor === 'custom' ? customColor : backgroundColor,
      });
    } else if (onPaddingChange) {
      onPaddingChange(null);
    }
  }, [isPaddingEnabled, padding, backgroundColor, customColor]);

  const handlePaddingChange = (side, value) => {
    const numValue = Math.max(0, Math.min(1000, parseInt(value) || 0));

    if (uniformPadding) {
      setPadding({
        top: numValue,
        right: numValue,
        bottom: numValue,
        left: numValue,
      });
    } else {
      setPadding(prev => ({ ...prev, [side]: numValue }));
    }
  };

  const handleUniformChange = (e) => {
    const checked = e.target.checked;
    setUniformPadding(checked);

    if (checked) {
      const value = padding.top;
      setPadding({
        top: value,
        right: value,
        bottom: value,
        left: value,
      });
    }
  };

  const handleReset = () => {
    setPadding({ top: 0, right: 0, bottom: 0, left: 0 });
    setBackgroundColor('transparent');
    setCustomColor('#FFFFFF');
    setIsPaddingEnabled(false);
  };

  const handleTogglePadding = () => {
    setIsPaddingEnabled(!isPaddingEnabled);
  };

  const newWidth = originalWidth + padding.left + padding.right;
  const newHeight = originalHeight + padding.top + padding.bottom;
  const hasChanges = padding.top > 0 || padding.right > 0 || padding.bottom > 0 || padding.left > 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('padding.title', 'Add Padding')}</h2>
            {isPaddingEnabled && hasChanges && (
              <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                {t('padding.active', 'Active')}
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
            {/* Enable Padding Checkbox */}
            <div className="mb-4 sm:mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaddingEnabled}
                  onChange={handleTogglePadding}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700 font-medium">{t('padding.enable', 'Enable Padding')}</span>
              </label>
            </div>

            {isPaddingEnabled && (
              <>
                {/* Uniform Padding Checkbox */}
                <div className="mb-4 sm:mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uniformPadding}
                      onChange={handleUniformChange}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm sm:text-base text-gray-700">{t('padding.uniform', 'Uniform padding')}</span>
                  </label>
                </div>

                {/* Padding Inputs */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('padding.size', 'Padding Size (px)')}</label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('padding.top', 'Top')}</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={padding.top}
                        onChange={(e) => handlePaddingChange('top', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('padding.bottom', 'Bottom')}</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={padding.bottom}
                        onChange={(e) => handlePaddingChange('bottom', e.target.value)}
                        disabled={uniformPadding}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('padding.left', 'Left')}</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={padding.left}
                        onChange={(e) => handlePaddingChange('left', e.target.value)}
                        disabled={uniformPadding}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('padding.right', 'Right')}</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={padding.right}
                        onChange={(e) => handlePaddingChange('right', e.target.value)}
                        disabled={uniformPadding}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Color Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('padding.color', 'Padding Color')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBackgroundColor(option.value)}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] ${
                          backgroundColor === option.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{
                            backgroundColor: option.value === 'custom' ? customColor : option.color,
                            backgroundImage: option.value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                            backgroundSize: '8px 8px',
                            backgroundPosition: '0 0, 4px 4px',
                          }}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Picker */}
                  {backgroundColor === 'custom' && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">{t('padding.customColor', 'Custom Color')}</label>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Size Preview */}
                {originalWidth > 0 && originalHeight > 0 && (
                  <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('padding.sizePreview', 'Size Preview')}</label>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-600">{t('resize.originalSize', 'Original Size')}</p>
                        <p className="text-base font-semibold text-gray-800">
                          {originalWidth} × {originalHeight}px
                        </p>
                      </div>
                      {hasChanges && (
                        <>
                          <svg className="w-5 h-5 text-purple-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-600">{t('padding.afterPadding', 'After Padding')}</p>
                            <p className="text-base font-semibold text-purple-600">
                              {newWidth} × {newHeight}px
                            </p>
                            <p className="text-xs text-gray-500">
                              (+{newWidth - originalWidth} × +{newHeight - originalHeight}px)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

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
                    {t('buttons.reset', 'Reset')}
                  </button>
                </div>
              </>
            )}

            {!isPaddingEnabled && (
              <div className="text-center py-8 text-gray-500">
                {t('padding.instruction', 'Check the box above to enable padding')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
