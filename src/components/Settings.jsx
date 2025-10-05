import { useState, useEffect } from 'react';
import { getSettings, saveSettings, resetSettings, getDefaultSettings } from '../utils/settings';

export default function Settings({ isOpen, onClose, onSettingsChange }) {
  const [settings, setSettings] = useState(getDefaultSettings());

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getSettings();
      setSettings(currentSettings);
    }
  }, [isOpen]);

  const handleFormatChange = (format) => {
    const newSettings = { ...settings, defaultFormat: format };
    setSettings(newSettings);
  };

  const handleQualityChange = (quality) => {
    const newSettings = { ...settings, defaultQuality: quality };
    setSettings(newSettings);
  };

  const handleFileNamingChange = (key, value) => {
    const newSettings = {
      ...settings,
      fileNaming: {
        ...settings.fileNaming,
        [key]: value,
      },
    };
    setSettings(newSettings);
  };

  const handleNotificationChange = (key, value) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    setSettings(newSettings);
  };

  const handleHistoryChange = (key, value) => {
    const newSettings = {
      ...settings,
      history: {
        ...settings.history,
        [key]: value,
      },
    };
    setSettings(newSettings);
  };

  const handleSave = () => {
    const savedSettings = saveSettings(settings);
    if (onSettingsChange) {
      onSettingsChange(savedSettings);
    }
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      const defaultSettings = resetSettings();
      setSettings(defaultSettings);
      if (onSettingsChange) {
        onSettingsChange(defaultSettings);
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-gray-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">설정</h2>
          </div>
          <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Default Format */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">기본 출력 포맷</h3>
            <div className="grid grid-cols-3 gap-3">
              {['jpg', 'png', 'webp'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatChange(format)}
                  className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                    settings.defaultFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Default Quality */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">기본 품질</h3>
            <div className="space-y-2">
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={settings.defaultQuality}
                onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>10%</span>
                <span className="font-semibold text-blue-600">{Math.round(settings.defaultQuality * 100)}%</span>
                <span>100%</span>
              </div>
            </div>
          </section>

          {/* File Naming */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">파일명 규칙</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fileNaming.keepOriginalName}
                  onChange={(e) => handleFileNamingChange('keepOriginalName', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">원본 파일명 유지</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fileNaming.addTimestamp}
                  onChange={(e) => handleFileNamingChange('addTimestamp', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">타임스탬프 추가</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fileNaming.addConvertedSuffix}
                  onChange={(e) => handleFileNamingChange('addConvertedSuffix', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">&quot;_converted&quot; 접미사 추가</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">커스텀 접두사</label>
                <input
                  type="text"
                  value={settings.fileNaming.customPrefix}
                  onChange={(e) => handleFileNamingChange('customPrefix', e.target.value)}
                  placeholder="예: my_"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">커스텀 접미사</label>
                <input
                  type="text"
                  value={settings.fileNaming.customSuffix}
                  onChange={(e) => handleFileNamingChange('customSuffix', e.target.value)}
                  placeholder="예: _final"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">미리보기:</p>
                <p className="text-sm font-medium text-gray-800">
                  {(() => {
                    const { fileNaming } = settings;
                    let preview = fileNaming.keepOriginalName ? 'example' : 'image';
                    if (fileNaming.customPrefix) preview = fileNaming.customPrefix + preview;
                    if (fileNaming.addConvertedSuffix) preview += '_converted';
                    if (fileNaming.customSuffix) preview += fileNaming.customSuffix;
                    if (fileNaming.addTimestamp) preview += '_2025-10-04T12-30-00';
                    preview += `.${settings.defaultFormat}`;
                    return preview;
                  })()}
                </p>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">알림</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.showToast}
                  onChange={(e) => handleNotificationChange('showToast', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">변환 완료 시 Toast 알림 표시</span>
              </label>
            </div>
          </section>

          {/* History */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">히스토리</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.history.autoSave}
                  onChange={(e) => handleHistoryChange('autoSave', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">변환 히스토리 자동 저장</span>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={handleReset}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            기본값으로 초기화
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none py-2 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
