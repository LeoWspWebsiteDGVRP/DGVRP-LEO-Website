# Law Enforcement Citation Management System

## Overview

This is a full-stack web application built for law enforcement agencies to manage traffic citations and violations. The system provides a modern, professional interface for officers to create, manage, and track citations with detailed violation information and monetary penalties.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom law enforcement theme (dark navy palette)
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Middleware**: Express middleware for request logging and error handling
- **Development**: Hot module replacement via Vite integration

### Data Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas shared between client and server

## Key Components

### Database Schema
- **Users Table**: Officer authentication and profile management
  - Fields: id, username, password
- **Citations Table**: Citation records with comprehensive violation tracking
  - Fields: officer details (badge, username, rank), violator info, violation types, penal codes array, amounts due array, total amount, additional notes, timestamps

### API Endpoints
- `POST /api/citations` - Create new citation
- `GET /api/citations` - Retrieve all citations
- `GET /api/citations/:id` - Retrieve specific citation by ID

### Form Management
- Dynamic penal code/amount pairs with add/remove functionality
- Real-time total calculation
- Comprehensive form validation with user-friendly error messages
- Auto-filled violation types with manual override capability

### UI Components
- Professional law enforcement themed interface
- Responsive design for desktop and mobile use
- Toast notifications for user feedback
- Comprehensive form controls (inputs, selects, textareas)

## Data Flow

1. **Citation Creation Flow**:
   - Officer fills out citation form with violation details
   - Form validates input data using Zod schemas
   - Client sends POST request to `/api/citations`
   - Server validates data and stores in database
   - Success/error feedback provided via toast notifications

2. **Data Validation**:
   - Shared Zod schemas ensure consistent validation
   - Client-side validation for immediate feedback
   - Server-side validation for security and data integrity

3. **Storage Strategy**:
   - Development: In-memory storage for rapid prototyping
   - Production: PostgreSQL database with Drizzle ORM

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type checking and validation

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Modern icon library

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Development server and build tool

## Deployment Strategy

### Build Process
1. Frontend build: `vite build` - Creates optimized React bundle
2. Backend build: `esbuild` - Bundles Node.js server for production
3. Output: `dist/` directory with static assets and server bundle

### Environment Configuration
- `NODE_ENV`: Development/production environment flag
- `DATABASE_URL`: PostgreSQL connection string (required)
- Drizzle configuration points to PostgreSQL dialect

### Production Considerations
- Server runs on Node.js with Express
- Static assets served from `dist/public`
- Database migrations managed via `drizzle-kit push`
- Error handling with appropriate HTTP status codes

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 10, 2025. Enhanced Discord integration and dynamic officer signatures:
  - Added image upload support with base64 encoding to Discord
  - Fixed "request entity too large" error by increasing server limit to 10MB
  - Added auto-dismiss for success notifications after 5 seconds
  - Images now attach to Discord when no description provided
  - Implemented dynamic officer signature boxes that scale with number of officers
  - Updated arrest form to support multiple officer signatures (array-based)
  - Modified Discord service to handle multiple officer signatures with proper labeling
- July 02, 2025. Initial setup