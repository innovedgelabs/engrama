import { createContext, useState, useContext, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

const SidebarContext = createContext();

const SIDEBAR_STORAGE_KEY = 'ead-sidebar-state';

/**
 * Get the initial sidebar state from localStorage or default based on screen size
 */
const getInitialSidebarState = (isMobile) => {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch (error) {
    console.warn('Failed to read sidebar state from localStorage:', error);
  }
  // Default: closed on mobile, open on desktop
  return !isMobile;
};

/**
 * SidebarProvider - Provides sidebar state management across the application
 *
 * Handles:
 * - Sidebar open/closed state with localStorage persistence
 * - Responsive behavior (closed on mobile, respects preference on desktop)
 * - Smooth transitions
 */
export const SidebarProvider = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize from localStorage or default
  const [sidebarOpen, setSidebarOpen] = useState(() => getInitialSidebarState(isMobile));
  const [previousIsMobile, setPreviousIsMobile] = useState(isMobile);

  // Save to localStorage whenever sidebar state changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [sidebarOpen]);

  // Handle responsive behavior: close sidebar when switching to mobile
  useEffect(() => {
    // Only close automatically when transitioning from desktop to mobile
    if (!previousIsMobile && isMobile) {
      setSidebarOpen(false);
    }
    // Update the previous state
    setPreviousIsMobile(isMobile);
  }, [isMobile, previousIsMobile]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * useSidebar - Hook to access sidebar state and methods
 *
 * @returns {Object} Sidebar state and control methods
 * @throws {Error} If used outside of SidebarProvider
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
