import { Box, Typography } from '@mui/material';

const PlaceholderDashboard = ({ domainName }) => (
  <Box
    sx={{
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      minHeight: '40vh',
    }}
  >
    <Typography variant="h5" fontWeight={700}>
      Dashboard coming soon
    </Typography>
    {domainName && (
      <Typography variant="body1" color="text.secondary">
        {domainName}
      </Typography>
    )}
  </Box>
);

export default PlaceholderDashboard;
