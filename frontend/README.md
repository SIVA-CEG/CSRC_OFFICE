# Frontend Application Documentation

This folder contains the main React frontend for the CSRC Office application.

## Purpose

The frontend provides the user interface for administrative modules covering:

- login and dashboard navigation
- master data maintenance
- tapal workflows
- endorsement processing
- project administration
- accounts and reporting screens

## Main Entry Points

- src/main.jsx - React application bootstrap
- src/App.jsx - Root app component and providers
- src/router/AppRouter.jsx - Route definitions for all major modules

## Key Folders

- src/pages/ - Page-level screens for the main application
- src/components/ - Shared UI components such as Navbar, Sidebar, and ProfilePage
- src_accounts/ - Accounts-specific pages and components
- src_tapal/ - Tapal-specific pages and components

## Development Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Notes

The frontend is currently built as a single Vite-based React application with several feature areas organized into separate folders. Some modules are still under development and may appear as placeholder or construction screens.
