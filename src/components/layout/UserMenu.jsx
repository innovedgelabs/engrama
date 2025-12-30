import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const TEXT = {
  viewProfile: { es: 'Ver perfil', en: 'View profile' },
  switchUser: { es: 'Cambiar usuario', en: 'Switch user' },
};

const getLabel = (key, language) => TEXT[key]?.[language] ?? TEXT[key]?.es ?? key;

const UserMenu = ({
  anchorEl,
  open,
  onClose,
  users = [],
  selectedUserId,
  onSelectUser,
  onViewProfile,
  language = 'es',
}) => {
  const selectedUser = users.find((user) => user.id === selectedUserId);

  const handleSelect = (userId) => {
    if (!userId || userId === selectedUserId) {
      onClose?.();
      return;
    }
    onSelectUser?.(userId);
    onClose?.();
  };

  const handleViewProfile = () => {
    onViewProfile?.();
    onClose?.();
  };

  const renderAvatar = (user) => (
    <Avatar
      src={user.avatarUrl ?? undefined}
      sx={{
        width: 32,
        height: 32,
        bgcolor: 'secondary.main',
        fontSize: '0.85rem',
        fontWeight: 700,
      }}
    >
      {user.initials ?? user.name?.slice(0, 2)}
    </Avatar>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {selectedUser && (
        <MenuItem onClick={handleViewProfile} sx={{ py: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>{renderAvatar(selectedUser)}</ListItemIcon>
          <ListItemText
            primary={selectedUser.name}
            secondary={selectedUser.title ?? selectedUser.department}
            primaryTypographyProps={{ fontWeight: 600 }}
            secondaryTypographyProps={{ color: 'text.secondary' }}
          />
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            {getLabel('viewProfile', language)}
          </Typography>
        </MenuItem>
      )}

      <Divider />

      <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
          {getLabel('switchUser', language)}
        </Typography>
      </Box>

      {users.map((user) => {
        const isSelected = user.id === selectedUserId;
        return (
          <MenuItem
            key={user.id}
            selected={isSelected}
            onClick={() => handleSelect(user.id)}
            sx={{ minWidth: 260, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {renderAvatar(user)}
            </ListItemIcon>
            <ListItemText
              primary={user.name}
              secondary={user.title ?? user.department}
              primaryTypographyProps={{ fontWeight: isSelected ? 700 : 600 }}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
            {isSelected && (
              <CheckIcon fontSize="small" color="primary" />
            )}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default UserMenu;
