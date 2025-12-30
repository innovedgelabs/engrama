# Request Storage Integration Guide

## Overview

This guide provides patterns and examples for building UI components that interact with the request storage system. The `requestStorage` service manages dynamic requests in localStorage, separate from hardcoded demo data. Both types are automatically merged during domain enrichment.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Data Flow                              │
└─────────────────────────────────────────────────────────┘

User Action (Form Submit)
    │
    ├─→ [requestStorage.saveRequest()]
    │
    ├─→ [Dispatch Refresh Event]
    │
    ├─→ [App.jsx reloads domain data]
    │
    ├─→ [enrichPensionFund merges hardcoded + dynamic]
    │
    └─→ [DomainContext updates]
            │
            └─→ [Components re-render with new data]
```

## Service API Reference

### Core Functions

#### `getDynamicRequests()`
Returns all dynamic requests from localStorage.

```javascript
import { getDynamicRequests } from '../services/requestStorage';

const requests = getDynamicRequests();
// Returns: Array<Request>
```

#### `saveRequest(request)`
Saves a new request or updates existing one. Auto-generates ID if missing.

```javascript
import { saveRequest } from '../services/requestStorage';

const newRequest = {
  request_type: 'NDA',
  counterparty_id: 'ENTITY-001',
  counterparty_name: 'Apple Inc.',
  investment_program: 'Private Markets',
  submitted_by: 'Sarah Johnson',
  submitted_at: '2024-12-01',
  office_location: 'Victoria, BC',
  urgency: 'normal',
  purpose: 'Due diligence for potential investment',
  workflow_status: 'draft',
};

const success = saveRequest(newRequest);
// Returns: boolean (true if saved successfully)
```

#### `updateRequest(requestId, updates)`
Updates specific fields of an existing request.

```javascript
import { updateRequest } from '../services/requestStorage';

const success = updateRequest('REQ-DYN-1703123456789-a3f2', {
  workflow_status: 'submitted',
  submitted_at: '2024-12-01',
});
// Returns: boolean
```

#### `deleteRequest(requestId)`
Deletes a request by ID.

```javascript
import { deleteRequest } from '../services/requestStorage';

const success = deleteRequest('REQ-DYN-1703123456789-a3f2');
// Returns: boolean
```

### Query Functions

#### `getRequestById(requestId)`
Gets a single request by ID.

```javascript
import { getRequestById } from '../services/requestStorage';

const request = getRequestById('REQ-DYN-1703123456789-a3f2');
// Returns: Request | null
```

#### `getRequestsByEntity(entityId)`
Filters requests by counterparty entity ID.

```javascript
import { getRequestsByEntity } from '../services/requestStorage';

const entityRequests = getRequestsByEntity('ENTITY-001');
// Returns: Array<Request>
```

#### `getRequestsByStatus(status)`
Filters requests by workflow status.

```javascript
import { getRequestsByStatus } from '../services/requestStorage';

const draftRequests = getRequestsByStatus('draft');
// Returns: Array<Request>
```

#### `getRequestsByType(type)`
Filters requests by request type.

```javascript
import { getRequestsByType } from '../services/requestStorage';

const ndaRequests = getRequestsByType('NDA');
// Returns: Array<Request>
```

### Utility Functions

#### `clearAllDynamicRequests()`
Clears all dynamic requests (useful for testing/reset).

```javascript
import { clearAllDynamicRequests } from '../services/requestStorage';

const success = clearAllDynamicRequests();
// Returns: boolean
```

## Request Data Structure

All requests must match this structure:

```javascript
{
  // Required fields
  id: string,                          // Auto-generated if missing: REQ-DYN-{timestamp}-{random}
  request_type: 'NDA' | 'MNPI' | 'INFO_SHARING' | 'NRL',
  counterparty_id: string,
  counterparty_name: string,
  investment_program: string,
  submitted_by: string,
  submitted_at: string,                // ISO date string (YYYY-MM-DD)
  office_location: string,
  urgency: 'normal' | 'high' | 'urgent',
  purpose: string,
  workflow_status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'needs_info',
  
  // Optional fields
  target_name?: string | null,
  additional_details?: string,
  assigned_to?: string,
  reviewed_at?: string,
  approved_by?: string,
  approval_notes?: string,
  conflicts_detected?: Array,
  conflict_severity?: 'critical' | 'warning' | null,
  estimated_value?: number,
  
  // Metadata (auto-added)
  _source?: 'dynamic'                  // Added automatically by service
}
```

## Integration Patterns

### 1. Creating Requests (Form Submission)

**Pattern**: Validate → Save → Refresh → Navigate

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box } from '@mui/material';
import { saveRequest } from '../services/requestStorage';

const CreateRequestForm = ({ entityId, entityName }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    request_type: 'NDA',
    counterparty_id: entityId,
    counterparty_name: entityName,
    investment_program: '',
    submitted_by: 'Current User', // Get from user context
    submitted_at: new Date().toISOString().split('T')[0],
    office_location: '',
    urgency: 'normal',
    purpose: '',
    workflow_status: 'draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.purpose || !formData.investment_program) {
        alert('Please fill in all required fields');
        return;
      }

      // Save request
      const success = saveRequest(formData);
      
      if (!success) {
        alert('Failed to save request. Please try again.');
        return;
      }

      // Trigger domain refresh
      window.dispatchEvent(new CustomEvent('domain:refresh'));

      // Navigate to request detail or back to entity
      navigate(`/request/${formData.id || 'new'}/info`);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Form fields */}
      <TextField
        label="Purpose"
        value={formData.purpose}
        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        required
        fullWidth
        multiline
        rows={3}
      />
      {/* ... more fields ... */}
      
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Create Request'}
      </Button>
    </Box>
  );
};
```

### 2. Updating Requests (Edit Workflow)

**Pattern**: Load → Edit → Update → Refresh

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById, updateRequest } from '../services/requestStorage';

const EditRequestForm = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [updates, setUpdates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load request
    const loadedRequest = getRequestById(requestId);
    if (loadedRequest) {
      setRequest(loadedRequest);
      setUpdates({});
    }
    setIsLoading(false);
  }, [requestId]);

  const handleSave = async () => {
    if (!request || Object.keys(updates).length === 0) {
      return;
    }

    setIsSaving(true);
    
    try {
      const success = updateRequest(requestId, updates);
      
      if (!success) {
        alert('Failed to update request. Please try again.');
        return;
      }

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('domain:refresh'));

      // Reload updated request
      const updated = getRequestById(requestId);
      setRequest(updated);
      setUpdates({});
    } catch (error) {
      console.error('Error updating request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <Box>
      {/* Form fields that update `updates` state */}
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  );
};
```

### 3. Deleting Requests

**Pattern**: Confirm → Delete → Refresh

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { deleteRequest } from '../services/requestStorage';

const DeleteRequestButton = ({ requestId, onDeleted }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = deleteRequest(requestId);
      
      if (!success) {
        alert('Failed to delete request. Please try again.');
        return;
      }

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('domain:refresh'));

      // Callback or navigate
      if (onDeleted) {
        onDeleted();
      } else {
        navigate('/requests'); // Navigate to requests list
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button color="error" onClick={() => setConfirmOpen(true)}>
        Delete Request
      </Button>
      
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Request?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this request? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```

### 4. Querying Requests

**Pattern**: Use query functions to filter requests for display

```javascript
import { useMemo } from 'react';
import { getRequestsByEntity, getRequestsByStatus } from '../services/requestStorage';
import { useDomain } from '../contexts/DomainContext';

const EntityRequestsList = ({ entityId }) => {
  const { currentData } = useDomain();
  
  // Get requests from domain context (includes both hardcoded and dynamic)
  const allRequests = currentData?.requests || [];
  
  // Or query directly from storage (dynamic only)
  const dynamicRequests = useMemo(() => {
    return getRequestsByEntity(entityId);
  }, [entityId]);
  
  // Filter all requests by entity
  const entityRequests = useMemo(() => {
    return allRequests.filter(req => req.counterparty_id === entityId);
  }, [allRequests, entityId]);
  
  return (
    <Box>
      {entityRequests.map(request => (
        <RequestCard key={request.id} request={request} />
      ))}
    </Box>
  );
};
```

### 5. Refresh Domain Context

After mutating requests (create/update/delete), you need to refresh the domain data so components see the changes.

**Option A: Custom Event (Recommended)**

Dispatch a custom event that App.jsx listens to:

```javascript
// In your component after mutation
window.dispatchEvent(new CustomEvent('domain:refresh'));

// In App.jsx (add this listener)
useEffect(() => {
  const handleRefresh = () => {
    // Reload domain data
    const reloadDomain = async () => {
      const data = await loadDomainData(domainConfig, selectedBusinessId);
      setDomainData(data);
    };
    reloadDomain();
  };

  window.addEventListener('domain:refresh', handleRefresh);
  return () => window.removeEventListener('domain:refresh', handleRefresh);
}, [domainConfig, selectedBusinessId]);
```

**Option B: Direct Context Update (Advanced)**

If you have access to domain context and can reload data:

```javascript
import { useDomain } from '../contexts/DomainContext';
import { loadDomainData } from '../utils/domainLoader';

const MyComponent = () => {
  const { currentConfig, currentDomainId, setDomainData } = useDomain();
  const selectedBusinessId = 'bci_pension_fund'; // Get from context or props

  const handleRefresh = async () => {
    const data = await loadDomainData(currentConfig, selectedBusinessId);
    setDomainData(currentDomainId, data, currentConfig);
  };

  // Call handleRefresh after mutations
};
```

## Error Handling

The service functions return `boolean` for write operations and handle errors gracefully:

```javascript
const success = saveRequest(requestData);

if (!success) {
  // Handle error - show user message
  alert('Failed to save request. Please try again.');
  return;
}

// Success - proceed with refresh and navigation
```

For read operations, functions return empty arrays or null on error:

```javascript
const requests = getDynamicRequests();
// Always returns an array (empty on error)

const request = getRequestById(id);
// Returns null if not found or on error
```

## Best Practices

1. **Always validate before saving**: Check required fields before calling `saveRequest()`
2. **Handle errors gracefully**: Check return values and show user-friendly messages
3. **Refresh after mutations**: Always dispatch refresh event after create/update/delete
4. **Use domain context for display**: Read from `currentData.requests` for UI (includes merged data)
5. **Use storage service for queries**: Use query functions when you need only dynamic requests
6. **Don't modify hardcoded requests**: Only create/update/delete dynamic requests (REQ-DYN-*)
7. **Preserve metadata**: Don't remove `_source: 'dynamic'` flag if manually constructing requests

## Complete Example: Request Form Component

```javascript
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { saveRequest, getRequestById, updateRequest } from '../services/requestStorage';
import { useDomain } from '../contexts/DomainContext';

const RequestForm = ({ mode = 'create', entityId, entityName }) => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { currentData } = useDomain();
  
  const [formData, setFormData] = useState({
    request_type: 'NDA',
    counterparty_id: entityId || '',
    counterparty_name: entityName || '',
    investment_program: '',
    submitted_by: 'Current User', // Get from user context
    submitted_at: new Date().toISOString().split('T')[0],
    office_location: '',
    urgency: 'normal',
    purpose: '',
    workflow_status: mode === 'create' ? 'draft' : undefined,
    target_name: null,
    estimated_value: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load existing request if editing
  useEffect(() => {
    if (mode === 'edit' && requestId) {
      const existing = getRequestById(requestId);
      if (existing) {
        setFormData(existing);
      }
    }
  }, [mode, requestId]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.investment_program) newErrors.investment_program = 'Investment program is required';
    if (!formData.counterparty_id) newErrors.counterparty_id = 'Counterparty is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let success;
      
      if (mode === 'edit' && requestId) {
        success = updateRequest(requestId, formData);
      } else {
        success = saveRequest(formData);
      }

      if (!success) {
        alert('Failed to save request. Please try again.');
        return;
      }

      // Trigger domain refresh
      window.dispatchEvent(new CustomEvent('domain:refresh'));

      // Navigate to request detail
      const finalId = mode === 'edit' ? requestId : formData.id;
      navigate(`/request/${finalId}/info`);
    } catch (error) {
      console.error('Error saving request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {mode === 'create' ? 'Create Request' : 'Edit Request'}
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Request Type</InputLabel>
        <Select
          value={formData.request_type}
          onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
        >
          <MenuItem value="NDA">NDA</MenuItem>
          <MenuItem value="MNPI">MNPI</MenuItem>
          <MenuItem value="INFO_SHARING">Info Sharing</MenuItem>
          <MenuItem value="NRL">NRL</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Counterparty"
        value={formData.counterparty_name}
        onChange={(e) => setFormData({ ...formData, counterparty_name: e.target.value })}
        fullWidth
        margin="normal"
        required
        error={!!errors.counterparty_id}
        helperText={errors.counterparty_id}
      />

      <TextField
        label="Investment Program"
        value={formData.investment_program}
        onChange={(e) => setFormData({ ...formData, investment_program: e.target.value })}
        fullWidth
        margin="normal"
        required
        error={!!errors.investment_program}
        helperText={errors.investment_program}
      />

      <TextField
        label="Purpose"
        value={formData.purpose}
        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        fullWidth
        margin="normal"
        required
        multiline
        rows={3}
        error={!!errors.purpose}
        helperText={errors.purpose}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Urgency</InputLabel>
        <Select
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="urgent">Urgent</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Request' : 'Save Changes'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default RequestForm;
```

## Testing

When testing components that use request storage:

1. **Clear storage before tests**: Use `clearAllDynamicRequests()` in test setup
2. **Mock localStorage**: Use a localStorage mock if needed
3. **Verify refresh**: Ensure domain refresh is triggered after mutations
4. **Check merged data**: Verify both hardcoded and dynamic requests appear in UI

## Next Steps

- See `PLAN_REQUEST_STORAGE.md` for future enhancements (workflow states, conflict detection, etc.)
- Request detail views can use `InfoTab` with request schema for display
- Workflow status transitions will be added in Phase 2
