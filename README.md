"# CSRC Office

CSRC Office is a React-based administrative workflow application for managing academic and research office processes such as tapal tracking, endorsements, project approvals, and accounts-related operations.

## Overview

This repository contains a multi-module frontend system centered around the main application in the frontend folder. The app provides role-based screens for:

- Dashboard and navigation
- Master data management
- Tapal (inward/outward correspondence) workflows
- Endorsement processing
- Project sanction, renewal, transfer, approval, and reporting
- Accounts and financial reporting modules

## Tech Stack

- React 19
- Vite 8
- React Router DOM
- Axios
- XLSX, jsPDF, html2canvas
- ESLint for code quality

## Project Structure

- frontend/ - Main React application entry point
  - src/ - Application pages, components, router, and styles
  - src_accounts/ - Accounts module UI and pages
  - src_tapal/ - Tapal module UI and pages
- README.md - Project documentation

## Main Application Flow

1. The app starts from the login and dashboard experience.
2. Users navigate to modules such as Master, My Tapals, Endorsements, Projects, and Accounts.
3. Each module contains its own pages and workflows, with routing handled by the main router configuration.
4. Project transfer requests and other office workflows use local storage-backed state for demo and interim processing.

## Key Modules

### 1. Dashboard
The landing page provides access to available modules and a simple overview of the system.

### 2. Master Module
Used for managing core reference data such as campuses, departments, designations, faculties, beneficiary records, and schemes.

### 3. Tapal Module
Handles correspondence and tracking workflows for tapal processing, requests, assigned work, and completed items.

### 4. Endorsement Module
Supports endorsement request creation, transfer, search, and completion tracking.

### 5. Project Module
Covers research project operations including:
- Fresh sanction
- Renewal sanction
- Project requests
- Office reappropriation
- Project extension
- ZBA claims
- Project transfer requests
- Search and reports

### 6. Accounts Module
Provides finance-related operations such as budget, receipts, payments, banking, reports, and statement workflows.

## Getting Started

### Prerequisites

- Node.js and npm

### Install dependencies

```bash
cd frontend
npm install
```

### Run the development server

```bash
cd frontend
npm run dev
```

### Build for production

```bash
cd frontend
npm run build
```

## Routing Notes

Routing is configured in frontend/src/router/AppRouter.jsx. The router provides routes for the main modules and nested sub-routes for projects, tapal, endorsements, and accounts.

## Notes for Developers

- The application is mostly UI-driven and uses local storage for interim state in several workflow pages.
- Some modules are still under construction and are marked as such in the dashboard.
- The project is structured as a monolithic frontend with several feature-specific folders rather than a backend-driven microservice architecture.

## Future Improvement Ideas

- Connect modules to a real backend API
- Add authentication and authorization with role-based access control
- Introduce centralized state management for shared workflow data
- Improve test coverage and end-to-end validation

## License

This project is intended for internal office workflow use and is not currently documented with a separate public license.
" 
