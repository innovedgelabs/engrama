import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  Avatar,
  Grid,
  Divider,
  LinearProgress,
} from '@mui/material';

const TEXT = {
  es: {
    title: 'Perfil de usuario',
    org: 'Organización',
    access: 'Acceso y seguridad',
    email: 'Correo',
    phone: 'Teléfono',
    location: 'Ubicación',
    timezone: 'Zona horaria',
    language: 'Idioma',
    manager: 'Responsable',
    startDate: 'Fecha de ingreso',
    lastActive: 'Último inicio',
    mfa: 'MFA',
    sso: 'SSO',
    dataRegion: 'Región de datos',
    dpaSigned: 'DPA firmado',
    plan: 'Plan',
    seats: 'Asientos',
    renewal: 'Renovación',
    close: 'Cerrar',
  },
  en: {
    title: 'User profile',
    org: 'Organization',
    access: 'Access & security',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    timezone: 'Timezone',
    language: 'Language',
    manager: 'Manager',
    startDate: 'Start date',
    lastActive: 'Last active',
    mfa: 'MFA',
    sso: 'SSO',
    dataRegion: 'Data region',
    dpaSigned: 'DPA signed',
    plan: 'Plan',
    seats: 'Seats',
    renewal: 'Renewal',
    close: 'Close',
  },
};

const formatDate = (value, language) => {
  if (!value) {
    return '—';
  }
  try {
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    return new Date(value).toLocaleDateString(locale);
  } catch (error) {
    return value;
  }
};

const formatDateTime = (value, language) => {
  if (!value) {
    return '—';
  }
  try {
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    return new Date(value).toLocaleString(locale);
  } catch (error) {
    return value;
  }
};

const InfoItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {value ?? '—'}
    </Typography>
  </Box>
);

const UserProfileDialog = ({ open, onClose, user, language = 'es' }) => {
  if (!user) {
    return null;
  }

  const t = TEXT[language] ?? TEXT.es;
  const yesLabel = language === 'en' ? 'Yes' : 'Sí';
  const noLabel = language === 'en' ? 'No' : 'No';
  const onLabel = language === 'en' ? 'On' : 'Activo';
  const offLabel = language === 'en' ? 'Off' : 'Inactivo';
  const seatUsagePercent = user.plan?.seatsTotal
    ? Math.min(100, Math.round((user.plan.seatsUsed / user.plan.seatsTotal) * 100))
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t.title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Avatar
              src={user.avatarUrl ?? undefined}
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'secondary.main',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
            >
              {user.initials ?? user.name?.slice(0, 2)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                {[user.title, user.department].filter(Boolean).join(' · ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.businessUnit}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {t.org}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.email} value={user.email} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.phone} value={user.phone} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.location} value={user.location} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.timezone} value={user.timezone} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.language} value={user.language?.toUpperCase()} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.manager} value={user.manager} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.startDate} value={formatDate(user.startDate, language)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.lastActive} value={formatDateTime(user.lastActive, language)} />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {t.access}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem label={t.plan} value={`${user.plan?.tier ?? '—'}`} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  label={t.seats}
                  value={
                    user.plan
                      ? `${user.plan.seatsUsed}/${user.plan.seatsTotal} (${seatUsagePercent}%)`
                      : '—'
                  }
                />
                <LinearProgress
                  variant="determinate"
                  value={seatUsagePercent}
                  sx={{ mt: 0.5, height: 6, borderRadius: 999 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.mfa} value={user.security?.mfaEnabled ? onLabel : offLabel} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.sso} value={user.security?.ssoProvider ?? '—'} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.dataRegion} value={user.security?.dataRegion ?? '—'} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label={t.dpaSigned} value={user.security?.dpaSigned ? yesLabel : noLabel} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <InfoItem
                  label={t.renewal}
                  value={
                    user.plan?.renewalDate
                      ? `${formatDate(user.plan.renewalDate, language)}`
                      : '—'
                  }
                />
              </Grid>
            </Grid>
          </Box>

        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" disableElevation>
          {t.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;
