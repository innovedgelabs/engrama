import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Typography,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { LAYOUT_CONSTANTS } from '../../constants/layout';
import SearchBar from '../common/SearchBar';
import UserMenu from './UserMenu';
import { useDomain } from '../../contexts/DomainContext';
import { filterRequestsByUser, canAccessRequestQueue, canAccessAssetSearch } from '../../utils/userRoles';

const visuallyHiddenStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const BusinessToggleContent = ({ business }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const label = business.shortName ?? business.name;

  if (!business.logo || logoFailed) {
    return (
      <Typography
        component="span"
        sx={{
          fontSize: '0.85rem',
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
    );
  }

  return (
    <>
      <Box
        component="img"
        src={business.logo}
        alt={label}
        sx={{
          height: 50,
          width: 'auto',
          maxWidth: 180,
          display: 'block',
        }}
        onError={() => setLogoFailed(true)}
      />
      <Typography component="span" sx={visuallyHiddenStyle}>
        {label}
      </Typography>
    </>
  );
};

const TopBar = ({
  onMenuClick,
  onLogoClick,
  businesses = [],
  selectedBusinessId,
  onBusinessChange,
  selectedBusinessName,
  showBusinessSelector = false,
  users = [],
  selectedUser,
  selectedUserId,
  onUserChange,
  onViewProfile,
  language = 'es',
}) => {
  const navigate = useNavigate();
  const searchBarRef = useRef(null);
  const hasBusinesses = businesses.length > 0;
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [businessMenuAnchor, setBusinessMenuAnchor] = useState(null);
  const currentUser = selectedUser ?? users.find((user) => user.id === selectedUserId);

  // Get domain context for pension_fund badge logic
  const { currentData, currentDomainId, currentConfig } = useDomain();

  // Domain UI configuration
  const showPlatformLogo = currentConfig?.ui?.showPlatformLogo ?? true;

  // Calculate pending request count for attorneys in pension_fund domain
  const pendingRequestCount = useMemo(() => {
    if (currentDomainId !== 'pension_fund') return null;
    if (!canAccessRequestQueue(currentUser)) return null;

    const allRequests = currentData?.requests || [];
    const roleFiltered = filterRequestsByUser(allRequests, currentUser);
    
    // Count only 'submitted' status (not in_review or draft)
    return roleFiltered.filter((req) => req.workflow_status === 'submitted').length;
  }, [currentDomainId, currentData, currentUser]);

  // Determine if badge should be shown and clickable
  const isPensionFundAttorney = currentDomainId === 'pension_fund' && canAccessRequestQueue(currentUser);
  const showNotificationBadge = currentDomainId !== 'pension_fund' || isPensionFundAttorney;
  const badgeCount = isPensionFundAttorney ? pendingRequestCount : 3;

  // Show search bar based on domain and user role
  const showSearchBar = canAccessAssetSearch(currentUser, currentDomainId);

  const handleNotificationClick = () => {
    if (isPensionFundAttorney) {
      navigate('/');
    }
  };
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleBusinessMenuOpen = (event) => {
    setBusinessMenuAnchor(event.currentTarget);
  };

  const handleBusinessMenuClose = () => {
    setBusinessMenuAnchor(null);
  };

  const handleBusinessSelect = (businessId) => {
    if (!businessId || businessId === selectedBusinessId) {
      handleBusinessMenuClose();
      return;
    }
    onBusinessChange?.(businessId);
    handleBusinessMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2 },
          minHeight: {
            xs: `${LAYOUT_CONSTANTS.topBar.height.mobile}px`,
            sm: `${LAYOUT_CONSTANTS.topBar.height.desktop}px`,
          },
          py: { xs: 0.5, sm: 1 },
        }}
      >
        {/* Left section - Menu button (mobile) / Menu + Logo (desktop) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo - Desktop only (hidden on mobile) */}
          {showPlatformLogo && (
            <Box
              component="img"
              src="/ead_logo.svg"
              alt="Estamos al Día"
              onClick={onLogoClick}
              sx={{
                height: { sm: 42, md: 48 },
                display: { xs: 'none', sm: 'block' },
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                }
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </Box>

        {/* Center section - Logo on mobile / Search on desktop (only for admin/attorney in pension_fund) */}
        {showSearchBar ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Flex centering on smaller screens, absolute centering on xl+
            flex: { xs: 1, xl: 'none' },
            position: { xs: 'static', xl: 'absolute' },
            left: { xl: '50%' },
            transform: { xl: 'translateX(-50%)' },
            width: { xs: '100%', xl: 600 },
            maxWidth: { xs: '100%', sm: 600 },
            px: { xs: 0.5, sm: 0 }
          }}>
            {/* Mobile logo */}
            {showPlatformLogo && (
              <Box
                component="img"
                src="/ead_logo.svg"
                alt="Estamos al Día"
                onClick={onLogoClick}
                sx={{
                  height: 36,
                  display: { xs: 'block', sm: 'none' },
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}

            {/* Desktop search bar */}
            <Box
              sx={{
                width: '100%',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              <SearchBar ref={searchBarRef} language={language} currentUser={currentUser} />
            </Box>
          </Box>
        ) : (
          /* Empty center section when search bar is hidden */
          <Box sx={{ flex: 1 }} />
        )}

        {/* Right section - User actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {showBusinessSelector && hasBusinesses && (
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' }, // Hidden on mobile, moved to sidebar
                alignItems: 'center',
                gap: 0.5,
                mr: { sm: 1.5 },
              }}
              title={selectedBusinessName}
            >
              <Button
                variant="text"
                onClick={handleBusinessMenuOpen}
                sx={{
                  textTransform: 'none',
                  px: 1,
                  py: 0.75,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: 'text.primary',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <BusinessToggleContent business={businesses.find((b) => b.id === selectedBusinessId) || businesses[0]} />
              </Button>
              <Menu
                anchorEl={businessMenuAnchor}
                open={Boolean(businessMenuAnchor)}
                onClose={handleBusinessMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {businesses.map((business) => {
                  const label = business.shortName ?? business.name;
                  return (
                    <MenuItem
                      key={business.id}
                      selected={business.id === selectedBusinessId}
                      onClick={() => handleBusinessSelect(business.id)}
                    >
                      <BusinessToggleContent business={business} />
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          )}

          <Tooltip title="Buscar">
            <IconButton
              aria-label="Buscar"
              onClick={() => searchBarRef.current?.open()}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {showNotificationBadge && (
            <Tooltip title={language === 'es' ? 'Notificaciones' : 'Notifications'}>
              <IconButton onClick={handleNotificationClick}>
                <Badge badgeContent={badgeCount} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Hide avatar on small screens since it's available in the sidebar */}
          {currentUser && (
            <Tooltip title={currentUser.name}>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ ml: { xs: 0, sm: 1 }, display: { xs: 'none', md: 'inline-flex' } }}
              >
                <Avatar
                  src={currentUser.avatarUrl ?? undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'secondary.main',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {currentUser.initials ?? currentUser.name?.slice(0, 2)}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
          <UserMenu
            key={`user-menu-${currentDomainId}-${selectedBusinessId}-${users.length}`}
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={onUserChange}
            onViewProfile={onViewProfile}
            language={language}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
