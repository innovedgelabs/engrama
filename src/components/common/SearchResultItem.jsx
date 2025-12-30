import { Box, Typography, ListItem, ListItemButton, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as MuiIcons from '@mui/icons-material';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Update as UpdateIcon,
  AttachFile as AttachFileIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import AssetAvatar from './AssetAvatar';
import { getUIText } from '../../utils/i18nHelpers';
import { getRouteForSearchResult } from '../../utils/searchNavigation';
import { useDomain } from '../../contexts/DomainContext';

const SearchResultItem = ({ result, language, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentConfig } = useDomain();

  const handleClick = () => {
    const route = getRouteForSearchResult(result, language, currentConfig);
    if (!route) {
      return;
    }

    navigate(route);
    if (onClose) {
      onClose();
    }
  };

  const renderIcon = () => {
    const getIconFromConfig = (entityKey, fallback) => {
      const iconName = currentConfig?.entities?.[entityKey]?.icon;
      if (iconName && MuiIcons[iconName]) {
        const IconComponent = MuiIcons[iconName];
        return <IconComponent sx={{ fontSize: 20 }} />;
      }
      return fallback;
    };

    if (result.entityType === 'asset') {
      const iconName = currentConfig?.entities?.[result.category]?.icon;
      const IconFromConfig = iconName && MuiIcons[iconName] ? MuiIcons[iconName] : null;
      return (
        <AssetAvatar
          name={result.name}
          image={result.image}
          variant="list"
          containerSx={{
            width: 40,
            height: 40,
            mr: 1.5
          }}
          avatarSx={{
            fontSize: '1rem',
            fontWeight: 600
          }}
          icon={IconFromConfig ? <IconFromConfig fontSize="small" /> : undefined}
        />
      );
    }

    switch (result.entityType) {
      case 'affair':
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              borderRadius: '50%'
            }}
          >
            {getIconFromConfig('regulatory_affair', <BusinessIcon sx={{ color: 'secondary.dark', fontSize: 20 }} />)}
          </Box>
        );

      case 'renewal':
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'info.light',
              borderRadius: '50%'
            }}
          >
            {getIconFromConfig('renewal', <UpdateIcon sx={{ color: 'info.dark', fontSize: 20 }} />)}
          </Box>
        );

      case 'attachment':
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.200',
              borderRadius: '50%'
            }}
          >
            <AttachFileIcon sx={{ color: 'grey.700', fontSize: 20 }} />
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.300',
              borderRadius: '50%'
            }}
          >
            <DescriptionIcon sx={{ color: 'grey.600', fontSize: 20 }} />
          </Box>
        );
    }
  };

  const renderPrimaryText = () => {
    switch (result.entityType) {
      case 'asset':
        // Special handling for requests: use localized title like "NDA Request (REQ-001)"
        if (result.category === 'request' && result.request_type) {
          const titleTemplate = getUIText(`pf_review_title_${result.request_type}`, language)
            || getUIText('pf_review_title_default', language)
            || 'Request';
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {titleTemplate} ({result.id})
            </Typography>
          );
        }
        return (
          <>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {result.name}
            </Typography>
            {result.code && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  ml: 1
                }}
              >
                {result.code}
              </Typography>
            )}
          </>
        );

      case 'affair':
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {result.name}
          </Typography>
        );

      case 'renewal':
        return (
          <>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {result.name}
            </Typography>
            {result.type && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  ml: 1
                }}
              >
                {result.type}
              </Typography>
            )}
          </>
        );

      case 'attachment':
        return (
          <>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {result.name}
            </Typography>
            {result.type && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  ml: 1
                }}
              >
                {result.type}
              </Typography>
            )}
          </>
        );

      default:
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {result.name || 'Unnamed'}
          </Typography>
        );
    }
  };

  const renderSecondaryText = () => {
    // For entities matched via security, show that info
    if (result.matchedVia === 'security') {
      const securityLabel = result.matchedSecurityTicker || result.matchedSecurityName;
      return securityLabel ? `Matched via security: ${securityLabel}` : 'Matched via security';
    }

    // Show breadcrumb context for nested entities
    if (!result.context) {
      // Assets have no context - show activities or description
      if (result.entityType === 'asset') {
        // Special handling for requests: show counterparty and submitted_by
        if (result.category === 'request') {
          const parts = [];
          if (result.counterparty_name) {
            parts.push(result.counterparty_name);
          }
          if (result.submitted_by) {
            parts.push(result.submitted_by);
          }
          return parts.join(' · ') || result.purpose || '';
        }
        // Special handling for board seats: show entity name
        if (result.category === 'board_seat') {
          return result.entity_name || '';
        }
        return result.activities || result.description || '';
      }
      return result.authority || result.description || '';
    }

    // Build breadcrumb from context
    const breadcrumbParts = [];

    if (result.context.assetName) {
      const categoryLabel =
        currentConfig?.entities?.[result.context.assetCategory]?.label?.[language] ||
        currentConfig?.entities?.[result.context.assetCategory]?.label?.en ||
        result.context.assetCategory;

      breadcrumbParts.push(`${categoryLabel}: ${result.context.assetName}`);
    }

    if (result.context.affairName) {
      breadcrumbParts.push(result.context.affairName);
    }

    if (result.context.renewalName && result.entityType === 'attachment') {
      breadcrumbParts.push(result.context.renewalName);
    }

    return breadcrumbParts.join(' > ');
  };

  return (
    <ListItem
      disablePadding
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none'
        }
      }}
    >
      <ListItemButton
        onClick={handleClick}
        sx={{
          py: { xs: 2.5, md: 1.5 }, // Larger padding on mobile for better touch targets (60-72px)
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        {/* Icon/Avatar */}
        {renderIcon()}

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Primary text */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            {renderPrimaryText()}
          </Box>

          {/* Secondary text (breadcrumb or description) */}
          {renderSecondaryText() && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {renderSecondaryText()}
            </Typography>
          )}
        </Box>

        {/* Chevron */}
        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
      </ListItemButton>
    </ListItem>
  );
};

export default SearchResultItem;
