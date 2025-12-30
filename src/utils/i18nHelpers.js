export const LANGUAGES = [
  { id: 'es', label: 'Español', shortLabel: 'ES' },
  { id: 'en', label: 'English', shortLabel: 'EN' },
];

export const DEFAULT_LANGUAGE = 'es';

// Default category keys (used for routing fallbacks). Domains should override via config.
export const CATEGORIES = {
  COMPANY: 'company',
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  FACILITY: 'facility',
  EQUIPMENT: 'equipment',
  PERSON: 'person',
  VEHICLE: 'vehicle',
  OTHER_ASSET: 'other_asset',
};

export const ALL_CATEGORIES = Object.values(CATEGORIES);

const fallbackLookup = (dictionary, key, language) => {
  if (!dictionary || !dictionary[key]) {
    return key;
  }
  return dictionary[key][language] ?? dictionary[key][DEFAULT_LANGUAGE] ?? key;
};

const buildEnglishLookup = (textMap) =>
  Object.entries(textMap || {}).reduce((acc, [key, translations]) => {
    const englishValue = translations?.en;
    if (englishValue) {
      acc[englishValue.toLowerCase()] = key;
    }
    return acc;
  }, {});

let ACTIVE_UI_TEXT = {};
let ACTIVE_DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
let ACTIVE_DOMAIN_CONFIG = null;
let ACTIVE_ENGLISH_LOOKUP = buildEnglishLookup(ACTIVE_UI_TEXT);

export const setActiveDomainI18n = (domainConfig) => {
  ACTIVE_DOMAIN_CONFIG = domainConfig || null;
  ACTIVE_UI_TEXT = domainConfig?.uiText || {};
  ACTIVE_DEFAULT_LANGUAGE = domainConfig?.defaultLanguage || DEFAULT_LANGUAGE;
  ACTIVE_ENGLISH_LOOKUP = buildEnglishLookup(ACTIVE_UI_TEXT);
};

const getActiveLanguage = (language) => language || ACTIVE_DEFAULT_LANGUAGE || DEFAULT_LANGUAGE;

export const getCategoryLabel = (category, language = ACTIVE_DEFAULT_LANGUAGE) => {
  const lang = getActiveLanguage(language);
  const labelFromDomain =
    ACTIVE_DOMAIN_CONFIG?.entities?.[category]?.label?.[lang] ||
    ACTIVE_DOMAIN_CONFIG?.entities?.[category]?.label?.[DEFAULT_LANGUAGE] ||
    ACTIVE_DOMAIN_CONFIG?.entities?.[category]?.label?.en ||
    ACTIVE_DOMAIN_CONFIG?.entities?.[category]?.label?.es;

  if (labelFromDomain) {
    return labelFromDomain;
  }

  return category;
};

export const getUIText = (key, language = ACTIVE_DEFAULT_LANGUAGE) =>
  fallbackLookup(ACTIVE_UI_TEXT, key, getActiveLanguage(language));

export const translateLabel = (label, language = ACTIVE_DEFAULT_LANGUAGE) => {
  if (!label) {
    return label;
  }
  const key = ACTIVE_ENGLISH_LOOKUP[label.toLowerCase()];
  if (!key) {
    return label;
  }
  return getUIText(key, language);
};

const getStatusLabel = (dimensionKey, valueKey, language = ACTIVE_DEFAULT_LANGUAGE) => {
  const lang = getActiveLanguage(language);
  const dimension = ACTIVE_DOMAIN_CONFIG?.statusSystem?.dimensions?.find((d) => d.key === dimensionKey);
  const valueConfig = dimension?.values?.[valueKey];
  if (valueConfig?.label) {
    return valueConfig.label[lang] || valueConfig.label[DEFAULT_LANGUAGE] || valueKey;
  }
  return valueKey;
};

export const getLifecycleLabel = (status, language = ACTIVE_DEFAULT_LANGUAGE) =>
  getStatusLabel('lifecycle', status, language);

export const getComplianceLabel = (status, language = ACTIVE_DEFAULT_LANGUAGE) =>
  getStatusLabel('compliance', status, language);

export const getWorkflowLabel = (status, language = ACTIVE_DEFAULT_LANGUAGE) =>
  getStatusLabel('workflow', status, language);

export const getPriorityLabel = (status, language = ACTIVE_DEFAULT_LANGUAGE) =>
  getStatusLabel('priority', status, language);
