import { useState, memo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  VisibilityOutlined as ViewIcon,
  FileDownloadOutlined as DownloadIcon,
  IosShare as ShareIcon,
} from '@mui/icons-material';
import { getUIText, DEFAULT_LANGUAGE } from '../../utils/i18nHelpers';

/**
 * Default actions for expandable rows (View, Download, Share)
 */
const getDefaultActions = (language = DEFAULT_LANGUAGE) => [
  {
    icon: <ViewIcon fontSize="small" />,
    label: getUIText('tooltipView', language),
    onClick: () => console.log('View clicked') // Placeholder
  },
  {
    icon: <DownloadIcon fontSize="small" />,
    label: getUIText('tooltipDownload', language),
    onClick: () => console.log('Download clicked') // Placeholder
  },
  {
    icon: <ShareIcon fontSize="small" />,
    label: getUIText('tooltipSend', language),
    onClick: () => console.log('Share clicked') // Placeholder
  },
];

/**
 * ExpandableRow - Mobile-optimized expandable row component
 *
 * Provides a compact collapsed view with key information, and expands to show
 * full details and actions. Designed for mobile document access workflows.
 *
 * @param {string} title - Main title (shown in collapsed view)
 * @param {string} borderColor - Color for the card's left border (based on status)
 * @param {Array} details - Array of { label, value } for expanded view
 * @param {Array} actions - Array of { icon, label, onClick } for action buttons (optional, defaults to View/Download/Share)
 * @param {Function} onClick - Handler to navigate to detail view (invoked from arrow button)
 * @param {boolean} defaultExpanded - Whether row starts expanded
 * @param {boolean} showActionsInCollapsed - Show action trigger in collapsed state (default: true)
 * @param {string} language - Current language for action labels
 */
const ExpandableRow = ({
  title,
  borderColor,
  details = [],
  actions,
  onClick,
  defaultExpanded = false,
  showActionsInCollapsed = true,
  language = DEFAULT_LANGUAGE,
}) => {
  // Use provided actions or default to View/Download/Share
  const effectiveActions = actions || getDefaultActions(language);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event?.stopPropagation?.();
    setMenuAnchorEl(null);
  };

  const handleActionSelect = (actionOnClick) => (event) => {
    event.stopPropagation();
    handleMenuClose(event);
    actionOnClick?.();
  };

  const handleCardClick = () => {
    setMenuAnchorEl(null);
    setExpanded((prev) => !prev);
  };

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        borderLeft: borderColor ? '4px solid' : 'none',
        borderLeftColor: borderColor || 'transparent',
        '&:hover': {
          boxShadow: 2,
        },
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onClick={handleCardClick}
    >
      <CardContent
        sx={{
          p: 1.5,
          '&:last-child': { pb: 1.5 },
          minHeight: 68, // Consistent height for 1-2 line titles
        }}
      >
        {/* Collapsed view - Always visible */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Header row: Title | Status | Actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            {/* Title */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
                flex: 1,
                minWidth: 0,
              }}
            >
              {title}
            </Typography>

            {/* Action menu trigger */}
            {showActionsInCollapsed && effectiveActions.length > 0 && (
              <>
                <IconButton
                  size="small"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen ? 'true' : undefined}
                  aria-label="More actions"
                  onClick={handleMenuOpen}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: isMenuOpen ? 'primary.50' : 'transparent',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      elevation: 3,
                      sx: {
                        mt: 0.5,
                        borderRadius: 2,
                        minWidth: 190,
                        py: 0.5,
                      },
                    },
                  }}
                >
                  {effectiveActions.map(({ icon, label, onClick: actionOnClick }, index) => (
                    <MenuItem
                      key={index}
                      onClick={handleActionSelect(actionOnClick)}
                      sx={{
                        gap: 1.5,
                        px: 1.5,
                        py: 0.85,
                        '&:hover': {
                          backgroundColor: 'primary.50',
                        },
                      }}
                    >
                      {icon && (
                        <ListItemIcon
                          sx={{
                            color: 'primary.main',
                            minWidth: 28,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                      )}
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* Expanded details */}
        <Collapse in={expanded} timeout={200}>
          {(details.length > 0 || onClick) && (
            <>
              <Divider sx={{ my: 1.5 }} />

              {/* Details Grid */}
              {details.length > 0 && (
                <Stack spacing={0.75} sx={{ mb: onClick ? 1.5 : 0 }}>
                  {details.map(({ label, value }, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.7rem',
                          flexShrink: 0,
                          minWidth: '30%',
                        }}
                      >
                        {label}:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          textAlign: 'right',
                          flex: 1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Navigate to detail */}
              {onClick && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    size="medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }}
                    sx={{
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      width: 44,
                      height: 44,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                      },
                    }}
                    aria-label="Ver detalle"
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default memo(ExpandableRow);
