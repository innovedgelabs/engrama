import { useMemo } from 'react';
import * as MuiIcons from '@mui/icons-material';
import { useDomain } from '../contexts/DomainContext';

const mapDimensionsByKey = (dimensions = []) => {
  const map = {};
  dimensions.forEach((dim) => {
    if (dim?.key) {
      map[dim.key] = dim;
    }
  });
  return map;
};

const getLabel = (config = {}, language = 'es') =>
  config.label?.[language] ?? config.label?.en ?? config.label?.es ?? config.key ?? '';

const resolveIcon = (icon) => {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return MuiIcons[icon] || null;
  }
  return icon;
};

/**
 * Hooks to access status configuration from the current domain.
 */
export const useStatusHelpers = () => {
  const { currentConfig } = useDomain();

  const dimensionsByKey = useMemo(
    () => mapDimensionsByKey(currentConfig?.statusSystem?.dimensions ?? []),
    [currentConfig]
  );

  const getDimension = (dimensionKey) => dimensionsByKey[dimensionKey] ?? null;

  const getValues = (dimensionKey) =>
    Object.keys(getDimension(dimensionKey)?.values ?? {});

  const getMetadata = (dimensionKey, valueKey, language = 'es') => {
    const dimension = getDimension(dimensionKey);
    const valueConfig = dimension?.values?.[valueKey];

    if (!valueConfig) {
      return {
        label: valueKey ?? '',
        color: '#94a3b8',
        icon: resolveIcon('Help'),
      };
    }

    return {
      label: getLabel(valueConfig, language),
      color: valueConfig.color,
      icon: resolveIcon(valueConfig.icon),
    };
  };

  const getDimensionLabel = (dimensionKey, language = 'es') =>
    getLabel(getDimension(dimensionKey), language) || dimensionKey;

  return {
    dimensionsByKey,
    getDimension,
    getValues,
    getMetadata,
    getDimensionLabel,
  };
};

export default useStatusHelpers;
