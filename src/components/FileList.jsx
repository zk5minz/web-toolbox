import { useState, useEffect } from 'react';

export default function FileList({ files, fileStatuses, convertedImages, selectedFormat, onRemove, onDownload }) {
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    // Create preview URLs for all files
    const urls = [];
    const loadImages = async () => {
      for (const file of files) {
        const reader = new FileReader();
        const url = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        urls.push({ file, url });
      }
      setPreviewUrls(urls);
    };

    if (files.length > 0) {
      loadImages();
    } else {
      setPreviewUrls([]);
    }

    // Cleanup preview URLs on unmount
    return () => {
      urls.forEach(({ url }) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [files]);

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const getStatusIcon = (status) => {
    switch (status?.status) {
      case 'pending':
        return (
          <div className="absolute top-2 left-2 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center" title="Pending">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'converting':
        return (
          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" title="Converting">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center" title="Conversion Complete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" title={`Conversion Failed: ${status.error || 'Unknown error'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Uploaded Files ({files.length})</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {previewUrls.map(({ file, url }, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 relative group">
              {/* Status icon */}
              {fileStatuses[index] && getStatusIcon(fileStatuses[index])}

              {/* Remove button */}
              <button
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                title="Delete File"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Thumbnail */}
              <div className="mb-3 flex justify-center">
                <img
                  src={url}
                  alt={file.name}
                  className="max-w-full h-32 object-cover rounded-lg"
                />
              </div>

              {/* File info */}
              <div className="space-y-1">
                <p className="text-sm text-gray-700 font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} MB
                </p>
              </div>

              {/* Download button (only for successfully converted files) */}
              {convertedImages[index] && fileStatuses[index]?.status === 'success' && (
                <button
                  onClick={() => onDownload(index)}
                  className="mt-2 w-full py-2 px-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center min-h-[44px]"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
