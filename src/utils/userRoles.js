/**
 * User Role Utilities
 * 
 * Provides permission checks and filtering based on user roles.
 * 
 * Pension Fund Roles:
 * - admin: Full access to everything
 * - attorney: Can search assets, view details, see request queue (filtered by investment strategies)
 * - user: Can create requests and view their own submissions only
 * 
 * Regulatory Affairs Roles (Demo):
 * - compliance_manager: Corp admin, full visibility
 * - ra_coordinator: Cross-facility/product drafter/reviewer
 * - plant_qa_lead: Site-scoped contributor
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  ATTORNEY: 'attorney',
  USER: 'user',
};

export const RA_USER_ROLES = {
  COMPLIANCE_MANAGER: 'compliance_manager',
  RA_COORDINATOR: 'ra_coordinator',
  PLANT_QA_LEAD: 'plant_qa_lead',
};

const ROLE_DEFINITIONS = {
  pension_fund: {
    [USER_ROLES.ADMIN]: {
      id: USER_ROLES.ADMIN,
      tier: 'admin',
      label: { en: 'Administrator', es: 'Administrador' },
    },
    [USER_ROLES.ATTORNEY]: {
      id: USER_ROLES.ATTORNEY,
      tier: 'reviewer',
      label: { en: 'Attorney', es: 'Abogado' },
    },
    [USER_ROLES.USER]: {
      id: USER_ROLES.USER,
      tier: 'requester',
      label: { en: 'User', es: 'Usuario' },
    },
  },
  regulatory_affairs: {
    [RA_USER_ROLES.COMPLIANCE_MANAGER]: {
      id: RA_USER_ROLES.COMPLIANCE_MANAGER,
      tier: 'admin',
      label: { en: 'Compliance Manager', es: 'Gerente de Cumplimiento' },
      canApprove: true,
    },
    [RA_USER_ROLES.RA_COORDINATOR]: {
      id: RA_USER_ROLES.RA_COORDINATOR,
      tier: 'reviewer',
      label: { en: 'Regulatory Affairs Coordinator', es: 'Coordinador de Asuntos Regulatorios' },
    },
    [RA_USER_ROLES.PLANT_QA_LEAD]: {
      id: RA_USER_ROLES.PLANT_QA_LEAD,
      tier: 'contributor',
      label: { en: 'Plant QA Lead', es: 'Líder de QA Planta' },
      scopeRequired: true,
    },
  },
};

const normalizeRole = (role) => (role || '').toLowerCase();

const getRoleMeta = (user, domainId = null) => {
  const resolvedDomain = domainId || user?.domainId || 'pension_fund';
  const domainRoles = ROLE_DEFINITIONS[resolvedDomain];
  if (!domainRoles) return null;
  const roleKey = normalizeRole(user?.role);
  return domainRoles[roleKey] || null;
};

/**
 * Check if user is an admin
 * @param {Object} user - User object
 * @param {string} domainId - Optional domain id for domain-specific roles
 * @returns {boolean}
 */
export const isAdmin = (user, domainId = null) => {
  const meta = getRoleMeta(user, domainId);
  if (meta?.tier === 'admin') return true;
  return normalizeRole(user?.role) === USER_ROLES.ADMIN;
};

/**
 * Check if user is an attorney
 * @param {Object} user - User object
 * @param {string} domainId - Optional domain id for domain-specific roles
 * @returns {boolean}
 */
export const isAttorney = (user, domainId = null) => {
  const resolvedDomain = domainId || user?.domainId || 'pension_fund';
  if (resolvedDomain !== 'pension_fund') return false;
  const roleKey = normalizeRole(user?.role);
  if (roleKey === USER_ROLES.ATTORNEY) return true;
  const meta = getRoleMeta(user, resolvedDomain);
  return meta?.id === USER_ROLES.ATTORNEY;
};

/**
 * Check if user is a general user
 * @param {Object} user - User object
 * @param {string} domainId - Optional domain id for domain-specific roles
 * @returns {boolean}
 */
export const isGeneralUser = (user, domainId = null) => {
  const roleKey = normalizeRole(user?.role);
  if (roleKey === USER_ROLES.USER) return true;
  const meta = getRoleMeta(user, domainId);
  return meta?.tier === 'requester';
};

/**
 * Check if user can access asset search and entity details
 * - For pension_fund domain: Only admins and attorneys have access
 * - For other domains (regulatory_affairs): All users have access
 * @param {Object} user - User object
 * @param {string} domainId - Domain id to evaluate
 * @returns {boolean}
 */
export const canAccessAssetSearch = (user, domainId = null) => {
  const resolvedDomain = domainId || user?.domainId || 'pension_fund';
  if (resolvedDomain === 'pension_fund') {
    return isAdmin(user, resolvedDomain) || isAttorney(user, resolvedDomain);
  }
  if (resolvedDomain === 'regulatory_affairs') {
    // All RA roles can browse entities; future queues/approvals will gate specific actions
    return !!user;
  }
  return !!user;
};

/**
 * Check if user can access the request queue (all/filtered requests)
 * Only admins and attorneys have this access
 * @param {Object} user - User object
 * @param {string} domainId - Domain id to evaluate
 * @returns {boolean}
 */
export const canAccessRequestQueue = (user, domainId = null) => {
  const resolvedDomain = domainId || user?.domainId || 'pension_fund';
  if (resolvedDomain !== 'pension_fund') {
    // Regulatory affairs will use renewal approvals later; keep queue disabled for now
    return false;
  }
  return isAdmin(user, resolvedDomain) || isAttorney(user, resolvedDomain);
};

/**
 * Check if user can create new requests
 * All users can create requests
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canCreateRequests = (user) => {
  return !!user;
};

/**
 * Check if user can view their own requests
 * All users can view their own requests
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewOwnRequests = (user) => {
  return !!user;
};

/**
 * Get the investment strategies visible to a user
 * - Admin: All strategies (empty array means all)
 * - Attorney: Only assigned strategies
 * - User: Empty (no filtering by strategy for own requests)
 * @param {Object} user - User object
 * @returns {string[]} Array of strategy names, empty for admin (all access) or user
 */
export const getVisibleInvestmentStrategies = (user) => {
  if (isAdmin(user)) {
    return []; // Empty means all
  }
  if (isAttorney(user)) {
    return user?.investmentStrategies || [];
  }
  return [];
};

/**
 * Filter requests based on user role and permissions
 * - Admin: All requests
 * - Attorney: Requests matching their investment strategies
 * - User: Only their own requests (by submitted_by name)
 * @param {Array} requests - Array of request objects
 * @param {Object} user - User object
 * @param {string} domainId - Domain id to evaluate
 * @returns {Array} Filtered requests
 */
export const filterRequestsByUser = (requests, user, domainId = null) => {
  const resolvedDomain = domainId || user?.domainId || 'pension_fund';
  if (resolvedDomain !== 'pension_fund') {
    // Request queue is only implemented for pension_fund; return as-is for other domains
    return Array.isArray(requests) ? requests : [];
  }

  if (!requests || !Array.isArray(requests)) {
    return [];
  }

  if (!user) {
    return [];
  }

  // Admin sees all
  if (isAdmin(user)) {
    return requests;
  }

  // Attorney sees requests matching their investment strategies
  if (isAttorney(user)) {
    const strategies = getVisibleInvestmentStrategies(user);
    if (strategies.length === 0) {
      return requests; // Fallback to all if no strategies defined
    }
    return requests.filter((request) => {
      const program = request.investment_program;
      if (!program) return false;
      return strategies.some((strategy) =>
        program.toLowerCase().includes(strategy.toLowerCase()) ||
        strategy.toLowerCase().includes(program.toLowerCase())
      );
    });
  }

  // General user sees only their own requests
  if (isGeneralUser(user)) {
    return requests.filter((request) => {
      return request.submitted_by === user?.name;
    });
  }

  return [];
};

/**
 * Get the default landing route for a user based on their role
 * @param {Object} user - User object
 * @param {string} domainId - Domain id to evaluate
 * @returns {string} Default route path
 */
export const getDefaultRouteForUser = (user, domainId = null) => {
  const resolvedDomain = domainId || user?.domainId || 'pension_fund';
  if (canAccessRequestQueue(user, resolvedDomain)) {
    return '/'; // Request queue for admin/attorney
  }
  return '/my-requests'; // My requests for general users
};

/**
 * Get a display label for a user's role
 * @param {Object} user - User object
 * @param {string} language - Language code ('en' or 'es')
 * @returns {string} Role display label
 */
export const getRoleLabel = (user, language = 'en') => {
  const roleKey = normalizeRole(user?.role || 'user');

  // Try domain-specific labels first (useful when we start passing domainId explicitly)
  const meta = getRoleMeta(user, user?.domainId || 'pension_fund');
  if (meta?.label) {
    return meta.label[language] || meta.label.en || roleKey;
  }

  const labels = {
    admin: { en: 'Administrator', es: 'Administrador' },
    attorney: { en: 'Attorney', es: 'Abogado' },
    user: { en: 'User', es: 'Usuario' },
    compliance_manager: { en: 'Compliance Manager', es: 'Gerente de Cumplimiento' },
    ra_coordinator: { en: 'Regulatory Affairs Coordinator', es: 'Coordinador de Asuntos Regulatorios' },
    plant_qa_lead: { en: 'Plant QA Lead', es: 'Líder de QA Planta' },
  };

  return labels[roleKey]?.[language] || labels[roleKey]?.en || roleKey;
};

/**
 * Get normalized scopes for a user (facilities/products/etc.)
 * @param {Object} user - User object
 * @returns {Object} Scopes object with optional accessAll flag
 */
export const getUserScopes = (user) => {
  if (!user?.scopes) return {};
  return user.scopes;
};

