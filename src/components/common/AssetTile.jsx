import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
} from '@mui/material';
import ClickableCard from './ClickableCard';
import AssetAvatar from './AssetAvatar';
import StatusTrafficLights from './StatusTrafficLights';
import { COMPLIANCE_STATUS } from '../../utils/status';
import { getCategorySlug, getTabSlug } from '../../utils/routing';
import { useDomain } from '../../contexts/DomainContext';

const AssetTile = ({
  asset,
  viewMode,
  language = 'es',
  trafficLightDimensions = ['compliance'],
}) => {
  const navigate = useNavigate();
  const { currentConfig } = useDomain();

  const handleCardClick = () => {
    const categorySlug = getCategorySlug(asset.category, language, currentConfig);
    const infoSlug = getTabSlug('info', 'asset', language, currentConfig);
    navigate(`/${categorySlug}/${asset.id}/${infoSlug}`);
  };

  if (viewMode === 'list') {
    return (
      <ClickableCard
        onClick={handleCardClick}
        contentSx={{
          p: 0,
          '&:last-child': { pb: 0 },
          display: 'flex'
        }}
      >
        {/* Image or Letter Avatar */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1.5, sm: 2 },
            minWidth: { xs: 60, sm: 80 }
          }}
        >
          <AssetAvatar name={asset.name} image={asset.image} variant="list" />
        </Box>

        {/* Content Area */}
        <Box sx={{
          display: 'flex',
          flex: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          py: { xs: 1.5, sm: 2 },
          pl: 0,
          pr: { xs: 1.5, sm: 3 },
          gap: { xs: 1, sm: 2 }
        }}>
          {/* Asset Name and Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                mb: { xs: 0.25, sm: 0.5 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {asset.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {asset.activities}
            </Typography>
          </Box>

          {/* Traffic Light Status Indicator */}
          <Box sx={{ mt: { xs: 0.25, sm: 0.5 } }}>
            <StatusTrafficLights
              dimensionCounts={asset.dimensionCounts}
              language={language}
              size="medium"
              showDimensions={trafficLightDimensions}
            />
          </Box>
        </Box>
      </ClickableCard>
    );
  }

  // Grid view
  return (
    <ClickableCard
      onClick={handleCardClick}
      contentSx={{
        p: 0,
        '&:last-child': { pb: 0 }
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Image or Letter Avatar */}
      <Box
        sx={{
          position: 'relative',
          paddingTop: { xs: '60%', sm: '70%', md: '80%' }, // Responsive aspect ratio
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <AssetAvatar
          name={asset.name}
          image={asset.image}
          variant="grid"
          imageSx={{ p: 1.5 }}
        />
      </Box>

      {/* Name and Traffic Light - Centered */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 0.5, sm: 0.75 },
        flexGrow: 1
      }}>
        {/* Asset Name */}
        <Typography
          variant="subtitle2"
          component="h3"
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: 600,
            color: 'text.primary',
            textAlign: 'center',
            mb: { xs: 0.25, sm: 0.5 },
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            width: '100%'
          }}
        >
          {asset.name}
        </Typography>

        {/* Traffic Light Status Indicator */}
        <StatusTrafficLights
          dimensionCounts={asset.dimensionCounts}
          language={language}
          size="small"
          showDimensions={trafficLightDimensions}
        />
      </Box>
    </ClickableCard>
  );
};

export default memo(AssetTile);
