-- ============================================================================
-- ENGRAMA DMS - COMPLETE DATABASE SCHEMA v7
-- ============================================================================
-- A multi-tenant, graph-based document management system
-- Designed for Supabase (PostgreSQL + RLS)
-- 
-- v7 Changes:
-- - Added NOT NULL to reminder_days, has_expiration, has_periods (NULL bypasses CHECK)
-- - Simplified date arithmetic in v_period_compliance (pure date math, index-friendly)
-- - Made dashboard indexes partial (WHERE status = 'active')
-- - Added trigger to enforce role-tenant consistency on tenant_member
-- - Made seed inserts idempotent with ON CONFLICT DO NOTHING
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- SECTION 1: TENANT & USER FOUNDATION
-- ============================================================================

CREATE TABLE tenant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tenant_slug ON tenant(slug);

CREATE TABLE user_profile (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 2: ROLES & PERMISSIONS (ABAC)
-- ============================================================================

CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    policy JSONB NOT NULL,
    
    is_system BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(tenant_id, slug)
);

COMMENT ON TABLE role IS '
ABAC Policy Structure:
{
  "resources": {
    "asset_instance": { "actions": ["create", "read", "update", "delete"] },
    "case_instance": { "actions": ["read", "update"], "ownership_override": "any" },
    "document": { "actions": ["*"], "classification_override": 20 }
  },
  "constraints": {
    "entity_types": ["factory", "vehicle"] | "*",
    "entity_scope": "all" | "assigned" | "own",
    "max_classification_level": 20,
    "ownership": "any" | "own" | "team",
    "case_types": ["permit", "license"] | "*"
  },
  "capabilities": {
    "can_approve": true,
    "can_invite_to_scope": true,
    "can_create_roles": false,
    "can_manage_policies": false
  }
}

ENFORCEMENT MODEL:
- RLS enforces: tenant isolation, entity_scope, max_classification_level, 
  external user primary-only, period status for externals, active status filter
- Application enforces: action permissions, ownership rules, case_type constraints, 
  approval workflows
';

CREATE TABLE tenant_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES role(id),
    
    is_external BOOLEAN DEFAULT false,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    
    invited_by UUID REFERENCES user_profile(id),
    invited_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_member_tenant ON tenant_member(tenant_id);
CREATE INDEX idx_tenant_member_user ON tenant_member(user_id);
CREATE INDEX idx_tenant_member_active ON tenant_member(tenant_id, status) WHERE status = 'active';
CREATE INDEX idx_tenant_member_external ON tenant_member(tenant_id, is_external) WHERE status = 'active';

-- ============================================================================
-- SECTION 3: MEMBER SCOPE ASSIGNMENTS
-- ============================================================================

CREATE TABLE member_asset_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_member_id UUID NOT NULL REFERENCES tenant_member(id) ON DELETE CASCADE,
    asset_instance_id UUID NOT NULL,
    
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES user_profile(id),
    
    UNIQUE(tenant_member_id, asset_instance_id)
);

CREATE INDEX idx_asset_assignment_member ON member_asset_assignment(tenant_member_id);
CREATE INDEX idx_asset_assignment_asset ON member_asset_assignment(asset_instance_id);

CREATE TABLE member_case_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_member_id UUID NOT NULL REFERENCES tenant_member(id) ON DELETE CASCADE,
    case_instance_id UUID NOT NULL,
    
    source_share_id UUID,
    
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES user_profile(id),
    
    UNIQUE(tenant_member_id, case_instance_id)
);

CREATE INDEX idx_case_assignment_member ON member_case_assignment(tenant_member_id);
CREATE INDEX idx_case_assignment_case ON member_case_assignment(case_instance_id);

-- ============================================================================
-- SECTION 4: CLASSIFICATION LEVELS
-- ============================================================================

CREATE TABLE classification_level (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    level INT NOT NULL,
    color TEXT,
    description TEXT,
    
    requires_approval_to_share BOOLEAN DEFAULT false,
    default_retention_years INT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(tenant_id, slug),
    UNIQUE(tenant_id, level)
);

-- ============================================================================
-- SECTION 5: SCHEMA DEFINITION LAYER (Types)
-- ============================================================================

CREATE TABLE asset_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    
    field_schema JSONB NOT NULL DEFAULT '{}',
    
    display_name_template TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(tenant_id, slug)
);

CREATE TABLE case_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    
    field_schema JSONB NOT NULL DEFAULT '{}',
    
    -- Period configuration
    has_periods BOOLEAN NOT NULL DEFAULT true,
    default_period_duration_months INT,
    
    -- Compliance configuration
    has_expiration BOOLEAN NOT NULL DEFAULT true,          -- false = "permanent" obligations
    reminder_days INT NOT NULL DEFAULT 30 CHECK (reminder_days >= 0),  -- Days before expiry to trigger "expiring" status
    
    -- Packet requirements
    packet_requirements JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(tenant_id, slug)
);

COMMENT ON COLUMN case_type.has_expiration IS 'If false, periods of this type never expire (e.g., one-time certifications)';
COMMENT ON COLUMN case_type.reminder_days IS 'Days before end_date when compliance_status becomes "expiring". Must be >= 0.';

CREATE TABLE connection_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    source_asset_type_id UUID REFERENCES asset_type(id) ON DELETE SET NULL,
    target_asset_type_id UUID REFERENCES asset_type(id) ON DELETE SET NULL,
    
    cardinality TEXT DEFAULT 'many_to_many',
    
    permission_inheritance TEXT DEFAULT 'none',
    
    field_schema JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(tenant_id, slug)
);

-- ============================================================================
-- SECTION 6: INSTANCE LAYER (Data)
-- ============================================================================

CREATE TABLE asset_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    asset_type_id UUID NOT NULL REFERENCES asset_type(id),
    
    name TEXT NOT NULL,
    code TEXT,
    
    data JSONB NOT NULL DEFAULT '{}',
    
    -- Lifecycle status (manual)
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    owned_by UUID REFERENCES user_profile(id),
    
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(code, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(data::text, '')), 'C')
    ) STORED
);

CREATE INDEX idx_asset_instance_tenant ON asset_instance(tenant_id);
CREATE INDEX idx_asset_instance_type ON asset_instance(asset_type_id);
CREATE INDEX idx_asset_instance_status ON asset_instance(tenant_id, status) WHERE status = 'active';
CREATE INDEX idx_asset_instance_data ON asset_instance USING GIN(data);
CREATE INDEX idx_asset_instance_search ON asset_instance USING GIN(search_vector);

ALTER TABLE member_asset_assignment 
    ADD CONSTRAINT fk_asset_assignment_asset 
    FOREIGN KEY (asset_instance_id) REFERENCES asset_instance(id) ON DELETE CASCADE;

CREATE TABLE case_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    case_type_id UUID NOT NULL REFERENCES case_type(id),
    asset_instance_id UUID NOT NULL REFERENCES asset_instance(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    data JSONB NOT NULL DEFAULT '{}',
    
    -- Lifecycle status (manual)
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    deleted_at TIMESTAMPTZ,
    
    -- Priority (manual) - business importance
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    owned_by UUID REFERENCES user_profile(id)
);

COMMENT ON COLUMN case_instance.priority IS 'Business importance: critical (compliance failure = major impact), high, medium (default), low';

CREATE INDEX idx_case_instance_tenant ON case_instance(tenant_id);
CREATE INDEX idx_case_instance_asset ON case_instance(asset_instance_id);
CREATE INDEX idx_case_instance_type ON case_instance(case_type_id);
CREATE INDEX idx_case_instance_status ON case_instance(tenant_id, status) WHERE status = 'active';
CREATE INDEX idx_case_instance_priority ON case_instance(tenant_id, priority) WHERE status = 'active';
-- Partial composite index for dashboard aggregations (active records only)
CREATE INDEX idx_case_instance_dashboard ON case_instance(asset_instance_id, priority)
    WHERE status = 'active';

ALTER TABLE member_case_assignment 
    ADD CONSTRAINT fk_case_assignment_case 
    FOREIGN KEY (case_instance_id) REFERENCES case_instance(id) ON DELETE CASCADE;

CREATE TABLE period (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    case_instance_id UUID NOT NULL REFERENCES case_instance(id) ON DELETE CASCADE,
    
    label TEXT NOT NULL,                          -- "2024", "Q1 2025", "Initial"
    start_date DATE,
    end_date DATE,                                -- NULL = no expiration (permanent)
    
    CONSTRAINT period_dates_valid CHECK (
        end_date IS NULL OR start_date IS NULL OR start_date <= end_date
    ),
    
    data JSONB DEFAULT '{}',
    
    -- Workflow status (process stage, NOT compliance)
    -- Compliance status is calculated from end_date via view
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'active', 'archived')),
    
    -- Packet completeness (denormalized)
    has_primary_document BOOLEAN DEFAULT false,
    is_packet_complete BOOLEAN DEFAULT false,
    
    -- Workflow tracking
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES user_profile(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profile(id),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id)
);

COMMENT ON TABLE period IS '
STATUS DIMENSIONS:
- period.status = Workflow stage (draft → submitted → approved → active → archived)
- Compliance status = Calculated from end_date (see v_period_compliance view)
- case_instance.status = Lifecycle (active/archived/deleted)
- case_instance.priority = Business importance (critical/high/medium/low)

Workflow transitions:
- draft: In preparation, documents being collected
- submitted: Sent for approval/review
- approved: Approved, ready to become active
- active: Current valid period (the "live" one)
- archived: Historical, superseded by newer period
';

CREATE INDEX idx_period_tenant ON period(tenant_id);
CREATE INDEX idx_period_case ON period(case_instance_id);
CREATE INDEX idx_period_status ON period(tenant_id, status);
CREATE INDEX idx_period_dates ON period(tenant_id, end_date) WHERE status = 'active';
CREATE INDEX idx_period_expiring ON period(tenant_id, end_date) 
    WHERE status = 'active' AND end_date IS NOT NULL;
-- Partial composite index for dashboard aggregations (active records only)
CREATE INDEX idx_period_dashboard ON period(case_instance_id, end_date)
    WHERE status = 'active';

CREATE TABLE connection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    connection_type_id UUID NOT NULL REFERENCES connection_type(id),
    
    source_asset_id UUID NOT NULL REFERENCES asset_instance(id) ON DELETE CASCADE,
    target_asset_id UUID NOT NULL REFERENCES asset_instance(id) ON DELETE CASCADE,
    
    data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    
    UNIQUE(connection_type_id, source_asset_id, target_asset_id)
);

CREATE INDEX idx_connection_tenant ON connection(tenant_id);
CREATE INDEX idx_connection_source ON connection(source_asset_id);
CREATE INDEX idx_connection_target ON connection(target_asset_id);
CREATE INDEX idx_connection_type ON connection(connection_type_id);

-- ============================================================================
-- SECTION 7: DOCUMENTS & FILES
-- ============================================================================

CREATE TABLE document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    classification_id UUID REFERENCES classification_level(id),
    
    current_file_id UUID,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    deleted_at TIMESTAMPTZ,
    retention_until DATE,
    
    legal_hold BOOLEAN DEFAULT false,
    legal_hold_reason TEXT,
    legal_hold_set_by UUID REFERENCES user_profile(id),
    legal_hold_set_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    owned_by UUID REFERENCES user_profile(id)
);

CREATE INDEX idx_document_tenant ON document(tenant_id);
CREATE INDEX idx_document_status ON document(tenant_id, status) WHERE status = 'active';
CREATE INDEX idx_document_classification ON document(classification_id);
CREATE INDEX idx_document_name ON document(tenant_id, name);
CREATE INDEX idx_document_name_trgm ON document USING GIN(name gin_trgm_ops);

CREATE TABLE file (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    
    filename TEXT NOT NULL,
    file_type TEXT,
    mime_type TEXT,
    file_size_bytes BIGINT,
    
    storage_path TEXT NOT NULL,
    storage_bucket TEXT,
    storage_region TEXT,
    checksum TEXT,
    
    version_number INT NOT NULL DEFAULT 1,
    version_label TEXT,
    
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES user_profile(id),
    lock_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id)
);

CREATE INDEX idx_file_document ON file(document_id);

ALTER TABLE document 
    ADD CONSTRAINT fk_document_current_file 
    FOREIGN KEY (current_file_id) REFERENCES file(id) ON DELETE SET NULL;

-- ============================================================================
-- SECTION 8: DOCUMENT LINK TABLES
-- ============================================================================

CREATE TABLE document_asset_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    asset_instance_id UUID NOT NULL REFERENCES asset_instance(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL DEFAULT 'supporting' CHECK (role IN ('primary', 'supporting')),
    label TEXT,
    display_order INT DEFAULT 0,
    share_externally BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    
    UNIQUE(document_id, asset_instance_id)
);

CREATE INDEX idx_doc_asset_link_document ON document_asset_link(document_id);
CREATE INDEX idx_doc_asset_link_asset ON document_asset_link(asset_instance_id);

CREATE TABLE document_case_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    case_instance_id UUID NOT NULL REFERENCES case_instance(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL DEFAULT 'supporting' CHECK (role IN ('primary', 'supporting')),
    label TEXT,
    display_order INT DEFAULT 0,
    share_externally BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    
    UNIQUE(document_id, case_instance_id)
);

CREATE INDEX idx_doc_case_link_document ON document_case_link(document_id);
CREATE INDEX idx_doc_case_link_case ON document_case_link(case_instance_id);

CREATE TABLE document_period_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES period(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL DEFAULT 'supporting' CHECK (role IN ('primary', 'supporting')),
    label TEXT,
    display_order INT DEFAULT 0,
    share_externally BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id),
    
    UNIQUE(document_id, period_id)
);

CREATE INDEX idx_doc_period_link_document ON document_period_link(document_id);
CREATE INDEX idx_doc_period_link_period ON document_period_link(period_id);
CREATE INDEX idx_doc_period_link_role ON document_period_link(period_id, role);

-- ============================================================================
-- SECTION 9: SHARING
-- ============================================================================

CREATE TABLE share (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    shareable_type TEXT NOT NULL CHECK (shareable_type IN ('case_instance', 'period', 'document')),
    shareable_id UUID NOT NULL,
    
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    name TEXT,
    description TEXT,
    
    requires_authentication BOOLEAN DEFAULT true,
    password_hash TEXT,
    
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    max_access_count INT,
    access_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_profile(id)
);

COMMENT ON TABLE share IS '
SHARING MODEL
=============

Shareable Types:
- case_instance: All periods (active/approved/submitted), primary documents only
- period: All primary documents in that period  
- document: Specific document only

Asset-level sharing is NOT supported (too coarse).

REDEMPTION FLOW (Server-Side Only)
==================================
Share redemption MUST happen via Edge Function with service role.
The share_select RLS intentionally blocks unauthenticated/non-member access.

Flow:
1. Internal user creates share, share_grant with grantee_email
2. External user receives share link with token (via email/etc)
3. External user clicks link → redirected to signup/login
4. After auth, Edge Function (service role) runs:
   a. Validates share_token (is_active, not expired, etc)
   b. Creates tenant_member (is_external=true, role=external_guest)
   c. Creates member_case_assignment (links to case)
   d. Updates share_grant.grantee_user_id
   e. Logs access in share_access_log
5. User redirected to app, RLS now grants access

DO NOT expose share table directly to client for token validation.
';

CREATE INDEX idx_share_token ON share(share_token) WHERE is_active = true;
CREATE INDEX idx_share_lookup ON share(shareable_type, shareable_id);
CREATE INDEX idx_share_tenant ON share(tenant_id);

ALTER TABLE member_case_assignment 
    ADD CONSTRAINT fk_case_assignment_share 
    FOREIGN KEY (source_share_id) REFERENCES share(id) ON DELETE SET NULL;

CREATE TABLE share_grant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES share(id) ON DELETE CASCADE,
    
    grantee_type TEXT NOT NULL CHECK (grantee_type IN ('user', 'tenant', 'email')),
    grantee_user_id UUID REFERENCES user_profile(id),
    grantee_tenant_id UUID REFERENCES tenant(id),
    grantee_email TEXT,
    
    permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'download')),
    
    is_active BOOLEAN DEFAULT true,
    accepted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    granted_by UUID REFERENCES user_profile(id),
    
    CONSTRAINT share_grant_has_grantee CHECK (
        grantee_user_id IS NOT NULL OR
        grantee_tenant_id IS NOT NULL OR
        grantee_email IS NOT NULL
    )
);

CREATE INDEX idx_share_grant_share ON share_grant(share_id);
CREATE INDEX idx_share_grant_user ON share_grant(grantee_user_id) WHERE grantee_user_id IS NOT NULL;
CREATE INDEX idx_share_grant_email ON share_grant(grantee_email) WHERE grantee_email IS NOT NULL;

CREATE TABLE share_access_log (
    id BIGSERIAL PRIMARY KEY,
    share_id UUID NOT NULL REFERENCES share(id) ON DELETE CASCADE,
    share_grant_id UUID REFERENCES share_grant(id),
    
    accessed_by_user_id UUID REFERENCES user_profile(id),
    accessed_by_email TEXT,
    accessed_by_ip INET,
    
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    
    accessed_at TIMESTAMPTZ DEFAULT now(),
    user_agent TEXT
);

CREATE INDEX idx_share_access_share ON share_access_log(share_id, accessed_at DESC);

-- ============================================================================
-- SECTION 10: APPROVAL WORKFLOWS
-- ============================================================================

CREATE TABLE approval_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    resource_type TEXT NOT NULL,
    action TEXT NOT NULL,
    
    conditions JSONB DEFAULT '{}',
    
    approver_type TEXT NOT NULL,
    approver_config JSONB NOT NULL,
    
    timeout_hours INT DEFAULT 72,
    escalation_role_slug TEXT,
    auto_action_on_timeout TEXT DEFAULT 'none',
    
    priority INT DEFAULT 100,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_policy_lookup ON approval_policy(tenant_id, resource_type, action, is_active)
    WHERE is_active = true;

CREATE TABLE approval_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES approval_policy(id),
    
    resource_type TEXT NOT NULL,
    resource_id UUID,
    action TEXT NOT NULL,
    
    payload JSONB NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
    
    requested_by UUID NOT NULL REFERENCES user_profile(id),
    requested_at TIMESTAMPTZ DEFAULT now(),
    
    decided_by UUID REFERENCES user_profile(id),
    decided_at TIMESTAMPTZ,
    decision_notes TEXT,
    
    expires_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    escalated_to UUID REFERENCES user_profile(id)
);

CREATE INDEX idx_approval_request_pending ON approval_request(tenant_id, status) WHERE status = 'pending';
CREATE INDEX idx_approval_request_requester ON approval_request(requested_by, status);
CREATE INDEX idx_approval_request_expires ON approval_request(expires_at) WHERE status = 'pending';

-- ============================================================================
-- SECTION 11: AUDIT LOGGING
-- ============================================================================

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    
    actor_id UUID,
    actor_type TEXT NOT NULL DEFAULT 'user',
    actor_email TEXT,
    
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    resource_name TEXT,
    
    changes JSONB,
    metadata JSONB DEFAULT '{}',
    
    approval_request_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE audit_log IS '
INTENTIONALLY NO FOREIGN KEYS

Audit logs must:
1. Survive longer than referenced data (user deleted? still need their history)
2. Not slow down with FK checks on every insert
3. Never cascade-delete (immutable historical record)
4. Capture state at time of action, not current references

Fields like actor_id, tenant_id, resource_id are UUIDs for correlation,
not enforced references. Use resource_type + resource_id to identify
what was affected. Store denormalized data (actor_email, resource_name)
for queryability after source deletion.
';

CREATE INDEX idx_audit_log_tenant_time ON audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at DESC);

-- ============================================================================
-- SECTION 12: NOTIFICATIONS
-- ============================================================================

CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    
    resource_type TEXT,
    resource_id UUID,
    action_url TEXT,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_user ON notification(user_id, is_read, created_at DESC);
CREATE INDEX idx_notification_unread ON notification(user_id, created_at DESC) WHERE is_read = false;

-- ============================================================================
-- SECTION 13: HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_access()
RETURNS TABLE (
    tenant_id UUID,
    role_id UUID,
    policy JSONB,
    max_classification_level INT,
    is_external BOOLEAN,
    member_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT
        tm.tenant_id,
        tm.role_id,
        r.policy,
        COALESCE((r.policy->'constraints'->>'max_classification_level')::int, 0),
        tm.is_external,
        tm.id
    FROM tenant_member tm
    JOIN role r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND (r.tenant_id = tm.tenant_id OR r.tenant_id IS NULL);
$$;

CREATE OR REPLACE FUNCTION is_asset_accessible_internal(
    p_asset_id UUID, 
    p_user_id UUID, 
    p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    WITH RECURSIVE accessible_assets AS (
        SELECT maa.asset_instance_id AS asset_id
        FROM member_asset_assignment maa
        JOIN tenant_member tm ON tm.id = maa.tenant_member_id
            AND tm.tenant_id = p_tenant_id
            AND tm.user_id = p_user_id
            AND tm.status = 'active'
            AND tm.is_external = false
        JOIN asset_instance ai ON ai.id = maa.asset_instance_id
            AND ai.tenant_id = p_tenant_id
            AND ai.status = 'active'
        
        UNION
        
        SELECT c.target_asset_id
        FROM accessible_assets aa
        JOIN connection c ON c.source_asset_id = aa.asset_id
            AND c.tenant_id = p_tenant_id
        JOIN connection_type ct ON ct.id = c.connection_type_id
            AND ct.tenant_id = p_tenant_id
        JOIN asset_instance target_ai ON target_ai.id = c.target_asset_id
            AND target_ai.tenant_id = p_tenant_id
            AND target_ai.status = 'active'
        WHERE ct.permission_inheritance = 'cascade_down'
    )
    SELECT EXISTS (
        SELECT 1 FROM accessible_assets WHERE asset_id = p_asset_id
    );
$$;

CREATE OR REPLACE FUNCTION is_case_accessible(p_case_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM case_instance ci
        JOIN tenant_member tm ON tm.tenant_id = ci.tenant_id
            AND tm.user_id = p_user_id
            AND tm.status = 'active'
        WHERE ci.id = p_case_id
          AND ci.status = 'active'
        AND (
            CASE WHEN tm.is_external THEN
                EXISTS (
                    SELECT 1 FROM member_case_assignment mca
                    WHERE mca.case_instance_id = p_case_id
                      AND mca.tenant_member_id = tm.id
                )
            ELSE
                is_asset_accessible_internal(ci.asset_instance_id, p_user_id, ci.tenant_id)
            END
        )
    );
$$;

CREATE OR REPLACE FUNCTION get_accessible_assets(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE (asset_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    WITH RECURSIVE accessible AS (
        SELECT maa.asset_instance_id AS asset_id
        FROM member_asset_assignment maa
        JOIN tenant_member tm ON tm.id = maa.tenant_member_id
            AND tm.tenant_id = p_tenant_id
            AND tm.user_id = p_user_id
            AND tm.status = 'active'
            AND tm.is_external = false
        JOIN asset_instance ai ON ai.id = maa.asset_instance_id
            AND ai.tenant_id = p_tenant_id
            AND ai.status = 'active'
        
        UNION
        
        SELECT c.target_asset_id
        FROM accessible a
        JOIN connection c ON c.source_asset_id = a.asset_id
            AND c.tenant_id = p_tenant_id
        JOIN connection_type ct ON ct.id = c.connection_type_id
            AND ct.tenant_id = p_tenant_id
        JOIN asset_instance target_ai ON target_ai.id = c.target_asset_id
            AND target_ai.tenant_id = p_tenant_id
            AND target_ai.status = 'active'
        WHERE ct.permission_inheritance = 'cascade_down'
    )
    SELECT DISTINCT asset_id FROM accessible;
$$;

CREATE OR REPLACE FUNCTION is_user_external_in_tenant(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT COALESCE(
        (
            SELECT is_external 
            FROM tenant_member 
            WHERE tenant_id = p_tenant_id 
              AND user_id = p_user_id 
              AND status = 'active'
            LIMIT 1
        ),
        true
    );
$$;

CREATE OR REPLACE FUNCTION update_packet_completeness(p_period_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_has_primary BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM document_period_link dpl
        JOIN document d ON d.id = dpl.document_id AND d.status = 'active'
        WHERE dpl.period_id = p_period_id
          AND dpl.role = 'primary'
    ) INTO v_has_primary;
    
    UPDATE period
    SET has_primary_document = v_has_primary,
        is_packet_complete = v_has_primary,
        updated_at = now()
    WHERE id = p_period_id;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_update_packet_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_packet_completeness(OLD.period_id);
        RETURN OLD;
    ELSE
        PERFORM update_packet_completeness(NEW.period_id);
        RETURN NEW;
    END IF;
END;
$$;

CREATE TRIGGER trg_document_period_link_completeness
    AFTER INSERT OR UPDATE OR DELETE ON document_period_link
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_packet_completeness();

-- Enforce role-tenant consistency
-- A tenant_member can only be assigned:
-- 1. A system role (role.tenant_id IS NULL), OR
-- 2. A role from the same tenant (role.tenant_id = tenant_member.tenant_id)
CREATE OR REPLACE FUNCTION enforce_role_tenant_consistency()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_role_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO v_role_tenant_id
    FROM role
    WHERE id = NEW.role_id;
    
    IF v_role_tenant_id IS NOT NULL AND v_role_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Role tenant mismatch: role belongs to tenant %, but member belongs to tenant %',
            v_role_tenant_id, NEW.tenant_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tenant_member_role_consistency
    BEFORE INSERT OR UPDATE OF role_id, tenant_id ON tenant_member
    FOR EACH ROW
    EXECUTE FUNCTION enforce_role_tenant_consistency();

-- ============================================================================
-- SECTION 14: FUNCTION PERMISSIONS
-- ============================================================================

REVOKE ALL ON FUNCTION get_user_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_access() TO authenticated;

REVOKE ALL ON FUNCTION is_asset_accessible_internal(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_asset_accessible_internal(UUID, UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION is_case_accessible(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_case_accessible(UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION is_user_external_in_tenant(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_user_external_in_tenant(UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION get_accessible_assets(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_accessible_assets(UUID, UUID) TO authenticated;

-- ============================================================================
-- SECTION 15: ROW-LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_asset_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_case_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE period ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE file ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_asset_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_case_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_period_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE share ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_grant ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- USER PROFILE
-- --------------------------------------------------------------------------
CREATE POLICY user_profile_select ON user_profile
    FOR SELECT USING (id = auth.uid());

CREATE POLICY user_profile_update ON user_profile
    FOR UPDATE USING (id = auth.uid());

-- --------------------------------------------------------------------------
-- TENANT
-- --------------------------------------------------------------------------
CREATE POLICY tenant_select ON tenant
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = tenant.id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

-- --------------------------------------------------------------------------
-- TENANT MEMBER
-- --------------------------------------------------------------------------
CREATE POLICY tenant_member_select ON tenant_member
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = tenant_member.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

-- --------------------------------------------------------------------------
-- MEMBER ASSET ASSIGNMENT (internal users only)
-- --------------------------------------------------------------------------
CREATE POLICY member_asset_assignment_select ON member_asset_assignment
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM tenant_member target 
            JOIN tenant_member viewer ON viewer.tenant_id = target.tenant_id
                AND viewer.user_id = auth.uid()
                AND viewer.status = 'active'
                AND NOT viewer.is_external
            WHERE target.id = member_asset_assignment.tenant_member_id
        )
    );

-- --------------------------------------------------------------------------
-- MEMBER CASE ASSIGNMENT (internal sees all, external sees own only)
-- --------------------------------------------------------------------------
CREATE POLICY member_case_assignment_select ON member_case_assignment
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM tenant_member target 
            JOIN tenant_member viewer ON viewer.tenant_id = target.tenant_id
                AND viewer.user_id = auth.uid()
                AND viewer.status = 'active'
            WHERE target.id = member_case_assignment.tenant_member_id
              AND (
                  NOT viewer.is_external
                  OR viewer.id = target.id
              )
        )
    );

-- --------------------------------------------------------------------------
-- ROLE
-- --------------------------------------------------------------------------
CREATE POLICY role_select ON role
    FOR SELECT USING (
        tenant_id IS NULL
        OR EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = role.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

-- --------------------------------------------------------------------------
-- CLASSIFICATION LEVEL
-- --------------------------------------------------------------------------
CREATE POLICY classification_level_select ON classification_level
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = classification_level.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

-- --------------------------------------------------------------------------
-- TYPE TABLES
-- --------------------------------------------------------------------------
CREATE POLICY asset_type_select ON asset_type
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = asset_type.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

CREATE POLICY case_type_select ON case_type
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = case_type.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

CREATE POLICY connection_type_select ON connection_type
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = connection_type.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
              AND NOT tm.is_external
        )
    );

-- --------------------------------------------------------------------------
-- ASSET INSTANCE (internal only, must be active)
-- --------------------------------------------------------------------------
CREATE POLICY asset_instance_select ON asset_instance
    FOR SELECT USING (
        asset_instance.status = 'active'
        AND EXISTS (
            SELECT 1 FROM get_user_access() ua
            WHERE ua.tenant_id = asset_instance.tenant_id
            AND NOT ua.is_external
            AND (
                ua.policy->'constraints'->>'entity_scope' = 'all'
                OR (
                    ua.policy->'constraints'->>'entity_scope' = 'assigned'
                    AND is_asset_accessible_internal(asset_instance.id, auth.uid(), asset_instance.tenant_id)
                )
                OR (
                    ua.policy->'constraints'->>'entity_scope' = 'own'
                    AND asset_instance.created_by = auth.uid()
                )
            )
        )
    );

-- --------------------------------------------------------------------------
-- CASE INSTANCE (must be active)
-- --------------------------------------------------------------------------
CREATE POLICY case_instance_select ON case_instance
    FOR SELECT USING (
        case_instance.status = 'active'
        AND is_case_accessible(case_instance.id, auth.uid())
    );

-- --------------------------------------------------------------------------
-- PERIOD (external sees only specific workflow statuses)
-- --------------------------------------------------------------------------
CREATE POLICY period_select ON period
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM case_instance ci
            JOIN tenant_member tm ON tm.tenant_id = ci.tenant_id
                AND tm.tenant_id = period.tenant_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
            WHERE ci.id = period.case_instance_id
              AND ci.tenant_id = period.tenant_id
              AND ci.status = 'active'
              AND is_case_accessible(ci.id, auth.uid())
              AND (
                  NOT tm.is_external
                  OR period.status IN ('active', 'approved', 'submitted')
              )
        )
    );

-- --------------------------------------------------------------------------
-- CONNECTION (internal only, both endpoints accessible)
-- --------------------------------------------------------------------------
CREATE POLICY connection_select ON connection
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = connection.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
              AND NOT tm.is_external
        )
        AND is_asset_accessible_internal(connection.source_asset_id, auth.uid(), connection.tenant_id)
        AND is_asset_accessible_internal(connection.target_asset_id, auth.uid(), connection.tenant_id)
    );

-- --------------------------------------------------------------------------
-- DOCUMENT (must be active, external via period primary only)
-- --------------------------------------------------------------------------
CREATE POLICY document_select ON document
    FOR SELECT USING (
        document.status = 'active'
        AND EXISTS (
            SELECT 1 FROM get_user_access() ua
            WHERE ua.tenant_id = document.tenant_id
            AND (
                document.classification_id IS NULL
                OR EXISTS (
                    SELECT 1 FROM classification_level cl
                    WHERE cl.id = document.classification_id
                      AND cl.tenant_id = document.tenant_id
                      AND cl.level <= ua.max_classification_level
                )
            )
            AND (
                CASE WHEN ua.is_external THEN
                    EXISTS (
                        SELECT 1 
                        FROM document_period_link dpl
                        JOIN period p ON p.id = dpl.period_id
                            AND p.tenant_id = document.tenant_id
                        JOIN case_instance ci ON ci.id = p.case_instance_id
                            AND ci.tenant_id = document.tenant_id
                            AND ci.status = 'active'
                        JOIN member_case_assignment mca ON mca.case_instance_id = ci.id
                            AND mca.tenant_member_id = ua.member_id
                        WHERE dpl.document_id = document.id
                          AND (dpl.role = 'primary' OR dpl.share_externally = true)
                          AND p.status IN ('active', 'approved', 'submitted')
                    )
                ELSE
                    EXISTS (
                        SELECT 1 FROM document_asset_link dal
                        JOIN asset_instance ai ON ai.id = dal.asset_instance_id
                            AND ai.tenant_id = document.tenant_id
                            AND ai.status = 'active'
                        WHERE dal.document_id = document.id
                          AND is_asset_accessible_internal(ai.id, auth.uid(), document.tenant_id)
                    )
                    OR EXISTS (
                        SELECT 1 FROM document_case_link dcl
                        JOIN case_instance ci ON ci.id = dcl.case_instance_id
                            AND ci.tenant_id = document.tenant_id
                            AND ci.status = 'active'
                        WHERE dcl.document_id = document.id
                          AND is_case_accessible(ci.id, auth.uid())
                    )
                    OR EXISTS (
                        SELECT 1 FROM document_period_link dpl
                        JOIN period p ON p.id = dpl.period_id
                            AND p.tenant_id = document.tenant_id
                        JOIN case_instance ci ON ci.id = p.case_instance_id
                            AND ci.tenant_id = document.tenant_id
                            AND ci.status = 'active'
                        WHERE dpl.document_id = document.id
                          AND is_case_accessible(ci.id, auth.uid())
                    )
                END
            )
        )
    );

-- --------------------------------------------------------------------------
-- FILE (inherits from document)
-- --------------------------------------------------------------------------
CREATE POLICY file_select ON file
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM document d 
            WHERE d.id = file.document_id
        )
    );

-- --------------------------------------------------------------------------
-- DOCUMENT ASSET LINK (internal only)
-- --------------------------------------------------------------------------
CREATE POLICY document_asset_link_select ON document_asset_link
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM document d
            JOIN asset_instance ai ON ai.id = document_asset_link.asset_instance_id
                AND ai.tenant_id = d.tenant_id
                AND ai.status = 'active'
            JOIN tenant_member tm ON tm.tenant_id = d.tenant_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
                AND NOT tm.is_external
            WHERE d.id = document_asset_link.document_id
              AND d.status = 'active'
              AND is_asset_accessible_internal(ai.id, auth.uid(), d.tenant_id)
        )
    );

-- --------------------------------------------------------------------------
-- DOCUMENT CASE LINK (internal full, external primary only)
-- --------------------------------------------------------------------------
CREATE POLICY document_case_link_select ON document_case_link
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM document d
            JOIN case_instance ci ON ci.id = document_case_link.case_instance_id
                AND ci.tenant_id = d.tenant_id
                AND ci.status = 'active'
            JOIN tenant_member tm ON tm.tenant_id = d.tenant_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
            WHERE d.id = document_case_link.document_id
              AND d.status = 'active'
              AND is_case_accessible(ci.id, auth.uid())
              AND (
                  NOT tm.is_external
                  OR document_case_link.role = 'primary'
                  OR document_case_link.share_externally = true
              )
        )
    );

-- --------------------------------------------------------------------------
-- DOCUMENT PERIOD LINK (internal full, external primary + status check)
-- --------------------------------------------------------------------------
CREATE POLICY document_period_link_select ON document_period_link
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM document d
            JOIN period p ON p.id = document_period_link.period_id
                AND p.tenant_id = d.tenant_id
            JOIN case_instance ci ON ci.id = p.case_instance_id
                AND ci.tenant_id = d.tenant_id
                AND ci.status = 'active'
            JOIN tenant_member tm ON tm.tenant_id = d.tenant_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
            WHERE d.id = document_period_link.document_id
              AND d.status = 'active'
              AND is_case_accessible(ci.id, auth.uid())
              AND (
                  NOT tm.is_external
                  OR (
                      (document_period_link.role = 'primary' OR document_period_link.share_externally = true)
                      AND p.status IN ('active', 'approved', 'submitted')
                  )
              )
        )
    );

-- --------------------------------------------------------------------------
-- SHARE (internal members only)
-- --------------------------------------------------------------------------
CREATE POLICY share_select ON share
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = share.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
              AND NOT tm.is_external
        )
    );

-- --------------------------------------------------------------------------
-- SHARE GRANT
-- --------------------------------------------------------------------------
CREATE POLICY share_grant_select ON share_grant
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM share s
            JOIN tenant_member tm ON tm.tenant_id = s.tenant_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
                AND NOT tm.is_external
            WHERE s.id = share_grant.share_id
        )
        OR share_grant.grantee_user_id = auth.uid()
    );

-- --------------------------------------------------------------------------
-- SHARE ACCESS LOG
-- --------------------------------------------------------------------------
CREATE POLICY share_access_log_select ON share_access_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM share s
            JOIN tenant_member tm ON tm.tenant_id = s.tenant_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
                AND NOT tm.is_external
            WHERE s.id = share_access_log.share_id
        )
    );

-- --------------------------------------------------------------------------
-- APPROVAL POLICY
-- --------------------------------------------------------------------------
CREATE POLICY approval_policy_select ON approval_policy
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = approval_policy.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
              AND NOT tm.is_external
        )
    );

-- --------------------------------------------------------------------------
-- APPROVAL REQUEST
-- --------------------------------------------------------------------------
CREATE POLICY approval_request_select ON approval_request
    FOR SELECT USING (
        requested_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = approval_request.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
              AND NOT tm.is_external
        )
    );

-- --------------------------------------------------------------------------
-- AUDIT LOG
-- --------------------------------------------------------------------------
CREATE POLICY audit_log_select ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_member tm
            WHERE tm.tenant_id = audit_log.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
              AND NOT tm.is_external
        )
    );

-- --------------------------------------------------------------------------
-- NOTIFICATION
-- --------------------------------------------------------------------------
CREATE POLICY notification_select ON notification
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 16: SEED DATA - SYSTEM ROLES
-- ============================================================================
-- Idempotent: ON CONFLICT DO NOTHING allows re-running migrations safely

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Owner',
    'owner',
    'Full access to everything including billing and tenant settings',
    '{
        "resources": {
            "asset_instance": {"actions": ["*"]},
            "case_instance": {"actions": ["*"]},
            "period": {"actions": ["*"]},
            "document": {"actions": ["*"]},
            "share": {"actions": ["*"]},
            "member": {"actions": ["*"]},
            "settings": {"actions": ["*"]},
            "approval": {"actions": ["*"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "all",
            "max_classification_level": 100,
            "ownership": "any",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": true,
            "can_invite_to_scope": true,
            "can_create_roles": true,
            "can_manage_policies": true
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Admin',
    'admin',
    'Full access except billing, can manage members',
    '{
        "resources": {
            "asset_instance": {"actions": ["*"]},
            "case_instance": {"actions": ["*"]},
            "period": {"actions": ["*"]},
            "document": {"actions": ["*"]},
            "share": {"actions": ["*"]},
            "member": {"actions": ["read", "invite", "update", "remove"]},
            "settings": {"actions": ["read", "update"]},
            "approval": {"actions": ["*"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "all",
            "max_classification_level": 100,
            "ownership": "any",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": true,
            "can_invite_to_scope": true,
            "can_create_roles": true,
            "can_manage_policies": true
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Manager',
    'manager',
    'Manage assigned scope, invite team members',
    '{
        "resources": {
            "asset_instance": {"actions": ["read", "update"]},
            "case_instance": {"actions": ["create", "read", "update", "delete"]},
            "period": {"actions": ["*"]},
            "document": {"actions": ["*"]},
            "share": {"actions": ["*"]},
            "member": {"actions": ["read", "invite"]},
            "approval": {"actions": ["read", "decide"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "assigned",
            "max_classification_level": 20,
            "ownership": "any",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": true,
            "can_invite_to_scope": true,
            "can_create_roles": false,
            "can_manage_policies": false
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000004',
    NULL,
    'Contributor',
    'contributor',
    'Create and manage own documents within assigned scope',
    '{
        "resources": {
            "asset_instance": {"actions": ["read"]},
            "case_instance": {"actions": ["read"]},
            "period": {"actions": ["read", "update"]},
            "document": {"actions": ["create", "read", "update", "download"], "ownership_override": "own"},
            "share": {"actions": ["read"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "assigned",
            "max_classification_level": 10,
            "ownership": "own",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": false,
            "can_invite_to_scope": false,
            "can_create_roles": false,
            "can_manage_policies": false
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000005',
    NULL,
    'Viewer',
    'viewer',
    'Read-only access to assigned scope',
    '{
        "resources": {
            "asset_instance": {"actions": ["read"]},
            "case_instance": {"actions": ["read"]},
            "period": {"actions": ["read"]},
            "document": {"actions": ["read", "download"]},
            "share": {"actions": ["read"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "assigned",
            "max_classification_level": 10,
            "ownership": "any",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": false,
            "can_invite_to_scope": false,
            "can_create_roles": false,
            "can_manage_policies": false
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000006',
    NULL,
    'Compliance Officer',
    'compliance_officer',
    'Read access to all, can lock documents, approve compliance items',
    '{
        "resources": {
            "asset_instance": {"actions": ["read"]},
            "case_instance": {"actions": ["read"]},
            "period": {"actions": ["read"]},
            "document": {"actions": ["read", "download", "lock", "unlock"]},
            "share": {"actions": ["read"]},
            "approval": {"actions": ["read", "decide"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "all",
            "max_classification_level": 30,
            "ownership": "any",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": true,
            "can_invite_to_scope": false,
            "can_create_roles": false,
            "can_manage_policies": false
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO role (id, tenant_id, name, slug, description, policy, is_system) VALUES
(
    '00000000-0000-0000-0000-000000000007',
    NULL,
    'External Guest',
    'external_guest',
    'External user with access to shared cases only (primary documents, active/approved/submitted periods)',
    '{
        "resources": {
            "case_instance": {"actions": ["read"]},
            "period": {"actions": ["read"]},
            "document": {"actions": ["read", "download"]}
        },
        "constraints": {
            "entity_types": "*",
            "entity_scope": "assigned",
            "max_classification_level": 0,
            "ownership": "any",
            "case_types": "*"
        },
        "capabilities": {
            "can_approve": false,
            "can_invite_to_scope": false,
            "can_create_roles": false,
            "can_manage_policies": false
        }
    }'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 17: VIEWS - BASIC
-- ============================================================================

CREATE VIEW v_asset_full AS
SELECT
    ai.*,
    at.name AS type_name,
    at.slug AS type_slug,
    at.icon AS type_icon,
    at.color AS type_color
FROM asset_instance ai
JOIN asset_type at ON at.id = ai.asset_type_id
    AND at.tenant_id = ai.tenant_id
WHERE ai.status = 'active';

CREATE VIEW v_case_full AS
SELECT
    ci.*,
    ct.name AS type_name,
    ct.slug AS type_slug,
    ct.has_expiration,
    ct.reminder_days,
    ai.name AS asset_name,
    at.name AS asset_type_name
FROM case_instance ci
JOIN case_type ct ON ct.id = ci.case_type_id
    AND ct.tenant_id = ci.tenant_id
JOIN asset_instance ai ON ai.id = ci.asset_instance_id
    AND ai.tenant_id = ci.tenant_id
JOIN asset_type at ON at.id = ai.asset_type_id
    AND at.tenant_id = ci.tenant_id
WHERE ci.status = 'active'
  AND ai.status = 'active';

CREATE VIEW v_document_full AS
SELECT
    d.*,
    f.filename,
    f.file_type,
    f.file_size_bytes,
    f.storage_path,
    f.version_number AS current_version,
    f.is_locked,
    cl.name AS classification_name,
    cl.level AS classification_level,
    cl.color AS classification_color
FROM document d
LEFT JOIN file f ON f.id = d.current_file_id
LEFT JOIN classification_level cl ON cl.id = d.classification_id
    AND cl.tenant_id = d.tenant_id
WHERE d.status = 'active';

-- ============================================================================
-- SECTION 18: VIEWS - COMPLIANCE STATUS
-- ============================================================================

-- Period with calculated compliance status
CREATE VIEW v_period_compliance AS
SELECT
    p.id,
    p.tenant_id,
    p.case_instance_id,
    p.label,
    p.start_date,
    p.end_date,
    p.data,
    p.status AS workflow_status,
    p.has_primary_document,
    p.is_packet_complete,
    p.submitted_at,
    p.submitted_by,
    p.approved_at,
    p.approved_by,
    p.created_at,
    p.updated_at,
    p.created_by,
    
    -- Case info
    ci.id AS case_id,
    ci.name AS case_name,
    ci.priority AS case_priority,
    
    -- Type info
    ct.id AS case_type_id,
    ct.name AS case_type_name,
    ct.slug AS case_type_slug,
    ct.has_expiration,
    ct.reminder_days,
    
    -- Asset info
    ai.id AS asset_id,
    ai.name AS asset_name,
    
    -- Calculated: Compliance status
    -- Uses pure date arithmetic for index friendliness
    CASE
        WHEN NOT ct.has_expiration THEN 'permanent'
        WHEN p.end_date IS NULL THEN 'permanent'
        WHEN p.end_date < CURRENT_DATE THEN 'expired'
        WHEN p.end_date <= CURRENT_DATE + ct.reminder_days THEN 'expiring'
        ELSE 'current'
    END AS compliance_status,
    
    -- Calculated: Days until expiry (NULL if permanent)
    CASE
        WHEN NOT ct.has_expiration THEN NULL
        WHEN p.end_date IS NULL THEN NULL
        ELSE p.end_date - CURRENT_DATE
    END AS days_until_expiry
    
FROM period p
JOIN case_instance ci ON ci.id = p.case_instance_id
    AND ci.tenant_id = p.tenant_id
    AND ci.status = 'active'
JOIN case_type ct ON ct.id = ci.case_type_id
    AND ct.tenant_id = p.tenant_id
JOIN asset_instance ai ON ai.id = ci.asset_instance_id
    AND ai.tenant_id = p.tenant_id
    AND ai.status = 'active';

COMMENT ON VIEW v_period_compliance IS '
COMPLIANCE STATUS VALUES:
- permanent: No expiration (has_expiration=false or end_date IS NULL)
- current: Valid, not near expiry (end_date > today + reminder_days)
- expiring: Within reminder window (end_date <= today + reminder_days AND >= today)
- expired: Past expiry date (end_date < today)

WORKFLOW STATUS (period.status):
- draft: In preparation
- submitted: Awaiting approval
- approved: Approved, ready to activate
- active: Current valid period
- archived: Historical, superseded

Use compliance_status for dashboards/alerts.
Use workflow_status for process tracking.
';

-- Full period view with compliance and document counts
CREATE VIEW v_period_full AS
SELECT
    vpc.*,
    (
        SELECT COUNT(*) FROM document_period_link dpl
        JOIN document d ON d.id = dpl.document_id AND d.status = 'active'
        WHERE dpl.period_id = vpc.id
    ) AS document_count,
    (
        SELECT COUNT(*) FROM document_period_link dpl
        JOIN document d ON d.id = dpl.document_id AND d.status = 'active'
        WHERE dpl.period_id = vpc.id AND dpl.role = 'primary'
    ) AS primary_document_count
FROM v_period_compliance vpc;

-- ============================================================================
-- SECTION 19: VIEWS - DASHBOARD AGGREGATIONS
-- ============================================================================
-- PERFORMANCE NOTE:
-- These views join multiple tables and perform aggregations. For tenants with
-- large data volumes (>10K periods), consider:
-- 1. Using the composite indexes: idx_period_dashboard, idx_case_instance_dashboard
-- 2. Converting to MATERIALIZED VIEWs refreshed on schedule (e.g., every 5 min)
-- 3. Implementing trigger-based denormalization for real-time dashboards
-- 
-- Composite indexes added in v6 should handle moderate scale (up to ~50K periods).
-- ============================================================================

-- Traffic light compliance summary per asset
CREATE VIEW v_asset_compliance_summary AS
SELECT
    ai.id AS asset_instance_id,
    ai.tenant_id,
    ai.name AS asset_name,
    at.name AS asset_type_name,
    
    -- Total active cases
    COUNT(DISTINCT ci.id) AS total_cases,
    
    -- Compliance counts (based on active periods only)
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'current' 
          AND vpc.workflow_status = 'active'
    ) AS current_count,
    
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'expiring' 
          AND vpc.workflow_status = 'active'
    ) AS expiring_count,
    
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'expired' 
          AND vpc.workflow_status = 'active'
    ) AS expired_count,
    
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'permanent' 
          AND vpc.workflow_status = 'active'
    ) AS permanent_count,
    
    -- Critical items needing attention
    COUNT(*) FILTER (
        WHERE ci.priority = 'critical' 
          AND vpc.compliance_status IN ('expiring', 'expired')
          AND vpc.workflow_status = 'active'
    ) AS critical_attention_count,
    
    -- High priority items needing attention
    COUNT(*) FILTER (
        WHERE ci.priority = 'high' 
          AND vpc.compliance_status IN ('expiring', 'expired')
          AND vpc.workflow_status = 'active'
    ) AS high_attention_count

FROM asset_instance ai
JOIN asset_type at ON at.id = ai.asset_type_id AND at.tenant_id = ai.tenant_id
LEFT JOIN case_instance ci ON ci.asset_instance_id = ai.id 
    AND ci.tenant_id = ai.tenant_id
    AND ci.status = 'active'
LEFT JOIN v_period_compliance vpc ON vpc.case_instance_id = ci.id
WHERE ai.status = 'active'
GROUP BY ai.id, ai.tenant_id, ai.name, at.name;

COMMENT ON VIEW v_asset_compliance_summary IS '
Dashboard view for traffic-light compliance indicators per asset.

Counts are based on ACTIVE workflow status periods only.
Use for:
- Asset list with compliance badges
- Dashboard widgets
- Alert prioritization

Colors:
- Green: current_count (valid, not near expiry)
- Yellow: expiring_count (within reminder window)
- Red: expired_count (past expiry)
- Gray: permanent_count (no expiration)
';

-- Tenant-wide compliance summary
CREATE VIEW v_tenant_compliance_summary AS
SELECT
    ai.tenant_id,
    
    -- Asset counts
    COUNT(DISTINCT ai.id) AS total_assets,
    
    -- Case counts
    COUNT(DISTINCT ci.id) AS total_cases,
    COUNT(DISTINCT ci.id) FILTER (WHERE ci.priority = 'critical') AS critical_cases,
    COUNT(DISTINCT ci.id) FILTER (WHERE ci.priority = 'high') AS high_priority_cases,
    
    -- Period compliance (active periods only)
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'current' 
          AND vpc.workflow_status = 'active'
    ) AS current_count,
    
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'expiring' 
          AND vpc.workflow_status = 'active'
    ) AS expiring_count,
    
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'expired' 
          AND vpc.workflow_status = 'active'
    ) AS expired_count,
    
    COUNT(*) FILTER (
        WHERE vpc.compliance_status = 'permanent' 
          AND vpc.workflow_status = 'active'
    ) AS permanent_count,
    
    -- Urgent: Critical cases with expired/expiring periods
    COUNT(*) FILTER (
        WHERE ci.priority = 'critical'
          AND vpc.compliance_status IN ('expiring', 'expired')
          AND vpc.workflow_status = 'active'
    ) AS urgent_count

FROM asset_instance ai
LEFT JOIN case_instance ci ON ci.asset_instance_id = ai.id 
    AND ci.tenant_id = ai.tenant_id
    AND ci.status = 'active'
LEFT JOIN v_period_compliance vpc ON vpc.case_instance_id = ci.id
WHERE ai.status = 'active'
GROUP BY ai.tenant_id;

-- Upcoming expirations list
CREATE VIEW v_upcoming_expirations AS
SELECT
    vpc.*,
    -- Urgency ranking for sorting
    CASE vpc.compliance_status
        WHEN 'expired' THEN 1
        WHEN 'expiring' THEN 2
        WHEN 'current' THEN 3
        ELSE 4
    END AS urgency_rank,
    CASE vpc.case_priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
    END AS priority_rank
FROM v_period_compliance vpc
WHERE vpc.workflow_status = 'active'
  AND vpc.compliance_status IN ('expired', 'expiring')
ORDER BY urgency_rank, priority_rank, vpc.days_until_expiry NULLS LAST;

COMMENT ON VIEW v_upcoming_expirations IS '
Actionable list of periods needing attention.
Sorted by urgency (expired first) then priority (critical first) then days until expiry.
Use for:
- Compliance dashboard alerts
- Email notification triggers
- Task assignment
';

-- ============================================================================
-- SECTION 20: VIEWS - EXTERNAL SHARING
-- ============================================================================

CREATE VIEW v_case_shareable_documents AS
SELECT
    ci.id AS case_instance_id,
    ci.tenant_id,
    p.id AS period_id,
    p.label AS period_label,
    p.status AS period_status,
    d.id AS document_id,
    d.name AS document_name,
    dpl.role,
    dpl.label AS link_label,
    f.filename,
    f.file_type,
    f.file_size_bytes
FROM case_instance ci
JOIN period p ON p.case_instance_id = ci.id
    AND p.tenant_id = ci.tenant_id
JOIN document_period_link dpl ON dpl.period_id = p.id
JOIN document d ON d.id = dpl.document_id
    AND d.tenant_id = ci.tenant_id
LEFT JOIN file f ON f.id = d.current_file_id
WHERE ci.status = 'active'
  AND d.status = 'active'
  AND p.status IN ('active', 'approved', 'submitted')
  AND (dpl.role = 'primary' OR dpl.share_externally = true);

COMMENT ON VIEW v_case_shareable_documents IS '
Documents visible to external users when a case is shared.
Filters:
- Only active cases and documents
- Only periods with workflow status: active, approved, submitted
- Only primary documents OR share_externally=true
';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
