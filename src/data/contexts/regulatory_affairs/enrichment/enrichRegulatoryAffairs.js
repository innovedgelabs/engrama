import { enrichRegulatoryAffairsDataset } from '../../../enrichRegulatoryAffairs.js';

/**
 * Wrapper to adapt the domain data object to the existing enrichment function.
 * @param {Object} data - Domain data keyed by entity collections.
 * @returns {Object} Data with enriched regulatory affairs and normalized renewals.
 */
export const enrichRegulatoryAffairsData = (data) => {
  const result = enrichRegulatoryAffairsDataset(
    data.regulatory_affairs || [],
    data.renewals || []
  );

  return {
    regulatory_affairs: result.regulatory_affairs,
    renewals: result.renewals,
  };
};

export default enrichRegulatoryAffairsData;
