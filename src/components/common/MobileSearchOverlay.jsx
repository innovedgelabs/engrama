import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Slide,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getUIText } from '../../utils/i18nHelpers';

const CATEGORY_CONFIG = [
  { key: 'asset', labelKey: 'assetsPlural', fallback: 'Assets' },
  { key: 'affair', labelKey: 'tabRegulatory', fallback: 'Reg. Affairs' },
  { key: 'renewal', labelKey: 'tabRenewals', fallback: 'Renewals' },
    { key: 'attachment', labelKey: 'tabAttachments', fallback: 'Attachments' },
];

const Transition = Slide;

const MobileResultList = ({
  items,
  onSelect,
  language,
}) => {
  if (!items?.length) {
    return (
      <Box sx={{ px: 3, py: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          {getUIText('searchNoResults', language) || 'No results found'}
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {items.map((item) => (
        <ListItemButton
          key={`${item.entityType}-${item.id}`}
          onClick={() => onSelect(item)}
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ListItemText
            primaryTypographyProps={{
              variant: 'body1',
              fontWeight: 600,
              noWrap: true,
            }}
            primary={item.name || ''}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

const MobileSearchOverlay = ({
  open,
  query,
  minChars = 2,
  onClose,
  onQueryChange,
  activeCategory = undefined,
  onCategoryChange,
  resultsByType = [],
  loading = false,
  language,
  onResultSelect,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  const chips = useMemo(() => CATEGORY_CONFIG.map((category) => {
    const label =
      getUIText(category.labelKey, language) ||
      category.fallback;

    const count = resultsByType?.find((group) => group.entityType === category.key)?.results.length || 0;

    return {
      ...category,
      label,
      count,
    };
  }), [language, resultsByType]);

  const activeKey = activeCategory || chips[0].key;

  const activeResults =
    resultsByType?.find((group) => group.entityType === activeKey)?.results || [];

  const showPrompt = !query || query.length < minChars;

  return (
    <Dialog
      fullScreen
      open={open}
      TransitionComponent={Transition}
      TransitionProps={{ direction: 'up' }}
      keepMounted
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
        },
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          py: 1.5,
          gap: 1.5,
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: 'background.default',
        }}
      >
        <IconButton
          edge="start"
          aria-label="close search"
          onClick={onClose}
        >
          <ArrowBackIcon />
        </IconButton>

        <TextField
          inputRef={inputRef}
          fullWidth
          variant="outlined"
          placeholder={getUIText('searchPlaceholder', language) || 'Buscar...'}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  edge="end"
                  onClick={() => onQueryChange('')}
                  size="small"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              borderRadius: 8,
              bgcolor: 'grey.100',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
              },
            },
          }}
        />
      </Toolbar>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
        }}
      >
        {chips.map((chip) => {
          const selected = chip.key === activeKey;
          const label = chip.count ? `${chip.label} (${chip.count})` : chip.label;

          return (
            <Chip
              key={chip.key}
              label={label}
              onClick={() => onCategoryChange(chip.key)}
              variant={selected ? 'filled' : 'outlined'}
              color={selected ? 'primary' : 'default'}
              sx={{
                flexShrink: 0,
              }}
            />
          );
        })}
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              gap: 1.5,
            }}
          >
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              {getUIText('search_empty_state', language) || 'Searching...'}
            </Typography>
          </Box>
        ) : showPrompt ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 3,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <SearchIcon sx={{ fontSize: 28, mb: 1.5 }} />
            <Typography variant="body2">
              {getUIText('search_empty_state', language) || 'Type to start searching'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <MobileResultList
              items={activeResults}
              onSelect={onResultSelect}
              language={language}
            />
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

MobileResultList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    entityType: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  })),
  onSelect: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
};

MobileSearchOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  minChars: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  activeCategory: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
  resultsByType: PropTypes.arrayOf(PropTypes.shape({
    entityType: PropTypes.string.isRequired,
    results: PropTypes.array.isRequired,
  })),
  loading: PropTypes.bool,
  language: PropTypes.string.isRequired,
  onResultSelect: PropTypes.func.isRequired,
};

export default MobileSearchOverlay;
