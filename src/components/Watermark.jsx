import { useState, useEffect } from 'react';

export default function Watermark({ onWatermarkChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [watermarkType, setWatermarkType] = useState('text'); // 'text' or 'image'

  // Text watermark options
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(40);
  const [fontColor, setFontColor] = useState('#000000');
  const [textOpacity, setTextOpacity] = useState(50);
  const [fontBold, setFontBold] = useState(false);

  // Image watermark options
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [imageSize, setImageSize] = useState(50);
  const [imageOpacity, setImageOpacity] = useState(50);

  // Common options
  const [position, setPosition] = useState('bottom-right');
  const [margin, setMargin] = useState(20);

  const positions = [
    { value: 'top-left', label: '좌상단', icon: '↖' },
    { value: 'top-center', label: '상단', icon: '↑' },
    { value: 'top-right', label: '우상단', icon: '↗' },
    { value: 'middle-left', label: '좌측', icon: '←' },
    { value: 'center', label: '중앙', icon: '●' },
    { value: 'middle-right', label: '우측', icon: '→' },
    { value: 'bottom-left', label: '좌하단', icon: '↙' },
    { value: 'bottom-center', label: '하단', icon: '↓' },
    { value: 'bottom-right', label: '우하단', icon: '↘' },
  ];

  useEffect(() => {
    if (isEnabled && onWatermarkChange) {
      const options = {
        enabled: true,
        type: watermarkType,
        position,
        margin,
      };

      if (watermarkType === 'text') {
        if (!text.trim()) {
          onWatermarkChange(null);
          return;
        }
        options.text = text;
        options.fontSize = fontSize;
        options.fontColor = fontColor;
        options.opacity = textOpacity / 100;
        options.fontBold = fontBold;
      } else {
        if (!watermarkImage) {
          onWatermarkChange(null);
          return;
        }
        options.image = watermarkImage;
        options.size = imageSize / 100;
        options.opacity = imageOpacity / 100;
      }

      onWatermarkChange(options);
    } else if (onWatermarkChange) {
      onWatermarkChange(null);
    }
  }, [isEnabled, watermarkType, text, fontSize, fontColor, textOpacity, fontBold,
      watermarkImage, imageSize, imageOpacity, position, margin]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWatermarkImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setText('');
    setFontSize(40);
    setFontColor('#000000');
    setTextOpacity(50);
    setFontBold(false);
    setWatermarkImage(null);
    setImageSize(50);
    setImageOpacity(50);
    setPosition('bottom-right');
    setMargin(20);
    setIsEnabled(false);
  };

  const hasChanges = (watermarkType === 'text' && text.trim()) || (watermarkType === 'image' && watermarkImage);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">워터마크 추가</h2>
            {isEnabled && hasChanges && (
              <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                활성화
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
            {/* Enable Watermark Checkbox */}
            <div className="mb-4 sm:mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700 font-medium">워터마크 추가 활성화</span>
              </label>
            </div>

            {isEnabled && (
              <>
                {/* Watermark Type Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">워터마크 타입</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watermarkType === 'text' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400'
                    }`}>
                      <input
                        type="radio"
                        name="watermarkType"
                        value="text"
                        checked={watermarkType === 'text'}
                        onChange={(e) => setWatermarkType(e.target.value)}
                        className="sr-only"
                      />
                      <svg className={`w-6 h-6 mr-2 ${watermarkType === 'text' ? 'text-indigo-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span className={`font-medium ${watermarkType === 'text' ? 'text-indigo-600' : 'text-gray-700'}`}>텍스트</span>
                    </label>
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      watermarkType === 'image' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400'
                    }`}>
                      <input
                        type="radio"
                        name="watermarkType"
                        value="image"
                        checked={watermarkType === 'image'}
                        onChange={(e) => setWatermarkType(e.target.value)}
                        className="sr-only"
                      />
                      <svg className={`w-6 h-6 mr-2 ${watermarkType === 'image' ? 'text-indigo-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className={`font-medium ${watermarkType === 'image' ? 'text-indigo-600' : 'text-gray-700'}`}>이미지</span>
                    </label>
                  </div>
                </div>

                {/* Text Watermark Options */}
                {watermarkType === 'text' && (
                  <div className="mb-4 sm:mb-6 space-y-4">
                    {/* Text Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">워터마크 텍스트</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="예: © 2024 My Company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        폰트 크기: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Font Color & Bold */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">폰트 색상</label>
                        <input
                          type="color"
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                          className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">폰트 스타일</label>
                        <label className="flex items-center h-12 px-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={fontBold}
                            onChange={(e) => setFontBold(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm font-bold">굵게</span>
                        </label>
                      </div>
                    </div>

                    {/* Text Opacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        투명도: {textOpacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={textOpacity}
                        onChange={(e) => setTextOpacity(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Image Watermark Options */}
                {watermarkType === 'image' && (
                  <div className="mb-4 sm:mb-6 space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">워터마크 이미지</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>

                    {/* Image Preview */}
                    {watermarkImage && (
                      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                        <img src={watermarkImage} alt="Watermark preview" className="max-h-32 rounded" />
                      </div>
                    )}

                    {/* Image Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        크기: {imageSize}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={imageSize}
                        onChange={(e) => setImageSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Image Opacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        투명도: {imageOpacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imageOpacity}
                        onChange={(e) => setImageOpacity(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Position Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">위치 선택</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={`p-3 sm:p-4 border-2 rounded-lg font-medium text-sm sm:text-base transition-all min-h-[60px] flex flex-col items-center justify-center ${
                          position === pos.value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
                        }`}
                      >
                        <span className="text-2xl mb-1">{pos.icon}</span>
                        <span className="text-xs">{pos.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Margin */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가장자리 여백: {margin}px
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={margin}
                    onChange={(e) => setMargin(Math.max(0, Math.min(200, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
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
                    초기화
                  </button>
                </div>
              </>
            )}

            {!isEnabled && (
              <div className="text-center py-8 text-gray-500">
                워터마크를 추가하려면 위의 체크박스를 선택하세요
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
