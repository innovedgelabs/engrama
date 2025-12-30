# Estamos al Día - Mockup

Modern document management system mockup with object-based architecture.

## Features

- ✅ **Object-Based Management**: Documents attached to entities (companies, products, people, etc.) instead of folders
- ✅ **Modern UI**: Clean, Material-UI based design with brand colors
- ✅ **Smart Filtering**: Search and filter by categories
- ✅ **Flexible Views**: Grid and list view modes
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Status Tracking**: Visual indicators for active, pending, and expired items
- ✅ **Component Architecture**: Clean, maintainable code structure

## Tech Stack

- **React 18** - Modern React with hooks
- **Material-UI v5** - Pre-built components for consistency
- **Vite** - Fast development server
- **Emotion** - CSS-in-JS styling

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx    # Main app wrapper
│   │   └── TopBar.jsx         # Navigation bar with user actions
│   └── home/
│       ├── SearchAndFilters.jsx  # Search bar and category filters
│       ├── AssetGrid.jsx         # Asset display grid/list
│       └── AssetCard.jsx         # Individual asset card
├── views/
│   └── HomeView.jsx           # Main home page
├── data/
│   └── mockData.js            # Mock data for development
├── theme.js                   # Material-UI theme configuration
├── App.jsx                    # Root component
└── main.jsx                   # Entry point
```

## Color Palette

From the "Estamos al Día" logo:
- **Primary Navy**: `#002855`
- **Secondary Teal/Green**: `#3ECFA0`
- **Background**: `#f5f7fa`

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

## Next Steps (Future Development)

- [ ] Detail view for each asset showing documents table
- [ ] Document upload functionality
- [ ] User authentication
- [ ] Database integration
- [ ] Document status tracking
- [ ] Notifications system
- [ ] Advanced filtering and sorting
- [ ] Export functionality
- [ ] Multi-tenant support

## Notes

This is a **mockup/prototype** using placeholder data. It demonstrates the UX/UI design and component structure before backend integration.

