import { getCategoryLabel } from './i18n';

/**
 * Format filter key and value into a display label
 *
 * @param {string} filterKey - The filter key (e.g., 'affairStatus', 'affairCategory')
 * @param {string} filterValue - The filter value
 * @param {string} language - Language code ('es' or 'en')
 * @returns {string} Formatted label for display
 */
export const formatFilterLabel = (filterKey, filterValue, language = 'es', getMetadata) => {
  if (!filterValue) {
    return '';
  }

  const normalizedKey = filterKey.toLowerCase();

  if (normalizedKey.includes('compliance')) {
    const metadata = getMetadata?.('compliance', filterValue, language);
    return metadata?.label ?? filterValue;
  }

  if (normalizedKey.includes('workflow')) {
    const metadata = getMetadata?.('workflow', filterValue, language);
    return metadata?.label ?? filterValue;
  }

  if (normalizedKey.includes('lifecycle')) {
    const metadata = getMetadata?.('lifecycle', filterValue, language);
    return metadata?.label ?? filterValue;
  }

  if (normalizedKey.includes('priority')) {
    const metadata = getMetadata?.('priority', filterValue, language);
    return metadata?.label ?? filterValue;
  }

  if (filterKey.endsWith('Category')) {
    if (filterKey === 'assetCategory') {
      return getCategoryLabel(filterValue, language);
    }
    return filterValue;
  }

  if (filterKey.endsWith('Type')) {
    return filterValue;
  }

  // Category filters (affairCategory, assetCategory, attachmentCategory)
  // Default: return the value as-is
  return filterValue;
};

/**
 * Get metadata for a filter (color, icon, etc.)
 * Used for styling filter chips
 *
 * @param {string} filterKey - The filter key
 * @param {string} filterValue - The filter value
 * @returns {object} Metadata object with color, bgColor, textColor
 */
export const getFilterMetadata = (filterKey, filterValue, getMetadata) => {
  const normalizedKey = filterKey.toLowerCase();

  if (normalizedKey.includes('compliance')) {
    const metadata = getMetadata?.('compliance', filterValue);
    return {
      color: metadata?.color,
      bgColor: metadata?.color,
      textColor: metadata?.textColor ?? '#fff',
    };
  }

  if (normalizedKey.includes('workflow')) {
    const metadata = getMetadata?.('workflow', filterValue);
    return {
      color: metadata?.color,
      bgColor: metadata?.color,
      textColor: metadata?.textColor ?? '#fff',
    };
  }

  if (normalizedKey.includes('lifecycle')) {
    const metadata = getMetadata?.('lifecycle', filterValue);
    return {
      color: metadata?.color,
      bgColor: metadata?.color,
      textColor: metadata?.textColor ?? '#fff',
    };
  }

  if (normalizedKey.includes('priority')) {
    const metadata = getMetadata?.('priority', filterValue);
    return {
      color: metadata?.color,
      bgColor: metadata?.color,
      textColor: '#fff',
    };
  }

  return {
    color: 'primary',
    bgColor: null,
    textColor: null,
  };
};
