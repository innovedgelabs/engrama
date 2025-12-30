# Engrama - Architecture & Scaffold Instructions

## Overview

Create a new branch `feat/supabase-architecture` and scaffold a clean React + Supabase application for document management in regulated industries (food manufacturing, pharma). This replaces the current mock-data architecture with a real database backend.

## Tech Stack

```
Framework:      Vite + React 18 + TypeScript
Styling:        Tailwind CSS + shadcn/ui
Database:       Supabase (PostgreSQL + RLS)
Data Fetching:  @tanstack/react-query
Routing:        react-router-dom v7
Validation:     Zod
Icons:          Lucide React
Dates:          date-fns
```

## Step 1: Create Branch and Clean Start

```bash
git checkout -b feat/supabase-architecture
# Remove all existing src/ content except assets you want to keep
rm -rf src/*
```

## Step 2: Install Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.312.0",
    "date-fns": "^3.2.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "supabase": "^1.131.0"
  }
}
```

## Step 3: Project Structure

Create this folder structure:

```
engrama/
├── src/
│   ├── app/                          # Route pages
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── main/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AssetsPage.tsx        # List view
│   │   │   ├── DetailPage.tsx        # Generic detail view
│   │   │   └── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── common/                   # Shared app components
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── StatusBadge.tsx       # Compliance/Workflow/Priority badges
│   │   │   ├── LifecycleToggle.tsx   # Active/Archived filter
│   │   │   ├── TrafficLights.tsx     # Compliance summary counts
│   │   │   ├── FileActions.tsx       # View/Download/Share/Delete
│   │   │   ├── DataTable.tsx         # Generic table wrapper
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── detail/                   # Detail view tab components
│   │   │   ├── InfoTab.tsx           # Schema-driven field display
│   │   │   ├── CasesTab.tsx          # Regulatory affairs list
│   │   │   ├── PeriodsTab.tsx        # Renewals list
│   │   │   ├── DocumentsTab.tsx      # Attachments list
│   │   │   ├── RelationshipsTab.tsx  # Connected entities
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                    # Create/Edit forms
│   │   │   ├── AssetForm.tsx
│   │   │   ├── CaseForm.tsx
│   │   │   ├── PeriodForm.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── ComplianceOverview.tsx
│   │   │   ├── UpcomingExpirations.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── layout/
│   │       ├── AppLayout.tsx         # Main shell with sidebar
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── AuthLayout.tsx        # Layout for login/signup
│   │       └── index.ts
│   │
│   ├── config/
│   │   ├── entities.ts               # Entity type configs (tabs, fields)
│   │   ├── status.ts                 # Status badge definitions
│   │   ├── navigation.ts             # Sidebar menu items
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-current-tenant.ts
│   │   ├── use-entity.ts             # Generic entity fetcher
│   │   ├── use-assets.ts
│   │   ├── use-cases.ts
│   │   ├── use-periods.ts
│   │   ├── use-documents.ts
│   │   ├── use-relationships.ts
│   │   ├── use-breadcrumbs.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── supabase.ts               # Supabase client
│   │   ├── auth.ts
│   │   ├── assets.ts
│   │   ├── cases.ts
│   │   ├── periods.ts
│   │   ├── documents.ts
│   │   ├── relationships.ts
│   │   └── index.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── TenantProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── utils.ts                  # cn(), formatDate(), formatFileSize()
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── database.ts               # Generated from Supabase (placeholder)
│   │   ├── entities.ts               # App-level entity types
│   │   └── index.ts
│   │
│   ├── router.tsx                    # Route definitions
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Tailwind imports
│
├── supabase/
│   ├── migrations/
│   │   └── 00001_initial_schema.sql  # Full schema (provided separately)
│   └── seed.sql                      # Demo data
│
├── public/
│   └── ...
│
├── .env.local.example
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── components.json                   # shadcn/ui config
└── package.json
```

## Step 4: Core Files Implementation

### 4.1 Entry Point & App

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```tsx
// src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { TenantProvider } from './providers/TenantProvider'
import { AppRouter } from './router'

export function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <TenantProvider>
            <AppRouter />
          </TenantProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}
```

### 4.2 Router

```tsx
// src/router.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/use-auth'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { LoginPage } from './app/auth/LoginPage'
import { SignupPage } from './app/auth/SignupPage'
import { DashboardPage } from './app/main/DashboardPage'
import { AssetsPage } from './app/main/AssetsPage'
import { DetailPage } from './app/main/DetailPage'
import { SettingsPage } from './app/main/SettingsPage'
import { NotFoundPage } from './app/NotFoundPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/detail/:entityType/:entityId" element={<DetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

### 4.3 Supabase Client

```tsx
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 4.4 Auth Provider

```tsx
// src/providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 4.5 Query Provider

```tsx
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 4.6 Tenant Provider

```tsx
// src/providers/TenantProvider.tsx
import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/use-auth'
import { supabase } from '../services/supabase'

interface Tenant {
  id: string
  name: string
  slug: string
}

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['current-tenant', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_member')
        .select('tenant:tenant_id(id, name, slug)')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single()
      
      if (error) throw error
      return data?.tenant as Tenant
    },
    enabled: !!user
  })

  return (
    <TenantContext.Provider value={{ tenant: tenant ?? null, isLoading }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useCurrentTenant() {
  const context = useContext(TenantContext)
  if (!context) throw new Error('useCurrentTenant must be used within TenantProvider')
  return context
}
```

### 4.7 Entity Configuration

```tsx
// src/config/entities.ts
import { Building2, FileText, Calendar, Paperclip, Link2 } from 'lucide-react'
import { InfoTab } from '../components/detail/InfoTab'
import { CasesTab } from '../components/detail/CasesTab'
import { PeriodsTab } from '../components/detail/PeriodsTab'
import { DocumentsTab } from '../components/detail/DocumentsTab'
import { RelationshipsTab } from '../components/detail/RelationshipsTab'

export type EntityType = 'asset' | 'case' | 'period' | 'document'

export interface EntityTab {
  id: string
  label: string
  labelEs?: string  // Spanish label
  component: React.ComponentType<{ entityType: EntityType; entityId: string }>
  countKey?: string
}

export interface EntityField {
  key: string
  label: string
  labelEs?: string
  type: 'text' | 'date' | 'badge' | 'compliance' | 'workflow' | 'priority' | 'dynamic'
}

export interface EntityConfig {
  icon: React.ComponentType<{ className?: string }>
  singularLabel: string
  pluralLabel: string
  singularLabelEs: string
  pluralLabelEs: string
  defaultTab: string
  tabs: EntityTab[]
  fields: EntityField[]
  parentKey?: string  // For building breadcrumbs
}

export const entityConfig: Record<EntityType, EntityConfig> = {
  asset: {
    icon: Building2,
    singularLabel: 'Company',
    pluralLabel: 'Companies',
    singularLabelEs: 'Empresa',
    pluralLabelEs: 'Empresas',
    defaultTab: 'info',
    tabs: [
      { id: 'info', label: 'Information', labelEs: 'Información', component: InfoTab },
      { id: 'cases', label: 'Regulatory Affairs', labelEs: 'Asuntos Regulatorios', component: CasesTab, countKey: 'cases_count' },
      { id: 'dossier', label: 'Dossier', component: DocumentsTab, countKey: 'documents_count' },
      { id: 'relationships', label: 'Relationships', labelEs: 'Relaciones', component: RelationshipsTab, countKey: 'relationships_count' }
    ],
    fields: [
      { key: 'name', label: 'Name', labelEs: 'Nombre', type: 'text' },
      { key: 'code', label: 'Code', labelEs: 'Código', type: 'text' },
      { key: 'data', label: 'Details', labelEs: 'Detalles', type: 'dynamic' }
    ]
  },

  case: {
    icon: FileText,
    singularLabel: 'Regulatory Affair',
    pluralLabel: 'Regulatory Affairs',
    singularLabelEs: 'Asunto Regulatorio',
    pluralLabelEs: 'Asuntos Regulatorios',
    defaultTab: 'info',
    parentKey: 'asset_instance_id',
    tabs: [
      { id: 'info', label: 'Information', labelEs: 'Información', component: InfoTab },
      { id: 'periods', label: 'Renewals', labelEs: 'Renovaciones', component: PeriodsTab, countKey: 'periods_count' }
    ],
    fields: [
      { key: 'name', label: 'Name', labelEs: 'Nombre', type: 'text' },
      { key: 'case_type.name', label: 'Category', labelEs: 'Categoría', type: 'badge' },
      { key: 'data.authority', label: 'Authority', labelEs: 'Autoridad', type: 'text' },
      { key: 'priority', label: 'Priority', labelEs: 'Prioridad', type: 'priority' }
    ]
  },

  period: {
    icon: Calendar,
    singularLabel: 'Renewal',
    pluralLabel: 'Renewals',
    singularLabelEs: 'Renovación',
    pluralLabelEs: 'Renovaciones',
    defaultTab: 'info',
    parentKey: 'case_instance_id',
    tabs: [
      { id: 'info', label: 'Information', labelEs: 'Información', component: InfoTab },
      { id: 'documents', label: 'Attachments', labelEs: 'Adjuntos', component: DocumentsTab, countKey: 'documents_count' }
    ],
    fields: [
      { key: 'label', label: 'Period', labelEs: 'Período', type: 'text' },
      { key: 'start_date', label: 'Approval Date', labelEs: 'Fecha de Aprobación', type: 'date' },
      { key: 'end_date', label: 'Expiration', labelEs: 'Vencimiento', type: 'date' },
      { key: 'compliance_status', label: 'Compliance', labelEs: 'Cumplimiento', type: 'compliance' },
      { key: 'status', label: 'Workflow', type: 'workflow' }
    ]
  },

  document: {
    icon: Paperclip,
    singularLabel: 'Document',
    pluralLabel: 'Documents',
    singularLabelEs: 'Documento',
    pluralLabelEs: 'Documentos',
    defaultTab: 'info',
    tabs: [
      { id: 'info', label: 'Information', labelEs: 'Información', component: InfoTab }
    ],
    fields: [
      { key: 'name', label: 'Name', labelEs: 'Nombre', type: 'text' },
      { key: 'current_file.filename', label: 'File', labelEs: 'Archivo', type: 'text' },
      { key: 'current_file.file_size_bytes', label: 'Size', labelEs: 'Tamaño', type: 'text' }
    ]
  }
}
```

### 4.8 Status Configuration

```tsx
// src/config/status.ts
export const complianceStatus = {
  current: {
    label: 'Current',
    labelEs: 'Vigente',
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500'
  },
  expiring: {
    label: 'Expiring Soon',
    labelEs: 'Por Vencer',
    color: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-500'
  },
  expired: {
    label: 'Expired',
    labelEs: 'Vencido',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500'
  },
  permanent: {
    label: 'Permanent',
    labelEs: 'Permanente',
    color: 'bg-gray-100 text-gray-600',
    dotColor: 'bg-gray-400'
  }
} as const

export const workflowStatus = {
  draft: {
    label: 'Draft',
    labelEs: 'Borrador',
    color: 'border-gray-300 text-gray-600 bg-transparent'
  },
  submitted: {
    label: 'Submitted',
    labelEs: 'Enviado',
    color: 'border-yellow-400 text-yellow-700 bg-yellow-50'
  },
  approved: {
    label: 'Approved',
    labelEs: 'Aprobado',
    color: 'border-green-400 text-green-700 bg-green-50'
  },
  active: {
    label: 'Active',
    labelEs: 'Activo',
    color: 'border-green-400 text-green-700 bg-green-50'
  },
  completed: {
    label: 'Completed',
    labelEs: 'Completado',
    color: 'border-green-400 text-green-700 bg-green-50'
  },
  needs_renewal: {
    label: 'Needs Renewal',
    labelEs: 'Requiere Renovación',
    color: 'border-red-400 text-red-700 bg-red-50'
  },
  archived: {
    label: 'Archived',
    labelEs: 'Archivado',
    color: 'border-gray-300 text-gray-500 bg-gray-50'
  }
} as const

export const priorityStatus = {
  critical: {
    label: 'Critical',
    labelEs: 'Crítico',
    color: 'bg-red-500 text-white'
  },
  high: {
    label: 'High',
    labelEs: 'Alto',
    color: 'bg-orange-500 text-white'
  },
  medium: {
    label: 'Medium',
    labelEs: 'Medio',
    color: 'bg-blue-500 text-white'
  },
  low: {
    label: 'Low',
    labelEs: 'Bajo',
    color: 'bg-gray-400 text-white'
  }
} as const

export type ComplianceStatus = keyof typeof complianceStatus
export type WorkflowStatus = keyof typeof workflowStatus
export type PriorityStatus = keyof typeof priorityStatus
```

### 4.9 Generic Detail Page

```tsx
// src/app/main/DetailPage.tsx
import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/common/PageHeader'
import { LifecycleToggle } from '../../components/common/LifecycleToggle'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { useEntity } from '../../hooks/use-entity'
import { useBreadcrumbs } from '../../hooks/use-breadcrumbs'
import { entityConfig, EntityType } from '../../config/entities'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function DetailPage() {
  const { entityType, entityId } = useParams<{ entityType: EntityType; entityId: string }>()
  const [lifecycle, setLifecycle] = useState<'active' | 'archived'>('active')
  
  const config = entityType ? entityConfig[entityType] : null
  const { data: entity, isLoading, error } = useEntity(entityType!, entityId!)
  const { data: breadcrumbs } = useBreadcrumbs(entityType!, entityId!)

  if (!config) return <EmptyState message="Unknown entity type" />
  if (isLoading) return <LoadingState />
  if (error || !entity) return <EmptyState message="Entity not found" />

  const Icon = config.icon

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={entity.name}
        icon={<Icon className="h-6 w-6" />}
      />

      <Tabs defaultValue={config.defaultTab}>
        <div className="flex items-center justify-between border-b">
          <TabsList className="border-b-0">
            {config.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.labelEs || tab.label}
                {tab.countKey && entity[tab.countKey] !== undefined && (
                  <Badge variant="secondary" className="ml-1">
                    {entity[tab.countKey]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2 pb-2">
            <LifecycleToggle value={lifecycle} onChange={setLifecycle} />
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {config.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <tab.component
              entityType={entityType!}
              entityId={entityId!}
              lifecycle={lifecycle}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

### 4.10 Services - Assets Example

```tsx
// src/services/assets.ts
import { supabase } from './supabase'

export interface Asset {
  id: string
  tenant_id: string
  name: string
  code: string | null
  status: 'active' | 'archived' | 'deleted'
  data: Record<string, unknown>
  created_at: string
  asset_type: {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
  }
  // Counts from joins/aggregations
  cases_count?: number
  documents_count?: number
  relationships_count?: number
}

export interface AssetWithCompliance extends Asset {
  current_count: number
  expiring_count: number
  expired_count: number
  permanent_count: number
  critical_attention_count: number
}

export const assetService = {
  async list(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('asset_instance')
      .select(`
        *,
        asset_type!inner(id, name, slug, icon, color)
      `)
      .eq('status', 'active')
      .order('name')

    if (error) throw error
    return data as Asset[]
  },

  async getById(id: string): Promise<Asset | null> {
    const { data, error } = await supabase
      .from('asset_instance')
      .select(`
        *,
        asset_type!inner(id, name, slug, icon, color)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Asset
  },

  async getWithCompliance(id: string): Promise<AssetWithCompliance | null> {
    const { data, error } = await supabase
      .from('v_asset_compliance_summary')
      .select('*')
      .eq('asset_instance_id', id)
      .single()

    if (error) throw error
    return data as AssetWithCompliance
  },

  async listWithCompliance(): Promise<AssetWithCompliance[]> {
    const { data, error } = await supabase
      .from('v_asset_compliance_summary')
      .select('*')
      .order('asset_name')

    if (error) throw error
    return data as AssetWithCompliance[]
  }
}
```

### 4.11 Generic Entity Hook

```tsx
// src/hooks/use-entity.ts
import { useQuery } from '@tanstack/react-query'
import { EntityType } from '../config/entities'
import { assetService } from '../services/assets'
import { caseService } from '../services/cases'
import { periodService } from '../services/periods'
import { documentService } from '../services/documents'

const serviceMap = {
  asset: assetService,
  case: caseService,
  period: periodService,
  document: documentService
}

export function useEntity(type: EntityType, id: string) {
  return useQuery({
    queryKey: [type, id],
    queryFn: () => serviceMap[type].getById(id),
    enabled: !!type && !!id
  })
}

export function useEntityList(type: EntityType, filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [type, 'list', filters],
    queryFn: () => serviceMap[type].list(filters),
    enabled: !!type
  })
}
```

### 4.12 Utility Functions

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null, pattern = 'd MMM yyyy'): string {
  if (!date) return '—'
  return format(new Date(date), pattern, { locale: es })
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj as unknown)
}
```

### 4.13 Status Badge Components

```tsx
// src/components/common/StatusBadge.tsx
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'
import {
  complianceStatus,
  workflowStatus,
  priorityStatus,
  ComplianceStatus,
  WorkflowStatus,
  PriorityStatus
} from '../../config/status'

interface ComplianceBadgeProps {
  status: ComplianceStatus
  showLabel?: boolean
}

export function ComplianceBadge({ status, showLabel = true }: ComplianceBadgeProps) {
  const config = complianceStatus[status]
  return (
    <Badge className={cn(config.color, 'font-medium')}>
      {showLabel ? config.labelEs : null}
    </Badge>
  )
}

interface WorkflowBadgeProps {
  status: WorkflowStatus
}

export function WorkflowBadge({ status }: WorkflowBadgeProps) {
  const config = workflowStatus[status]
  return (
    <Badge variant="outline" className={cn(config.color, 'font-medium')}>
      {config.labelEs}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: PriorityStatus
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityStatus[priority]
  return (
    <Badge className={cn(config.color, 'font-medium')}>
      {config.labelEs}
    </Badge>
  )
}
```

### 4.14 Traffic Lights Component

```tsx
// src/components/common/TrafficLights.tsx
import { cn } from '../../lib/utils'
import { complianceStatus, ComplianceStatus } from '../../config/status'

interface TrafficLightsProps {
  counts: {
    current: number
    expiring: number
    expired: number
    permanent?: number
  }
  size?: 'sm' | 'md'
}

export function TrafficLights({ counts, size = 'md' }: TrafficLightsProps) {
  const items: { key: ComplianceStatus; count: number }[] = [
    { key: 'current', count: counts.current },
    { key: 'expiring', count: counts.expiring },
    { key: 'expired', count: counts.expired }
  ]

  if (counts.permanent) {
    items.push({ key: 'permanent', count: counts.permanent })
  }

  return (
    <div className="flex items-center gap-2">
      {items.map(({ key, count }) => {
        const config = complianceStatus[key]
        return (
          <div
            key={key}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5',
              config.color
            )}
          >
            <span
              className={cn(
                'rounded-full',
                config.dotColor,
                size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'
              )}
            />
            <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

### 4.15 Environment Variables

```bash
# .env.local.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Tailwind & shadcn Setup

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

```json
// components.json (for shadcn CLI)
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## Step 6: Install shadcn Components

After initial setup, run:

```bash
npx shadcn@latest add badge button card dialog dropdown-menu input label table tabs
```

## Step 7: Database Schema

Copy the schema file provided separately as `supabase/migrations/00001_initial_schema.sql`

This is the v7 schema with:
- 26 tables, 72 foreign keys
- Row-Level Security policies
- Status dimensions (lifecycle, compliance, workflow, priority)
- Compliance calculation views

## Entity → Schema Mapping

| UI Term | Schema Table | Key Fields |
|---------|--------------|------------|
| Company | `asset_instance` | name, code, data, status |
| Regulatory Affair | `case_instance` | name, priority, data.authority |
| Renewal | `period` | label, start_date, end_date, status |
| Attachment | `document` + `document_period_link` | name, current_file_id |
| Relationship | `connection` | source_asset_id, target_asset_id |
| Category | `case_type` | name, slug |

## Route Structure

```
/                         → Dashboard
/assets                   → Asset list (companies)
/detail/asset/:id         → Company detail with tabs
/detail/case/:id          → Regulatory affair detail  
/detail/period/:id        → Renewal detail with attachments
/settings                 → User/tenant settings
/login                    → Login page
/signup                   → Signup page
```

## Order of Implementation

1. **Foundation**: File structure, providers, router
2. **Auth**: Login/signup pages, AuthProvider
3. **Layout**: AppLayout, Sidebar, Header
4. **Services**: Supabase client, entity services
5. **Hooks**: Data fetching hooks with React Query
6. **Common components**: StatusBadge, TrafficLights, DataTable
7. **Pages**: AssetsPage (list), DetailPage (generic)
8. **Detail tabs**: InfoTab, CasesTab, PeriodsTab, DocumentsTab
9. **Forms**: Asset/Case/Period forms, document upload
10. **Dashboard**: ComplianceOverview, UpcomingExpirations

## Notes for Claude Code

- Use TypeScript strict mode
- Follow the service → hook → component pattern
- All Supabase queries go through services, never directly in components
- Use React Query for all data fetching
- Status badges must use the config from `src/config/status.ts`
- Generic DetailPage renders tabs based on entityConfig
- Keep components small and focused
- Spanish labels (labelEs) are the primary display language
