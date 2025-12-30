import { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { searchEntities, setSearchData } from '../../services/searchService';
import SearchDropdown from './SearchDropdown';
import MobileSearchOverlay from './MobileSearchOverlay';
import { getUIText } from '../../utils/i18nHelpers';
import { getRouteForSearchResult } from '../../utils/searchNavigation';
import { useDomain } from '../../contexts/DomainContext';

const SearchBar = forwardRef(({ language, currentUser }, ref) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentConfig, currentData } = useDomain();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState({ groups: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState('asset');

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const suppressNextOpenRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        if (isMobile) {
          setOverlayOpen(true);
        } else {
          inputRef.current?.focus();
          if (debouncedQuery && debouncedQuery.length >= 2) {
            setDropdownOpen(true);
          }
        }
      },
      close: () => {
        if (isMobile) {
          setOverlayOpen(false);
        } else {
          setDropdownOpen(false);
          inputRef.current?.blur();
        }
      }
    }),
    [isMobile, debouncedQuery]
  );

  // Close overlay if viewport switches to desktop
  useEffect(() => {
    if (!isMobile) {
      setOverlayOpen(false);
    }
  }, [isMobile]);

  // Debounce search query (200ms on mobile for faster response, 300ms on desktop)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, isMobile ? 200 : 300);

    return () => clearTimeout(timer);
  }, [query, isMobile]);

  // Close dropdown immediately when query is cleared (don't wait for debounce)
  useEffect(() => {
    if (query.length === 0) {
      setDropdownOpen(false);
      setResults({ groups: [], total: 0 });
      if (isMobile) {
        setActiveMobileCategory('asset');
      }
    }
  }, [query, isMobile]);

  // Perform search when debounced query changes
  useEffect(() => {
    // Refresh search indexes whenever domain data or config changes
    setSearchData(currentData || {}, currentConfig, currentUser);
  }, [currentData, currentConfig, currentUser]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      setLoading(true);
      try {
        const searchResults = searchEntities(debouncedQuery, {
          entityType: 'all',
          limit: 50 // Increased limit since users can scroll through tabs
        });
        setResults(searchResults);
        if (!isMobile) {
          setDropdownOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({ groups: [], total: 0 });
      } finally {
        setLoading(false);
      }
    } else if (debouncedQuery.length === 0) {
      setResults({ groups: [], total: 0 });
      setDropdownOpen(false);
    }
  }, [debouncedQuery, isMobile]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (isMobile) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const resultsByType = useMemo(() => {
    const entityTypes =
      currentConfig?.search?.entityTypes && currentConfig.search.entityTypes.length
        ? currentConfig.search.entityTypes
        : ['asset', 'affair', 'renewal', 'attachment'];
    return entityTypes.map((entityType) => {
      const group = results.groups?.find((g) => g.entityType === entityType);
      return {
        entityType,
        results: group?.results || [],
      };
    });
  }, [results, currentConfig]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const activeGroup = resultsByType.find((group) => group.entityType === activeMobileCategory);
    if (activeGroup && activeGroup.results.length > 0) {
      return;
    }

    const firstWithResults = resultsByType.find((group) => group.results.length > 0);
    if (firstWithResults) {
      setActiveMobileCategory(firstWithResults.entityType);
    }
  }, [isMobile, resultsByType, activeMobileCategory]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults({ groups: [], total: 0 });
    setDropdownOpen(false);
    if (!isMobile) {
      inputRef.current?.focus();
    }
  }, [isMobile]);

  const handleCloseDropdown = useCallback(() => {
    setDropdownOpen(false);
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const handleInputFocus = useCallback(() => {
    if (suppressNextOpenRef.current) {
      suppressNextOpenRef.current = false;
      return;
    }
    if (isMobile) {
      setOverlayOpen(true);
      return;
    }
    if (debouncedQuery && debouncedQuery.length >= 2) {
      setDropdownOpen(true);
    }
  }, [debouncedQuery, isMobile]);

  const handleInputClick = useCallback(() => {
    if (suppressNextOpenRef.current) {
      suppressNextOpenRef.current = false;
      return;
    }
    if (isMobile) {
      setOverlayOpen(true);
    }
  }, [isMobile]);

  const handleOverlayClose = useCallback(() => {
    setOverlayOpen(false);
    suppressNextOpenRef.current = true;
    setTimeout(() => {
      suppressNextOpenRef.current = false;
    }, 120);
    inputRef.current?.blur();
  }, []);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
  }, []);

  const handleMobileResultSelect = useCallback((item) => {
    if (!item) {
      return;
    }

    const route = getRouteForSearchResult(item, language, currentConfig);
    if (!route) {
      return;
    }

    setOverlayOpen(false);
    suppressNextOpenRef.current = true;
    setTimeout(() => {
      suppressNextOpenRef.current = false;
    }, 120);
    setDropdownOpen(false);
    setResults({ groups: [], total: 0 });
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.blur();
    navigate(route);
  }, [currentConfig, language, navigate]);

  // Always show full search bar on all screen sizes
  return (
    <Box
      ref={searchContainerRef}
      sx={{
        position: 'relative',
        width: '100%',
        minWidth: 0, // Allow shrinking to prevent overflow
      }}
    >
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        placeholder={getUIText('searchPlaceholder', language) || 'Buscar...'}
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        InputProps={{
          readOnly: isMobile,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
                aria-label="clear search"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            bgcolor: 'grey.100',
            borderRadius: 10,
            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '&:hover': {
              bgcolor: 'grey.200',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              }
            },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              }
            }
          }
        }}
      />

      {!isMobile && dropdownOpen && (
        <SearchDropdown
          results={results}
          query={debouncedQuery}
          loading={loading}
          language={language}
          onClose={handleCloseDropdown}
        />
      )}

      {isMobile && (
        <MobileSearchOverlay
          open={overlayOpen}
          query={query}
          onQueryChange={handleQueryChange}
          onClose={handleOverlayClose}
          activeCategory={activeMobileCategory}
          onCategoryChange={setActiveMobileCategory}
          resultsByType={resultsByType}
          loading={loading}
          language={language}
          onResultSelect={handleMobileResultSelect}
        />
      )}
    </Box>
  );
});

export default SearchBar;
