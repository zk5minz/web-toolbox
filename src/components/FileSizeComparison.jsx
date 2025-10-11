export default function FileSizeComparison({ originalSize, convertedSize }) {
  // Convert bytes to MB
  const formatSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const originalMB = formatSize(originalSize);
  const convertedMB = formatSize(convertedSize);

  // Calculate reduction percentage
  const difference = originalSize - convertedSize;
  const reductionPercent = ((difference / originalSize) * 100).toFixed(1);
  const isReduced = difference > 0;
  const isIncreased = difference < 0;

  // Calculate relative size for progress bar
  const relativeSize = (convertedSize / originalSize) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mb-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          File Size Comparison
        </h3>

        {/* Size Comparison */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Original Size */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Original Size</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{originalMB} MB</p>
          </div>

          {/* Converted Size */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Converted Size</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{convertedMB} MB</p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="mb-4 sm:mb-6">
          {/* Original Size Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Original</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
              <div
                className="bg-gray-400 h-3 sm:h-4 rounded-full transition-all"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {/* Converted Size Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Converted</span>
              <span>{relativeSize.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
              <div
                className={`h-3 sm:h-4 rounded-full transition-all ${
                  isReduced ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(relativeSize, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Reduction/Increase Badge */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full font-bold text-sm sm:text-base ${
              isReduced
                ? 'bg-green-100 text-green-700'
                : isIncreased
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isReduced ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {Math.abs(reductionPercent)}% Reduced
              </>
            ) : isIncreased ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                {Math.abs(reductionPercent)}% Increased
              </>
            ) : (
              <>Same Size</>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {isReduced && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              File size reduced by {(Math.abs(difference) / (1024 * 1024)).toFixed(2)} MB!
            </p>
          </div>
        )}

        {isIncreased && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              File size increased after conversion. Try different format or quality settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
