import { useState } from 'react';

export default function FormatSelector({ onChange }) {
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [pdfMode, setPdfMode] = useState('single'); // 'single' or 'multiple'

  const formats = [
    {
      value: 'jpg',
      label: 'JPG',
      description: '작은 용량, 사진 최적화',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: 'png',
      label: 'PNG',
      description: '고화질, 투명도 보존',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      value: 'webp',
      label: 'WEBP',
      description: '최적 압축, 웹 최적화',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: '문서 형식, 다중 페이지',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6" />
        </svg>
      ),
    },
  ];

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    if (onChange) {
      onChange(format, pdfMode);
    }
  };

  const handlePdfModeChange = (mode) => {
    setPdfMode(mode);
    if (onChange) {
      onChange(selectedFormat, mode);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">변환 포맷 선택</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {formats.map((format) => (
            <label
              key={format.value}
              className={`relative flex flex-col items-center p-4 sm:p-6 border-2 rounded-lg cursor-pointer transition-all min-h-[120px] ${
                selectedFormat === format.value
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={selectedFormat === format.value}
                onChange={() => handleFormatChange(format.value)}
                className="sr-only"
              />

              {/* Check Icon */}
              {selectedFormat === format.value && (
                <div className="absolute top-3 right-3">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Format Icon */}
              <div className={`mb-2 sm:mb-3 ${selectedFormat === format.value ? 'text-blue-600' : 'text-gray-500'}`}>
                {format.icon}
              </div>

              {/* Format Label */}
              <div className="text-center">
                <p className={`text-lg sm:text-xl font-bold mb-1 ${selectedFormat === format.value ? 'text-blue-600' : 'text-gray-800'}`}>
                  {format.label}
                </p>
                <p className={`text-xs sm:text-sm ${selectedFormat === format.value ? 'text-blue-500' : 'text-gray-500'}`}>
                  {format.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* PDF Mode Options */}
        {selectedFormat === 'pdf' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">PDF 변환 옵션</h3>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="pdfMode"
                  value="single"
                  checked={pdfMode === 'single'}
                  onChange={() => handlePdfModeChange('single')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm sm:text-base text-gray-700">
                  모두 하나의 PDF로 합치기 <span className="text-gray-500">(기본값)</span>
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="pdfMode"
                  value="multiple"
                  checked={pdfMode === 'multiple'}
                  onChange={() => handlePdfModeChange('multiple')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm sm:text-base text-gray-700">
                  각각 개별 PDF로 생성
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Selected Format Display */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base text-gray-700">
              선택된 포맷: <span className="font-bold text-blue-600">{selectedFormat.toUpperCase()}</span>
              {selectedFormat === 'pdf' && (
                <span className="ml-2 text-gray-500">
                  ({pdfMode === 'single' ? '통합 PDF' : '개별 PDF'})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
