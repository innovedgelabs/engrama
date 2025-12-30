import { Card, CardContent } from '@mui/material';

/**
 * ClickableCard - Interactive card component with subtle hover effects
 *
 * Use for cards that navigate or trigger actions (e.g., AssetTile)
 *
 * Props:
 * - children: Card content
 * - onClick: Click handler function
 * - elevation: Shadow elevation (default: 2)
 * - sx: Additional styles
 * - contentSx: Styles for CardContent
 * - All other props passed to Card
 */
const ClickableCard = ({
  children,
  onClick,
  elevation = 2,
  sx = {},
  contentSx = {},
  ...otherProps
}) => {
  return (
    <Card
      elevation={elevation}
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        ...sx
      }}
      {...otherProps}
    >
      <CardContent sx={contentSx}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ClickableCard;
