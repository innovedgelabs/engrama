import { useState } from 'react';
import { Box, Paper, Typography, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { getUIText } from '../../utils/i18nHelpers';
import { calculateDaysUntilExpiry } from '../../utils/dashboardCalculations';
import { useStatusHelpers } from '../../utils/domainStatus';

/**
 * UpcomingExpirationsList Component
 *
 * Shows grouped list of upcoming renewal expirations
 * Groups: Urgent (in alert period), Upcoming (next 90 days), Future (90+ days)
 *
 * @param {Array} renewals - All renewal objects
 * @param {Array} regulatoryAffairs - All affairs for lookup
 * @param {Array} assets - All assets for lookup
 * @param {Object} urgencyGroups - Pre-grouped renewals { urgent, upcoming, future }
 * @param {string} language - Current language
 */
const UpcomingExpirationsList = ({ renewals, regulatoryAffairs, assets, urgencyGroups, language }) => {
  const { getMetadata } = useStatusHelpers();
  const [expandedSections, setExpandedSections] = useState({
    urgent: true,
    upcoming: true,
    future: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getRenewalDetails = (renewal) => {
    const affair = regulatoryAffairs.find((a) => a.id === renewal.affairId);
    const asset = affair ? assets.find((a) => a.id === affair.assetId) : null;
    const daysUntil = calculateDaysUntilExpiry(renewal.expiryDate);
    const priority = renewal.priority || 'medium';
    const priorityMeta =
      getMetadata('priority', priority, language) ||
      {};

    return { affair, asset, daysUntil, priority, priorityMeta };
  };

  const sections = [
    {
      key: 'urgent',
      titleKey: 'urgent_items',
      color: 'error.main',
      icon: '🔴',
      items: urgencyGroups.urgent || [],
    },
    {
      key: 'upcoming',
      titleKey: 'upcoming_items',
      color: 'warning.main',
      icon: '🟡',
      items: urgencyGroups.upcoming || [],
    },
    {
      key: 'future',
      titleKey: 'future_items',
      color: 'success.main',
      icon: '🟢',
      items: urgencyGroups.future || [],
    },
  ];

  return (
    <Box>
      {sections.map((section, index) => (
        <Box key={section.key} sx={{ mb: index === sections.length - 1 ? 0 : 1.25 }}>
          <Box
            onClick={() => toggleSection(section.key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: { xs: 1, md: 1.25 },
              bgcolor: 'action.hover',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.selected',
              },
              transition: 'background-color 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{section.icon}</Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getUIText(section.titleKey, language)} ({section.items.length})
              </Typography>
            </Box>
            <ExpandMoreIcon
              sx={{
                transform: expandedSections[section.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                flexShrink: 0,
                fontSize: '1.25rem',
              }}
            />
          </Box>
          <Collapse in={expandedSections[section.key]}>
            <Box sx={{ mt: 0.75 }}>
              {section.items.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 1.5, textAlign: 'center', fontSize: '0.8rem' }}
                >
                  {getUIText('no_items', language)}
                </Typography>
              ) : (
                section.items.map((renewal, itemIndex) => {
                  const { affair, asset, daysUntil, priorityMeta } = getRenewalDetails(renewal);
                  if (!affair || !asset) return null;

                  const PriorityIcon = priorityMeta.icon;
                  const isLastItem = itemIndex === section.items.length - 1;

                  return (
                    <Paper
                      key={renewal.id}
                      elevation={0}
                      sx={{
                        p: { xs: 1.25, md: 1.5 },
                        mb: isLastItem ? 0 : 0.75,
                        border: 1,
                        borderColor: 'divider',
                        borderLeft: 3,
                        borderLeftColor: priorityMeta.color,
                        '&:hover': {
                          boxShadow: 1,
                          borderColor: 'primary.main',
                        },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              mb: 0.35,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.85rem',
                            }}
                          >
                            {affair.name} - {asset.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.35, fontSize: '0.7rem' }}
                          >
                            {getUIText('expires', language)}: {new Date(renewal.expiryDate).toLocaleDateString(language === 'es' ? 'es-VE' : 'en-US')}
                            {' '}({daysUntil > 0 ? daysUntil : 0} {getUIText('days', language)})
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {PriorityIcon && <PriorityIcon sx={{ fontSize: 13, color: priorityMeta.color }} />}
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.68rem' }}>
                              {getUIText(priorityMeta.labelKey, language)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default UpcomingExpirationsList;
