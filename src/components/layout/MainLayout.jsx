import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useSidebar } from '../../contexts/SidebarContext';
import { LAYOUT_CONSTANTS } from '../../constants/layout';
import UserProfileDialog from './UserProfileDialog';

const MainLayout = ({
  children,
  businesses,
  selectedBusinessId,
  onBusinessChange,
  selectedBusinessName,
  users = [],
  selectedUser,
  selectedUserId,
  onUserChange,
  language,
  onLanguageChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);

  const effectiveSelectedUser = useMemo(() => {
    if (selectedUser) {
      return selectedUser;
    }
    return users.find((user) => user.id === selectedUserId) ?? null;
  }, [selectedUser, selectedUserId, users]);

  // Listen for user/business change events to navigate to home (simulates fresh login)
  useEffect(() => {
    const handleContextChange = () => {
      // Navigate to home - the route will redirect based on user role
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      // Close sidebar on mobile after context switch
      closeSidebar();
      // Trigger domain data refresh
      window.dispatchEvent(new CustomEvent('domain:refresh'));
    };

    window.addEventListener('user:change', handleContextChange);
    window.addEventListener('business:change', handleContextChange);
    return () => {
      window.removeEventListener('user:change', handleContextChange);
      window.removeEventListener('business:change', handleContextChange);
    };
  }, [navigate, location.pathname, closeSidebar]);

  const handleViewProfile = () => {
    closeSidebar();
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100dvh',
      width: '100dvw',
      maxWidth: '100dvw',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <TopBar
        onMenuClick={toggleSidebar}
        onLogoClick={handleLogoClick}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onBusinessChange={onBusinessChange}
        selectedBusinessName={selectedBusinessName}
        showBusinessSelector
        users={users}
        selectedUser={effectiveSelectedUser}
        selectedUserId={selectedUserId}
        onUserChange={onUserChange}
        onViewProfile={handleViewProfile}
        language={language}
      />
      <Sidebar
        language={language}
        onLanguageChange={onLanguageChange}
        open={sidebarOpen}
        onClose={closeSidebar}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onBusinessChange={onBusinessChange}
        showBusinessSelector
        users={users}
        selectedUser={effectiveSelectedUser}
        selectedUserId={selectedUserId}
        onUserChange={onUserChange}
        onViewProfile={handleViewProfile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'background.default',
          minWidth: 0, // CHANGED: Allow main area to shrink to prevent overflow
          overflowX: 'hidden', // CHANGED: Prevent horizontal scroll in main content
        }}
      >
        {children}
      </Box>
      <UserProfileDialog
        open={profileOpen}
        onClose={handleCloseProfile}
        user={effectiveSelectedUser}
        language={language}
      />
    </Box>
  );
};

export default MainLayout;
