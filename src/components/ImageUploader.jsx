import { useState, useRef } from 'react';

export default function ImageUploader({ onFileSelect, onError, onClearAll, hasFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const validateAndProcessFiles = (files) => {
    const validFiles = [];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        if (onError) {
          onError(`${file.name}: Only JPG, PNG, PDF files can be uploaded`, 'error');
        }
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        if (onError) {
          onError(`${file.name}: File size is too large. Please select a file under 50MB`, 'warning');
        }
        return;
      }

      validFiles.push(file);
    });

    // Pass valid files to parent component
    if (validFiles.length > 0 && onFileSelect) {
      onFileSelect(validFiles);
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      validateAndProcessFiles(files);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFiles(files);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Image Uploader</h2>

        {/* File Input */}
        <div className="mb-4 sm:mb-6 flex gap-3">
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center flex-1 px-4 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors min-h-[44px] text-base sm:text-lg font-medium"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose Files
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          {/* Clear All Button */}
          {hasFiles && (
            <button
              onClick={onClearAll}
              className="px-4 py-3 sm:py-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors min-h-[44px] text-base sm:text-lg font-medium flex items-center"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Delete All</span>
              <span className="sm:hidden">Delete</span>
            </button>
          )}
        </div>

        {/* Preview Area */}
        <div
          className={`border-2 rounded-lg p-4 sm:p-6 min-h-48 sm:min-h-64 flex items-center justify-center transition-all duration-200 ${
            isDragging
              ? 'border-solid border-blue-500 bg-blue-50'
              : 'border-dashed border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center px-2">
            <svg className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-base sm:text-lg transition-colors ${isDragging ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              {isDragging ? 'Drop files here' : 'Drag & drop images or click here'}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Only JPG, PNG files are supported (multiple files allowed)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
