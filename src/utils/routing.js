import { DEFAULT_LANGUAGE, ALL_CATEGORIES } from './i18nHelpers';

const normalizeSlug = (value) => (value ?? '').trim().toLowerCase();

export const CATEGORY_SLUGS = {
  en: {
    company: 'company',
    supplier: 'supplier',
    customer: 'customer',
    product: 'product',
    facility: 'facility',
    equipment: 'equipment',
    vehicle: 'vehicle',
    person: 'person',
    other_asset: 'other_asset',
  },
  es: {
    company: 'empresas',
    supplier: 'proveedores',
    customer: 'clientes',
    product: 'productos',
    facility: 'establecimientos',
    equipment: 'equipos',
    vehicle: 'vehiculos',
    person: 'personas',
    other_asset: 'otros-activos',
  },
};

const CATEGORY_SLUG_LOOKUP = (() => {
  const map = new Map();

  Object.values(CATEGORY_SLUGS).forEach((translations) => {
    Object.entries(translations).forEach(([category, slug]) => {
      if (!slug) {
        return;
      }
      map.set(normalizeSlug(slug), category);
    });
  });

  ALL_CATEGORIES.forEach((category) => {
    map.set(normalizeSlug(category), category);
  });

  return map;
})();

export const ROUTE_SEGMENTS = {
  control_panel: { en: 'control-panel', es: 'panel-de-control' },
  dashboard: { en: 'dashboard', es: 'panel' },
  affair: { en: 'affair', es: 'asunto' },
  renewal: { en: 'renewal', es: 'actualizacion' },
};

const ROUTE_SEGMENT_LOOKUP = (() => {
  const map = new Map();

  Object.entries(ROUTE_SEGMENTS).forEach(([key, translations]) => {
    Object.entries(translations).forEach(([language, slug]) => {
      if (!slug) {
        return;
      }
      map.set(normalizeSlug(slug), key);
    });
  });

  return map;
})();

export const TAB_SLUGS = {
  asset: {
    info: { en: 'info', es: 'informacion' },
    regulatory: { en: 'regulatory', es: 'regulatorios' },
    dossier: { en: 'dossier', es: 'expediente' },
    relations: { en: 'relations', es: 'relaciones' },
  },
  affair: {
    info: { en: 'info', es: 'informacion' },
    renewals: { en: 'renewals', es: 'renovaciones' },
  },
  renewal: {
    info: { en: 'info', es: 'informacion' },
    attachments: { en: 'attachments', es: 'adjuntos' },
  },
};

const TAB_SLUG_LOOKUP = (() => {
  const lookup = {};

  Object.entries(TAB_SLUGS).forEach(([context, tabs]) => {
    const map = new Map();

    Object.entries(tabs).forEach(([tabKey, translations]) => {
      Object.entries(translations).forEach(([language, slug]) => {
        if (!slug) {
          return;
        }
        map.set(normalizeSlug(slug), tabKey);
      });

      map.set(normalizeSlug(tabKey), tabKey);
    });

    lookup[context] = map;
  });

  return lookup;
})();

const getDomainSegment = (domainConfig, key, language = DEFAULT_LANGUAGE) => {
  if (!domainConfig?.routing?.segments) return null;
  const segment = domainConfig.routing.segments[key];
  if (!segment) return null;
  return segment[language] ?? segment[DEFAULT_LANGUAGE] ?? null;
};

const resolveDomainSegment = (domainConfig, slug) => {
  if (!domainConfig?.routing?.segments) return null;
  const normalized = normalizeSlug(slug);
  const entries = Object.entries(domainConfig.routing.segments);
  for (const [key, translations] of entries) {
    if (translations && Object.values(translations).some((val) => normalizeSlug(val) === normalized)) {
      return key;
    }
  }
  return null;
};

export const getCategorySlug = (category, language = DEFAULT_LANGUAGE, domainConfig = null) => {
  const domainSegment = getDomainSegment(domainConfig, category, language);
  if (domainSegment) return domainSegment;
  return CATEGORY_SLUGS[language]?.[category] ?? category;
};

export const resolveCategoryFromSlug = (slug, domainConfig = null) => {
  if (domainConfig) {
    const resolved = resolveDomainSegment(domainConfig, slug);
    if (resolved) return resolved;
  }
  return CATEGORY_SLUG_LOOKUP.get(normalizeSlug(slug)) ?? null;
};

export const getRouteSegment = (segmentKey, language = DEFAULT_LANGUAGE, domainConfig = null) => {
  const domainSegment = getDomainSegment(domainConfig, segmentKey, language);
  if (domainSegment) return domainSegment;
  return ROUTE_SEGMENTS[segmentKey]?.[language] ?? ROUTE_SEGMENTS[segmentKey]?.[DEFAULT_LANGUAGE] ?? segmentKey;
};

export const resolveRouteSegment = (slug, domainConfig = null) => {
  if (domainConfig) {
    const resolved = resolveDomainSegment(domainConfig, slug);
    if (resolved) return resolved;
  }
  return ROUTE_SEGMENT_LOOKUP.get(normalizeSlug(slug)) ?? null;
};

export const getTabSlug = (tabKey, context, language = DEFAULT_LANGUAGE, domainConfig = null) => {
  if (domainConfig?.routing?.tabRoutes?.[context]?.[tabKey]) {
    const route = domainConfig.routing.tabRoutes[context][tabKey];
    return route[language] ?? route[DEFAULT_LANGUAGE] ?? tabKey;
  }
  const translations = TAB_SLUGS[context]?.[tabKey];
  if (!translations) {
    return tabKey;
  }
  return translations[language] ?? translations[DEFAULT_LANGUAGE] ?? tabKey;
};

export const resolveTabKeyFromSlug = (slug, context, domainConfig = null) => {
  if (!slug) {
    return null;
  }

  if (domainConfig?.routing?.tabRoutes?.[context]) {
    const normalized = normalizeSlug(slug);
    const entries = Object.entries(domainConfig.routing.tabRoutes[context]);
    for (const [key, translations] of entries) {
      if (translations && Object.values(translations).some((val) => normalizeSlug(val) === normalized)) {
        return key;
      }
    }
  }

  const lookup = TAB_SLUG_LOOKUP[context];
  if (!lookup) {
    return null;
  }

  return lookup.get(normalizeSlug(slug)) ?? null;
};

export const parsePathname = (pathname, domainConfig = null) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { type: 'home', params: {} };
  }

  const [first, ...rest] = segments;
  const staticRouteKey = resolveRouteSegment(first, domainConfig);

  if (staticRouteKey === 'control_panel') {
    return { type: 'control_panel', params: {} };
  }

  if (staticRouteKey === 'dashboard') {
    return { type: 'dashboard', params: {} };
  }

  if (staticRouteKey === 'affair') {
    const [affairId, tabSlug] = rest;
    return {
      type: 'affair',
      params: {
        affairId,
        tabKey: resolveTabKeyFromSlug(tabSlug, 'affair'),
        tabSlug,
      },
    };
  }

  if (staticRouteKey === 'renewal') {
    const [renewalId, tabSlug] = rest;
    return {
      type: 'renewal',
      params: {
        renewalId,
        tabKey: resolveTabKeyFromSlug(tabSlug, 'renewal', domainConfig),
        tabSlug,
      },
    };
  }

  const category = resolveCategoryFromSlug(first, domainConfig);
  if (!category) {
    return null;
  }

  if (rest.length === 0) {
    return {
      type: 'category',
      params: { category },
    };
  }

  const [assetId, tabSlug, relatedCategorySlug] = rest;
  return {
    type: 'asset',
    params: {
      category,
      assetId,
      tabKey: resolveTabKeyFromSlug(tabSlug, 'asset'),
      tabSlug,
      relatedCategory: resolveCategoryFromSlug(relatedCategorySlug),
      relatedCategorySlug,
    },
  };
};

export const buildPathname = (route, language = DEFAULT_LANGUAGE, domainConfig = null) => {
  if (!route) {
    return '/';
  }

  const { type, params = {} } = route;

  switch (type) {
    case 'home':
      return '/';

    case 'control_panel':
      return `/${getRouteSegment('control_panel', language, domainConfig)}`;

    case 'dashboard':
      return `/${getRouteSegment('dashboard', language, domainConfig)}`;

    case 'category': {
      const slug = getCategorySlug(params.category, language, domainConfig);
      return `/${slug}`;
    }

    case 'asset': {
      const categorySlug = getCategorySlug(params.category, language, domainConfig);
      let path = `/${categorySlug}/${params.assetId}`;

      if (params.tabKey) {
        const tabSlug = getTabSlug(params.tabKey, 'asset', language, domainConfig);
        path += `/${tabSlug}`;
      } else if (params.tabSlug) {
        path += `/${params.tabSlug}`;
      }

      if (params.relatedCategory) {
        const relatedSlug = getCategorySlug(params.relatedCategory, language, domainConfig);
        path += `/${relatedSlug}`;
      } else if (params.relatedCategorySlug) {
        path += `/${params.relatedCategorySlug}`;
      }

      return path;
    }

    case 'affair': {
      const base = `/${getRouteSegment('affair', language, domainConfig)}/${params.affairId}`;
      if (!params.tabKey && !params.tabSlug) {
        return base;
      }

      const tabSlug = params.tabKey
        ? getTabSlug(params.tabKey, 'affair', language, domainConfig)
        : params.tabSlug;

      return `${base}/${tabSlug}`;
    }

    case 'renewal': {
      const base = `/${getRouteSegment('renewal', language, domainConfig)}/${params.renewalId}`;
      if (!params.tabKey && !params.tabSlug) {
        return base;
      }

      const tabSlug = params.tabKey
        ? getTabSlug(params.tabKey, 'renewal', language, domainConfig)
        : params.tabSlug;

      return `${base}/${tabSlug}`;
    }

    default:
      return '/';
  }
};

export const translatePathname = (pathname, targetLanguage = DEFAULT_LANGUAGE, domainConfig = null) => {
  const route = parsePathname(pathname, domainConfig);
  if (!route) {
    return pathname;
  }
  return buildPathname(route, targetLanguage, domainConfig);
};

export const isControlPanelPath = (pathname, domainConfig = null) => {
  const route = parsePathname(pathname, domainConfig);
  return route?.type === 'control_panel';
};

export const isDashboardPath = (pathname, domainConfig = null) => {
  const route = parsePathname(pathname, domainConfig);
  return route?.type === 'dashboard';
};
