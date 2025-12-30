import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import theme from './theme';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { SidebarProvider } from './contexts/SidebarContext';
import { DomainProvider } from './contexts/DomainContext';
import {
  DEFAULT_BUSINESS_ID,
  DEMO_BUSINESSES,
  getBusinessById,
  getBusinessData,
} from './data/mockData';
import { DEFAULT_LANGUAGE } from './utils/i18nHelpers';
import { loadDomainConfig } from './utils/domainRegistry';
import { loadDomainData } from './utils/domainLoader';
import { getRouteSegment } from './utils/routing';
import { canAccessRequestQueue, isGeneralUser } from './utils/userRoles';

const HomeView = lazy(() => import('./views/HomeView'));
const RequestQueueView = lazy(() => import('./views/RequestQueueView'));
const CreateRequestView = lazy(() => import('./views/CreateRequestView'));
const CategoryView = lazy(() => import('./views/CategoryView'));
const DetailView = lazy(() => import('./views/DetailView'));
const ControlPanelView = lazy(() => import('./views/ControlPanelView'));
const DashboardView = lazy(() => import('./views/DashboardView'));

const RouteFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress color="primary" size={32} />
  </Box>
);

// Helper to safely read localStorage, treating "null"/"undefined" strings as null
const getPersistedValue = (key) => {
  try {
    const value = localStorage.getItem(key);
    // Treat "null", "undefined", or empty string as null
    if (!value || value === 'null' || value === 'undefined') return null;
    return value;
  } catch (e) {
    return null;
  }
};

function App() {
  const persistedBusinessId = getPersistedValue('ead:lastBusinessId');
  const persistedUserId = getPersistedValue('ead:lastUserId');
  const persistedLanguage = getPersistedValue('ead:lastLanguage');

  const defaultBusiness = getBusinessById(persistedBusinessId || DEFAULT_BUSINESS_ID);

  // Load domain config for default business to get default language
  const defaultDomainConfig = useMemo(() => {
    if (!defaultBusiness?.domainId) return null;
    return loadDomainConfig(defaultBusiness.domainId);
  }, [defaultBusiness?.domainId]);

  // Read default language from domain config, fallback to DEFAULT_LANGUAGE
  const businessDefaultLanguage = defaultDomainConfig?.defaultLanguage || DEFAULT_LANGUAGE;

  // Trust persistedUserId initially - it will be validated once domain data loads
  const initialUserId = persistedUserId ?? defaultBusiness?.defaultUserId ?? defaultBusiness?.users?.[0]?.id ?? null;

  const [selectedBusinessId, setSelectedBusinessId] = useState(defaultBusiness.id);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [language, setLanguage] = useState(persistedLanguage || businessDefaultLanguage);
  const [currentDomainId, setCurrentDomainId] = useState(
    defaultBusiness?.domainId ?? 'regulatory_affairs',
  );
  const [domainConfig, setDomainConfig] = useState(null);
  const [domainData, setDomainData] = useState(null);
  const [isLoadingDomain, setIsLoadingDomain] = useState(true);
  const [domainError, setDomainError] = useState(null);
  const [isUserSwitching, setIsUserSwitching] = useState(false);
  const [isBusinessSwitching, setIsBusinessSwitching] = useState(false);

  const businessData = useMemo(
    () => getBusinessData(selectedBusinessId),
    [selectedBusinessId]
  );

  const currentUsers = useMemo(() => {
    if (domainData?.users) return domainData.users;
    return businessData.users ?? [];
  }, [domainData?.users, businessData.users]);

  const selectedUser = useMemo(() => {
    return currentUsers.find((user) => user.id === selectedUserId) ?? currentUsers[0] ?? null;
  }, [currentUsers, selectedUserId]);

  // Load domain data
  const loadDomain = useCallback(async () => {
    setIsLoadingDomain(true);
    setDomainError(null);

    try {
      console.log(`[App] Loading domain: ${currentDomainId}`);

      const config = await loadDomainConfig(currentDomainId);
      setDomainConfig(config);
      console.log('[App] Domain config loaded successfully');

      const data = await loadDomainData(config, selectedBusinessId);
      setDomainData(data);
      console.log('[App] Domain data loaded successfully');
    } catch (error) {
      console.error('[App] Failed to load domain:', error);
      setDomainError(error.message);
    } finally {
      setIsLoadingDomain(false);
    }
  }, [currentDomainId, selectedBusinessId]);

  // Initial domain load
  useEffect(() => {
    loadDomain();
  }, [loadDomain]);

  // Listen for domain:refresh events (triggered after request create/update/delete)
  useEffect(() => {
    const handleDomainRefresh = () => {
      console.log('[App] Received domain:refresh event, reloading data...');
      loadDomain();
    };

    window.addEventListener('domain:refresh', handleDomainRefresh);
    return () => window.removeEventListener('domain:refresh', handleDomainRefresh);
  }, [loadDomain]);

  // Validate and correct selectedUserId once domain data loads
  // This ensures persisted users from domain data are restored correctly
  useEffect(() => {
    // Only validate after domain data has loaded and we have users available
    if (isLoadingDomain || !domainData || currentUsers.length === 0) return;
    // Don't interfere with active user or business switching
    if (isUserSwitching || isBusinessSwitching) return;

    // Check if current selectedUserId exists in available users
    const userExists = currentUsers.some((u) => u.id === selectedUserId);
    if (userExists) return; // Current user is valid, no correction needed

    // Current user doesn't exist in domain users
    // Only try persisted user ID if it's for the current business (not from a different domain)
    const latestPersistedBusinessId = getPersistedValue('ead:lastBusinessId');
    const latestPersistedUserId = getPersistedValue('ead:lastUserId');
    
    // Only restore persisted user if it's for the current business
    if (latestPersistedUserId && latestPersistedBusinessId === selectedBusinessId) {
      const persistedUserExists = currentUsers.some((u) => u.id === latestPersistedUserId);
      if (persistedUserExists) {
        setSelectedUserId(latestPersistedUserId);
        return;
      }
    }

    // Fall back to first available user (domain default)
    if (currentUsers[0]?.id) {
      setSelectedUserId(currentUsers[0].id);
    }
  }, [isLoadingDomain, domainData, currentUsers, selectedUserId, selectedBusinessId, isUserSwitching, isBusinessSwitching]);

  // Shared context switching logic for user and business changes
  const handleContextSwitch = useCallback((type, eventDetail, stateUpdates) => {
    // Set appropriate switching state
    if (type === 'business') {
      setIsBusinessSwitching(true);
    } else if (type === 'user') {
      setIsUserSwitching(true);
    }

    // Apply state updates
    stateUpdates();

    // Dispatch event to trigger navigation to home and refresh data
    // This simulates a fresh login experience
    window.dispatchEvent(new CustomEvent(`${type}:change`, { detail: eventDetail }));
  }, []);

  // Clear switching state when domain loading completes
  // This provides event-driven completion detection instead of arbitrary timeouts
  useEffect(() => {
    // Only clear switching state when loading completes (transitions from true to false)
    if (!isLoadingDomain && (isUserSwitching || isBusinessSwitching)) {
      // Small delay to ensure navigation has visually completed
      const timer = setTimeout(() => {
        setIsUserSwitching(false);
        setIsBusinessSwitching(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoadingDomain, isUserSwitching, isBusinessSwitching]);

  const handleBusinessChange = (businessId) => {
    if (businessId === selectedBusinessId) return;

    const nextBusiness = getBusinessById(businessId);
    const nextDomainId = nextBusiness?.domainId ?? 'regulatory_affairs';
    // Always use the default user for the new business/domain
    // This ensures we don't carry over a user from a different domain
    const nextDefaultUser =
      nextBusiness?.defaultUserId ?? nextBusiness?.users?.[0]?.id ?? null;

    handleContextSwitch('business', { businessId }, () => {
      setSelectedBusinessId(businessId);
      setCurrentDomainId(nextDomainId);
      // Set default user for the new business (validation effect will correct if needed)
      if (nextDefaultUser) {
        setSelectedUserId(nextDefaultUser);
      }
    });
  };

  const handleUserChange = (userId) => {
    if (userId === selectedUserId) return;

    handleContextSwitch('user', { userId }, () => {
      setSelectedUserId(userId);
    });
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
  };

  // Persist selections
  useEffect(() => {
    try {
      localStorage.setItem('ead:lastBusinessId', selectedBusinessId);
      localStorage.setItem('ead:lastDomainId', currentDomainId);
      localStorage.setItem('ead:lastLanguage', language);
      localStorage.setItem('ead:lastUserId', selectedUserId);
    } catch (e) {
      // ignore storage errors (e.g., private mode)
    }
  }, [selectedBusinessId, currentDomainId, language, selectedUserId]);

  if (isLoadingDomain) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading domain configuration...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentDomainId}
        </Typography>
      </Box>
    );
  }

  if (domainError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
          p: 4,
        }}
      >
        <Typography variant="h5" color="error">
          Failed to Load Domain
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, textAlign: 'center' }}>
          {domainError}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload Application
        </Button>
      </Box>
    );
  }

  // Context switching loading overlay (user or business switch)
  const isContextSwitching = isUserSwitching || isBusinessSwitching;
  const contextSwitchingOverlay = isContextSwitching && (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        zIndex: 9999,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        {isBusinessSwitching ? 'Switching company...' : 'Switching user...'}
      </Typography>
    </Box>
  );

  const affairSegment = getRouteSegment('affair', language, domainConfig);
  const renewalSegment = getRouteSegment('renewal', language, domainConfig);
  const controlSegment = getRouteSegment('control_panel', language, domainConfig);
  const dashboardSegment = getRouteSegment('dashboard', language, domainConfig);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DomainProvider
          initialDomainId={currentDomainId}
          initialConfig={domainConfig}
          initialData={domainData}
        >
          <SidebarProvider>
            <MainLayout
              businesses={DEMO_BUSINESSES}
              selectedBusinessId={selectedBusinessId}
              selectedBusinessName={businessData.business.name}
              onBusinessChange={handleBusinessChange}
              users={currentUsers}
              selectedUser={selectedUser}
              selectedUserId={selectedUserId}
              onUserChange={handleUserChange}
              language={language}
              onLanguageChange={handleLanguageChange}
            >
              <Suspense fallback={<RouteFallback />}>
                <ErrorBoundary>
                  <Routes>
                    {/* Home route - Role-based for pension_fund, HomeView for others */}
                    <Route
                      path="/"
                      element={
                        currentDomainId === 'pension_fund' ? (
                          // For pension_fund: General users go to new request, admin/attorney see queue
                          isGeneralUser(selectedUser) ? (
                            <Navigate to="/requests/new" replace />
                          ) : (
                            <RequestQueueView language={language} currentUser={selectedUser} mode="queue" />
                          )
                        ) : (
                          <HomeView language={language} currentUser={selectedUser} />
                        )
                      }
                    />

                    {/* My Requests Route - pension_fund domain only, for all users */}
                    {currentDomainId === 'pension_fund' && (
                      <Route
                        path="/my-requests"
                        element={<RequestQueueView language={language} currentUser={selectedUser} mode="my_requests" />}
                      />
                    )}

                    {/* Entity Search Route - pension_fund domain only, for admin/attorney */}
                    {currentDomainId === 'pension_fund' && (
                      <Route
                        path="/entities"
                        element={
                          isGeneralUser(selectedUser) ? (
                            <Navigate to="/my-requests" replace />
                          ) : (
                            <HomeView language={language} currentUser={selectedUser} />
                          )
                        }
                      />
                    )}

                    {/* Edit Request Route - pension_fund domain only, must come before /requests/new */}
                    {currentDomainId === 'pension_fund' && (
                      <Route
                        path="/requests/edit/:id"
                        element={<CreateRequestView language={language} currentUser={selectedUser} />}
                      />
                    )}

                    {/* Create Request Route - pension_fund domain only */}
                    {currentDomainId === 'pension_fund' && (
                      <Route
                        path="/requests/new"
                        element={<CreateRequestView language={language} currentUser={selectedUser} />}
                      />
                    )}

                    {/* Request Detail Route - pension_fund domain, accessible to all users */}
                    {currentDomainId === 'pension_fund' && (
                      <Route
                        path="/request/:id/:tab?"
                        element={<DetailView language={language} />}
                      />
                    )}

                    {/* Holdings List View - pension_fund domain, shows holdings grouped by security */}
                    {currentDomainId === 'pension_fund' && (
                      <Route path="/security" element={<CategoryView language={language} currentUser={selectedUser} />} />
                    )}
                    {currentDomainId === 'pension_fund' && (
                      <Route path="/valor" element={<CategoryView language={language} currentUser={selectedUser} />} />
                    )}

                    {/* Control Panel Route - MUST come before /:category to avoid conflict */}
                    <Route path={`/${controlSegment}`} element={<ControlPanelView language={language} />} />

                    {/* Dashboard Route - MUST come before /:category to avoid conflict */}
                    <Route path={`/${dashboardSegment}`} element={<DashboardView language={language} currentUser={selectedUser} />} />

                    {/* Affair Detail View - MUST come before /:category/:id to avoid conflict */}
                    <Route path={`/${affairSegment}/:affairId/:tab?`} element={<DetailView language={language} currentUser={selectedUser} />} />

                    {/* Renewal Detail View - MUST come before /:category/:id to avoid conflict */}
                    <Route path={`/${renewalSegment}/:renewalId/:tab?`} element={<DetailView language={language} currentUser={selectedUser} />} />

                    {/* Asset Detail View - specific routes before general */}
                    <Route path="/:category/:id/:tab?/:relatedCategory?" element={<DetailView language={language} currentUser={selectedUser} />} />

                    {/* Category list route - MUST be last to avoid matching other routes */}
                    <Route path="/:category" element={<CategoryView language={language} currentUser={selectedUser} />} />
                  </Routes>
                </ErrorBoundary>
              </Suspense>
            </MainLayout>
          </SidebarProvider>
        </DomainProvider>
      </BrowserRouter>
      {/* Context switching loading overlay (user or business switch) */}
      {contextSwitchingOverlay}
    </ThemeProvider>
  );
}

export default App;