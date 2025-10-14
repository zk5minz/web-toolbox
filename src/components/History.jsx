import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
  getRelativeTime,
  calculateSizeReduction,
  formatFileSize
} from '../utils/history';

export default function History({ onHistoryUpdate }) {
  const { t } = useTranslation(['imageConverter']);
  const [history, setHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getHistory();
    setHistory(historyData);
    if (onHistoryUpdate) {
      onHistoryUpdate(historyData);
    }
  };

  const handleDeleteItem = (id) => {
    const updatedHistory = deleteHistoryItem(id);
    setHistory(updatedHistory);
    if (onHistoryUpdate) {
      onHistoryUpdate(updatedHistory);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(t('imageConverter:history.confirmDelete'))) {
      const emptyHistory = clearHistory();
      setHistory(emptyHistory);
      if (onHistoryUpdate) {
        onHistoryUpdate(emptyHistory);
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('imageConverter:history.title')}</h2>
            {history.length > 0 && (
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                {history.length} {t('imageConverter:history.items')}
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
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm sm:text-base">{t('imageConverter:history.noHistory')}</p>
              </div>
            ) : (
              <>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    {sortOrder === 'newest' ? t('imageConverter:history.latestFirst') : t('imageConverter:history.oldestFirst')}
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('imageConverter:buttons.clearAll')}
                  </button>
                </div>

                {/* History List */}
                <div className="space-y-3">
                  {sortedHistory.map((item) => {
                    const sizeReduction = calculateSizeReduction(item.originalSize, item.convertedSize);
                    return (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            {/* File Name */}
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                                {item.fileName}
                              </p>
                            </div>

                            {/* Conversion Info */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <span className="font-semibold uppercase">{item.originalFormat}</span>
                                <svg className="w-3 h-3 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="font-semibold uppercase">{item.convertedFormat}</span>
                              </span>
                              <span className="hidden sm:inline text-gray-400">•</span>
                              <span>{formatFileSize(item.originalSize)} → {formatFileSize(item.convertedSize)}</span>
                            </div>

                            {/* Size Reduction & Time */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                              {sizeReduction > 0 && (
                                <span className="flex items-center text-green-600 font-medium">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                  </svg>
                                  {sizeReduction}% {t('imageConverter:history.reduced')}
                                </span>
                              )}
                              {sizeReduction < 0 && (
                                <span className="flex items-center text-red-600 font-medium">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  {Math.abs(sizeReduction)}% {t('imageConverter:history.increased')}
                                </span>
                              )}
                              <span className="hidden sm:inline text-gray-400">•</span>
                              <span>{getRelativeTime(item.timestamp)}</span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title={t('imageConverter:buttons.delete')}
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
