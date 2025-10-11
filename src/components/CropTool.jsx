import { useState, useEffect, useRef } from 'react';

export default function CropTool({ file, onCropChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
  const [imageSrc, setImageSrc] = useState(null);
  const [isCropEnabled, setIsCropEnabled] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imageDisplay, setImageDisplay] = useState(null); // { displayWidth, displayHeight, offsetX, offsetY }
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialBoxX: 0, initialBoxY: 0 });
  const [resizing, setResizing] = useState(null); // { handle: 'nw'|'ne'|'sw'|'se', startX, startY, initialBox }
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 ~ 3

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (file && isExpanded && isCropEnabled) {
      console.log('Loading file:', file.name, file.type, file.size);

      // Create object URL from file
      const url = URL.createObjectURL(file);
      console.log('Image URL created:', url);
      setImageSrc(url);
      setImageError(null);

      // Cleanup URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageSrc(null);
    }
  }, [file, isExpanded, isCropEnabled]);

  // Calculate aspect ratio based on orientation
  const getAspectRatioValue = (baseRatio) => {
    if (baseRatio === null || baseRatio === 1) {
      return baseRatio; // Free ratio and 1:1 are orientation-independent
    }
    return orientation === 'landscape' ? baseRatio : 1 / baseRatio;
  };

  const aspectRatios = [
    { name: 'Free', baseValue: null, displayName: 'Free Ratio' },
    { name: '1:1', baseValue: 1, displayName: '1:1 (Square)' },
    { name: '16:9', baseValue: 16 / 9, displayName: orientation === 'landscape' ? '16:9 (Landscape)' : '9:16 (Portrait)' },
    { name: '4:3', baseValue: 4 / 3, displayName: orientation === 'landscape' ? '4:3 (Landscape)' : '3:4 (Portrait)' },
    { name: '3:2', baseValue: 3 / 2, displayName: orientation === 'landscape' ? '3:2 (Landscape)' : '2:3 (Portrait)' },
  ];

  const handleApply = () => {
    if (isCropEnabled && imageDisplay && onCropChange) {
      // Calculate crop coordinates in original image pixels
      const originalX = ((cropBox.x - imageDisplay.offsetX) / imageDisplay.displayWidth) * imageDisplay.naturalWidth;
      const originalY = ((cropBox.y - imageDisplay.offsetY) / imageDisplay.displayHeight) * imageDisplay.naturalHeight;
      const originalWidth = (cropBox.width / imageDisplay.displayWidth) * imageDisplay.naturalWidth;
      const originalHeight = (cropBox.height / imageDisplay.displayHeight) * imageDisplay.naturalHeight;

      // Pass crop info to parent
      onCropChange({
        enabled: true,
        area: {
          x: Math.round(originalX),
          y: Math.round(originalY),
          width: Math.round(originalWidth),
          height: Math.round(originalHeight),
        },
      });

      console.log('Crop applied:', {
        display: cropBox,
        original: {
          x: Math.round(originalX),
          y: Math.round(originalY),
          width: Math.round(originalWidth),
          height: Math.round(originalHeight),
        },
      });
    }
  };

  const handleReset = () => {
    // Reset crop box to center 60% of image
    if (imageDisplay) {
      const boxWidth = imageDisplay.displayWidth * 0.6;
      const boxHeight = imageDisplay.displayHeight * 0.6;
      const boxX = imageDisplay.offsetX + (imageDisplay.displayWidth - boxWidth) / 2;
      const boxY = imageDisplay.offsetY + (imageDisplay.displayHeight - boxHeight) / 2;

      setCropBox({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
      });
    }

    // Reset zoom
    setZoom(1);

    // Reset aspect ratio
    setAspectRatio(null);

    console.log('Crop settings reset to defaults');
  };

  const handleCancel = () => {
    setIsCropEnabled(false);
    setAspectRatio(null);
    setImageSrc(null);
    if (onCropChange) {
      onCropChange(null);
    }
  };

  const handleOrientationChange = (newOrientation) => {
    if (newOrientation === orientation) return;

    setOrientation(newOrientation);

    // Swap crop box dimensions if aspect ratio is set
    if (aspectRatio && aspectRatio !== 1 && imageDisplay) {
      const centerX = cropBox.x + cropBox.width / 2;
      const centerY = cropBox.y + cropBox.height / 2;

      // Swap width and height
      const newWidth = cropBox.height;
      const newHeight = cropBox.width;

      setCropBox({
        x: centerX - newWidth / 2,
        y: centerY - newHeight / 2,
        width: newWidth,
        height: newHeight,
      });

      console.log(`Orientation changed to ${newOrientation}, box dimensions swapped`);
    }
  };

  const handleToggleCrop = () => {
    const newState = !isCropEnabled;
    setIsCropEnabled(newState);
    if (!newState && onCropChange) {
      onCropChange(null);
    }
  };

  const handleImageError = (e) => {
    console.error('Image load error:', e);
    setImageError('Failed to load image');
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    console.log('Image loaded successfully:', img.naturalWidth, 'x', img.naturalHeight);

    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      // Calculate base dimensions to fit within container (500px height, with padding)
      const containerWidth = containerRect.width;
      const containerHeight = 500; // Container height
      const padding = 40; // Padding to ensure image doesn't touch edges

      const maxWidth = containerWidth - padding * 2;
      const maxHeight = containerHeight - padding * 2;

      // Calculate base dimensions (zoom 1.0 = fit to container)
      let baseWidth, baseHeight;
      const aspectRatio = img.naturalWidth / img.naturalHeight;

      if (img.naturalWidth / maxWidth > img.naturalHeight / maxHeight) {
        // Width is the limiting factor
        baseWidth = maxWidth;
        baseHeight = maxWidth / aspectRatio;
      } else {
        // Height is the limiting factor
        baseHeight = maxHeight;
        baseWidth = maxHeight * aspectRatio;
      }

      // Apply zoom to get display dimensions
      const displayWidth = baseWidth * zoom;
      const displayHeight = baseHeight * zoom;

      // Center the image in container
      const offsetX = (containerWidth - displayWidth) / 2;
      const offsetY = (containerHeight - displayHeight) / 2;

      console.log('Image display:', {
        baseWidth,
        baseHeight,
        displayWidth,
        displayHeight,
        offsetX,
        offsetY,
        containerWidth,
        containerHeight
      });

      setImageDisplay({
        baseWidth,
        baseHeight,
        displayWidth,
        displayHeight,
        offsetX,
        offsetY,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });

      // Initialize crop box at center, 60% of image size
      const boxWidth = displayWidth * 0.6;
      const boxHeight = displayHeight * 0.6;
      const boxX = offsetX + (displayWidth - boxWidth) / 2;
      const boxY = offsetY + (displayHeight - boxHeight) / 2;

      setCropBox({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
      });

      console.log('Crop box initialized:', { x: boxX, y: boxY, width: boxWidth, height: boxHeight });
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialBoxX: cropBox.x,
      initialBoxY: cropBox.y,
    });

    console.log('Drag start:', { x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();

    setResizing({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialBox: { ...cropBox },
    });

    console.log('Resize start:', handle);
  };

  const handleMouseMove = (e) => {
    if (!imageDisplay) return;

    // Handle dragging (moving the box)
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newX = dragStart.initialBoxX + deltaX;
      let newY = dragStart.initialBoxY + deltaY;

      // Apply container boundaries only (allow box to extend beyond image)
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const minX = -cropBox.width + 50; // Allow box to extend left, keep 50px visible
        const minY = -cropBox.height + 50; // Allow box to extend top, keep 50px visible
        const maxX = containerRect.width - 50; // Allow box to extend right
        const maxY = containerRect.height - 50; // Allow box to extend bottom

        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));
      }

      setCropBox(prev => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    }

    // Handle resizing
    if (resizing) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const { initialBox, handle } = resizing;

      let newX = initialBox.x;
      let newY = initialBox.y;
      let newWidth = initialBox.width;
      let newHeight = initialBox.height;

      const minSize = 50;

      // Calculate new dimensions based on handle
      if (handle === 'nw') {
        // Northwest handle - resize from top-left
        newX = initialBox.x + deltaX;
        newY = initialBox.y + deltaY;
        newWidth = initialBox.width - deltaX;
        newHeight = initialBox.height - deltaY;
      } else if (handle === 'ne') {
        // Northeast handle - resize from top-right
        newY = initialBox.y + deltaY;
        newWidth = initialBox.width + deltaX;
        newHeight = initialBox.height - deltaY;
      } else if (handle === 'sw') {
        // Southwest handle - resize from bottom-left
        newX = initialBox.x + deltaX;
        newWidth = initialBox.width - deltaX;
        newHeight = initialBox.height + deltaY;
      } else if (handle === 'se') {
        // Southeast handle - resize from bottom-right
        newWidth = initialBox.width + deltaX;
        newHeight = initialBox.height + deltaY;
      }

      // Apply aspect ratio if set
      if (aspectRatio !== null) {
        // Calculate which dimension to base the resize on
        const widthBasedHeight = newWidth / aspectRatio;
        const heightBasedWidth = newHeight * aspectRatio;

        // Use the larger dimension to avoid shrinking too much
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Width change is dominant
          newHeight = widthBasedHeight;

          // Adjust Y position for top handles
          if (handle === 'nw' || handle === 'ne') {
            newY = initialBox.y + initialBox.height - newHeight;
          }
        } else {
          // Height change is dominant
          newWidth = heightBasedWidth;

          // Adjust X position for left handles
          if (handle === 'nw' || handle === 'sw') {
            newX = initialBox.x + initialBox.width - newWidth;
          }
        }
      }

      // Apply minimum size constraint
      if (newWidth < minSize) {
        newWidth = minSize;
        if (handle === 'nw' || handle === 'sw') {
          newX = initialBox.x + initialBox.width - minSize;
        }
      }

      if (newHeight < minSize) {
        newHeight = minSize;
        if (handle === 'nw' || handle === 'ne') {
          newY = initialBox.y + initialBox.height - minSize;
        }
      }

      // Final validation - ensure minimum size (no image boundary constraints)
      if (newWidth >= minSize && newHeight >= minSize) {
        setCropBox({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log('Drag end');
      setIsDragging(false);
    }
    if (resizing) {
      console.log('Resize end');
      setResizing(null);
    }
  };

  // Add window event listeners for drag and resize
  useEffect(() => {
    if (isDragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, resizing, dragStart, cropBox, imageDisplay]);

  // Adjust crop box when aspect ratio changes
  useEffect(() => {
    if (!imageDisplay || !cropBox.width) return;

    if (aspectRatio !== null) {
      // Calculate center point of current box
      const centerX = cropBox.x + cropBox.width / 2;
      const centerY = cropBox.y + cropBox.height / 2;

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = cropBox.width;
      let newHeight = newWidth / aspectRatio;

      // If new height exceeds image bounds, adjust based on height instead
      if (newHeight > imageDisplay.displayHeight) {
        newHeight = imageDisplay.displayHeight * 0.8;
        newWidth = newHeight * aspectRatio;
      }

      // If new width exceeds image bounds, adjust
      if (newWidth > imageDisplay.displayWidth) {
        newWidth = imageDisplay.displayWidth * 0.8;
        newHeight = newWidth / aspectRatio;
      }

      // Calculate new position to keep center point
      let newX = centerX - newWidth / 2;
      let newY = centerY - newHeight / 2;

      // Ensure box stays within image bounds
      const minX = imageDisplay.offsetX;
      const minY = imageDisplay.offsetY;
      const maxX = imageDisplay.offsetX + imageDisplay.displayWidth - newWidth;
      const maxY = imageDisplay.offsetY + imageDisplay.displayHeight - newHeight;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));

      setCropBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });

      console.log('Aspect ratio changed:', aspectRatio, { width: newWidth, height: newHeight });
    }
  }, [aspectRatio, imageDisplay]);

  // Update image display and crop box when zoom changes
  useEffect(() => {
    if (!imageDisplay || !imageDisplay.baseWidth) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Get current zoom before change
    const currentZoom = imageDisplay.displayWidth / imageDisplay.baseWidth;
    if (Math.abs(currentZoom - zoom) < 0.01) return; // No significant change

    const containerWidth = containerRect.width;
    const containerHeight = 500;

    // Calculate new dimensions with zoom
    const newDisplayWidth = imageDisplay.baseWidth * zoom;
    const newDisplayHeight = imageDisplay.baseHeight * zoom;

    // Calculate new offset to keep image centered in container
    const newOffsetX = (containerWidth - newDisplayWidth) / 2;
    const newOffsetY = (containerHeight - newDisplayHeight) / 2;

    // Calculate zoom scale ratio
    const scaleRatio = zoom / currentZoom;

    // Get crop box center in container coordinates
    const cropCenterX = cropBox.x + cropBox.width / 2;
    const cropCenterY = cropBox.y + cropBox.height / 2;

    // Calculate new crop box dimensions
    const newBoxWidth = cropBox.width * scaleRatio;
    const newBoxHeight = cropBox.height * scaleRatio;

    // Adjust crop box position to maintain its center relative to container
    const newBoxX = cropCenterX - newBoxWidth / 2;
    const newBoxY = cropCenterY - newBoxHeight / 2;

    // Update image display
    setImageDisplay(prev => ({
      ...prev,
      displayWidth: newDisplayWidth,
      displayHeight: newDisplayHeight,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    }));

    // Update crop box
    setCropBox({
      x: newBoxX,
      y: newBoxY,
      width: newBoxWidth,
      height: newBoxHeight,
    });

    console.log('Zoom changed to:', zoom, { scaleRatio, newDisplayWidth, newDisplayHeight });
  }, [zoom]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Crop Image</h2>
            {isCropEnabled && (
              <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                Active
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
            {/* Crop Enable Toggle */}
            <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCropEnabled}
                  onChange={handleToggleCrop}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700 font-medium">Enable Cropping</span>
              </label>
            </div>

            {isCropEnabled && (
              <>
                {/* Image Display Area */}
                <div className="mb-4 sm:mb-6">
                  <div
                    ref={containerRef}
                    className="relative w-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ height: '500px' }}
                  >
                    {imageSrc ? (
                      <>
                        <img
                          ref={imageRef}
                          src={imageSrc}
                          alt="Crop preview"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          className="absolute"
                          style={{
                            width: imageDisplay ? `${imageDisplay.displayWidth}px` : 'auto',
                            height: imageDisplay ? `${imageDisplay.displayHeight}px` : 'auto',
                            left: imageDisplay ? `${imageDisplay.offsetX}px` : '50%',
                            top: imageDisplay ? `${imageDisplay.offsetY}px` : '50%',
                            transform: !imageDisplay ? 'translate(-50%, -50%)' : 'none'
                          }}
                        />

                        {/* Crop Box and Overlay */}
                        {imageDisplay && (
                          <>
                            {/* Dark overlay - Clip to image area only */}
                            <div
                              className="absolute bg-black bg-opacity-50 pointer-events-none"
                              style={{
                                left: `${imageDisplay.offsetX}px`,
                                top: `${imageDisplay.offsetY}px`,
                                width: `${imageDisplay.displayWidth}px`,
                                height: `${imageDisplay.displayHeight}px`,
                                clipPath: `polygon(
                                  0% 0%,
                                  100% 0%,
                                  100% 100%,
                                  0% 100%,
                                  0% 0%,
                                  ${Math.max(0, cropBox.x - imageDisplay.offsetX)}px ${Math.max(0, cropBox.y - imageDisplay.offsetY)}px,
                                  ${Math.max(0, cropBox.x - imageDisplay.offsetX)}px ${Math.min(imageDisplay.displayHeight, cropBox.y + cropBox.height - imageDisplay.offsetY)}px,
                                  ${Math.min(imageDisplay.displayWidth, cropBox.x + cropBox.width - imageDisplay.offsetX)}px ${Math.min(imageDisplay.displayHeight, cropBox.y + cropBox.height - imageDisplay.offsetY)}px,
                                  ${Math.min(imageDisplay.displayWidth, cropBox.x + cropBox.width - imageDisplay.offsetX)}px ${Math.max(0, cropBox.y - imageDisplay.offsetY)}px,
                                  ${Math.max(0, cropBox.x - imageDisplay.offsetX)}px ${Math.max(0, cropBox.y - imageDisplay.offsetY)}px
                                )`,
                              }}
                            />

                            {/* Crop Box */}
                            <div
                              className="absolute border-2 border-dashed border-white cursor-move"
                              style={{
                                left: `${cropBox.x}px`,
                                top: `${cropBox.y}px`,
                                width: `${cropBox.width}px`,
                                height: `${cropBox.height}px`,
                                zIndex: 10,
                              }}
                              onMouseDown={handleMouseDown}
                            >
                              {/* Resize Handles */}
                              {/* Northwest handle */}
                              <div
                                className="absolute bg-white border-2 border-blue-500"
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  top: '-6px',
                                  left: '-6px',
                                  cursor: 'nwse-resize',
                                  zIndex: 20,
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                              />

                              {/* Northeast handle */}
                              <div
                                className="absolute bg-white border-2 border-blue-500"
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  top: '-6px',
                                  right: '-6px',
                                  cursor: 'nesw-resize',
                                  zIndex: 20,
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                              />

                              {/* Southwest handle */}
                              <div
                                className="absolute bg-white border-2 border-blue-500"
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  bottom: '-6px',
                                  left: '-6px',
                                  cursor: 'nesw-resize',
                                  zIndex: 20,
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                              />

                              {/* Southeast handle */}
                              <div
                                className="absolute bg-white border-2 border-blue-500"
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  bottom: '-6px',
                                  right: '-6px',
                                  cursor: 'nwse-resize',
                                  zIndex: 20,
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                              />
                            </div>
                          </>
                        )}

                        {imageError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90">
                            <p className="text-red-600 font-medium">{imageError}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-center">
                        <p>Loading image...</p>
                      </div>
                    )}
                  </div>

                  {/* Crop Info */}
                  {imageDisplay && (
                    <div className="mt-2 text-sm text-center text-gray-600">
                      <p>Selection Area: {Math.round(cropBox.width)} × {Math.round(cropBox.height)} px (display size)</p>
                      {imageDisplay.naturalWidth && (
                        <p className="text-xs text-gray-500 mt-1">
                          Original Image: {imageDisplay.naturalWidth} × {imageDisplay.naturalHeight} px
                        </p>
                      )}
                    </div>
                  )}

                  {/* Debug Info */}
                  {file && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>File: {file.name}</p>
                      <p>Type: {file.type}</p>
                      <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  )}
                </div>

                {/* Zoom Slider */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Zoom: <span className="text-indigo-600 font-bold">{zoom.toFixed(1)}x</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 min-w-[2.5rem]">0.5x</span>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs text-gray-600 min-w-[2.5rem]">3.0x</span>
                  </div>
                </div>

                {/* Aspect Ratio Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Aspect Ratio</label>
                  {/* Orientation Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleOrientationChange('landscape')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                        orientation === 'landscape'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Landscape
                    </button>
                    <button
                      onClick={() => handleOrientationChange('portrait')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                        orientation === 'portrait'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Portrait
                    </button>
                  </div>

                  {/* Aspect Ratio Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {aspectRatios.map((ratio, index) => {
                      const actualValue = getAspectRatioValue(ratio.baseValue);
                      return (
                        <button
                          key={index}
                          onClick={() => setAspectRatio(actualValue)}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium min-h-[44px] transition-colors ${
                            aspectRatio === actualValue
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {ratio.displayName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleApply}
                    className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-indigo-600 text-white rounded-lg font-bold text-base hover:bg-indigo-700 shadow-md transition-all min-h-[44px]"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-gray-100 text-gray-700 rounded-lg font-bold text-base hover:bg-gray-200 shadow-md transition-all min-h-[44px]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-gray-600 text-white rounded-lg font-bold text-base hover:bg-gray-700 shadow-md transition-all min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {!isCropEnabled && (
              <div className="text-center py-8 text-gray-500">
                Check the box above to enable cropping
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
