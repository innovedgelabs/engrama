import { useEffect, useMemo, useState, memo } from 'react';
import { Avatar, Box } from '@mui/material';

const VARIANT_STYLES = {
  list: {
    container: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: { xs: 48, sm: 64 },
      height: { xs: 48, sm: 64 },
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    avatar: {
      width: '100%',
      height: '100%',
      fontSize: { xs: '1.25rem', sm: '1.5rem' },
      fontWeight: 600,
      bgcolor: 'primary.main',
      color: 'white',
    },
  },
  detail: {
    container: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    avatar: {
      width: '100%',
      height: '100%',
      fontWeight: 600,
      bgcolor: 'primary.main',
      color: 'white',
      fontSize: '1.5rem',
    },
  },
  grid: {
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    avatar: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: 56, sm: 64, md: 72 },
      height: { xs: 56, sm: 64, md: 72 },
      fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
      fontWeight: 600,
      bgcolor: 'primary.main',
      color: 'white',
    },
  },
};

const normalizeImagePath = (image) => {
  if (!image) {
    return '';
  }

  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image;
  }

  if (image.startsWith('public/')) {
    return `/${image.replace(/^public\//, '')}`;
  }

  if (image.startsWith('/')) {
    return image;
  }

  return `/${image.replace(/^\/+/, '')}`;
};

const AssetAvatar = ({
  name,
  image,
  variant = 'list',
  containerSx = {},
  imageSx = {},
  avatarSx = {},
  alt,
  ...rest
}) => {
  const resolvedImage = useMemo(() => normalizeImagePath(image), [image]);
  const [showImage, setShowImage] = useState(Boolean(resolvedImage));

  useEffect(() => {
    setShowImage(Boolean(resolvedImage));
  }, [resolvedImage]);

  const styles = useMemo(() => VARIANT_STYLES[variant] ?? VARIANT_STYLES.list, [variant]);

  const initials = useMemo(() => {
    if (!name) {
      return '?';
    }
    const trimmed = name.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }, [name]);

  return (
    <Box sx={{ ...styles.container, ...containerSx }} {...rest}>
      {showImage && resolvedImage ? (
        <Box
          component="img"
          src={resolvedImage}
          alt={alt ?? name}
          sx={{ ...styles.image, ...imageSx }}
          loading="lazy"
          decoding="async"
          onError={() => setShowImage(false)}
        />
      ) : (
        <Avatar
          alt={alt ?? name}
          sx={{ ...styles.avatar, ...avatarSx }}
        >
          {initials}
        </Avatar>
      )}
    </Box>
  );
};

export default memo(AssetAvatar);
