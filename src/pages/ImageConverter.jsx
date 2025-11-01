import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeaderControls from '../components/HeaderControls'
import { useCanonicalUrl } from '../utils/seoHelpers'
import JSZip from 'jszip'
import ImageUploader from '../components/ImageUploader'
import FileList from '../components/FileList'
import FormatSelector from '../components/FormatSelector'
import ResizeOptions from '../components/ResizeOptions'
import RotateFlip from '../components/RotateFlip'
import PaddingTool from '../components/PaddingTool'
import Watermark from '../components/Watermark'
import Filters from '../components/Filters'
import CropTool from '../components/CropTool'
import QualitySlider from '../components/QualitySlider'
import FileSizeComparison from '../components/FileSizeComparison'
import Toast from '../components/Toast'
import History from '../components/History'
import Settings from '../components/Settings'
import Stats from '../components/Stats'
import { convertToJPG, convertToPNG, convertToWEBP, convertToPDF, convertSingleImageToPDF, convertPDFToImages, getImageDimensions } from '../utils/imageConverter'
import downloadImage from '../utils/download'
import { addToHistory } from '../utils/history'
import { getSettings, generateFileName } from '../utils/settings'
import { updateStats } from '../utils/stats'

function ImageConverter() {
  const { t, i18n } = useTranslation(['imageConverter', 'translation']);
  
  // Set canonical URL
  useCanonicalUrl('/image-converter');
  
  // SEO Meta Tags
  useEffect(() => {
    document.title = t('imageConverter:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('imageConverter:metaDescription'));
    }
  }, [t, i18n.language]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [pdfMode, setPdfMode] = useState('single'); // 'single' or 'multiple'
  const [convertedImages, setConvertedImages] = useState([]);
  const [fileStatuses, setFileStatuses] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState({ current: 0, total: 0 });
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [resizeOptions, setResizeOptions] = useState(null);
  const [transformOptions, setTransformOptions] = useState(null);
  const [paddingOptions, setPaddingOptions] = useState(null);
  const [watermarkOptions, setWatermarkOptions] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [cropOptions, setCropOptions] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [toast, setToast] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState(getSettings());
  const historyRef = useRef();

  // Load settings on mount
  useEffect(() => {
    const settings = getSettings();
    setUserSettings(settings);
    setSelectedFormat(settings.defaultFormat);
    setQuality(settings.defaultQuality);
  }, []);

  const showToast = (message, type = 'info') => {
    if (userSettings.notifications.showToast) {
      setToast({ message, type });
    }
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleSettingsChange = (newSettings) => {
    setUserSettings(newSettings);
    setSelectedFormat(newSettings.defaultFormat);
    setQuality(newSettings.defaultQuality);
  };

  const handleFileSelect = async (files) => {
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    // Initialize statuses for new files
    const newStatuses = [...fileStatuses, ...files.map(() => ({ status: 'pending', error: null }))];
    setFileStatuses(newStatuses);
    // Initialize converted images array
    const newConverted = [...convertedImages, ...files.map(() => null)];
    setConvertedImages(newConverted);

    // Get dimensions of first file in the entire list
    if (newFiles.length > 0) {
      // Check if the first file is an image
      if (newFiles[0].type.startsWith('image/')) {
        try {
          const dimensions = await getImageDimensions(newFiles[0]);
          console.log('Image dimensions loaded:', dimensions);
          setImageDimensions(dimensions);
        } catch (error) {
          console.error('Failed to get image dimensions:', error);
          setImageDimensions({ width: 0, height: 0 });
        }
      } else if (newFiles[0].type === 'application/pdf') {
        // PDF files don't need dimensions for resize options
        console.log('PDF file detected, skipping dimension calculation');
        setImageDimensions({ width: 0, height: 0 });
      } else {
        // Other file types
        console.log('Non-image file detected, skipping dimension calculation');
        setImageDimensions({ width: 0, height: 0 });
      }
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setFileStatuses(prevStatuses => prevStatuses.filter((_, i) => i !== index));
    setConvertedImages(prevConverted => prevConverted.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setConvertedImages([]);
    setFileStatuses([]);
    setImageDimensions({ width: 0, height: 0 });
    setResizeOptions(null);
    setTransformOptions(null);
    setPaddingOptions(null);
    setWatermarkOptions(null);
    setFilterOptions(null);
    setCropOptions(null);
    console.log('All files and settings cleared');
  };

  const handleError = (message, type) => {
    showToast(message, type);
  };

  const handleFormatChange = (format, mode = 'single') => {
    setSelectedFormat(format);
    setPdfMode(mode);
  };

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
  };

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) {
      showToast(t('imageConverter:messages.selectImagesFirst'), 'warning');
      return;
    }

    setIsConverting(true);
    setConversionProgress({ current: 0, total: uploadedFiles.length });

    // Check if converting to PDF
    if (selectedFormat === 'pdf') {
      try {
        // Filter only image files for PDF conversion
        const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0) {
          showToast(t('imageConverter:messages.noImagesForPdf'), 'error');
          setIsConverting(false);
          return;
        }

        if (pdfMode === 'single') {
          // Single PDF mode: all images into one PDF
          const blob = await convertToPDF(imageFiles, quality, resizeOptions, transformOptions, cropOptions, paddingOptions, watermarkOptions, filterOptions);

          setConvertedImages([blob]);
          setFileStatuses([{ status: 'success', error: null }]);
          setConversionProgress({ current: 1, total: 1 });

          // Update stats for each image file (count each image separately)
          imageFiles.forEach(file => {
            updateStats({
              format: 'pdf',
              originalSize: file.size,
              convertedSize: blob.size / imageFiles.length, // Divide PDF size by number of images
            });
            console.log(`Stats updated for ${file.name} -> PDF (single mode)`);
          });

          showToast(t('imageConverter:messages.pdfConversionComplete'), 'success');
        } else {
          // Multiple PDF mode: each image to individual PDF
          const pdfBlobs = [];
          const statuses = [];

          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            setConversionProgress({ current: i + 1, total: imageFiles.length });

            try {
              const blob = await convertSingleImageToPDF(file, quality, resizeOptions, transformOptions, cropOptions, paddingOptions, watermarkOptions, filterOptions);
              pdfBlobs.push(blob);
              statuses.push({ status: 'success', error: null });

              // Update stats for each PDF
              updateStats({
                format: 'pdf',
                originalSize: file.size,
                convertedSize: blob.size,
              });
              console.log(`Stats updated for ${file.name} -> PDF (multiple mode)`);
            } catch (error) {
              console.error(`PDF conversion failed for ${file.name}:`, error);
              pdfBlobs.push(null);
              statuses.push({ status: 'error', error: error.message });
            }
          }

          setConvertedImages(pdfBlobs);
          setFileStatuses(statuses);
          console.log('Stats updated for PDF conversion (multiple mode)');

          const successCount = statuses.filter(s => s.status === 'success').length;
          showToast(t('imageConverter:messages.pdfFilesConverted', { count: successCount }), 'success');
        }
      } catch (error) {
        console.error('PDF conversion failed:', error);
        showToast(t('imageConverter:messages.pdfConversionFailed'), 'error');
      } finally {
        setIsConverting(false);
      }
      return;
    }

    // Check if there are PDF files to convert to images
    const pdfFiles = uploadedFiles.filter(f => f.type === 'application/pdf');
    const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'));

    // Convert PDF files to images first
    if (pdfFiles.length > 0 && selectedFormat !== 'pdf') {
      try {
        const allImageBlobs = [];
        const pdfFileMapping = []; // Track which PDF each image came from

        for (const pdfFile of pdfFiles) {
          const imageBlobs = await convertPDFToImages(pdfFile, selectedFormat, quality);

          // Track which PDF each image belongs to
          imageBlobs.forEach(blob => {
            allImageBlobs.push(blob);
            pdfFileMapping.push({ pdfFile, blob });
          });
        }

        setConvertedImages(allImageBlobs);
        const statuses = allImageBlobs.map(() => ({ status: 'success', error: null }));
        setFileStatuses(statuses);
        setConversionProgress({ current: allImageBlobs.length, total: allImageBlobs.length });

        // Update stats for each converted image
        pdfFileMapping.forEach(({ pdfFile, blob }, index) => {
          updateStats({
            format: selectedFormat,
            originalSize: pdfFile.size / pdfFileMapping.filter(m => m.pdfFile === pdfFile).length, // Divide PDF size by number of pages
            convertedSize: blob.size,
          });
          console.log(`Stats updated for PDF page ${index + 1} -> ${selectedFormat}`);
        });

        showToast(t('imageConverter:messages.pdfConverted', { count: allImageBlobs.length }), 'success');
      } catch (error) {
        console.error('PDF to images conversion failed:', error);
        showToast(t('imageConverter:messages.pdfConversionFailed'), 'error');
      } finally {
        setIsConverting(false);
      }
      return;
    }

    // Convert all image files
    const conversionPromises = imageFiles.map(async (file, index) => {
      try {
        // Update status to converting
        setFileStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[index] = { status: 'converting', error: null };
          return newStatuses;
        });

        // Debug log
        console.log('Converting with options:', {
          file: file.name,
          quality,
          resizeOptions,
          transformOptions,
          cropOptions,
          paddingOptions,
          watermarkOptions,
          filterOptions
        });

        let blob;
        if (selectedFormat === 'jpg') {
          blob = await convertToJPG(file, quality, resizeOptions, transformOptions, cropOptions, paddingOptions, watermarkOptions, filterOptions);
        } else if (selectedFormat === 'png') {
          blob = await convertToPNG(file, resizeOptions, transformOptions, cropOptions, paddingOptions, watermarkOptions, filterOptions);
        } else if (selectedFormat === 'webp') {
          blob = await convertToWEBP(file, quality, resizeOptions, transformOptions, cropOptions, paddingOptions, watermarkOptions, filterOptions);
        }

        // Update converted image
        setConvertedImages(prev => {
          const newConverted = [...prev];
          newConverted[index] = blob;
          return newConverted;
        });

        // Update status to success
        setFileStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[index] = { status: 'success', error: null };
          return newStatuses;
        });

        // Update progress
        setConversionProgress(prev => ({ ...prev, current: prev.current + 1 }));

        // Add to history if enabled
        if (userSettings.history.autoSave) {
          const originalFormat = file.type.split('/')[1].toUpperCase();
          addToHistory({
            fileName: file.name,
            originalFormat: originalFormat,
            convertedFormat: selectedFormat.toUpperCase(),
            originalSize: file.size,
            convertedSize: blob.size,
          });
        }

        // Update stats
        updateStats({
          format: selectedFormat,
          originalSize: file.size,
          convertedSize: blob.size,
        });
        console.log(`Stats updated for ${file.name}: ${selectedFormat}`);

        return { success: true, index, blob };
      } catch (error) {
        console.error(`Conversion failed for ${file.name}:`, error);

        // Update status to error
        setFileStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[index] = { status: 'error', error: error.message };
          return newStatuses;
        });

        // Update progress
        setConversionProgress(prev => ({ ...prev, current: prev.current + 1 }));

        return { success: false, index, error };
      }
    });

    try {
      const results = await Promise.all(conversionPromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        showToast(t('imageConverter:messages.allImagesSuccess', { count: successCount }), 'success');
      } else if (successCount === 0) {
        showToast(t('imageConverter:messages.allImagesFailed'), 'error');
      } else {
        showToast(t('imageConverter:messages.partialSuccess', { success: successCount, fail: failCount }), 'warning');
      }

      // Refresh history component
      if (successCount > 0) {
        setHistoryKey(prev => prev + 1);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAll = () => {
    // Check if PDF to images conversion (multiple images from one PDF)
    if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'application/pdf' && convertedImages.length > 1) {
      // PDF to images: add page number to filename
      convertedImages.forEach((blob, index) => {
        if (blob) {
          const originalName = uploadedFiles[0].name.replace(/\.pdf$/i, '');
          const fileName = `${originalName}_page${index + 1}.${selectedFormat}`;
          downloadImage(blob, fileName, selectedFormat);
        }
      });
    } else {
      // Normal conversion
      convertedImages.forEach((blob, index) => {
        if (blob && uploadedFiles[index]) {
          const fileName = generateFileName(uploadedFiles[index].name, selectedFormat, userSettings);
          downloadImage(blob, fileName, selectedFormat);
        }
      });
    }
  };

  const handleDownloadSingle = (index) => {
    if (convertedImages[index]) {
      // Check if PDF to images conversion
      if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'application/pdf' && convertedImages.length > 1) {
        const originalName = uploadedFiles[0].name.replace(/\.pdf$/i, '');
        const fileName = `${originalName}_page${index + 1}.${selectedFormat}`;
        downloadImage(convertedImages[index], fileName, selectedFormat);
      } else if (uploadedFiles[index]) {
        const fileName = generateFileName(uploadedFiles[index].name, selectedFormat, userSettings);
        downloadImage(convertedImages[index], fileName, selectedFormat);
      }
    }
  };

  const handleDownloadAsZip = async () => {
    setIsCreatingZip(true);

    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

      // Add all converted images to the ZIP
      if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'application/pdf' && convertedImages.length > 1) {
        // PDF to images: add page number to filename
        const originalName = uploadedFiles[0].name.replace(/\.pdf$/i, '');
        convertedImages.forEach((blob, index) => {
          if (blob) {
            const fileName = `${originalName}_page${index + 1}.${selectedFormat}`;
            zip.file(fileName, blob);
          }
        });
      } else {
        // Normal conversion
        convertedImages.forEach((blob, index) => {
          if (blob && uploadedFiles[index]) {
            const convertedFileName = generateFileName(uploadedFiles[index].name, selectedFormat, userSettings);
            zip.file(convertedFileName, blob);
          }
        });
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_images_${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(t('imageConverter:messages.zipComplete'), 'success');
    } catch (error) {
      console.error('ZIP creation failed:', error);
      showToast(t('imageConverter:messages.zipFailed'), 'error');
    } finally {
      setIsCreatingZip(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-12 image-converter-container" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 px-4 relative">
        {/* Language Switcher and Settings */}
        <div style={{ position: 'absolute', top: '0', right: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <HeaderControls />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
            title="Settings"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4 text-lg sm:text-xl">
          <Link
            to="/"
            className="home-button"
            style={{
              background: 'white',
              color: '#6366f1',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'underline',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1e40af';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#6366f1';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🏠 {t('translation:nav.home')}
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{'>'}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{t('imageConverter:breadcrumb.imageConverter')}</span>
        </div>
        <h1 className="font-bold mb-2 image-converter-title" style={{ color: 'white', fontSize: '2.5rem', fontWeight: '700' }}>{t('imageConverter:title')}</h1>
        <p className="text-sm sm:text-base image-converter-subtitle" style={{ color: 'white' }}>{t('imageConverter:subtitle')}</p>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Main Content */}
      <ImageUploader
        onFileSelect={handleFileSelect}
        onError={handleError}
        onClearAll={handleClearAll}
        hasFiles={uploadedFiles.length > 0}
      />
      <FileList
        files={uploadedFiles}
        fileStatuses={fileStatuses}
        convertedImages={convertedImages}
        selectedFormat={selectedFormat}
        onRemove={handleRemoveFile}
        onDownload={handleDownloadSingle}
      />

      <FormatSelector onChange={handleFormatChange} />

      {/* Resize Options - Debug */}
      {(() => {
        console.log('ResizeOptions render check:', {
          uploadedFilesLength: uploadedFiles.length,
          imageDimensions,
          shouldRender: uploadedFiles.length > 0 && imageDimensions.width > 0 && imageDimensions.height > 0
        });
        return null;
      })()}
      {uploadedFiles.length > 0 && imageDimensions.width > 0 && imageDimensions.height > 0 && (
        <ResizeOptions
          originalWidth={imageDimensions.width}
          originalHeight={imageDimensions.height}
          onResizeChange={setResizeOptions}
        />
      )}

      {/* Rotate and Flip */}
      {uploadedFiles.length > 0 && (
        <RotateFlip onTransformChange={setTransformOptions} />
      )}

      {/* Padding Tool */}
      {uploadedFiles.length > 0 && imageDimensions.width > 0 && imageDimensions.height > 0 && (
        <PaddingTool
          originalWidth={imageDimensions.width}
          originalHeight={imageDimensions.height}
          onPaddingChange={setPaddingOptions}
        />
      )}

      {/* Watermark */}
      {uploadedFiles.length > 0 && (
        <Watermark onWatermarkChange={setWatermarkOptions} />
      )}

      {/* Filters */}
      {uploadedFiles.length > 0 && (
        <Filters onFilterChange={setFilterOptions} />
      )}

      {/* Crop Tool */}
      {uploadedFiles.length > 0 && (
        <CropTool file={uploadedFiles[0]} onCropChange={setCropOptions} />
      )}

      <QualitySlider
        quality={quality}
        onQualityChange={handleQualityChange}
        selectedFormat={selectedFormat}
      />

      {/* Action Buttons */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex flex-col gap-4">
          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={uploadedFiles.length === 0 || isConverting}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg transition-all min-h-[44px] ${
              uploadedFiles.length === 0 || isConverting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isConverting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('imageConverter:buttons.convertingProgress', { current: conversionProgress.current, total: conversionProgress.total })}
              </span>
            ) : (
              t('imageConverter:buttons.convert')
            )}
          </button>

        </div>
      </div>

      {/* Download Buttons */}
      {convertedImages.some(img => img !== null) && (
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Download All Button */}
            <button
              onClick={handleDownloadAll}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-green-600 text-white rounded-lg font-bold text-base sm:text-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">{t('imageConverter:buttons.downloadAll', { count: convertedImages.filter(img => img !== null).length })}</span>
                <span className="sm:hidden">{t('imageConverter:buttons.downloadAll', { count: convertedImages.filter(img => img !== null).length })}</span>
              </span>
            </button>

            {/* ZIP Download Button (only show when 2+ files converted) */}
            {convertedImages.filter(img => img !== null).length >= 2 && (
              <button
                onClick={handleDownloadAsZip}
                disabled={isCreatingZip}
                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all min-h-[44px] ${
                  isCreatingZip
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <span className="flex items-center justify-center">
                  {isCreatingZip ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="hidden sm:inline">{t('imageConverter:buttons.creatingZip')}</span>
                      <span className="sm:hidden">{t('imageConverter:buttons.creating')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">{t('imageConverter:buttons.downloadZip')}</span>
                      <span className="sm:hidden">{t('imageConverter:buttons.downloadZipShort')}</span>
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <History key={historyKey} ref={historyRef} />

      {/* Stats */}
      <Stats />

      {/* Features Section */}
      <div className="features-section" style={{ marginTop: '3rem', padding: '2rem', background: 'white', borderRadius: '12px' }}>
        <h2 className="features-title" style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: '2rem' }}>{t('imageConverter:features.title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="feature-card-container" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
            <h3 className="feature-card-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('imageConverter:features.privateSecure.title')}</h3>
            <p className="feature-card-description" style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('imageConverter:features.privateSecure.description')}</p>
          </div>
          <div className="feature-card-container" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔄</div>
            <h3 className="feature-card-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('imageConverter:features.multipleFormats.title')}</h3>
            <p className="feature-card-description" style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('imageConverter:features.multipleFormats.description')}</p>
          </div>
          <div className="feature-card-container" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚙️</div>
            <h3 className="feature-card-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('imageConverter:features.advancedTools.title')}</h3>
            <p className="feature-card-description" style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('imageConverter:features.advancedTools.description')}</p>
          </div>
          <div className="feature-card-container" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
            <h3 className="feature-card-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('imageConverter:features.batchProcessing.title')}</h3>
            <p className="feature-card-description" style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('imageConverter:features.batchProcessing.description')}</p>
          </div>
          <div className="feature-card-container" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
            <h3 className="feature-card-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('imageConverter:features.qualityControl.title')}</h3>
            <p className="feature-card-description" style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('imageConverter:features.qualityControl.description')}</p>
          </div>
          <div className="feature-card-container" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🆓</div>
            <h3 className="feature-card-title" style={{ fontSize: '1.125rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{t('imageConverter:features.free.title')}</h3>
            <p className="feature-card-description" style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', margin: 0 }}>{t('imageConverter:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageConverter
