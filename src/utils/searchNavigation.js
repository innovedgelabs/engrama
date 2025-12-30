import { DEFAULT_LANGUAGE } from './i18nHelpers';
import { getCategorySlug, getRouteSegment, getTabSlug } from './routing';

export const getRouteForSearchResult = (result, language = DEFAULT_LANGUAGE, domainConfig = null) => {
  if (!result || !result.entityType) {
    return null;
  }

  switch (result.entityType) {
    case 'asset':
      return `/${getCategorySlug(result.category, language, domainConfig)}/${result.id}/${getTabSlug('info', 'asset', language, domainConfig)}`;

    case 'affair':
      return `/${getRouteSegment('affair', language, domainConfig)}/${result.id}/${getTabSlug('info', 'affair', language, domainConfig)}`;

    case 'renewal':
      return `/${getRouteSegment('renewal', language, domainConfig)}/${result.id}/${getTabSlug('info', 'renewal', language, domainConfig)}`;

    case 'attachment':
      if (result.renewalId) {
        return `/${getRouteSegment('renewal', language, domainConfig)}/${result.renewalId}/${getTabSlug('attachments', 'renewal', language, domainConfig)}`;
      }

      if (result.assetId && result.context?.assetCategory) {
        return `/${getCategorySlug(result.context.assetCategory, language, domainConfig)}/${result.assetId}/${getTabSlug('dossier', 'asset', language, domainConfig)}`;
      }

      return null;

    default:
      return null;
  }
};
