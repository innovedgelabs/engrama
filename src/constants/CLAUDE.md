# Constants - Design Context

## Directory Purpose

Application-wide constants that:
- Provide single source of truth for configuration values
- Enable consistent spacing and sizing across components
- Simplify responsive design with standardized breakpoints
- Make global changes easy (modify once, apply everywhere)
- Improve designer/developer collaboration with shared values

**Current Constants**:
- `layout.js` - Layout dimensions, spacing, transitions, and touch targets

---

## layout.js

**Purpose**: Centralized layout configuration defining all spacing values, component dimensions, transitions, and responsive behaviors used throughout the application.

**Architecture Philosophy**:

**DRY Principle**: Define layout values once, reference everywhere.

**Benefits**:
- **Consistency**: All components use same spacing scale
- **Maintainability**: Change one value, update entire app
- **Designer Collaboration**: Shared language between design and code
- **Responsive Harmony**: Coordinated breakpoint values
- **Refactoring Safety**: Update constants, not hundreds of component files

**Anti-Pattern** (Before Constants):
```javascript
// TopBar.jsx
sx={{ height: 80 }}

// PageLayout.jsx
sx={{ marginTop: '80px' }}

// StickyHeader.jsx
sx={{ top: 80 }}

// Problem: Magic numbers scattered everywhere, hard to change
```

**Pattern** (With Constants):
```javascript
// constants/layout.js
export const LAYOUT_CONSTANTS = {
  topBar: { height: { desktop: 80 } }
};

// TopBar.jsx
sx={{ height: LAYOUT_CONSTANTS.topBar.height.desktop }}

// PageLayout.jsx
sx={{ marginTop: `${LAYOUT_CONSTANTS.topBar.height.desktop}px` }}

// StickyHeader.jsx
sx={{ top: LAYOUT_CONSTANTS.topBar.height.desktop }}

// Solution: Single source of truth, change once to update everywhere
```

---

### LAYOUT_CONSTANTS Object

```javascript
export const LAYOUT_CONSTANTS = {
  topBar: { /* ... */ },
  sidebar: { /* ... */ },
  pageLayout: { /* ... */ },
  spacing: { /* ... */ },
  pageHeader: { /* ... */ },
  contentPanel: { /* ... */ },
  touchTargets: { /* ... */ },
  mobileSpacing: { /* ... */ },
};
```

---

### topBar

**Purpose**: TopBar component dimensions across responsive breakpoints.

```javascript
topBar: {
  height: {
    mobile: 64,   // Mobile devices (< 600px)
    desktop: 80,  // Desktop devices (>= 600px)
  },
}
```

**Values Explained**:
- **mobile: 64px** - Compressed height for small screens (saves vertical space)
- **desktop: 80px** - Comfortable height for larger screens (more breathing room)

**Material-UI Baseline**: AppBar default minHeight is 56px, we add padding (8px mobile, 16px desktop) for larger touch targets and visual balance.

**Usage**:
```javascript
// TopBar.jsx
<AppBar
  sx={{
    height: {
      xs: LAYOUT_CONSTANTS.topBar.height.mobile,
      sm: LAYOUT_CONSTANTS.topBar.height.desktop
    }
  }}
>

// PageLayout.jsx - Content offset to avoid overlapping TopBar
<Box
  sx={{
    marginTop: {
      xs: `${LAYOUT_CONSTANTS.topBar.height.mobile}px`,
      sm: `${LAYOUT_CONSTANTS.topBar.height.desktop}px`
    }
  }}
>
```

**Why Responsive Heights?**
- Mobile: Limited vertical space, compress to show more content
- Desktop: More screen space, increase for better aesthetics and touch targets

---

### sidebar

**Purpose**: Sidebar dimensions and animation timing.

```javascript
sidebar: {
  openWidth: 180,           // Width when expanded (shows icons + labels)
  closedWidth: 50,          // Width when collapsed (shows icons only)
  transition: '0.3s ease',  // Animation timing for open/close
}
```

**Values Explained**:
- **openWidth: 180px** - Enough for icons (24px) + labels (~120px) + padding (36px)
- **closedWidth: 50px** - Minimal width for icons (24px) + padding (26px)
- **transition: '0.3s ease'** - Fast enough to feel responsive, slow enough to be smooth

**Usage**:
```javascript
// Sidebar.jsx
<Drawer
  sx={{
    width: sidebarOpen ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth,
    transition: LAYOUT_CONSTANTS.sidebar.transition,
    '& .MuiDrawer-paper': {
      width: sidebarOpen ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth,
      transition: LAYOUT_CONSTANTS.sidebar.transition,
    }
  }}
>

// PageLayout.jsx - Content margin adjusts with sidebar
<Box
  sx={{
    marginLeft: isMobile ? 0 : (
      sidebarOpen ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth
    ),
    transition: LAYOUT_CONSTANTS.sidebar.transition,
  }}
>
```

**Why These Widths?**
- **180px open**: Material Design recommendation for navigation drawers (160-240px)
- **50px closed**: Minimum for icon-only navigation (44-56px range)
- **0.3s transition**: Matches Material Design motion guidelines (200-400ms)

**Transition Timing**:
- **Too fast (< 0.2s)**: Jarring, hard to follow
- **Just right (0.3s)**: Smooth, professional feel
- **Too slow (> 0.5s)**: Sluggish, frustrating

---

### pageLayout

**Purpose**: Main content area container padding.

```javascript
pageLayout: {
  padding: 3,  // Material-UI spacing unit (3 × 8px = 24px)
}
```

**Value Explained**:
- **3 units (24px)** - Comfortable padding for content area, not too cramped, not too wasteful

**Material-UI Spacing Scale**:
- 1 unit = 8px
- 2 units = 16px
- 3 units = 24px ✓ (used here)
- 4 units = 32px

**Usage**:
```javascript
// PageLayout.jsx
<Container
  maxWidth="xl"
  sx={{
    py: LAYOUT_CONSTANTS.pageLayout.padding,  // Vertical padding: 24px
    px: LAYOUT_CONSTANTS.pageLayout.padding,  // Horizontal padding: 24px
  }}
>
```

**Why 24px?**
- **Too small (< 16px)**: Content feels cramped, hard to read on edges
- **Just right (24px)**: Balanced whitespace, comfortable reading
- **Too large (> 32px)**: Wastes screen space, especially on mobile

---

### spacing

**Purpose**: Standard gaps between major layout elements.

```javascript
spacing: {
  headerMargin: 3,                      // Gap between PageHeader and ContentPanel (24px)
  navigationMargin: { xs: 1, sm: 1.5 }, // Margin below breadcrumbs (8-12px)
}
```

**Values Explained**:
- **headerMargin: 3 (24px)** - Visual separation between header and content cards
- **navigationMargin: 1-1.5 (8-12px)** - Minimal gap below breadcrumbs/back button

**Usage**:
```javascript
// PageLayout.jsx - Breadcrumbs margin
<Breadcrumbs sx={{ mb: LAYOUT_CONSTANTS.spacing.navigationMargin }}>

// PageHeader margin below
<PageHeader sx={{ mb: LAYOUT_CONSTANTS.spacing.headerMargin }}>

// ContentPanel
<ContentPanel>
  {/* Now properly spaced from PageHeader */}
</ContentPanel>
```

**Why Responsive navigationMargin?**
- **Mobile (8px)**: Tight spacing to maximize content area
- **Desktop (12px)**: More breathing room when space available

---

### pageHeader

**Purpose**: Hero card dimensions for detail views.

```javascript
pageHeader: {
  padding: { xs: 1.2, sm: 1.6 },            // Internal padding (12-16px)
  minHeight: { xs: 110, sm: 130, md: 180 }, // Minimum height for consistency
}
```

**Values Explained**:
- **padding: 1.2-1.6 (12-16px)** - Compact internal spacing for entity info
- **minHeight: 110-180px** - Ensures consistent header size across views

**Usage**:
```javascript
// PageHeader.jsx
<Paper
  elevation={1}
  sx={{
    p: LAYOUT_CONSTANTS.pageHeader.padding,
    minHeight: LAYOUT_CONSTANTS.pageHeader.minHeight,
    display: 'flex',
    alignItems: 'center',
    gap: 2
  }}
>
  <Avatar />
  <Box>
    <Typography variant="h5">{entity.name}</Typography>
    {/* Status chips, description */}
  </Box>
</Paper>
```

**Why Responsive minHeight?**
- **Mobile (110px)**: Minimal header, stack elements vertically if needed
- **Tablet (130px)**: More comfortable on medium screens
- **Desktop (180px)**: Spacious header with room for all elements horizontally

**Why minHeight (not height)?**
- Allows header to grow if content overflows (long names, many chips)
- Ensures minimum size for visual consistency
- Prevents header from collapsing when empty

---

### contentPanel

**Purpose**: Data card (Paper) wrapper dimensions.

```javascript
contentPanel: {
  padding: 2,                // Internal padding (16px)
  defaultTableHeight: 420,   // Standard table height for dashboard views
}
```

**Values Explained**:
- **padding: 2 (16px)** - Internal spacing for tables, charts, forms
- **defaultTableHeight: 420px** - Standard height showing ~10 table rows

**Usage**:
```javascript
// ContentPanel.jsx
<Paper
  elevation={1}
  sx={{
    p: LAYOUT_CONSTANTS.contentPanel.padding,
    height: LAYOUT_CONSTANTS.contentPanel.defaultTableHeight,
    overflow: 'auto'
  }}
>
  <DataTable />
</Paper>
```

**Why 420px Table Height?**
- **10 rows visible** (42px per row including header)
- **Compact enough** to fit multiple tables on screen
- **Tall enough** to avoid excessive scrolling
- **Consistent** across all dashboard views

**Alternative Heights**:
```javascript
// Compact table (5-7 rows)
height: 300

// Standard table (10 rows) ✓
height: 420

// Large table (15-20 rows)
height: 600
```

---

### touchTargets

**Purpose**: Mobile touch target sizing per WCAG 2.1 Level AA guidelines.

```javascript
touchTargets: {
  minimum: 44,     // Minimum touch target size (px)
  comfortable: 48, // Comfortable touch target size (px)
  spacing: 8,      // Minimum spacing between touch targets (px)
}
```

**Values Explained**:
- **minimum: 44px** - WCAG 2.1 Level AA minimum (44×44px)
- **comfortable: 48px** - Material Design recommendation (48×48px)
- **spacing: 8px** - Prevent accidental taps on adjacent targets

**WCAG 2.1 Level AA Target Size**:
> The size of the target for pointer inputs is at least 44 by 44 CSS pixels

**Usage**:
```javascript
// IconButton.jsx
<IconButton
  sx={{
    minWidth: LAYOUT_CONSTANTS.touchTargets.comfortable,
    minHeight: LAYOUT_CONSTANTS.touchTargets.comfortable,
    margin: `${LAYOUT_CONSTANTS.touchTargets.spacing / 2}px`, // 4px on each side = 8px gap
  }}
>
  <MenuIcon />
</IconButton>

// FilterChip.jsx (mobile)
<Chip
  sx={{
    minHeight: { xs: LAYOUT_CONSTANTS.touchTargets.minimum, md: 32 },
    padding: { xs: 1, md: 0.5 },
  }}
/>
```

**Why 44px Minimum?**
- **Accessibility**: WCAG compliance ensures app is usable by people with motor impairments
- **Mobile UX**: Prevents "fat finger" mistakes on small screens
- **Touch Accuracy**: Easier to tap without accidentally hitting adjacent buttons

**Why 48px Comfortable?**
- **Material Design**: Google's research-backed recommendation
- **Better UX**: Larger targets reduce user frustration
- **Modern Standard**: Most popular apps use 48px or larger

---

### mobileSpacing

**Purpose**: Mobile-specific spacing for compact layouts.

```javascript
mobileSpacing: {
  screenPadding: { xs: 2, sm: 3 },   // Horizontal screen padding (16-24px)
  cardGap: { xs: 1, sm: 1.5 },       // Gap between cards in lists (8-12px)
  sectionGap: { xs: 2, sm: 3 },      // Gap between major sections (16-24px)
  itemGap: { xs: 0.5, sm: 1 },       // Gap between small items (4-8px)
}
```

**Values Explained**:
- **screenPadding: 16-24px** - Edge margins on mobile screens
- **cardGap: 8-12px** - Space between asset cards in lists
- **sectionGap: 16-24px** - Visual separation between page sections
- **itemGap: 4-8px** - Tight spacing for list items, chips, buttons

**Usage**:
```javascript
// AssetCarousel.jsx - Mobile screen padding
<Box sx={{ px: LAYOUT_CONSTANTS.mobileSpacing.screenPadding }}>

// Asset list - Gap between cards
<Stack spacing={LAYOUT_CONSTANTS.mobileSpacing.cardGap}>
  <AssetTile />
  <AssetTile />
  <AssetTile />
</Stack>

// Dashboard sections - Visual separation
<Box>
  <HealthScore />
  <Box sx={{ mt: LAYOUT_CONSTANTS.mobileSpacing.sectionGap }}>
    <HealthDonut />
  </Box>
</Box>

// Chip group - Tight spacing
<Stack direction="row" spacing={LAYOUT_CONSTANTS.mobileSpacing.itemGap}>
  <Chip />
  <Chip />
  <Chip />
</Stack>
```

**Why Responsive Spacing?**
- **Mobile (smaller values)**: Maximize content area on limited screen space
- **Desktop (larger values)**: More breathing room when space is plentiful

---

### Responsive Breakpoints Reference

```javascript
// Material-UI default breakpoints (commented in layout.js)
// xs: 0px     (mobile portrait)
// sm: 600px   (mobile landscape / tablet portrait)
// md: 960px   (tablet landscape)
// lg: 1280px  (desktop)
// xl: 1920px  (large desktop)
```

**Why Include Reference?**
- Developers can see breakpoint values without checking theme
- Ensures consistent responsive design across components
- Reminder to use these values when adding responsive spacing

**Usage in Components**:
```javascript
// Responsive value using breakpoints
sx={{
  padding: {
    xs: 2,  // 0-599px: 16px padding
    sm: 3,  // 600-959px: 24px padding
    md: 4,  // 960px+: 32px padding
  }
}}
```

---

### Usage Patterns

#### Pattern 1: Direct Reference
```javascript
import { LAYOUT_CONSTANTS } from '../constants/layout';

function TopBar() {
  return (
    <AppBar
      sx={{
        height: {
          xs: LAYOUT_CONSTANTS.topBar.height.mobile,
          sm: LAYOUT_CONSTANTS.topBar.height.desktop
        }
      }}
    >
      {/* ... */}
    </AppBar>
  );
}
```

#### Pattern 2: Destructuring
```javascript
import { LAYOUT_CONSTANTS } from '../constants/layout';

const { openWidth, closedWidth, transition } = LAYOUT_CONSTANTS.sidebar;

function Sidebar() {
  return (
    <Drawer
      sx={{
        width: sidebarOpen ? openWidth : closedWidth,
        transition: transition,
      }}
    >
      {/* ... */}
    </Drawer>
  );
}
```

#### Pattern 3: Computed Values
```javascript
import { LAYOUT_CONSTANTS } from '../constants/layout';

function PageLayout() {
  const topBarHeight = LAYOUT_CONSTANTS.topBar.height.desktop;
  const sidebarWidth = sidebarOpen ? LAYOUT_CONSTANTS.sidebar.openWidth : LAYOUT_CONSTANTS.sidebar.closedWidth;

  return (
    <Box
      sx={{
        marginTop: `${topBarHeight}px`,
        marginLeft: `${sidebarWidth}px`,
        padding: LAYOUT_CONSTANTS.pageLayout.padding,
      }}
    >
      {children}
    </Box>
  );
}
```

---

### Design Decisions

#### Why Single Constants File?

**Alternative 1: Constants Per Component**
- Problem: Hard to maintain global consistency, duplication across components

**Alternative 2: Theme File**
- Problem: Mixing layout constants with MUI theme, pollutes theme object

**Our Solution**: Single `constants/layout.js` file
- ✅ Single source of truth
- ✅ Easy to find and update
- ✅ Doesn't pollute MUI theme
- ✅ Can import anywhere

#### Why Material-UI Spacing Units?

**Material-UI Spacing**: 1 unit = 8px (configurable in theme)

**Benefits**:
- **Consistency**: All spacing is multiples of 8px (8, 16, 24, 32, 40, etc.)
- **Visual Rhythm**: Creates harmonious layouts (8-point grid system)
- **Industry Standard**: Used by Material Design, iOS, many design systems

**Example**:
```javascript
// Using MUI spacing units
sx={{ p: 3 }}  // padding: 24px

// Equivalent without units (not recommended)
sx={{ p: '24px' }}
```

**Why 8px Grid?**
- **Divisibility**: 8 is divisible by 2, 4, 8 (easy to create half/quarter spaces)
- **Screen Compatibility**: Most screen resolutions are multiples of 8
- **Design Tools**: Figma, Sketch, Adobe XD all support 8px grids

#### Why Not Use CSS Variables?

**CSS Variables Alternative**:
```css
:root {
  --topbar-height-mobile: 64px;
  --topbar-height-desktop: 80px;
}
```

**Pros**:
- Can be updated dynamically (e.g., user customization)
- Can cascade through DOM

**Cons**:
- No TypeScript type checking
- Harder to use in JavaScript calculations
- Less IDE autocomplete support
- Not as common in React/MUI ecosystem

**Our Choice**: JavaScript constants
- ✅ Better TypeScript support (future migration)
- ✅ Easy to use in calculations
- ✅ Better IDE autocomplete
- ✅ Fits React/MUI patterns

---

## Performance Considerations

**No Performance Impact**:
- Constants are JavaScript objects (evaluated once at module load)
- No runtime overhead compared to hardcoded values
- Tree-shaking works (unused constants removed in production build)

**Bundle Size**:
- layout.js: < 1KB (negligible)
- Benefits far outweigh tiny size increase

---

