import React, { useMemo } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  ButtonBase,
  Avatar,
  Typography,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  ListAlt as ListAltIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import * as MuiIcons from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_LANGUAGE, LANGUAGES, getCategoryLabel, getUIText } from '../../utils/i18nHelpers';
import {
  getCategorySlug,
  translatePathname,
  parsePathname,
  getRouteSegment,
} from '../../utils/routing';
import { useSidebar } from '../../contexts/SidebarContext';
import { LAYOUT_CONSTANTS } from '../../constants/layout';
import UserMenu from './UserMenu';
import { useDomain } from '../../contexts/DomainContext';

const MOBILE_SIDEBAR_WIDTH = 240;

const SidebarListItem = ({
  icon: IconComponent,
  label,
  selected,
  onClick,
  open,
  isMobile,
}) => (
  <ListItemButton
    selected={selected}
    onClick={onClick}
    sx={{
      minHeight: 36,
      justifyContent: (open || isMobile) ? 'initial' : 'center',
      px: 1.5,
      py: 0.5,
      '&.Mui-selected': {
        backgroundColor: 'primary.main',
        color: 'white',
        '&:hover': {
          backgroundColor: 'primary.dark',
        },
        '& .MuiListItemIcon-root': {
          color: 'white',
        },
      },
    }}
  >
    <ListItemIcon
      sx={{
        minWidth: 0,
        mr: (open || isMobile) ? 1.5 : 'auto',
        justifyContent: 'center',
        color: selected ? 'white' : 'text.secondary',
        flexShrink: 0,
      }}
    >
      <IconComponent sx={{ fontSize: 20 }} />
    </ListItemIcon>
    {(open || isMobile) && (
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontSize: '0.8125rem',
          fontWeight: selected ? 600 : 400,
          lineHeight: 1.3,
          noWrap: true,
        }}
        sx={{
          margin: 0,
          overflow: 'hidden',
        }}
      />
    )}
  </ListItemButton>
);

// Helper to check if user role matches allowed roles
const hasAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true; // No restriction = all roles
  return allowedRoles.includes(userRole);
};

// Icon map for navigation items (used by all domains)
// Reads icon names from domain config and maps to actual components
const NAV_ICONS = {
  ListAltIcon: ListAltIcon,
  HomeIcon: HomeIcon,
  AddIcon: AddIcon,
  AccountBalance: MuiIcons.AccountBalance || HomeIcon,
  Groups: MuiIcons.Groups || HomeIcon,
  BusinessCenter: MuiIcons.BusinessCenter || HomeIcon,
};

const SidebarNavSection = ({
  open,
  isMobile,
  language,
  currentConfig,
  currentRouteType,
  currentCategory,
  currentDomainId,
  selectedUser,
  onNavigate,
}) => {
  const userRole = selectedUser?.role;

  // Build navigation sections based on config and user role
  const navSections = useMemo(() => {
    // Check if domain has navigation config
    const navigationConfig = currentConfig?.navigation;

    if (navigationConfig) {
      const { sections, labels } = navigationConfig;

      return sections
        .filter((section) => hasAccess(userRole, section.roles))
        .map((section) => ({
          id: section.id,
          items: section.items.map((item) => {
            // Determine if item is selected based on routeType and optionally routeCategory
            let isSelected = false;
            if (item.routeTypes) {
              isSelected = item.routeTypes.includes(currentRouteType);
            } else if (item.routeCategory) {
              // If routeCategory is specified, match both routeType and category
              isSelected = currentRouteType === item.routeType && currentCategory === item.routeCategory;
            } else {
              isSelected = currentRouteType === item.routeType;
            }

            return {
              id: item.id,
              icon: NAV_ICONS[item.icon] || HomeIcon,
              label: labels[item.labelKey]?.[language] || item.labelKey,
              path: item.path,
              selected: isSelected,
            };
          }),
        }));
    }

    // Default navigation for other domains
    return [
      {
        id: 'section_main',
        items: [
          { id: 'home', icon: HomeIcon, label: language === 'es' ? 'Inicio' : 'Home', path: '/', selected: currentRouteType === 'home' },
          { id: 'control_panel', icon: SettingsIcon, label: getUIText('control_panel', language), path: `/${getRouteSegment('control_panel', language, currentConfig)}`, selected: currentRouteType === 'control_panel' },
          { id: 'dashboard', icon: DashboardIcon, label: language === 'es' ? 'Panel' : 'Dashboard', path: `/${getRouteSegment('dashboard', language, currentConfig)}`, selected: currentRouteType === 'dashboard' },
        ],
      },
    ];
  }, [userRole, language, currentRouteType, currentCategory, currentConfig]);

  // Render a single nav item as mobile button
  const MobileNavButton = ({ item }) => {
    const Icon = item.icon;
    return (
      <ButtonBase
        onClick={() => onNavigate(item.path)}
        aria-pressed={item.selected}
        sx={{
          width: '100%',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: item.selected ? 'primary.main' : 'divider',
          backgroundColor: item.selected ? 'primary.main' : 'grey.100',
          color: item.selected ? 'primary.contrastText' : 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          py: 0.75,
          px: 0.6,
          minHeight: 50,
          transition: 'all 0.2s ease',
          boxShadow: item.selected ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
          '&:hover': { backgroundColor: item.selected ? 'primary.dark' : 'grey.200' },
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.63rem', textAlign: 'center', lineHeight: 1.2 }}>
          {item.label}
        </Typography>
      </ButtonBase>
    );
  };

  // Render sections with separators (works for both mobile and desktop)
  const renderSections = () =>
    navSections.map((section, index) => (
      <React.Fragment key={section.id}>
        {isMobile ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
            {section.items.map((item) => <MobileNavButton key={item.id} item={item} />)}
          </Box>
        ) : (
          <List sx={{ pt: 0, pb: 0 }}>
            {section.items.map((item) => (
              <SidebarListItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                selected={item.selected}
                onClick={() => onNavigate(item.path)}
                open={open}
                isMobile={isMobile}
              />
            ))}
          </List>
        )}
        {index < navSections.length - 1 && (
          <Divider sx={isMobile ? { my: 1.5 } : { mx: open ? 1.5 : 0.5, my: 0.5 }} />
        )}
      </React.Fragment>
    ));

  return (
    <Box sx={isMobile ? { px: 2, pt: 2, pb: 1 } : { pt: 0, pb: 0.5 }}>
      {renderSections()}
    </Box>
  );
};

const SidebarCategorySection = ({ open, isMobile, language, currentCategory, onNavigate, categories }) => {
  const categoryList = useMemo(() => categories || [], [categories]);
  if (isMobile) {
    return (
      <Box
        sx={{
          px: 2,
          py: 2,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1.25,
          }}
        >
          {categoryList.map(({ id, icon: Icon, label, path }) => {
            const selected = currentCategory === id;
            return (
              <ButtonBase
                key={id}
                onClick={() => onNavigate(path)}
                aria-pressed={selected}
                sx={{
                  width: '100%',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  backgroundColor: selected ? 'primary.main' : 'grey.100',
                  color: selected ? 'primary.contrastText' : 'text.primary',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  py: 0.75,
                  px: 0.6,
                  minHeight: 50,
                  transition: 'all 0.2s ease',
                  boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  '&:hover': {
                    backgroundColor: selected ? 'primary.dark' : 'grey.200',
                  },
                  '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineOffset: 2,
                    outlineColor: (theme) => theme.palette.primary.main,
                  },
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.63rem',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    );
  }

  return (
    <List sx={{ pt: 0, pb: 0.5, flex: 1, overflow: 'auto' }}>
      {categoryList.map(({ id, icon: Icon, label, path }) => {
        const selected = currentCategory === id;
        return (
          <SidebarListItem
            key={id}
            icon={Icon}
            label={label}
            selected={selected}
            onClick={() => onNavigate(path)}
            open={open}
            isMobile={isMobile}
          />
        );
      })}
    </List>
  );
};

const Sidebar = ({
  open,
  onClose,
  language = DEFAULT_LANGUAGE,
  onLanguageChange,
  businesses = [],
  selectedBusinessId,
  onBusinessChange,
  showBusinessSelector = false,
  users = [],
  selectedUser,
  selectedUserId,
  onUserChange,
  onViewProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useSidebar();
  const { currentConfig } = useDomain();

  const categories = useMemo(() => {
    const entities = currentConfig?.entities || {};
    const demoKey = currentConfig?.defaultDemo;
    const usage = currentConfig?.demos?.[demoKey]?.schemaUsage?.primary || [];
    const primaryList = usage.length ? usage : Object.keys(entities);

    return primaryList
      .map((id) => {
        const config = entities[id];
        if (!config) return null;
        const IconComponent = (config.icon && MuiIcons[config.icon]) || CategoryIcon;
        const label =
          config.label?.[language] ||
          config.label?.en ||
          config.label?.es ||
          id;
        const path = `/${getCategorySlug(id, language, currentConfig)}`;
        return { id, icon: IconComponent, label, path };
      })
      .filter(Boolean);
  }, [currentConfig, language]);

  const routeInfo = useMemo(() => parsePathname(location.pathname, currentConfig), [location.pathname, currentConfig]);
  const currentCategory = useMemo(() => {
    if (!routeInfo) {
      return null;
    }
    if (routeInfo.type === 'category' || routeInfo.type === 'asset') {
      return routeInfo.params?.category ?? null;
    }
    return null;
  }, [routeInfo]);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);
  const effectiveSelectedUser = useMemo(() => {
    if (selectedUser) {
      return selectedUser;
    }
    return users.find((user) => user.id === selectedUserId) ?? null;
  }, [selectedUser, selectedUserId, users]);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const toggleLanguage = () => {
    if (!onLanguageChange) {
      return;
    }

    const currentIndex = LANGUAGES.findIndex((lang) => lang.id === language);
    const nextLanguage = LANGUAGES[(currentIndex + 1) % LANGUAGES.length]?.id ?? DEFAULT_LANGUAGE;

    if (nextLanguage !== language) {
      const translatedPath = translatePathname(location.pathname, nextLanguage, currentConfig);
      if (translatedPath && translatedPath !== location.pathname) {
        navigate({ pathname: translatedPath, search: location.search }, { replace: true });
      }
      onLanguageChange(nextLanguage);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <SidebarNavSection
        open={open}
        isMobile={isMobile}
        language={language}
        currentConfig={currentConfig}
        currentRouteType={routeInfo?.type ?? null}
        currentCategory={currentCategory}
        currentDomainId={currentConfig?.id}
        selectedUser={effectiveSelectedUser}
        onNavigate={handleNavigate}
      />

      {/* Category section - hidden if domain config specifies showCategories: false */}
      {(currentConfig?.ui?.showCategories ?? true) && (
        <>
          <Divider sx={{ mx: (open || isMobile) ? 1.5 : 0.5, my: 0.5 }} />

          <SidebarCategorySection
            open={open}
            isMobile={isMobile}
            language={language}
            currentCategory={currentCategory}
            onNavigate={handleNavigate}
            categories={categories}
            currentConfig={currentConfig}
          />
        </>
      )}

      <SidebarFooterSection
        open={open}
        isMobile={isMobile}
        language={language}
        onToggleLanguage={toggleLanguage}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onBusinessChange={onBusinessChange}
        showBusinessSelector={showBusinessSelector}
      />

      {isMobile && (
        <>
          <Divider />
          <ButtonBase 
            onClick={handleUserMenuOpen}
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              width: '100%',
              justifyContent: 'flex-start',
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              textAlign: 'left'
            }}
          >
            <Avatar 
              src={effectiveSelectedUser?.avatarUrl ?? undefined}
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'secondary.main',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {effectiveSelectedUser?.initials ?? effectiveSelectedUser?.name?.slice(0, 2) ?? 'USR'}
            </Avatar>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {effectiveSelectedUser?.name ?? 'Usuario'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {effectiveSelectedUser?.title ?? getUIText('viewProfile', language)}
              </Typography>
            </Box>
          </ButtonBase>
          <UserMenu
            key={`user-menu-${currentConfig?.id || selectedBusinessId}-${users.length}`}
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={onUserChange}
            onViewProfile={onViewProfile}
            language={language}
          />
        </>
      )}
    </Box>
  );

  // Use temporary drawer on mobile, permanent on desktop
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: MOBILE_SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            top: 0,
            height: '100dvh',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: permanent drawer
  return (
    <Drawer
      variant="permanent"
      sx={(theme) => ({
        width: open ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth,
          boxSizing: 'border-box',
          transition: `width ${LAYOUT_CONSTANTS.sidebar.transition}`,
          overflowX: 'hidden',
          top: `${LAYOUT_CONSTANTS.topBar.height.mobile}px`,
          height: `calc(100dvh - ${LAYOUT_CONSTANTS.topBar.height.mobile}px)`,
          borderRight: '1px solid',
          borderColor: 'divider',
          [theme.breakpoints.up('sm')]: {
            top: `${LAYOUT_CONSTANTS.topBar.height.desktop}px`,
            height: `calc(100dvh - ${LAYOUT_CONSTANTS.topBar.height.desktop}px)`,
          },
        },
      })}
    >
      {drawerContent}
    </Drawer>
  );
};

const BusinessSelectorContent = ({ business }) => {
  const [logoFailed, setLogoFailed] = React.useState(false);
  const label = business.shortName ?? business.name;

  if (!business.logo || logoFailed) {
    return <span>{label}</span>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={business.logo}
        alt={label}
        sx={{
          height: 28,
          width: 'auto',
          maxWidth: '100%',
          display: 'block',
        }}
        onError={() => setLogoFailed(true)}
      />
    </Box>
  );
};

const SidebarFooterSection = ({
  open,
  isMobile,
  language,
  onToggleLanguage,
  businesses = [],
  selectedBusinessId,
  onBusinessChange,
  showBusinessSelector = false,
}) => {
  const hasBusinesses = businesses.length > 0;
  const showBusinessSelectorOnMobile = isMobile && showBusinessSelector && hasBusinesses;

  const handleBusinessChange = (event) => {
    const nextBusinessId = event.target.value;
    if (!nextBusinessId || nextBusinessId === selectedBusinessId) {
      return;
    }
    onBusinessChange?.(nextBusinessId);
  };

  return (
    <Box>
      <Divider />

      <Box
        sx={{
          px: (open || isMobile) ? 1.5 : 0.5,
          py: 1,
          display: 'flex',
          flexDirection: showBusinessSelectorOnMobile ? 'column' : 'row',
          gap: showBusinessSelectorOnMobile ? 1 : 0,
          justifyContent: 'center',
        }}
      >
        {showBusinessSelectorOnMobile && (
          <Select
            value={selectedBusinessId ?? ''}
            onChange={handleBusinessChange}
            size="small"
            displayEmpty
            fullWidth
            sx={{
              fontSize: '0.8rem',
              fontWeight: 500,
              '& .MuiSelect-select': {
                py: 1,
                px: 1.5,
              },
            }}
            inputProps={{ 'aria-label': 'Select business' }}
          >
            {businesses.map((business) => {
              const selectedBusiness = businesses.find((b) => b.id === business.id);
              return (
                <MenuItem key={business.id} value={business.id}>
                  {selectedBusiness && selectedBusiness.logo ? (
                    <BusinessSelectorContent business={selectedBusiness} />
                  ) : (
                    business.shortName ?? business.name
                  )}
                </MenuItem>
              );
            })}
          </Select>
        )}

        <Button
          onClick={onToggleLanguage}
          variant="contained"
          disableElevation
          fullWidth={showBusinessSelectorOnMobile}
          sx={{
            borderRadius: '999px',
            minWidth: (open || isMobile) ? 80 : 32,
            width: (open || isMobile) ? (showBusinessSelectorOnMobile ? '100%' : 'auto') : 32,
            height: 28,
            px: (open || isMobile) ? 1.5 : 0,
            fontWeight: 600,
            letterSpacing: 0.5,
            fontSize: (open || isMobile) ? '0.75rem' : '0.7rem',
            backgroundColor: 'grey.200',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'grey.300',
            },
          }}
        >
          {language?.toUpperCase() ?? DEFAULT_LANGUAGE.toUpperCase()}
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
