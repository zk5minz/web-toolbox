import { useState, useEffect } from 'react';

export default function ResizeOptions({ originalWidth, originalHeight, onResizeChange }) {
  const [width, setWidth] = useState(originalWidth || 0);
  const [height, setHeight] = useState(originalHeight || 0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (originalWidth && originalHeight) {
      setWidth(originalWidth);
      setHeight(originalHeight);
      setAspectRatio(originalWidth / originalHeight);
    }
  }, [originalWidth, originalHeight]);

  const presets = [
    { name: 'Full HD', width: 1920, height: 1080 },
    { name: 'HD', width: 1280, height: 720 },
    { name: '800x600', width: 800, height: 600 },
    { name: '640x480', width: 640, height: 480 },
    { name: '원본', width: originalWidth, height: originalHeight },
  ];

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value) || 0;
    setWidth(newWidth);

    if (maintainRatio && aspectRatio) {
      const newHeight = Math.round(newWidth / aspectRatio);
      setHeight(newHeight);
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value) || 0;
    setHeight(newHeight);

    if (maintainRatio && aspectRatio) {
      const newWidth = Math.round(newHeight * aspectRatio);
      setWidth(newWidth);
    }
  };

  const handlePresetClick = (preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleApply = () => {
    if (onResizeChange) {
      onResizeChange({ width, height });
    }
  };

  const handleReset = () => {
    setWidth(originalWidth || 0);
    setHeight(originalHeight || 0);
    if (onResizeChange) {
      onResizeChange({ width: originalWidth, height: originalHeight });
    }
  };

  const isModified = width !== originalWidth || height !== originalHeight;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">이미지 크기 조정</h2>

        {/* Current Size Display */}
        <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">원본 크기</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">
                {originalWidth} × {originalHeight}px
              </p>
            </div>
            {isModified && (
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">변경될 크기</p>
                  <p className="text-base sm:text-lg font-semibold text-blue-600">
                    {width} × {height}px
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Width and Height Inputs */}
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Width Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">너비 (px)</label>
              <input
                type="number"
                value={width}
                onChange={handleWidthChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                min="1"
              />
            </div>

            {/* Height Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">높이 (px)</label>
              <input
                type="number"
                value={height}
                onChange={handleHeightChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                min="1"
              />
            </div>
          </div>

          {/* Maintain Ratio Checkbox */}
          <div className="mt-3 sm:mt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={maintainRatio}
                onChange={(e) => setMaintainRatio(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm sm:text-base text-gray-700">비율 유지</span>
            </label>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">프리셋 크기</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium min-h-[44px] flex flex-col items-center justify-center"
              >
                <span className="font-semibold">{preset.name}</span>
                {preset.width && <span className="text-xs text-gray-500 mt-1">{preset.width}×{preset.height}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleApply}
            disabled={!isModified}
            className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-base transition-all min-h-[44px] ${
              isModified
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            적용
          </button>
          <button
            onClick={handleReset}
            disabled={!isModified}
            className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-base transition-all min-h-[44px] ${
              isModified
                ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
