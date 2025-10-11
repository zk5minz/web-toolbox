/**
 * Convert image to JPG format
 * @param {File} file - The image file to convert
 * @param {number} quality - JPEG quality (0-1), default 0.9
 * @param {Object} resizeOptions - Optional resize dimensions {width, height}
 * @param {Object} transformOptions - Optional transform {rotation, flipHorizontal, flipVertical}
 * @param {Object} cropOptions - Optional crop area {enabled, area: {x, y, width, height}}
 * @param {Object} paddingOptions - Optional padding {enabled, padding: {top, right, bottom, left}, backgroundColor}
 * @param {Object} watermarkOptions - Optional watermark {enabled, type, ...}
 * @param {Object} filterOptions - Optional filters {brightness, contrast, saturation, hue, sepia}
 * @returns {Promise<Blob>} - The converted image blob
 */
export async function convertToJPG(file, quality = 0.9, resizeOptions = null, transformOptions = null, cropOptions = null, paddingOptions = null, watermarkOptions = null, filterOptions = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Apply crop first if enabled
        let sourceImg = img;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let cropOffsetX = 0;
        let cropOffsetY = 0;

        if (cropOptions?.enabled && cropOptions?.area) {
          const { x, y, width, height } = cropOptions.area;
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');

          cropCanvas.width = width;
          cropCanvas.height = height;

          // Fill white background (JPG doesn't support transparency)
          cropCtx.fillStyle = '#FFFFFF';
          cropCtx.fillRect(0, 0, width, height);

          // Calculate source coordinates (what part of the image to draw)
          const sourceX = Math.max(0, x);
          const sourceY = Math.max(0, y);
          const sourceRight = Math.min(img.width, x + width);
          const sourceBottom = Math.min(img.height, y + height);
          const sourceDrawWidth = sourceRight - sourceX;
          const sourceDrawHeight = sourceBottom - sourceY;

          // Calculate destination coordinates (where to draw on canvas)
          const destX = Math.max(0, -x);
          const destY = Math.max(0, -y);

          // Draw the image portion
          if (sourceDrawWidth > 0 && sourceDrawHeight > 0) {
            cropCtx.drawImage(
              img,
              sourceX,
              sourceY,
              sourceDrawWidth,
              sourceDrawHeight,
              destX,
              destY,
              sourceDrawWidth,
              sourceDrawHeight
            );
          }

          // Create new image from cropped canvas
          const croppedImage = new Image();
          croppedImage.src = cropCanvas.toDataURL();
          sourceImg = croppedImage;
          sourceWidth = width;
          sourceHeight = height;
        }

        const canvas = document.createElement('canvas');

        // Use resize dimensions if provided, otherwise use source dimensions
        let targetWidth = resizeOptions?.width || sourceWidth;
        let targetHeight = resizeOptions?.height || sourceHeight;

        // Adjust canvas size for rotation
        const rotation = transformOptions?.rotation || 0;
        if (rotation === 90 || rotation === 270) {
          canvas.width = targetHeight;
          canvas.height = targetWidth;
        } else {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
        }

        const ctx = canvas.getContext('2d');

        // Fill white background (JPG doesn't support transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Wait for cropped image to load if cropping was applied
        const applyTransform = async () => {
          applyTransformations(ctx, sourceImg, canvas.width, canvas.height, targetWidth, targetHeight, transformOptions);

          // Apply filters if enabled
          let finalCanvas = applyFilters(canvas, filterOptions);

          // Apply padding if enabled
          finalCanvas = applyPadding(finalCanvas, paddingOptions);

          // Apply watermark if enabled
          finalCanvas = await applyWatermark(finalCanvas, watermarkOptions);

          // Convert to blob
          finalCanvas.toBlob(
            (blob) => {
              if (blob) {
                console.log('JPG conversion complete, final size:', finalCanvas.width, 'x', finalCanvas.height);
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image to JPG'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        if (cropOptions?.enabled && cropOptions?.area) {
          sourceImg.onload = applyTransform;
        } else {
          applyTransform();
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to PNG format
 * @param {File} file - The image file to convert
 * @param {Object} resizeOptions - Optional resize dimensions {width, height}
 * @param {Object} transformOptions - Optional transform {rotation, flipHorizontal, flipVertical}
 * @param {Object} cropOptions - Optional crop area {enabled, area: {x, y, width, height}}
 * @param {Object} paddingOptions - Optional padding {enabled, padding: {top, right, bottom, left}, backgroundColor}
 * @param {Object} watermarkOptions - Optional watermark {enabled, type, ...}
 * @param {Object} filterOptions - Optional filters {brightness, contrast, saturation, hue, sepia}
 * @returns {Promise<Blob>} - The converted image blob
 */
export async function convertToPNG(file, resizeOptions = null, transformOptions = null, cropOptions = null, paddingOptions = null, watermarkOptions = null, filterOptions = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Apply crop first if enabled
        let sourceImg = img;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (cropOptions?.enabled && cropOptions?.area) {
          const { x, y, width, height } = cropOptions.area;
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');

          cropCanvas.width = width;
          cropCanvas.height = height;

          // PNG supports transparency - no background fill needed

          // Calculate source coordinates (what part of the image to draw)
          const sourceX = Math.max(0, x);
          const sourceY = Math.max(0, y);
          const sourceRight = Math.min(img.width, x + width);
          const sourceBottom = Math.min(img.height, y + height);
          const sourceDrawWidth = sourceRight - sourceX;
          const sourceDrawHeight = sourceBottom - sourceY;

          // Calculate destination coordinates (where to draw on canvas)
          const destX = Math.max(0, -x);
          const destY = Math.max(0, -y);

          // Draw the image portion
          if (sourceDrawWidth > 0 && sourceDrawHeight > 0) {
            cropCtx.drawImage(
              img,
              sourceX,
              sourceY,
              sourceDrawWidth,
              sourceDrawHeight,
              destX,
              destY,
              sourceDrawWidth,
              sourceDrawHeight
            );
          }

          const croppedImage = new Image();
          croppedImage.src = cropCanvas.toDataURL();
          sourceImg = croppedImage;
          sourceWidth = width;
          sourceHeight = height;
        }

        const canvas = document.createElement('canvas');

        // Use resize dimensions if provided, otherwise use source dimensions
        let targetWidth = resizeOptions?.width || sourceWidth;
        let targetHeight = resizeOptions?.height || sourceHeight;

        // Adjust canvas size for rotation
        const rotation = transformOptions?.rotation || 0;
        if (rotation === 90 || rotation === 270) {
          canvas.width = targetHeight;
          canvas.height = targetWidth;
        } else {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
        }

        const ctx = canvas.getContext('2d');

        const applyTransform = async () => {
          // Apply transformations
          applyTransformations(ctx, sourceImg, canvas.width, canvas.height, targetWidth, targetHeight, transformOptions);

          // Apply filters if enabled
          let finalCanvas = applyFilters(canvas, filterOptions);

          // Apply padding if enabled
          finalCanvas = applyPadding(finalCanvas, paddingOptions);

          // Apply watermark if enabled
          finalCanvas = await applyWatermark(finalCanvas, watermarkOptions);

          // Convert to blob
          finalCanvas.toBlob(
            (blob) => {
              if (blob) {
                console.log('PNG conversion complete, final size:', finalCanvas.width, 'x', finalCanvas.height);
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image to PNG'));
              }
            },
            'image/png'
          );
        };

        if (cropOptions?.enabled && cropOptions?.area) {
          sourceImg.onload = applyTransform;
        } else {
          applyTransform();
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to WEBP format
 * @param {File} file - The image file to convert
 * @param {number} quality - WEBP quality (0-1), default 0.9
 * @param {Object} resizeOptions - Optional resize dimensions {width, height}
 * @param {Object} transformOptions - Optional transform {rotation, flipHorizontal, flipVertical}
 * @param {Object} cropOptions - Optional crop area {enabled, area: {x, y, width, height}}
 * @param {Object} paddingOptions - Optional padding {enabled, padding: {top, right, bottom, left}, backgroundColor}
 * @param {Object} watermarkOptions - Optional watermark {enabled, type, ...}
 * @param {Object} filterOptions - Optional filters {brightness, contrast, saturation, hue, sepia}
 * @returns {Promise<Blob>} - The converted image blob
 */
export async function convertToWEBP(file, quality = 0.9, resizeOptions = null, transformOptions = null, cropOptions = null, paddingOptions = null, watermarkOptions = null, filterOptions = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Apply crop first if enabled
        let sourceImg = img;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (cropOptions?.enabled && cropOptions?.area) {
          const { x, y, width, height } = cropOptions.area;
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');

          cropCanvas.width = width;
          cropCanvas.height = height;

          // Fill white background (WEBP with white background for compatibility)
          cropCtx.fillStyle = '#FFFFFF';
          cropCtx.fillRect(0, 0, width, height);

          // Calculate source coordinates (what part of the image to draw)
          const sourceX = Math.max(0, x);
          const sourceY = Math.max(0, y);
          const sourceRight = Math.min(img.width, x + width);
          const sourceBottom = Math.min(img.height, y + height);
          const sourceDrawWidth = sourceRight - sourceX;
          const sourceDrawHeight = sourceBottom - sourceY;

          // Calculate destination coordinates (where to draw on canvas)
          const destX = Math.max(0, -x);
          const destY = Math.max(0, -y);

          // Draw the image portion
          if (sourceDrawWidth > 0 && sourceDrawHeight > 0) {
            cropCtx.drawImage(
              img,
              sourceX,
              sourceY,
              sourceDrawWidth,
              sourceDrawHeight,
              destX,
              destY,
              sourceDrawWidth,
              sourceDrawHeight
            );
          }

          const croppedImage = new Image();
          croppedImage.src = cropCanvas.toDataURL();
          sourceImg = croppedImage;
          sourceWidth = width;
          sourceHeight = height;
        }

        const canvas = document.createElement('canvas');

        // Use resize dimensions if provided, otherwise use source dimensions
        let targetWidth = resizeOptions?.width || sourceWidth;
        let targetHeight = resizeOptions?.height || sourceHeight;

        // Adjust canvas size for rotation
        const rotation = transformOptions?.rotation || 0;
        if (rotation === 90 || rotation === 270) {
          canvas.width = targetHeight;
          canvas.height = targetWidth;
        } else {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
        }

        const ctx = canvas.getContext('2d');

        const applyTransform = async () => {
          // Apply transformations
          applyTransformations(ctx, sourceImg, canvas.width, canvas.height, targetWidth, targetHeight, transformOptions);

          // Apply filters if enabled
          let finalCanvas = applyFilters(canvas, filterOptions);

          // Apply padding if enabled
          finalCanvas = applyPadding(finalCanvas, paddingOptions);

          // Apply watermark if enabled
          finalCanvas = await applyWatermark(finalCanvas, watermarkOptions);

          // Convert to blob
          finalCanvas.toBlob(
            (blob) => {
              if (blob) {
                console.log('WEBP conversion complete, final size:', finalCanvas.width, 'x', finalCanvas.height);
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image to WEBP'));
              }
            },
            'image/webp',
            quality
          );
        };

        if (cropOptions?.enabled && cropOptions?.area) {
          sourceImg.onload = applyTransform;
        } else {
          applyTransform();
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert images to PDF format
 * @param {File|File[]} files - Single file or array of image files
 * @param {number} quality - Image quality (0-1), default 0.9
 * @param {Object} resizeOptions - Optional resize dimensions {width, height}
 * @param {Object} transformOptions - Optional transform {rotation, flipHorizontal, flipVertical}
 * @param {Object} cropOptions - Optional crop area {enabled, area: {x, y, width, height}}
 * @param {Object} paddingOptions - Optional padding {enabled, padding: {top, right, bottom, left}, backgroundColor}
 * @param {Object} watermarkOptions - Optional watermark {enabled, type, ...}
 * @param {Object} filterOptions - Optional filters {brightness, contrast, saturation, hue, sepia}
 * @returns {Promise<Blob>} - The PDF blob
 */
export async function convertToPDF(files, quality = 0.9, resizeOptions = null, transformOptions = null, cropOptions = null, paddingOptions = null, watermarkOptions = null, filterOptions = null) {
  const { jsPDF } = await import('jspdf');

  // Ensure files is an array
  const fileArray = Array.isArray(files) ? files : [files];

  return new Promise(async (resolve, reject) => {
    try {
      let pdf = null;

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Convert image to data URL first
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target.result);
          reader.onerror = () => rej(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        // Load image to get dimensions
        const img = await new Promise((res, rej) => {
          const image = new Image();
          image.onload = () => res(image);
          image.onerror = () => rej(new Error('Failed to load image'));
          image.src = dataUrl;
        });

        // Apply transformations to canvas
        const canvas = document.createElement('canvas');
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // Apply crop if enabled
        if (cropOptions?.enabled && cropOptions?.area) {
          const { x, y, width, height } = cropOptions.area;
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');

          cropCanvas.width = width;
          cropCanvas.height = height;

          const sourceX = Math.max(0, x);
          const sourceY = Math.max(0, y);
          const sourceRight = Math.min(img.width, x + width);
          const sourceBottom = Math.min(img.height, y + height);
          const sourceDrawWidth = sourceRight - sourceX;
          const sourceDrawHeight = sourceBottom - sourceY;
          const destX = Math.max(0, -x);
          const destY = Math.max(0, -y);

          cropCtx.fillStyle = '#FFFFFF';
          cropCtx.fillRect(0, 0, width, height);

          if (sourceDrawWidth > 0 && sourceDrawHeight > 0) {
            cropCtx.drawImage(img, sourceX, sourceY, sourceDrawWidth, sourceDrawHeight, destX, destY, sourceDrawWidth, sourceDrawHeight);
          }

          sourceWidth = width;
          sourceHeight = height;
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(cropCanvas, 0, 0);
        } else {
          canvas.width = sourceWidth;
          canvas.height = sourceHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
        }

        // Apply resize
        let finalWidth = resizeOptions?.width || sourceWidth;
        let finalHeight = resizeOptions?.height || sourceHeight;

        // Apply transformations
        const transformedCanvas = document.createElement('canvas');
        const rotation = transformOptions?.rotation || 0;
        if (rotation === 90 || rotation === 270) {
          transformedCanvas.width = finalHeight;
          transformedCanvas.height = finalWidth;
        } else {
          transformedCanvas.width = finalWidth;
          transformedCanvas.height = finalHeight;
        }

        const ctx = transformedCanvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, transformedCanvas.width, transformedCanvas.height);
        applyTransformations(ctx, canvas, transformedCanvas.width, transformedCanvas.height, finalWidth, finalHeight, transformOptions);

        // Apply filters if enabled
        let finalCanvas = applyFilters(transformedCanvas, filterOptions);

        // Apply padding if enabled
        finalCanvas = applyPadding(finalCanvas, paddingOptions);

        // Apply watermark if enabled
        finalCanvas = await applyWatermark(finalCanvas, watermarkOptions);

        const finalDataUrl = finalCanvas.toDataURL('image/jpeg', quality);

        // Create or add to PDF - use final canvas dimensions
        const mmWidth = finalCanvas.width * 0.264583; // px to mm
        const mmHeight = finalCanvas.height * 0.264583;

        if (i === 0) {
          pdf = new jsPDF({
            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [mmWidth, mmHeight]
          });
        } else {
          pdf.addPage([mmWidth, mmHeight], mmWidth > mmHeight ? 'landscape' : 'portrait');
        }

        pdf.addImage(finalDataUrl, 'JPEG', 0, 0, mmWidth, mmHeight);
      }

      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert single image to individual PDF
 * @param {File} file - Image file
 * @param {number} quality - Quality setting
 * @param {Object} resizeOptions - Resize options
 * @param {Object} transformOptions - Transform options
 * @param {Object} cropOptions - Crop options
 * @param {Object} paddingOptions - Padding options
 * @param {Object} watermarkOptions - Watermark options
 * @param {Object} filterOptions - Filter options
 * @returns {Promise<Blob>} - PDF blob
 */
export async function convertSingleImageToPDF(file, quality = 0.9, resizeOptions = null, transformOptions = null, cropOptions = null, paddingOptions = null, watermarkOptions = null, filterOptions = null) {
  return convertToPDF([file], quality, resizeOptions, transformOptions, cropOptions, paddingOptions, watermarkOptions, filterOptions);
}

/**
 * Convert PDF to images
 * @param {File} pdfFile - The PDF file
 * @param {string} format - Output format (jpg, png, webp)
 * @param {number} quality - Image quality (0-1), default 0.9
 * @param {number} scale - Scale factor for resolution, default 2
 * @returns {Promise<Blob[]>} - Array of image blobs
 */
export async function convertPDFToImages(pdfFile, format = 'png', quality = 0.9, scale = 2) {
  console.log('Starting PDF to images conversion:', { fileName: pdfFile.name, format, quality, scale });

  try {
    // Dynamic import of pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    console.log('pdfjs-dist loaded, version:', pdfjsLib.version);

    // Set worker source - use local worker file from public folder
    const workerSrc = '/pdf.worker.min.mjs';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('Worker source set to:', workerSrc);

    // Read PDF file as ArrayBuffer
    console.log('Reading PDF file...');
    const arrayBuffer = await pdfFile.arrayBuffer();
    console.log('PDF file read, size:', arrayBuffer.byteLength, 'bytes');

    // Load PDF document
    console.log('Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    const imageBlobs = [];

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}...`);

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        console.log(`Page ${pageNum} viewport:`, { width: viewport.width, height: viewport.height });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        console.log(`Page ${pageNum} rendered to canvas`);

        // Convert canvas to blob
        const blob = await new Promise((res, rej) => {
          const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
          const qualityParam = (format === 'jpg' || format === 'webp') ? quality : undefined;

          canvas.toBlob((b) => {
            if (b) {
              console.log(`Page ${pageNum} converted to blob, size:`, b.size);
              res(b);
            } else {
              rej(new Error(`Failed to convert page ${pageNum} to blob`));
            }
          }, mimeType, qualityParam);
        });

        imageBlobs.push(blob);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        throw new Error(`Failed to process page ${pageNum}: ${pageError.message}`);
      }
    }

    console.log('PDF to images conversion completed successfully');
    return imageBlobs;
  } catch (error) {
    console.error('PDF to images conversion failed:', error);
    console.error('Error stack:', error.stack);
    throw new Error('PDF conversion failed: ' + error.message);
  }
}

/**
 * Get image dimensions from file
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Apply transformations (rotation and flip) to canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Image} img - Source image
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} targetWidth - Target image width
 * @param {number} targetHeight - Target image height
 * @param {Object} transformOptions - Transform options {rotation, flipHorizontal, flipVertical}
 */
function applyTransformations(ctx, img, canvasWidth, canvasHeight, targetWidth, targetHeight, transformOptions) {
  const rotation = transformOptions?.rotation || 0;
  const flipH = transformOptions?.flipHorizontal || false;
  const flipV = transformOptions?.flipVertical || false;

  ctx.save();

  // Move to center for rotation
  ctx.translate(canvasWidth / 2, canvasHeight / 2);

  // Apply rotation
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Apply flip
  const scaleX = flipH ? -1 : 1;
  const scaleY = flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Draw image centered
  if (rotation === 90 || rotation === 270) {
    ctx.drawImage(img, -targetHeight / 2, -targetWidth / 2, targetHeight, targetWidth);
  } else {
    ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  }

  ctx.restore();
}

/**
 * Apply padding to canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas to add padding to
 * @param {Object} paddingOptions - Padding options {padding: {top, right, bottom, left}, backgroundColor}
 * @returns {HTMLCanvasElement} - New canvas with padding
 */
function applyPadding(sourceCanvas, paddingOptions) {
  if (!paddingOptions?.enabled || !paddingOptions?.padding) {
    return sourceCanvas;
  }

  const { padding, backgroundColor } = paddingOptions;
  const newWidth = sourceCanvas.width + padding.left + padding.right;
  const newHeight = sourceCanvas.height + padding.top + padding.bottom;

  const paddedCanvas = document.createElement('canvas');
  paddedCanvas.width = newWidth;
  paddedCanvas.height = newHeight;
  const ctx = paddedCanvas.getContext('2d');

  // Fill background
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor === 'white' ? '#FFFFFF' : backgroundColor === 'black' ? '#000000' : backgroundColor;
    ctx.fillRect(0, 0, newWidth, newHeight);
  }

  // Draw source image with padding offset
  ctx.drawImage(sourceCanvas, padding.left, padding.top);

  return paddedCanvas;
}

/**
 * Apply watermark to canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas to add watermark to
 * @param {Object} watermarkOptions - Watermark options
 * @returns {Promise<HTMLCanvasElement>} - Canvas with watermark applied
 */
async function applyWatermark(sourceCanvas, watermarkOptions) {
  if (!watermarkOptions?.enabled) {
    return sourceCanvas;
  }

  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d');

  // Draw source image first
  ctx.drawImage(sourceCanvas, 0, 0);

  const { type, position, margin } = watermarkOptions;

  // Calculate position
  const getPosition = () => {
    const positions = {
      'top-left': { x: margin, y: margin, align: 'left', baseline: 'top' },
      'top-center': { x: canvas.width / 2, y: margin, align: 'center', baseline: 'top' },
      'top-right': { x: canvas.width - margin, y: margin, align: 'right', baseline: 'top' },
      'middle-left': { x: margin, y: canvas.height / 2, align: 'left', baseline: 'middle' },
      'center': { x: canvas.width / 2, y: canvas.height / 2, align: 'center', baseline: 'middle' },
      'middle-right': { x: canvas.width - margin, y: canvas.height / 2, align: 'right', baseline: 'middle' },
      'bottom-left': { x: margin, y: canvas.height - margin, align: 'left', baseline: 'bottom' },
      'bottom-center': { x: canvas.width / 2, y: canvas.height - margin, align: 'center', baseline: 'bottom' },
      'bottom-right': { x: canvas.width - margin, y: canvas.height - margin, align: 'right', baseline: 'bottom' },
    };
    return positions[position] || positions['bottom-right'];
  };

  const pos = getPosition();

  if (type === 'text') {
    const { text, fontSize, fontColor, opacity, fontBold } = watermarkOptions;

    // Set font
    ctx.font = `${fontBold ? 'bold' : 'normal'} ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = fontColor;
    ctx.globalAlpha = opacity;
    ctx.textAlign = pos.align;
    ctx.textBaseline = pos.baseline;

    // Draw text
    ctx.fillText(text, pos.x, pos.y);
    ctx.globalAlpha = 1.0;
  } else if (type === 'image') {
    const { image, size, opacity } = watermarkOptions;

    // Load watermark image
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Calculate watermark dimensions
        const maxWidth = canvas.width * size;
        const maxHeight = canvas.height * size;

        let watermarkWidth = img.width;
        let watermarkHeight = img.height;

        // Scale to fit within size constraint
        if (watermarkWidth > maxWidth || watermarkHeight > maxHeight) {
          const scale = Math.min(maxWidth / watermarkWidth, maxHeight / watermarkHeight);
          watermarkWidth *= scale;
          watermarkHeight *= scale;
        } else {
          const scale = size;
          watermarkWidth *= scale;
          watermarkHeight *= scale;
        }

        // Calculate position based on alignment
        let x = pos.x;
        let y = pos.y;

        if (pos.align === 'center') {
          x -= watermarkWidth / 2;
        } else if (pos.align === 'right') {
          x -= watermarkWidth;
        }

        if (pos.baseline === 'middle') {
          y -= watermarkHeight / 2;
        } else if (pos.baseline === 'bottom') {
          y -= watermarkHeight;
        }

        // Draw watermark image
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x, y, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1.0;

        resolve(canvas);
      };
      img.onerror = () => {
        console.error('Failed to load watermark image');
        resolve(sourceCanvas);
      };
      img.src = image;
    });
  }

  return canvas;
}

/**
 * Apply filters to canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas to apply filters to
 * @param {Object} filterOptions - Filter options {brightness, contrast, saturation, hue, sepia}
 * @returns {HTMLCanvasElement} - Canvas with filters applied
 */
function applyFilters(sourceCanvas, filterOptions) {
  if (!filterOptions?.enabled) {
    return sourceCanvas;
  }

  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d');

  // Draw source image
  ctx.drawImage(sourceCanvas, 0, 0);

  // Get image data for pixel manipulation
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const { brightness = 0, contrast = 0, saturation = 0, hue = 0, sepia = false } = filterOptions;

  // Convert values to proper ranges
  const brightnessValue = brightness * 2.55; // -100~100 to -255~255
  const contrastFactor = (contrast + 100) / 100; // -100~100 to 0~2
  const saturationFactor = (saturation + 100) / 100; // -100~100 to 0~2
  const hueRotation = hue; // 0~360 degrees

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply brightness
    if (brightness !== 0) {
      r += brightnessValue;
      g += brightnessValue;
      b += brightnessValue;
    }

    // Apply contrast
    if (contrast !== 0) {
      r = ((r - 128) * contrastFactor) + 128;
      g = ((g - 128) * contrastFactor) + 128;
      b = ((b - 128) * contrastFactor) + 128;
    }

    // Apply sepia
    if (sepia) {
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = tr;
      g = tg;
      b = tb;
    }

    // Apply saturation and hue
    if (saturation !== 0 || hue !== 0) {
      // Convert RGB to HSL
      const rgb = { r: r / 255, g: g / 255, b: b / 255 };
      const max = Math.max(rgb.r, rgb.g, rgb.b);
      const min = Math.min(rgb.r, rgb.g, rgb.b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case rgb.r:
            h = ((rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0)) / 6;
            break;
          case rgb.g:
            h = ((rgb.b - rgb.r) / d + 2) / 6;
            break;
          case rgb.b:
            h = ((rgb.r - rgb.g) / d + 4) / 6;
            break;
        }
      }

      // Apply hue rotation
      if (hue !== 0) {
        h = (h * 360 + hueRotation) / 360;
        h = h - Math.floor(h); // Keep in 0-1 range
      }

      // Apply saturation
      if (saturation !== 0) {
        s = Math.max(0, Math.min(1, s * saturationFactor));
      }

      // Convert HSL back to RGB
      let r2, g2, b2;
      if (s === 0) {
        r2 = g2 = b2 = l; // achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r2 = hue2rgb(p, q, h + 1/3);
        g2 = hue2rgb(p, q, h);
        b2 = hue2rgb(p, q, h - 1/3);
      }

      r = r2 * 255;
      g = g2 * 255;
      b = b2 * 255;
    }

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
    // Alpha channel (data[i + 3]) remains unchanged
  }

  // Put modified image data back
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}
