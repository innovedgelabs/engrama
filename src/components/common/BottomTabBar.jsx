import { BottomNavigation, BottomNavigationAction, Badge, Box } from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  FactCheck as RegulatoryIcon,
  Autorenew as RenewalsIcon,
  AttachFile as AttachmentsIcon,
  Hub as RelationsIcon,
} from '@mui/icons-material';

/**
 * BottomTabBar - Fixed bottom navigation for detail views (mobile only)
 *
 * Shows icon-only tabs that are always visible at the bottom of the screen.
 *
 * @param {number} value - Active tab index
 * @param {Function} onChange - Callback (event, newValue) => void
 * @param {Array} tabs - Tab configuration array with { key, label, badgeContent }
 */
const BottomTabBar = ({ value, onChange, tabs = [] }) => {
  const getIcon = (tabKey) => {
    switch (tabKey) {
      case 'info':
        return <InfoIcon />;
      case 'regulatory':
        return <RegulatoryIcon />;
      case 'renewals':
        return <RenewalsIcon />;
      case 'dossier':
      case 'attachments':
        return <AttachmentsIcon />;
      case 'relations':
        return <RelationsIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getLabel = (tab) => {
    // Extract label from Badge component or use directly
    if (tab.label?.props?.children) {
      // It's a Badge component
      const children = tab.label.props.children;
      if (children?.props?.children) {
        return children.props.children;
      }
    }
    return tab.label;
  };

  return (
    <BottomNavigation
      value={value}
      onChange={onChange}
      showLabels={false}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        height: 64,
        '& .MuiBottomNavigationAction-root': {
          minWidth: 60,
          maxWidth: 120,
          color: 'text.secondary',
          '&.Mui-selected': {
            color: 'secondary.main', // Use accent color for active tab
          },
        },
        '& .MuiBottomNavigationAction-label': {
          display: 'none', // Hide labels completely
        },
      }}
    >
      {tabs.map((tab, index) => {
        const icon = getIcon(tab.key);
        const label = getLabel(tab);

        // Extract badge content if tab.label is a Badge component
        const badgeContent = tab.label?.props?.badgeContent;

        return (
          <BottomNavigationAction
            key={tab.key}
            icon={
              badgeContent ? (
                <Badge
                  badgeContent={badgeContent}
                  color="primary"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      height: 16,
                      minWidth: 16,
                      padding: '0 4px',
                    },
                  }}
                >
                  {icon}
                </Badge>
              ) : (
                icon
              )
            }
            label={label}
          />
        );
      })}
    </BottomNavigation>
  );
};

export default BottomTabBar;
