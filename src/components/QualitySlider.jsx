import { useTranslation } from 'react-i18next';

export default function QualitySlider({ quality, onQualityChange, selectedFormat }) {
  const { t } = useTranslation(['imageConverter']);
  const isDisabled = selectedFormat === 'png';
  const qualityPercent = Math.round(quality * 100);

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    if (onQualityChange) {
      onQualityChange(value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('imageConverter:quality.title')}</h2>

        {isDisabled ? (
          // Disabled state for PNG
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-500 text-lg">{t('imageConverter:quality.unavailable')}</p>
            <p className="text-gray-400 text-sm mt-2">{t('imageConverter:quality.losslessFormat')}</p>
          </div>
        ) : (
          // Active state for JPG and WEBP
          <div>
            {/* Quality Display */}
            <div className="mb-4 sm:mb-6 text-center">
              <div className="inline-block bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">{qualityPercent}%</span>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-4 px-2">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={quality}
                onChange={handleSliderChange}
                className="w-full h-4 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${qualityPercent}%, #e5e7eb ${qualityPercent}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Quality Labels */}
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 px-2">
              <span>{t('imageConverter:quality.low')}</span>
              <span className="hidden sm:inline">{t('imageConverter:quality.medium')}</span>
              <span>{t('imageConverter:quality.high')}</span>
            </div>

            {/* Quality Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">{t('imageConverter:quality.guideTitle')}</p>
                  <ul className="space-y-1 text-xs">
                    <li>• {t('imageConverter:quality.guide1')}</li>
                    <li>• {t('imageConverter:quality.guide2')}</li>
                    <li>• {t('imageConverter:quality.guide3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        @media (min-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
}
