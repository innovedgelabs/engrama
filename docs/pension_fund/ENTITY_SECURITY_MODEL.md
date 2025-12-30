# Entity and Security Identifier Model

## Overview

This document describes the standardized identifier model for investment entities and securities in the pension fund domain.

## Entity ID Standardization

### ID Format Rules

Investment entities use standardized IDs based on whether they have a Legal Entity Identifier (LEI):

| Entity Type | ID Format | Example |
|-------------|-----------|---------|
| Entities with LEI | `LEI-{LEI}` | `LEI-HWUPKR0MPOU8FGXBT394` |
| Entities without LEI | `ENTITY-{id}` | `ENTITY-004` |

### Identifier Ownership

Different identifiers belong to different entity levels:

| Identifier | Level | Description |
|------------|-------|-------------|
| LEI | Entity | Legal Entity Identifier - uniquely identifies a legal entity globally |
| CUSIP | Security | Committee on Uniform Securities Identification Procedures - US/Canada securities |
| ISIN | Security | International Securities Identification Number - global securities |
| Ticker | Security | Exchange trading symbol |

### Key Principles

1. **LEI is entity-level only**: LEI identifies the issuing company, not individual securities
2. **CUSIP/ISIN/Ticker are security-level only**: These identify specific securities issued by an entity
3. **Entities never have CUSIP, ISIN, or Ticker**: These were removed from the entity schema
4. **Securities link to entities via `entity_id`**: Using standardized `LEI-{value}` or `ENTITY-{id}` format

## Data Model

### Investment Entities

```javascript
{
  id: 'LEI-HWUPKR0MPOU8FGXBT394',  // Standardized ID (LEI- or ENTITY- prefix)
  name: 'Apple Inc.',
  entity_type: 'Public Company',
  industry: 'Technology',
  country: 'United States',
  lei: 'HWUPKR0MPOU8FGXBT394',      // Raw LEI value (if entity has one)
  website: 'https://www.apple.com',
  // ... other entity attributes
}
```

### Securities

```javascript
{
  id: 'SEC-001',
  security_name: 'Apple Inc. Common Stock',
  security_type: 'EQUITY_COMMON',
  entity_id: 'LEI-HWUPKR0MPOU8FGXBT394',  // Links to entity using standardized ID
  entity_name: 'Apple Inc.',
  cusip: '037833100',                      // Security-level identifier
  isin: 'US0378331005',                    // Security-level identifier
  ticker: 'AAPL',                          // Security-level identifier
  // ... other security attributes
}
```

### Holdings

```javascript
{
  id: 'HOLD-001',
  security_id: 'SEC-001',
  entity_id: 'LEI-HWUPKR0MPOU8FGXBT394',  // Links to entity using standardized ID
  entity_name: 'Apple Inc.',
  // ... other holding attributes
}
```

### Related Data

All data that references entities uses the standardized entity ID:

- **Compliance Obligations**: `entity_id` field
- **Board Seats**: `entity_id` field
- **Requests**: `counterparty_id` field

## Utility Functions

The `entityIdUtils.js` module provides utilities for working with standardized IDs:

```javascript
import {
  normalizeEntityId,    // Generate standardized ID from entity object
  parseEntityId,        // Parse standardized ID to extract type and value
  isLeiId,              // Check if ID is LEI format
  isEntityId,           // Check if ID is ENTITY format
  extractLeiFromId,     // Extract LEI value from LEI-{value} format
  buildEntityIdMap,     // Build mapping of old IDs to new standardized IDs
} from '@/utils/entityIdUtils';
```

### Examples

```javascript
// Normalize entity ID
normalizeEntityId({ id: 'OLD-001', lei: 'HWUPKR0MPOU8FGXBT394' })
// Returns: 'LEI-HWUPKR0MPOU8FGXBT394'

normalizeEntityId({ id: 'OLD-002' })
// Returns: 'ENTITY-OLD-002'

// Parse entity ID
parseEntityId('LEI-HWUPKR0MPOU8FGXBT394')
// Returns: { type: 'LEI', value: 'HWUPKR0MPOU8FGXBT394' }

parseEntityId('ENTITY-004')
// Returns: { type: 'ENTITY', value: '004' }

// Extract LEI from ID
extractLeiFromId('LEI-HWUPKR0MPOU8FGXBT394')
// Returns: 'HWUPKR0MPOU8FGXBT394'
```

## Request Handling

The `getEntityLei` function in `requestUtils.js` works with standardized IDs:

```javascript
import { getEntityLei } from '@/utils/requestUtils';

// For LEI-prefixed IDs, extracts LEI directly
getEntityLei('LEI-HWUPKR0MPOU8FGXBT394', entities)
// Returns: 'HWUPKR0MPOU8FGXBT394'

// For ENTITY-prefixed IDs, looks up entity and returns its LEI
getEntityLei('ENTITY-004', entities)
// Returns: null (if entity has no LEI) or LEI value if found
```

## Identifier Reference

### LEI (Legal Entity Identifier)
- **Length**: 20 characters
- **Format**: Alphanumeric
- **Scope**: Global, entity-level
- **Issuer**: Global Legal Entity Identifier Foundation (GLEIF)
- **Example**: `HWUPKR0MPOU8FGXBT394` (Apple Inc.)

### CUSIP
- **Length**: 9 characters
- **Format**: Alphanumeric
- **Scope**: US and Canadian securities
- **Issuer**: CUSIP Global Services
- **Example**: `037833100` (Apple Common Stock)

### ISIN (International Securities Identification Number)
- **Length**: 12 characters
- **Format**: Country code (2) + CUSIP/equivalent (9) + check digit (1)
- **Scope**: Global securities
- **Example**: `US0378331005` (Apple Common Stock)

### Ticker Symbol
- **Length**: Varies (typically 1-5 characters)
- **Format**: Alphabetic
- **Scope**: Exchange-specific
- **Example**: `AAPL` (Apple on NASDAQ)

## Migration Notes

When migrating existing data:

1. **Entities with LEI**: Change `id` from `ENTITY-xxx` to `LEI-{lei}`
2. **Entities without LEI**: Keep `id` as `ENTITY-xxx` format
3. **Securities**: Update `entity_id` to match new entity ID format
4. **Holdings/Obligations/BoardSeats**: Update `entity_id` to match new format
5. **Requests**: Update `counterparty_id` to match new format
6. **Remove from entities**: `cusip`, `isin`, `ticker` fields

## Search Configuration

Entity search fields have been updated to remove security-level identifiers:

```javascript
// Before
searchFields: ['name', 'ticker', 'entity_type', 'industry', 'country']

// After
searchFields: ['name', 'lei', 'entity_type', 'industry', 'country']
```

Security search continues to include security-level identifiers:

```javascript
searchFields: ['security_name', 'cusip', 'ticker', 'entity_name']
```

