/**
 * Download an image blob as a file
 * @param {Blob} blob - The image blob to download
 * @param {string} fileName - The file name (already processed by generateFileName)
 * @param {string} format - The target format ('jpg', 'png', or 'webp') - not used anymore but kept for backward compatibility
 */
export default function downloadImage(blob, fileName, format) {
  // Create blob URL
  const blobUrl = URL.createObjectURL(blob);

  // Create temporary anchor element
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
