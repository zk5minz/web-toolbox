import { useState } from 'react';

export default function RotateFlip({ onTransformChange }) {
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  const handleRotate = (degrees) => {
    const newRotation = (rotation + degrees) % 360;
    setRotation(newRotation < 0 ? newRotation + 360 : newRotation);
    updateTransform(newRotation, flipHorizontal, flipVertical);
  };

  const handleFlipHorizontal = () => {
    const newFlip = !flipHorizontal;
    setFlipHorizontal(newFlip);
    updateTransform(rotation, newFlip, flipVertical);
  };

  const handleFlipVertical = () => {
    const newFlip = !flipVertical;
    setFlipVertical(newFlip);
    updateTransform(rotation, flipHorizontal, newFlip);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    updateTransform(0, false, false);
  };

  const updateTransform = (rot, flipH, flipV) => {
    if (onTransformChange) {
      onTransformChange({
        rotation: rot,
        flipHorizontal: flipH,
        flipVertical: flipV
      });
    }
  };

  const hasTransform = rotation !== 0 || flipHorizontal || flipVertical;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Rotate & Flip</h2>
          {hasTransform && (
            <button
              onClick={handleReset}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Current Transform Status */}
        <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Rotation Angle</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600">{rotation}°</p>
            </div>
            {(flipHorizontal || flipVertical) && (
              <>
                <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Flip Status</p>
                  <div className="flex gap-2">
                    {flipHorizontal && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Horizontal
                      </span>
                    )}
                    {flipVertical && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Vertical
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Rotation</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => handleRotate(-90)}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group min-h-[80px] sm:min-h-[90px]"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Counter-<br className="sm:hidden"/>clockwise 90°</span>
            </button>

            <button
              onClick={() => handleRotate(180)}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group min-h-[80px] sm:min-h-[90px]"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700">180°</span>
            </button>

            <button
              onClick={() => handleRotate(90)}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group min-h-[80px] sm:min-h-[90px]"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Clockwise<br className="sm:hidden"/> 90°</span>
            </button>
          </div>
        </div>

        {/* Flip Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Flip</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={handleFlipHorizontal}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg transition-colors min-h-[80px] sm:min-h-[90px] ${
                flipHorizontal
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <svg className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${flipHorizontal ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className={`text-xs sm:text-sm font-medium ${flipHorizontal ? 'text-white' : 'text-gray-700'}`}>
                Flip Horizontal
              </span>
            </button>

            <button
              onClick={handleFlipVertical}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg transition-colors min-h-[80px] sm:min-h-[90px] ${
                flipVertical
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <svg className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${flipVertical ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className={`text-xs sm:text-sm font-medium ${flipVertical ? 'text-white' : 'text-gray-700'}`}>
                Flip Vertical
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
