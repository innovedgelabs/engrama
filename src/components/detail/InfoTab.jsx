import { useMemo, useState, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Link,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { DEFAULT_LANGUAGE, getUIText, translateLabel } from '../../utils/i18nHelpers';
import { calculateComplianceStatus, calculateWorkflowStatus } from '../../utils/status';
import { getComparableRenewalDate } from '../../utils/renewal';
import { useDomain } from '../../contexts/DomainContext';
import { useStatusHelpers } from '../../utils/domainStatus';
const BASIC_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  LINK: 'link',
  PHONE: 'phone',
  DATE: 'date',
  CURRENCY: 'currency',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  STATUS: 'status',
};

const formatFieldValue = (value, type, fieldTypes, statusFormatter) => {
  if (value === null || value === undefined) {
    return value;
  }

  switch (type) {
    case fieldTypes.DATE: {
      if (typeof value === 'string' || value instanceof Date) {
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return value;
    }
    case fieldTypes.CURRENCY: {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(value);
      }
      return value;
    }
    case fieldTypes.ARRAY: {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value;
    }
    case fieldTypes.STATUS: {
      return statusFormatter ? statusFormatter(value) : value;
    }
    case fieldTypes.BOOLEAN:
      return value ? 'Yes' : 'No';
    default:
      return value;
  }
};

const getFieldValue = (asset, fieldConfig) => {
  if (!asset) {
    return null;
  }

  if (asset[fieldConfig.key] != null) {
    return asset[fieldConfig.key];
  }

  if (fieldConfig.fallbackTo && asset[fieldConfig.fallbackTo] != null) {
    return asset[fieldConfig.fallbackTo];
  }

  return null;
};

const FieldDisplay = ({ label, value, link = false, onCopy }) => {
  if (!value) return null;

  const handleClick = () => {
    if (onCopy) {
      onCopy(value, label);
    }
  };

  return (
    <Box sx={{ mb: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, display: 'block', mb: 0.25, fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
      {link ? (
        <Link
          href={`https://${value}`}
          target="_blank"
          rel="noopener"
          sx={{ fontSize: '0.8125rem' }}
          onClick={(e) => {
            e.preventDefault();
            handleClick();
            window.open(`https://${value}`, '_blank');
          }}
        >
          {value}
        </Link>
      ) : (
        <Typography
          variant="body2"
          onClick={handleClick}
          sx={{
            color: 'text.primary',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': {
              color: 'rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
};

const InfoTab = ({ asset, entityType, renewals = [], language = DEFAULT_LANGUAGE }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getSchema } = useDomain();
  const { getMetadata } = useStatusHelpers();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const fieldTypes = useMemo(() => {
    const schema = getSchema('fieldTypes');
    if (schema?.FIELD_TYPES) return schema.FIELD_TYPES;
    if (schema) return schema;
    return BASIC_FIELD_TYPES;
  }, [getSchema]);

  const statusFormatter = useCallback(
    (statusValue, key, dimensionOverride = null) => {
      if (!statusValue) return statusValue;
      const dimension =
        dimensionOverride ||
        (key && key.includes('lifecycle')) ? 'lifecycle' :
        (key && key.includes('compliance')) ? 'compliance' :
        (key && key.includes('workflow')) ? 'workflow' :
        (key && key.includes('priority')) ? 'priority' :
        null;
      if (!dimension) return statusValue;
      const metadata = getMetadata(dimension, statusValue, language);
      return metadata?.label || statusValue;
    },
    [getMetadata, language]
  );

  const resolvedEntityType = useMemo(() => entityType, [entityType]);

  // For regulatory affairs, enrich with calculated compliance/workflow statuses
  const enrichedAsset = useMemo(() => {
    if (resolvedEntityType !== 'regulatory_affair' || !asset?.id) {
      return asset;
    }

    // Find all renewals for this affair and get the latest one
    const affairRenewals = renewals.filter((r) => r.affairId === asset.id);
    if (affairRenewals.length === 0) {
      return {
        ...asset,
        complianceStatus: null,
        workflowStatus: null,
      };
    }

    // Sort renewals by date (descending) to get the latest
    const sortedRenewals = [...affairRenewals].sort(
      (a, b) => getComparableRenewalDate(b) - getComparableRenewalDate(a)
    );
    const latestRenewal = sortedRenewals[0];

    // Calculate derived statuses
    const complianceStatus = calculateComplianceStatus(latestRenewal);
    const workflowStatus = calculateWorkflowStatus(latestRenewal, complianceStatus);

    return {
      ...asset,
      complianceStatus,
      workflowStatus,
    };
  }, [asset, renewals, resolvedEntityType]);

  const schema = useMemo(() => getSchema(resolvedEntityType), [getSchema, resolvedEntityType]);

  const visibleSections = useMemo(() => {
    if (!schema?.sections) {
      return [];
    }

    return schema.sections
      .filter((section) => {
        if (section.condition) {
          return enrichedAsset[section.condition] != null;
        }
        return true;
      })
      .map((section) => ({
        ...section,
        title: section.titleKey ? getUIText(section.titleKey, language) : translateLabel(section.title, language),
        fields: section.fields.map((field) => ({
          ...field,
          label: field.labelKey ? getUIText(field.labelKey, language) : translateLabel(field.label, language),
        })),
      }));
  }, [enrichedAsset, language, schema, getUIText]);

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const isSectionExpanded = (sectionKey, defaultExpanded = false) =>
    expandedSections[sectionKey] ?? defaultExpanded;

  return (
    <Box
      sx={{
        ...(isMobile
          ? {
              // Mobile: Natural flow with card sections
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }
          : {
              // Desktop: Fill height with internal scrolling
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }),
      }}
    >
      {isMobile ? (
        // Mobile: Individual Paper cards per section
        visibleSections.map((section) => (
          <Paper
            key={section.key}
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'secondary.main',
                  cursor: section.collapsible ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onClick={section.collapsible ? () => toggleSection(section.key) : undefined}
              >
                {section.title}
                {section.collapsible && (
                  <ExpandMoreIcon
                    sx={{
                      transform: isSectionExpanded(section.key, section.defaultExpanded)
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: 'secondary.main',
                    }}
                  />
                )}
              </Typography>

              {(!section.collapsible || isSectionExpanded(section.key, section.defaultExpanded)) && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={1.5}>
                    {section.fields.map((field) => {
                      const value = getFieldValue(enrichedAsset, field);
                      if (value == null) return null;

                      const formattedValue = formatFieldValue(
                        value,
                        field.type || fieldTypes.TEXT,
                        fieldTypes,
                        (val) => statusFormatter(val, field.key, field.dimension)
                      );

                      const gridProps = field.grid || { xs: 12 };

                      return (
                        <Grid key={field.key} item {...gridProps}>
                          <FieldDisplay
                            label={field.label}
                            value={formattedValue}
                            link={field.type === 'link'}
                            onCopy={handleCopy}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </Box>
          </Paper>
        ))
      ) : (
        // Desktop: Single scrollable container
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            px: 1,
            py: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(62, 207, 160, 0.7)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(62, 207, 160, 0.9)',
              },
            },
          }}
        >
          {visibleSections.map((section) => (
            <Box key={section.key} sx={{ p: 2, pt: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.9rem',
                  borderBottom: '1px solid',
                  borderColor: 'secondary.main',
                  ...(section.collapsible && {
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }),
                }}
                onClick={section.collapsible ? () => toggleSection(section.key) : undefined}
              >
                {section.title}
                {section.collapsible && (
                  <ExpandMoreIcon
                    sx={{
                      transform: isSectionExpanded(section.key, section.defaultExpanded)
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                )}
              </Typography>

              {(!section.collapsible || isSectionExpanded(section.key, section.defaultExpanded)) && (
                <Box sx={{ mt: section.collapsible ? 1.5 : 0 }}>
                  <Grid container spacing={1.5}>
                    {section.fields.map((field) => {
                      const value = getFieldValue(enrichedAsset, field);
                      if (value == null) return null;

                      const formattedValue = formatFieldValue(
                        value,
                        field.type || fieldTypes.TEXT,
                        fieldTypes,
                        (val) => statusFormatter(val, field.key, field.dimension)
                      );

                      const gridProps = field.grid || { xs: 12 };

                      return (
                        <Grid key={field.key} item {...gridProps}>
                          <FieldDisplay
                            label={field.label}
                            value={formattedValue}
                            link={field.type === 'link'}
                            onCopy={handleCopy}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="outlined"
          sx={{
            width: '100%',
            bgcolor: 'white',
            borderColor: 'secondary.main',
            borderWidth: 2,
            '& .MuiAlert-icon': {
              color: 'secondary.main',
            },
          }}
        >
          {getUIText('copySuccess', language)}
          {copiedField && `: ${copiedField}`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InfoTab;
