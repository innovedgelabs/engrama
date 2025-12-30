import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Autocomplete,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Send as SendIcon,
  Save as SaveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import ContentPanel from '../components/layout/ContentPanel';
import RequestTypeSelector from '../components/domain/pension_fund/RequestTypeSelector';
import { LAYOUT_CONSTANTS } from '../constants/layout';
import { useDomain } from '../contexts/DomainContext';
import { saveRequest, getRequestById } from '../services/requestStorage';
import { DEFAULT_LANGUAGE, getUIText } from '../utils/i18nHelpers';
import { parseEstimatedValue } from '../utils/requestUtils';

/**
 * CreateRequestView - Form for creating and editing legal requests
 * 
 * Access points:
 * - /requests/new - New request from scratch
 * - /requests/new?entity=ENTITY-001 - Pre-populated with entity data
 * - /requests/edit/:id - Edit an existing draft request
 */
const CreateRequestView = ({ language = DEFAULT_LANGUAGE, currentUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: editRequestId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentData, currentConfig } = useDomain();

  // Get form options from domain config with fallback to empty arrays
  const INVESTMENT_STRATEGIES = currentConfig?.forms?.createRequest?.investmentStrategies || [];
  const OFFICE_LOCATIONS = currentConfig?.forms?.createRequest?.officeLocations || [];
  const URGENCY_OPTIONS = currentConfig?.forms?.createRequest?.urgencyLevels || [];

  // Determine if we're in edit mode
  const isEditMode = Boolean(editRequestId);

  // Get entities and securities for autocomplete
  const entities = useMemo(() => {
    return currentData?.investment_entities || [];
  }, [currentData]);

  const securities = useMemo(() => {
    return currentData?.securities || [];
  }, [currentData]);

  // Build lookup map: security identifier (CUSIP, ISIN, ticker) -> entity_id
  const securityIdentifierToEntityId = useMemo(() => {
    const map = new Map();
    securities.forEach((sec) => {
      if (sec.cusip) map.set(sec.cusip.toLowerCase(), sec.entity_id);
      if (sec.isin) map.set(sec.isin.toLowerCase(), sec.entity_id);
      if (sec.ticker) map.set(sec.ticker.toLowerCase(), sec.entity_id);
    });
    return map;
  }, [securities]);

  // Custom filter function for entity autocomplete
  // Searches: name, LEI, ticker (entity fields) + CUSIP, ISIN (via security lookup)
  const filterEntityOptions = useMemo(() => {
    return (options, { inputValue }) => {
      const query = inputValue.toLowerCase().trim();
      if (!query) return options;

      // First, check if query matches a security identifier -> get entity IDs
      const entityIdFromSecurity = securityIdentifierToEntityId.get(query);

      return options.filter((entity) => {
        // Match on entity fields
        const nameMatch = entity.name?.toLowerCase().includes(query);
        const leiMatch = entity.lei?.toLowerCase().includes(query);
        const tickerMatch = entity.ticker?.toLowerCase().includes(query);

        // Match via security identifier lookup (exact match already done above)
        const securityMatch = entityIdFromSecurity === entity.id;

        return nameMatch || leiMatch || tickerMatch || securityMatch;
      });
    };
  }, [securityIdentifierToEntityId]);

  // Check for pre-populated entity from URL
  const preselectedEntityId = searchParams.get('entity');
  const preselectedEntity = useMemo(() => {
    if (!preselectedEntityId) return null;
    return entities.find(e => e.id === preselectedEntityId) || null;
  }, [preselectedEntityId, entities]);

  // Form state
  const [formData, setFormData] = useState({
    request_type: '',
    counterparty_id: '',
    counterparty_name: '',
    entity_lei: '',
    target_name: '',
    project_name: '',
    office_location: '',
    investment_program: '',
    shared_with_team: '',
    estimated_value: '',
    purpose: '',
    urgency: 'normal',
    additional_details: '',
    // MNPI
    mnpi_source: '',
    mnpi_recipients: '',
    mnpi_information_scope: '',
    mnpi_blackout_start: '',
    mnpi_blackout_end: '',
    mnpi_restrictions: '',
    // Info Sharing
    info_sharing_audience: '',
    info_sharing_data_types: '',
    info_sharing_retention: '',
    info_sharing_channels: '',
    // NRL
    nrl_transaction_name: '',
    nrl_reliance_scope: '',
    nrl_governing_law: '',
    nrl_effective_date: '',
    nrl_counsel_contact: '',
  });

  // Selected entity for autocomplete
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Pre-populate entity when coming from entity detail view
  useEffect(() => {
    if (preselectedEntity && !selectedEntity) {
      setSelectedEntity(preselectedEntity);
      setFormData(prev => ({
        ...prev,
        counterparty_id: preselectedEntity.id,
        counterparty_name: preselectedEntity.name,
        entity_lei: preselectedEntity.lei || '',
      }));
    }
  }, [preselectedEntity, selectedEntity]);

  // Load existing draft data when in edit mode
  useEffect(() => {
    if (isEditMode && editRequestId && entities.length > 0) {
      const existingRequest = getRequestById(editRequestId);
      if (existingRequest) {
        // Convert estimated_value number back to string for display
        const estimatedValueStr = existingRequest.estimated_value
          ? existingRequest.estimated_value.toLocaleString()
          : '';
        
        setFormData({
          request_type: existingRequest.request_type || 'NDA',
          counterparty_id: existingRequest.counterparty_id || '',
          counterparty_name: existingRequest.counterparty_name || '',
          entity_lei: existingRequest.entity_lei || '',
          target_name: existingRequest.target_name || '',
          project_name: existingRequest.project_name || '',
          office_location: existingRequest.office_location || '',
          investment_program: existingRequest.investment_program || '',
          shared_with_team: existingRequest.shared_with_team || '',
          estimated_value: estimatedValueStr,
          purpose: existingRequest.purpose || '',
          urgency: existingRequest.urgency || 'normal',
          additional_details: existingRequest.additional_details || '',
          mnpi_source: existingRequest.mnpi_source || '',
          mnpi_recipients: existingRequest.mnpi_recipients || '',
          mnpi_information_scope: existingRequest.mnpi_information_scope || '',
          mnpi_blackout_start: existingRequest.mnpi_blackout_start || '',
          mnpi_blackout_end: existingRequest.mnpi_blackout_end || '',
          mnpi_restrictions: existingRequest.mnpi_restrictions || '',
          info_sharing_audience: existingRequest.info_sharing_audience || '',
          info_sharing_data_types: existingRequest.info_sharing_data_types || '',
          info_sharing_retention: existingRequest.info_sharing_retention || '',
          info_sharing_channels: existingRequest.info_sharing_channels || '',
          nrl_transaction_name: existingRequest.nrl_transaction_name || '',
          nrl_reliance_scope: existingRequest.nrl_reliance_scope || '',
          nrl_governing_law: existingRequest.nrl_governing_law || '',
          nrl_effective_date: existingRequest.nrl_effective_date || '',
          nrl_counsel_contact: existingRequest.nrl_counsel_contact || '',
        });

        // Set selected entity for autocomplete
        if (existingRequest.counterparty_id) {
          const entity = entities.find(e => e.id === existingRequest.counterparty_id);
          if (entity) {
            setSelectedEntity(entity);
          }
        }
      }
    }
  }, [isEditMode, editRequestId, entities]);

  // Handle entity selection from autocomplete
  const handleEntityChange = (event, newValue) => {
    setSelectedEntity(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        counterparty_id: newValue.id,
        counterparty_name: newValue.name,
        entity_lei: newValue.lei || '',
      }));
      if (errors.counterparty_id) {
        setErrors(prev => ({ ...prev, counterparty_id: null }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        counterparty_id: '',
        counterparty_name: '',
        entity_lei: '',
      }));
    }
  };

  // Handle form field changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle request type change from card selector
  const handleRequestTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      request_type: newType,
    }));
    if (errors.request_type) {
      setErrors(prev => ({ ...prev, request_type: null }));
    }
  };

  // Handle chip-style selection (office location, urgency)
  const handleChipSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  // Validate form data
  const validateForm = (isDraft = false) => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.counterparty_id) {
      newErrors.counterparty_id = 'Counterparty is required';
    }
    if (!formData.request_type) {
      newErrors.request_type = 'Request type is required';
    }

    // Date validations (apply if present)
    const blackoutStart = parseDateValue(formData.mnpi_blackout_start);
    const blackoutEnd = parseDateValue(formData.mnpi_blackout_end);
    if (blackoutStart && blackoutStart < today) {
      newErrors.mnpi_blackout_start = 'Blackout start cannot be in the past';
    }
    if (blackoutEnd && blackoutEnd < today) {
      newErrors.mnpi_blackout_end = 'Blackout end cannot be in the past';
    }
    if (blackoutStart && blackoutEnd && blackoutEnd < blackoutStart) {
      newErrors.mnpi_blackout_end = 'Blackout end must be after the start date';
    }

    const retentionDate = parseDateValue(formData.info_sharing_retention);
    if (retentionDate && retentionDate < today) {
      newErrors.info_sharing_retention = 'Retention/expiration cannot be in the past';
    }

    const nrlEffective = parseDateValue(formData.nrl_effective_date);
    if (nrlEffective && nrlEffective < today) {
      newErrors.nrl_effective_date = 'Effective date cannot be in the past';
    }

    if (!isDraft) {
      if (!formData.investment_program) {
        newErrors.investment_program = 'Investment strategy is required';
      }
      if (!formData.purpose || formData.purpose.trim().length < 10) {
        newErrors.purpose = 'Purpose is required (minimum 10 characters)';
      }
      if (!formData.office_location) {
        newErrors.office_location = 'Office location is required';
      }

      // Type-specific validation
      switch (formData.request_type) {
        case 'MNPI':
          if (!formData.mnpi_source) {
            newErrors.mnpi_source = 'Information source is required';
          }
          if (!formData.mnpi_recipients) {
            newErrors.mnpi_recipients = 'Recipients are required';
          }
          if (!formData.mnpi_information_scope) {
            newErrors.mnpi_information_scope = 'Information scope is required';
          }
          break;
        case 'INFO_SHARING':
          if (!formData.info_sharing_audience) {
            newErrors.info_sharing_audience = 'Audience is required';
          }
          if (!formData.info_sharing_data_types) {
            newErrors.info_sharing_data_types = 'Data types are required';
          }
          break;
        case 'NRL':
          if (!formData.nrl_transaction_name) {
            newErrors.nrl_transaction_name = 'Transaction name is required';
          }
          if (!formData.nrl_reliance_scope) {
            newErrors.nrl_reliance_scope = 'Reliance scope is required';
          }
          if (!formData.nrl_governing_law) {
            newErrors.nrl_governing_law = 'Governing law is required';
          }
          if (!formData.nrl_effective_date) {
            newErrors.nrl_effective_date = 'Effective date is required';
          }
          if (formData.nrl_effective_date && !nrlEffective) {
            newErrors.nrl_effective_date = 'Effective date is invalid';
          }
          break;
        default:
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate due date based on urgency
  const calculateDueDate = (urgency, submittedAt) => {
    const date = new Date(submittedAt);
    switch (urgency) {
      case 'urgent':
        date.setDate(date.getDate() + 1);
        break;
      case 'high':
        date.setDate(date.getDate() + 3);
        break;
      case 'normal':
      default:
        date.setDate(date.getDate() + 7);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    if (!validateForm(true)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submittedAt = new Date().toISOString();
      const requestData = {
        ...formData,
        submitted_by: currentUser?.name || 'Unknown User',
        submitted_at: submittedAt,
        workflow_status: 'draft',
        estimated_value: parseEstimatedValue(formData.estimated_value),
      };

      // Preserve existing ID when editing
      if (isEditMode && editRequestId) {
        requestData.id = editRequestId;
      }

      const success = saveRequest(requestData);

      if (!success) {
        setSubmitError('Failed to save draft. Please try again.');
        return;
      }

      window.dispatchEvent(new CustomEvent('domain:refresh'));
      navigate('/my-requests');
    } catch (error) {
      console.error('[CreateRequestView] Failed to save draft:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submit request
  const handleSubmit = async () => {
    if (!validateForm(false)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submittedAt = new Date().toISOString();
      const dueDate = calculateDueDate(formData.urgency, submittedAt);

      const requestData = {
        ...formData,
        submitted_by: currentUser?.name || 'Unknown User',
        submitted_at: submittedAt,
        workflow_status: 'submitted',
        due_date: dueDate,
        estimated_value: parseEstimatedValue(formData.estimated_value),
      };

      // Preserve existing ID when editing
      if (isEditMode && editRequestId) {
        requestData.id = editRequestId;
      }

      const success = saveRequest(requestData);

      if (!success) {
        setSubmitError('Failed to submit request. Please try again.');
        return;
      }

      window.dispatchEvent(new CustomEvent('domain:refresh'));

      navigate('/my-requests');
    } catch (error) {
      console.error('[CreateRequestView] Failed to submit request:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chip button style helper
  const getChipButtonSx = (isSelected, hasError = false) => ({
    flex: 1,
    py: 1.5,
    px: 2,
    borderRadius: '8px',
    border: '1px solid',
    borderColor: hasError ? 'error.main' : isSelected ? 'primary.main' : 'grey.300',
    bgcolor: isSelected ? 'primary.50' : 'background.paper',
    color: isSelected ? 'primary.main' : 'text.primary',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: isSelected ? 600 : 400,
    transition: 'all 0.15s ease-in-out',
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: isSelected ? 'primary.50' : 'grey.50',
    },
  });

  const getUrgencyButtonSx = (isSelected) => ({
    flex: 1,
    py: 1.5,
    px: 2,
    borderRadius: '8px',
    border: '1px solid',
    borderColor: isSelected ? 'secondary.main' : 'grey.300',
    bgcolor: isSelected ? alpha(theme.palette.secondary.main, 0.12) : 'background.paper',
    color: isSelected ? 'secondary.main' : 'text.primary',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: isSelected ? 600 : 400,
    transition: 'all 0.15s ease-in-out',
    '&:hover': {
      borderColor: 'secondary.main',
      boxShadow: isSelected
        ? `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.18)}`
        : '0 2px 8px rgba(0,0,0,0.08)',
    },
  });

  const getRequestTitle = () => {
    if (isEditMode) {
      return language === 'es' ? 'Editar Solicitud' : 'Edit Request';
    }

    const baseTitle = language === 'es' ? 'Nueva Solicitud Legal' : 'New Legal Request';
    const typeKey = formData.request_type ? formData.request_type.toLowerCase() : '';
    const typeLabel =
      (typeKey && getUIText(`pf_request_type_${typeKey}_full`, language)) ||
      formData.request_type ||
      '';

    return typeLabel ? `${baseTitle} - ${typeLabel}` : baseTitle;
  };

  // Header content
  const headerContent = (
    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {getRequestTitle()}
    </Typography>
  );

  // Footer content (action buttons)
  const footerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        justifyContent: 'flex-end',
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        onClick={handleSaveDraft}
        startIcon={isSubmitting ? <CircularProgress size={18} /> : <SaveIcon />}
        disabled={isSubmitting}
        sx={{ 
          order: isMobile ? 2 : 1,
          borderColor: 'grey.300',
          color: 'text.primary',
        }}
      >
        Save as Draft
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
        disabled={isSubmitting}
        sx={{ order: isMobile ? 1 : 2 }}
      >
        Submit Request
      </Button>
    </Box>
  );

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    const sectionTitleSx = { mb: 1, fontWeight: 600, color: 'text.primary' };

    if (formData.request_type === 'MNPI') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" sx={sectionTitleSx}>MNPI Details</Typography>
          <TextField
            fullWidth
            label="Information Source"
            required
            value={formData.mnpi_source}
            onChange={handleChange('mnpi_source')}
            error={!!errors.mnpi_source}
            helperText={errors.mnpi_source || 'Who is providing the material information'}
          />
          <TextField
            fullWidth
            label="Recipients"
            required
            value={formData.mnpi_recipients}
            onChange={handleChange('mnpi_recipients')}
            error={!!errors.mnpi_recipients}
            helperText={errors.mnpi_recipients || 'Teams or individuals receiving MNPI'}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Information Scope"
            required
            value={formData.mnpi_information_scope}
            onChange={handleChange('mnpi_information_scope')}
            error={!!errors.mnpi_information_scope}
            helperText={errors.mnpi_information_scope || 'Describe what MNPI is included'}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Blackout Start"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.mnpi_blackout_start}
              onChange={handleChange('mnpi_blackout_start')}
              error={!!errors.mnpi_blackout_start}
              helperText={errors.mnpi_blackout_start || 'Choose when restrictions begin'}
            />
            <TextField
              fullWidth
              label="Blackout End"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.mnpi_blackout_end}
              onChange={handleChange('mnpi_blackout_end')}
              error={!!errors.mnpi_blackout_end}
              helperText={errors.mnpi_blackout_end || 'Choose when restrictions end'}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Restrictions / Notes"
            value={formData.mnpi_restrictions}
            onChange={handleChange('mnpi_restrictions')}
          />
        </Box>
      );
    }

    if (formData.request_type === 'INFO_SHARING') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" sx={sectionTitleSx}>Info Sharing Details</Typography>
          <TextField
            fullWidth
            label="Audience / Receiving Team"
            required
            value={formData.info_sharing_audience}
            onChange={handleChange('info_sharing_audience')}
            error={!!errors.info_sharing_audience}
            helperText={errors.info_sharing_audience || 'Which teams or divisions will receive the info'}
          />
          <TextField
            fullWidth
            label="Data or Information Types"
            required
            value={formData.info_sharing_data_types}
            onChange={handleChange('info_sharing_data_types')}
            error={!!errors.info_sharing_data_types}
            helperText={errors.info_sharing_data_types || 'Categories of data to be shared'}
          />
          <TextField
            fullWidth
            label="Channels / Delivery"
            value={formData.info_sharing_channels}
            onChange={handleChange('info_sharing_channels')}
            helperText="How the information will be shared"
          />
          <TextField
            fullWidth
            label="Retention / Expiration Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.info_sharing_retention}
            onChange={handleChange('info_sharing_retention')}
            error={!!errors.info_sharing_retention}
            helperText={errors.info_sharing_retention || 'When access expires or data should be removed'}
          />
        </Box>
      );
    }

    if (formData.request_type === 'NRL') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" sx={sectionTitleSx}>NRL Details</Typography>
          <TextField
            fullWidth
            label="Transaction / Matter"
            required
            value={formData.nrl_transaction_name}
            onChange={handleChange('nrl_transaction_name')}
            error={!!errors.nrl_transaction_name}
            helperText={errors.nrl_transaction_name || 'Name of the deal or investment'}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reliance Scope"
            required
            value={formData.nrl_reliance_scope}
            onChange={handleChange('nrl_reliance_scope')}
            error={!!errors.nrl_reliance_scope}
            helperText={errors.nrl_reliance_scope || 'What the counterparty may or may not rely on'}
          />
          <TextField
            fullWidth
            label="Governing Law"
            required
            value={formData.nrl_governing_law}
            onChange={handleChange('nrl_governing_law')}
            error={!!errors.nrl_governing_law}
            helperText={errors.nrl_governing_law || 'Choose applicable jurisdiction'}
          />
          <TextField
            fullWidth
            label="Effective Date"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            value={formData.nrl_effective_date}
            onChange={handleChange('nrl_effective_date')}
            error={!!errors.nrl_effective_date}
            helperText={errors.nrl_effective_date || 'Date when the non-reliance takes effect'}
          />
          <TextField
            fullWidth
            label="Primary Counsel Contact"
            value={formData.nrl_counsel_contact}
            onChange={handleChange('nrl_counsel_contact')}
            helperText="Who should receive drafts and comments"
          />
        </Box>
      );
    }

    return null;
  };

  return (
    <PageLayout showBackButton={false}>
      <ContentPanel
        fullHeight
        maxWidth={LAYOUT_CONSTANTS.formLayout.maxWidth}
        header={headerContent}
        footer={footerContent}
      >
        {/* Error Alert */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {/* Request Type Selector */}
        <RequestTypeSelector
          selectedType={formData.request_type}
          onTypeChange={handleRequestTypeChange}
          language={language}
        />

        {/* Form */}
        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Counterparty Name */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Counterparty Name <span style={{ color: theme.palette.error.main }}>*</span>
            </Typography>
            <Autocomplete
              options={entities}
              getOptionLabel={(option) => option.name || ''}
              filterOptions={filterEntityOptions}
              value={selectedEntity}
              onChange={handleEntityChange}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.lei ? `LEI: ${option.lei}` : option.entity_type}
                        {option.ticker && ` • ${option.ticker}`}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by name, LEI, ticker, CUSIP, or ISIN..."
                  error={!!errors.counterparty_id}
                  helperText={errors.counterparty_id}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* Target Name */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Target Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Name of target company or investment opportunity..."
              value={formData.target_name}
              onChange={handleChange('target_name')}
              helperText="For investment due diligence or acquisition opportunities"
            />
          </Box>

          {/* Project Name */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Project Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Internal project code name or identifier..."
              value={formData.project_name}
              onChange={handleChange('project_name')}
              helperText="Used for internal tracking and organization"
            />
          </Box>

          {/* Office Location - 4 columns on md+, 2 on smaller */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Office Location <span style={{ color: theme.palette.error.main }}>*</span>
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              {OFFICE_LOCATIONS.map((loc) => (
                <Box
                  key={loc.value}
                  onClick={() => handleChipSelect('office_location', loc.value)}
                  sx={getChipButtonSx(formData.office_location === loc.value, !!errors.office_location)}
                >
                  <Typography variant="body2">{loc.label}</Typography>
                </Box>
              ))}
            </Box>
            {errors.office_location && (
              <FormHelperText error>{errors.office_location}</FormHelperText>
            )}
          </Box>

          {/* Investment Strategy */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Investment Strategy <span style={{ color: theme.palette.error.main }}>*</span>
            </Typography>
            <FormControl fullWidth error={!!errors.investment_program}>
              <Select
                value={formData.investment_program}
                onChange={handleChange('investment_program')}
                displayEmpty
                sx={{ bgcolor: 'background.paper' }}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">Select strategy...</Typography>
                </MenuItem>
                {INVESTMENT_STRATEGIES.map(strategy => (
                  <MenuItem key={strategy} value={strategy}>
                    {strategy}
                  </MenuItem>
                ))}
              </Select>
              {errors.investment_program && (
                <FormHelperText>{errors.investment_program}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Information Will Be Shared To */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Information Will Be Shared To <span style={{ color: theme.palette.error.main }}>*</span>
            </Typography>
            <FormControl fullWidth>
              <Select
                value={formData.shared_with_team}
                onChange={handleChange('shared_with_team')}
                displayEmpty
                sx={{ bgcolor: 'background.paper' }}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">Select receiving strategy...</Typography>
                </MenuItem>
                {INVESTMENT_STRATEGIES.map(strategy => (
                  <MenuItem key={strategy} value={strategy}>
                    {strategy}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select the investment strategy team that will receive this information
              </FormHelperText>
            </FormControl>
          </Box>

          {/* Estimated Value */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Estimated Value (Optional)
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter estimated value (e.g., $1,000,000)"
              value={formData.estimated_value}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow digits, commas, periods, and dollar sign
                const cleaned = value.replace(/[^0-9.,$ ]/g, '');
                handleChange('estimated_value')({ target: { value: cleaned } });
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography color="text.secondary">$</Typography>
                  </InputAdornment>
                ),
              }}
              helperText="Approximate value of the transaction or investment"
            />
          </Box>

          {/* Purpose of Request */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Purpose of Request <span style={{ color: theme.palette.error.main }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the business purpose and context for this agreement..."
              value={formData.purpose}
              onChange={handleChange('purpose')}
              error={!!errors.purpose}
              helperText={errors.purpose}
            />
          </Box>

          {/* Urgency Level - Inline Chips */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Urgency Level
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {URGENCY_OPTIONS.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => handleChipSelect('urgency', opt.value)}
                  sx={getUrgencyButtonSx(formData.urgency === opt.value)}
                >
                  <Typography variant="body2">{opt.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

          {/* Additional Details (Optional) */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Additional Details (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Any specific terms, conditions, or special requirements..."
              value={formData.additional_details}
              onChange={handleChange('additional_details')}
            />
          </Box>
        </Box>
      </ContentPanel>
    </PageLayout>
  );
};

export default CreateRequestView;
