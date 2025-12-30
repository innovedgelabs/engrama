import { useState, memo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import AssetTile from '../common/AssetTile';
import ScrollContainer from '../common/ScrollContainer';
import { DEFAULT_LANGUAGE, getUIText } from '../../utils/i18nHelpers';
import { useDomain } from '../../contexts/DomainContext';

const AssetGrid = ({ assetsByCategory, viewMode, language = DEFAULT_LANGUAGE }) => {
  const categories = Object.keys(assetsByCategory);
  const { currentConfig } = useDomain();
  
  // Keep track of which accordions are expanded (all expanded by default)
  const [expanded, setExpanded] = useState(
    categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {})
  );

  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpanded(prev => ({
      ...prev,
      [category]: isExpanded
    }));
  };

  if (categories.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 6,
          color: 'text.secondary' 
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1rem' }}>
          {getUIText('noResultsTitle', language)}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
          {getUIText('noResultsSubtitle', language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {categories.map(category => (
        <Accordion 
          key={category}
          expanded={expanded[category]}
          onChange={handleAccordionChange(category)}
          sx={{
            mb: { xs: 1, sm: 1.5, md: 2 },
            boxShadow: { xs: 0, sm: 1 },
            border: { xs: '1px solid', sm: 'none' },
            borderColor: { xs: 'divider', sm: 'transparent' },
            '&:before': {
              display: 'none', // Remove default MUI accordion divider
            },
            borderRadius: { xs: '4px !important', sm: '6px !important', md: '8px !important' },
            overflow: 'hidden',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
            sx={{
              minHeight: { xs: 44, sm: 48, md: 56 },
              borderBottom: expanded[category] ? '2px solid' : 'none',
              borderColor: 'secondary.main',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                my: { xs: 0.75, sm: 1, md: 1.5 },
                mx: 0,
              },
              px: { xs: 1.25, sm: 1.5, md: 2 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="subtitle1" 
                component="h2"
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {currentConfig?.entities?.[category]?.label?.[language] ||
                  currentConfig?.entities?.[category]?.label?.en ||
                  category}
              </Typography>
              <Chip 
                label={assetsByCategory[category].length}
                size="small"
                color="primary"
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                  minWidth: { xs: 28, sm: 32 },
                }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            <ScrollContainer sx={{
              pt: { xs: 1, sm: 1.5, md: 2 },
              pb: { xs: 1.5, sm: 2, md: 3 },
              px: { xs: 0.75, sm: 1, md: 2 },
              maxHeight: 'calc(100vh - 250px)', // Leave space for header and accordion title
              overflowX: 'hidden',
            }}>
              {/* Assets Grid */}
              <Grid container spacing={1.5}>
                {assetsByCategory[category].map(asset => (
                  <Grid
                    item
                    xs={6}
                    sm={viewMode === 'grid' ? 4 : 12}
                    md={viewMode === 'grid' ? 3 : 6}
                    lg={viewMode === 'grid' ? 2 : 4}
                    xl={viewMode === 'grid' ? 2 : 3}
                    key={asset.id}
                  >
                    <AssetTile asset={asset} viewMode={viewMode} language={language} />
                  </Grid>
                ))}
              </Grid>
            </ScrollContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default memo(AssetGrid);





