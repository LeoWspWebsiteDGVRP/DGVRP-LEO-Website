# Law Enforcement Citation Management System

## Overview

This is a full-stack web application built for law enforcement agencies to manage traffic citations and arrests. The system provides a modern, professional interface for officers to create, manage, and submit citations and arrest forms with optional Discord integration for automated reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Development**: Hot module replacement via Vite integration
- **Build**: esbuild for server bundling

### Data Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for PostgreSQL connectivity
- **Validation**: Zod schemas shared between client and server

## Key Components

### Database Schema
Located in `shared/schema.ts`:
- **Users Table**: Officer authentication and profile management
  - Fields: id, username, password
- **Citations Table**: Citation records with comprehensive violation tracking
  - Fields: officer details (badges, usernames, ranks, user IDs as arrays), violator info, violation types, penal codes array, amounts due array, jail times array, total amounts, additional notes, timestamps

### API Endpoints
- `POST /api/citations` - Create new citation
- `GET /api/citations` - Retrieve all citations
- `GET /api/citations/:id` - Retrieve specific citation by ID
- Additional arrest endpoints (in development)

### Form Management
- **Citation Form**: Dynamic penal code/amount pairs with add/remove functionality
- **Arrest Form**: Comprehensive arrest documentation with mugshot upload
- **Validation**: Real-time form validation with user-friendly error messages
- **Multi-officer Support**: Up to 3 officers can be added per citation/arrest

### UI Components
- Professional law enforcement theme with dark navy color palette
- Responsive design with mobile support
- Form selection interface for choosing between citation and arrest forms
- Command palette for searchable penal code selection
- Signature capture functionality

## Data Flow

1. **Form Selection**: Users choose between citation or arrest forms
2. **Form Completion**: Officers fill out comprehensive forms with validation
3. **Submission**: Data is validated on both client and server
4. **Storage**: Records are stored in PostgreSQL database
5. **Discord Integration**: Optional automated reporting to Discord channels

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React Hook Form, React Query
- **UI Components**: Radix UI primitives, shadcn/ui component library
- **Styling**: Tailwind CSS, class-variance-authority
- **Database**: Drizzle ORM, PostgreSQL, Neon serverless
- **Validation**: Zod for runtime type checking
- **Build Tools**: Vite, esbuild, TypeScript

### Optional Integrations
- **Discord.js**: For automated reporting to Discord channels
- **File Upload**: Support for mugshot uploads in arrest forms

## Deployment Strategy

### Development
- Run `npm run dev` to start development server
- Vite provides hot module replacement for fast development
- PostgreSQL database required via DATABASE_URL environment variable

### Production Build
- `npm run build` creates optimized client and server bundles
- Client files built to `dist/public`
- Server bundled with esbuild to `dist/index.js`
- `npm start` runs production server

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `DISCORD_BOT_TOKEN`: Discord bot token (optional)
- `DISCORD_CHANNEL_ID`: Discord channel ID for reports (optional)

### Database Management
- `npm run db:push` applies schema changes to database
- Migrations stored in `./migrations` directory
- Schema definition in `shared/schema.ts`

## Key Architectural Decisions

### Monorepo Structure
- **Problem**: Sharing types and schemas between client and server
- **Solution**: Shared directory with common TypeScript definitions
- **Benefits**: Type safety across full stack, reduced duplication

### Form State Management
- **Problem**: Complex forms with dynamic fields and validation
- **Solution**: React Hook Form with Zod validation
- **Benefits**: Excellent performance, type-safe validation, great UX

### Database Choice
- **Problem**: Need for reliable, scalable data storage
- **Solution**: PostgreSQL with Drizzle ORM
- **Benefits**: ACID compliance, excellent TypeScript support, migration management

### UI Component Strategy
- **Problem**: Need for professional, consistent UI components
- **Solution**: shadcn/ui built on Radix UI primitives
- **Benefits**: Accessibility, customization, professional appearance

### Optional Discord Integration
- **Problem**: Need for automated reporting without requiring Discord
- **Solution**: Optional Discord service with graceful fallbacks
- **Benefits**: Flexibility for different deployment scenarios