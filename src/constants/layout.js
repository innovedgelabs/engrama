/**
 * Layout Constants
 *
 * Single source of truth for all layout spacing, sizing, and transitions.
 * Change values here to apply them across the entire application.
 */

export const LAYOUT_CONSTANTS = {
  // TopBar dimensions
  topBar: {
    height: {
      mobile: 64,   // Mobile devices (56px minHeight + 8px padding)
      desktop: 80,  // Desktop devices (64px minHeight + 16px padding)
    },
  },

  // Sidebar dimensions and behavior
  sidebar: {
    openWidth: 180,      // Width when expanded
    closedWidth: 50,     // Width when collapsed
    transition: '0.3s ease',  // Transition timing for open/close
  },

  // PageLayout (main content area) spacing
  pageLayout: {
    padding: 3,  // Container padding (24px with 8px base)
  },

  // Spacing between elements
  spacing: {
    headerMargin: 3,  // Gap between PageHeader and ContentPanel (24px)
    navigationMargin: { xs: 1, sm: 1.5 },  // Margin below back button/breadcrumbs (8-12px)
  },

  // PageHeader (hero card) styling
  pageHeader: {
    padding: { xs: 1.2, sm: 1.6 },  // Internal padding (12-16px)
    minHeight: { xs: 110, sm: 130, md: 180 },  // Minimum height for consistency across views
  },

  // ContentPanel (data card) styling
  contentPanel: {
    padding: 2,  // Internal padding (16px)
    defaultTableHeight: 420,  // Standard table height for dashboard-style views
  },

  // Form layouts (for data entry views)
  formLayout: {
    maxWidth: 800,  // Optimal width for form readability on large screens
  },

  // Touch targets (mobile optimization)
  touchTargets: {
    minimum: 44,  // Minimum touch target size (px) per WCAG guidelines
    comfortable: 48,  // Comfortable touch target size (px)
    spacing: 8,  // Minimum spacing between touch targets (px)
  },

  // Mobile-specific spacing
  mobileSpacing: {
    screenPadding: { xs: 2, sm: 3 },  // Horizontal screen padding (16-24px)
    cardGap: { xs: 1, sm: 1.5 },  // Gap between cards in lists (8-12px)
    sectionGap: { xs: 2, sm: 3 },  // Gap between major sections (16-24px)
    itemGap: { xs: 0.5, sm: 1 },  // Gap between small items (4-8px)
  },

  // Responsive breakpoints reference (from MUI theme)
  // xs: 0px (mobile)
  // sm: 600px (tablet portrait)
  // md: 960px (tablet landscape)
  // lg: 1280px (desktop)
  // xl: 1920px (large desktop)
};
