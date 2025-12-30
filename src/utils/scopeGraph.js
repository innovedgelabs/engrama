/**
 * Scope-aware graph utilities
 *
 * Designed to be domain-agnostic: supply a neighbor map and start nodes,
 * and get back the reachable asset IDs plus helpers to filter data.
 */

/**
 * Build an undirected neighbor map from assets using their connections.
 * @param {Array} assets - Array of asset objects with `id` and `connections`
 * @param {Function} getConnections - Optional extractor for connections array
 * @returns {Map<string, Array<{id: string, type?: string}>>}
 */
export const buildUndirectedNeighborMap = (assets = [], getConnections = (asset) => asset?.connections || []) => {
  const neighborMap = new Map();

  const ensureList = (id) => {
    if (!neighborMap.has(id)) {
      neighborMap.set(id, []);
    }
    return neighborMap.get(id);
  };

  assets.forEach((asset) => {
    const connections = Array.isArray(getConnections(asset)) ? getConnections(asset) : [];
    const fromList = ensureList(asset.id);

    connections.forEach((conn) => {
      if (!conn?.id) return;
      fromList.push({ id: conn.id, type: conn.type });
      const toList = ensureList(conn.id);
      toList.push({ id: asset.id, type: conn.type }); // undirected for simplicity
    });
  });

  return neighborMap;
};

/**
 * Get reachable node IDs from a set of start nodes.
 * @param {Iterable<string>} startIds
 * @param {Map<string, Array<{id: string, type?: string}>>} neighborMap
 * @param {Object} options
 * @param {number} options.maxDepth - BFS depth (0 = only start nodes)
 * @param {Set<string>|null} options.allowedTypes - Optional whitelist of edge types
 * @returns {Set<string>}
 */
export const getReachableNodes = (startIds = [], neighborMap = new Map(), options = {}) => {
  const { maxDepth = 1, allowedTypes = null } = options;
  const visited = new Set();
  const queue = [];

  (Array.isArray(startIds) ? startIds : Array.from(startIds || [])).forEach((id) => {
    if (!id) return;
    visited.add(id);
    queue.push({ id, depth: 0 });
  });

  let head = 0;
  while (head < queue.length) {
    const { id, depth } = queue[head++];
    if (depth >= maxDepth) continue;

    const neighbors = neighborMap.get(id) || [];
    neighbors.forEach(({ id: nextId, type }) => {
      if (!nextId) return;
      if (allowedTypes && !allowedTypes.has(type)) return;
      if (visited.has(nextId)) return;
      visited.add(nextId);
      queue.push({ id: nextId, depth: depth + 1 });
    });
  }

  return visited;
};

/**
 * Compute scoped regulatory affairs data for RA domain.
 * Traverses assets graph depth-1 from provided start nodes to derive visibility.
 * @param {Object} data - Domain data object (assets, regulatory_affairs, renewals, attachments)
 * @param {Array<string>} startNodeIds - Asset IDs that define the user's scope
 * @param {Object} options
 * @param {number} options.maxDepth - BFS depth (defaults to 1)
 * @returns {Object} Filtered data object
 */
export const computeRegAffairsScopedData = (data, startNodeIds = [], options = {}) => {
  if (!data || !Array.isArray(startNodeIds) || startNodeIds.length === 0) {
    return data;
  }

  const assets = data.assets || [];
  const neighborMap = buildUndirectedNeighborMap(assets);
  const reachable = getReachableNodes(startNodeIds, neighborMap, {
    maxDepth: options.maxDepth ?? 1,
    allowedTypes: options.allowedTypes || null,
  });

  // Ensure explicit start nodes are included even if not in assets list
  startNodeIds.forEach((id) => reachable.add(id));

  const scopedAssets = assets.filter((asset) => reachable.has(asset.id));
  const affairs = (data.regulatory_affairs || []).filter((affair) => reachable.has(affair.assetId));
  const affairIds = new Set(affairs.map((affair) => affair.id));
  const renewals = (data.renewals || []).filter((renewal) => affairIds.has(renewal.affairId));
  const renewalIds = new Set(renewals.map((renewal) => renewal.id));
  const attachments = (data.attachments || []).filter((attachment) => {
    if (!attachment?.renewalId) return false;
    return renewalIds.has(attachment.renewalId);
  });

  return {
    ...data,
    assets: scopedAssets,
    regulatory_affairs: affairs,
    renewals,
    attachments,
  };
};

export default {
  buildUndirectedNeighborMap,
  getReachableNodes,
  computeRegAffairsScopedData,
};
