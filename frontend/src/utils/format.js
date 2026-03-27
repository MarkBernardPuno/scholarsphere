// Utility functions for date and file path formatting

/**
 * Format a date string as YYYY-MM-DD
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a file path for display (removes 'uploads\' prefix)
 */
export function formatFilePath(filePath) {
  return filePath ? filePath.replace(/^uploads\\/, '') : 'Choose file';
}
