import { useMemo } from 'react';
import { useDomain } from '../contexts/DomainContext';
import { computeRegAffairsScopedData } from '../utils/scopeGraph';

/**
 * Return domain data filtered to the current user's scope (domain-aware).
 * - regulatory_affairs: graph-based scoping from start nodes
 * - other domains: passthrough
 */
export const useScopedDomainData = (currentUser) => {
  const { currentDomainId, currentData } = useDomain();

  return useMemo(() => {
    if (!currentData) return currentData;
    if (!currentUser) return currentData;

    // Explicit access-all flag bypasses scoping
    if (currentUser?.scopes?.accessAll) {
      return currentData;
    }

    if (currentDomainId === 'regulatory_affairs') {
      const startNodes = currentUser?.scopeStartNodes || [];
      if (!startNodes.length) {
        // Safer default: misconfigured scoped user sees nothing
        return {
          ...currentData,
          assets: [],
          regulatory_affairs: [],
          renewals: [],
          attachments: [],
        };
      }
      return computeRegAffairsScopedData(currentData, startNodes);
    }

    // Other domains unchanged (no scoping applied yet)
    return currentData;
  }, [currentDomainId, currentData, currentUser, currentUser?.scopes, currentUser?.scopeStartNodes]);
};

export default useScopedDomainData;
