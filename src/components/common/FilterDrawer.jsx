import { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getCategoryLabel, getUIText } from '../../utils/i18nHelpers';
import { useStatusHelpers } from '../../utils/domainStatus';
import * as MuiIcons from '@mui/icons-material';

/**
 * FilterDrawer - Responsive filter drawer (Side panel on desktop, Bottom sheet on mobile)
 *
 * Provides multi-select filters for regulatory affairs with context-aware options.
 *
 * @param {boolean} open - Whether drawer is open
 * @param {Function} onClose - Callback to close drawer
 * @param {Object} filters - Current filter state (arrays)
 * @param {Function} onFilterChange - Callback (filterKey, value) => void
 * @param {Function} onClearAll - Callback to clear all filters
 * @param {Object} availableOptions - Context-aware filter options
 * @param {string} language - Current language
 */
const FilterDrawer = ({
  open,
  onClose,
  filters: filtersProp,
  activeFilters,
  onFilterChange,
  onClearAll,
  availableOptions = {},
  sections,
  language = 'es',
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { getMetadata } = useStatusHelpers();

  const filters = filtersProp ?? activeFilters ?? {};
  const hasCustomSections = Array.isArray(sections) && sections.length > 0;
  // State for per-section search terms
  const [sectionSearchTerms, setSectionSearchTerms] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  const handleSectionToggle = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !(prev?.[sectionKey] ?? true),
    }));
  };

  const isSectionExpanded = (sectionKey) => expandedSections?.[sectionKey] ?? false;

  const handleSectionSearchChange = (sectionKey, term) => {
    setSectionSearchTerms(prev => ({
      ...prev,
      [sectionKey]: term
    }));
    
    // Auto-expand if user is searching
    if (term && !expandedSections[sectionKey]) {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: true
        }));
    }
  };

  const getActiveCountForSection = (sectionKey) => {
    const value = filters?.[sectionKey];
    if (Array.isArray(value)) {
      return value.length;
    }
    return value ? 1 : 0;
  };

  const handleCheckboxChange = (filterKey, value) => {
    const currentValue = filters[filterKey];

    // Handle single-select mode (value is a string)
    if (typeof currentValue === 'string' || currentValue === null || currentValue === undefined) {
      // If clicking the same value, deselect it (set to null)
      if (currentValue === value) {
        onFilterChange(filterKey, null);
      } else {
        // Otherwise, select the new value
        onFilterChange(filterKey, value);
      }
      return;
    }

    // Handle multi-select mode (value is an array) - legacy support
    if (Array.isArray(currentValue)) {
      const newValues = currentValue.includes(value)
        ? currentValue.filter(v => v !== value)
        : [...currentValue, value];
      onFilterChange(filterKey, newValues.length > 0 ? newValues : null);
      return;
    }

    // Default: set as single value
    onFilterChange(filterKey, value);
  };

  const isChecked = (filterKey, value) => {
    const currentValue = filters[filterKey];

    // Handle single-select mode (value is a string)
    if (typeof currentValue === 'string') {
      return currentValue === value;
    }

    // Handle multi-select mode (value is an array)
    if (Array.isArray(currentValue)) {
      return currentValue.includes(value);
    }

    // No filter set
    return false;
  };

  const normalizedSections = useMemo(() => {
    if (!hasCustomSections) {
      return [];
    }

    return sections
      .filter((section) => section && section.key && Array.isArray(section.options) && section.options.length > 0)
      .map((section) => {
        // Apply search filtering per section
        const searchTerm = sectionSearchTerms[section.key] || '';
        const filteredOptions = section.options
          .map((option) => {
            if (option === null || option === undefined) {
              return null;
            }

            let normalizedOption;
            if (typeof option === 'string') {
              // If option is just a string, create object with label.
              // CRITICAL: Apply translation here for known types like 'category'
              let computedLabel = option;
              if (section.type === 'category') {
                  computedLabel = getCategoryLabel(option, language);
              } else if (section.type === 'status') {
                 const metadata = getMetadata('compliance', option, language);
                 if (metadata?.label) {
                   computedLabel = metadata.label;
                 } else if (metadata?.labelKey) {
                   computedLabel = getUIText(metadata.labelKey, language);
                 }
              }
              
              normalizedOption = { value: option, label: computedLabel };
            } else if (typeof option === 'object' && option.value !== undefined) {
              normalizedOption = option;
            } else {
              return null;
            }

            // Filter logic - now works against the translated label
            if (searchTerm) {
              const label = normalizedOption.label || normalizedOption.value;
              if (!String(label).toLowerCase().includes(searchTerm.toLowerCase())) {
                return null;
              }
            }
            
            return normalizedOption;
          })
          .filter(Boolean);

        return {
          ...section,
          options: filteredOptions,
        };
      });
  }, [sections, hasCustomSections, sectionSearchTerms, language]);

  const renderOptionContent = (section, option) => {
    const optionValue = option.value;
    const optionLabel = option.label;

    if (section.type === 'status') {
      const metadata = getMetadata('compliance', optionValue, language);
      const StatusIcon =
        typeof (option.icon ?? metadata?.icon) === 'string'
          ? MuiIcons[option.icon ?? metadata?.icon]
          : option.icon ?? metadata?.icon;
      const statusLabel =
        optionLabel ??
        metadata?.label ??
        (metadata?.labelKey ? getUIText(metadata.labelKey, language) : optionValue);

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {StatusIcon && (
            <StatusIcon sx={{ fontSize: 18, color: metadata?.color }} />
          )}
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{statusLabel}</Typography>
        </Box>
      );
    }

    // Category label is already handled in normalization if passed as string,
    // but if passed as object with explicit label, use that.
    // If normalization set the label, optionLabel is already translated.
    return <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{optionLabel ?? String(optionValue)}</Typography>;
  };

  // Count active filters (handle both single values and arrays)
  const activeFilterCount = Object.values(filters).reduce((sum, value) => {
    if (value === null || value === undefined || value === '') return sum;
    if (Array.isArray(value)) return sum + value.length;
    return sum + 1; // Single value counts as 1
  }, 0);

  const handleClearAllClick = () => {
    if (typeof onClearAll === 'function') {
      onClearAll();
    }
    setSectionSearchTerms({}); // Clear local search terms
  };

  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isDesktop ? {
            width: 400,
            height: '100%',
            borderRadius: '16px 0 0 16px',
          } : {
            maxHeight: '80vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }),
          pb: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <Box sx={{ width: '100%', maxWidth: isDesktop ? 'none' : 600, mx: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {getUIText('filters', language)}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Filter Sections */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            px: 2,
            py: 1,
            // Custom scrollbar styling matching InfoTab
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(62, 207, 160, 0.7)', // secondary.main with opacity
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(62, 207, 160, 0.9)',
              },
            },
          }}
        >
          {hasCustomSections && (
            normalizedSections.map((section, index) => {
              const activeCount = getActiveCountForSection(section.key);
              const isExpanded = isSectionExpanded(section.key);
              const hasActiveFilters = activeCount > 0;
              const isLast = index === normalizedSections.length - 1;
              
              // Construct the label for the input field
              let inputLabel = section.label;
              if (activeCount > 0) {
                  inputLabel = `${section.label} (${activeCount})`;
              }

              return (
                <Accordion
                  key={section.key}
                  expanded={isExpanded}
                  onChange={() => handleSectionToggle(section.key)}
                  elevation={0}
                  disableGutters
                  sx={{
                    '&:before': { display: 'none' }, // Hide default divider
                    borderBottom: isLast ? 'none' : '1px solid',
                    borderColor: 'secondary.main', // Changed to secondary.main (mint) to match InfoTab
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: 'transparent' // Remove hover bg on container to keep clean look
                    },
                    bgcolor: 'transparent',
                    mb: 0
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        px: 1,
                        minHeight: 60,
                        '& .MuiAccordionSummary-content': {
                            display: 'block', // Ensure full width for TextField
                            alignItems: 'center',
                            my: 1.5,
                            mr: 1
                        },
                        '&:hover': {
                            bgcolor: 'transparent'
                        }
                    }}
                  >
                    {/* Header is now the Search Input itself acting as title */}
                    <TextField
                      fullWidth
                      size="small"
                      label={inputLabel}
                      value={sectionSearchTerms[section.key] || ''}
                      onChange={(e) => handleSectionSearchChange(section.key, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      InputProps={{
                        startAdornment: null,
                        sx: {
                           bgcolor: 'background.paper',
                           borderRadius: 1,
                           fontSize: '0.9rem',
                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                               borderColor: 'primary.main',
                               borderWidth: 1.5
                           },
                           '& .MuiOutlinedInput-notchedOutline': {
                               borderColor: hasActiveFilters ? 'primary.light' : 'rgba(0, 0, 0, 0.20)',
                               borderWidth: hasActiveFilters ? 1.5 : 1,
                           },
                           '&:hover .MuiOutlinedInput-notchedOutline': {
                               borderColor: hasActiveFilters ? 'primary.main' : 'text.secondary',
                           }
                        }
                      }}
                      InputLabelProps={{
                          sx: hasActiveFilters ? { 
                              color: 'primary.main',
                              fontWeight: 600
                          } : {
                              color: 'text.secondary',
                              fontWeight: 500
                          }
                      }}
                      variant="outlined"
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2, px: 1 }}>
                    <FormGroup sx={{ maxHeight: 300, overflowY: 'auto', pl: 0.5 }}>
                      {section.options.length > 0 ? (
                        section.options.map((option) => (
                          <FormControlLabel
                            key={option.value}
                            control={
                              <Checkbox
                                checked={isChecked(section.key, option.value)}
                                onChange={() => handleCheckboxChange(section.key, option.value)}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&.Mui-checked': {
                                        color: 'primary.main',
                                    }
                                }}
                              />
                            }
                            label={renderOptionContent(section, option)}
                            sx={{ 
                                width: '100%', 
                                mr: 0,
                                ml: 0, // Align checkbox properly
                                py: 0.75, // Better tap target spacing
                                px: 1,
                                borderRadius: 1,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    bgcolor: 'primary.50', // Light blue background on hover matching ExpandableRow actions
                                },
                                '& .MuiTypography-root': {
                                    fontWeight: isChecked(section.key, option.value) ? 500 : 400,
                                    color: isChecked(section.key, option.value) ? 'primary.main' : 'text.primary'
                                }
                            }}
                          />
                        ))
                      ) : (
                        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {language === 'es' ? 'No se encontraron opciones' : 'No options found'}
                            </Typography>
                        </Box>
                      )}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
          
          {!hasCustomSections && (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
              {language === 'es' ? 'Configuración de filtros no válida.' : 'Invalid filter configuration.'}
            </Typography>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {activeFilterCount} {getUIText('filters_active', language)}
          </Typography>
          <Button
            onClick={handleClearAllClick}
            disabled={activeFilterCount === 0 || typeof onClearAll !== 'function'}
            size="small"
            color="primary"
          >
            {getUIText('clear_all', language)}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
