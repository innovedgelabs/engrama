import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ConflictCard from './ConflictCard';
import { getUIText } from '../../../../utils/i18nHelpers';

/**
 * ConflictsSection - Standalone full-width conflicts display
 * Shows conflicts with severity-based styling or "no conflicts" state
 */
const ConflictsSection = ({ conflicts, language }) => {
  const conflictsTitle = getUIText('pf_review_conflicts', language) || 'Conflicts Detected';
  const noConflictsTitle = getUIText('pf_review_no_conflicts', language) || 'No Conflicts Detected';

  // Sort conflicts by severity (critical first)
  const sortedConflicts = useMemo(() => {
    return [...(conflicts || [])].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1 };
      return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    });
  }, [conflicts]);

  const hasConflicts = sortedConflicts.length > 0;
  const criticalCount = sortedConflicts.filter(c => c.severity === 'critical').length;

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 2,
        borderRadius: 2,
        p: 2,
      }}
    >
      {/* Section title with icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        {hasConflicts ? (
          <WarningAmberIcon color={criticalCount > 0 ? 'error' : 'warning'} />
        ) : (
          <CheckCircleOutlineIcon color="success" />
        )}
        <Typography
          variant="subtitle2"
          sx={{
            color: hasConflicts
              ? (criticalCount > 0 ? 'error.main' : 'warning.main')
              : 'success.main',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {hasConflicts ? `${conflictsTitle} (${sortedConflicts.length})` : noConflictsTitle}
        </Typography>
      </Box>

      {hasConflicts ? (
        // Render conflict cards
        <Box>
          {sortedConflicts.map((conflict, index) => (
            <ConflictCard
              key={`${conflict.type}-${index}`}
              conflict={conflict}
              language={language}
              isLast={index === sortedConflicts.length - 1}
            />
          ))}
        </Box>
      ) : (
        // No conflicts state
        <Card
          variant="outlined"
          sx={{
            borderColor: 'success.main',
            borderLeftWidth: 4,
            borderLeftStyle: 'solid',
          }}
        >
          <CardContent
            sx={{
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5,
              '&:last-child': { pb: 1.5 },
            }}
          >
            <Typography variant="body2" fontWeight={500} color="success.dark">
              {language === 'es'
                ? 'No se detectaron conflictos de interés para esta solicitud.'
                : 'No conflicts of interest detected for this request.'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default ConflictsSection;
