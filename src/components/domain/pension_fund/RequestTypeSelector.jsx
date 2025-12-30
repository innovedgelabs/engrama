import { Box, Typography, useTheme, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DescriptionOutlined as NdaIcon,
  LockOutlined as MnpiIcon,
  ShareOutlined as InfoSharingIcon,
  AssignmentOutlined as NrlIcon,
} from '@mui/icons-material';
import { DEFAULT_LANGUAGE, getUIText } from '../../../utils/i18nHelpers';

/**
 * Request type definitions with metadata and icons
 */
const REQUEST_TYPES = [
  {
    value: 'NDA',
    label: 'NDA',
    icon: NdaIcon,
    enabled: true,
  },
  {
    value: 'MNPI',
    label: 'MNPI',
    icon: MnpiIcon,
    enabled: true,
  },
  {
    value: 'INFO_SHARING',
    label: 'Info Sharing',
    icon: InfoSharingIcon,
    enabled: true,
  },
  {
    value: 'NRL',
    label: 'NRL',
    icon: NrlIcon,
    enabled: true,
  },
];

/**
 * RequestTypeSelector - Visual card-based selector for request types
 * 
 * Displays 4 request type cards in a 2x2 grid layout with icons.
 * Only NDA is enabled; other types appear disabled.
 */
const RequestTypeSelector = ({
  selectedType,
  onTypeChange,
  language = DEFAULT_LANGUAGE,
}) => {
  const theme = useTheme();

  // Get the full name from i18n
  const getTypeFullName = (value) => {
    const key = `pf_request_type_${value.toLowerCase()}_full`;
    return getUIText(key, language) || value;
  };

  const handleCardClick = (type) => {
    if (type.enabled && onTypeChange) {
      onTypeChange(type.value);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Title */}
      <Typography
        variant="body2"
        sx={{
          display: 'block',
          mb: 1.5,
          fontWeight: 500,
          color: 'text.primary',
        }}
      >
        Request Type <span style={{ color: theme.palette.error.main }}>*</span>
      </Typography>

      {/* Cards Grid - 4 columns on lg+, 2 columns on md, 1 column on mobile */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {REQUEST_TYPES.map((type) => {
          const isSelected = selectedType === type.value;
          const isEnabled = type.enabled;
          const IconComponent = type.icon;
          const fullName = getTypeFullName(type.value);

          return (
            <Tooltip key={type.value} title={fullName} arrow placement="top">
              <Box
                onClick={() => handleCardClick(type)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: isSelected
                    ? 'secondary.main'
                    : isEnabled
                    ? 'grey.300'
                    : 'grey.200',
                  bgcolor: isSelected
                    ? alpha(theme.palette.secondary.main, 0.12)
                    : isEnabled
                    ? 'background.paper'
                    : 'grey.50',
                  cursor: isEnabled ? 'pointer' : 'not-allowed',
                  opacity: isEnabled ? 1 : 0.5,
                  transition: 'all 0.2s ease-in-out',
                  minHeight: '100px',
                  ...(isEnabled && !isSelected && {
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                  }),
                }}
              >
                {/* Icon */}
                <IconComponent
                  sx={{
                    fontSize: 26,
                    mb: 0.75,
                    color: isEnabled
                      ? isSelected
                        ? 'secondary.main'
                        : 'primary.main'
                      : 'text.disabled',
                  }}
                />

                {/* Type Abbreviation */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: isEnabled
                      ? isSelected
                        ? 'secondary.main'
                        : 'text.primary'
                      : 'text.disabled',
                  }}
                >
                  {type.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default RequestTypeSelector;
