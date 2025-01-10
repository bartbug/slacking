# Server Directory Structure

## Current State Overview
This document reflects the actual current state of the server codebase. Items marked with 🚧 are documented but not yet implemented.

## Root Files
### Configuration
- `package.json` - Project configuration, dependencies, and scripts
- `package-lock.json` - Locked dependency versions
- `pnpm-lock.yaml` - PNPM locked dependency versions
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration for code style

### Environment
- `.env` - Local environment variables (not in git)
- `.env.example` - Example environment variables template

### Testing
- `test.http` - HTTP request tests
- `test-socket.html` - WebSocket testing page

## Active Directories

### `/src` - Core Application
- `/src/index.ts` - Main application entry point (11KB)
  - Express and Socket.io setup
  - WebSocket event handlers
  - Server initialization

- `/src/routes/` - Express route handlers
  - `auth.ts` (4.1KB) - Authentication routes (login, register)
  - `channels.ts` (6.0KB) - Channel management routes
  - `messages.ts` (5.2KB) - Message-related routes
  - `threads.ts` (2.8KB) - Thread-related routes

- `/src/middleware/` - Express middleware
  - `auth.ts` (1.0KB) - JWT authentication middleware
  - 🚧 `validation.ts` - Request validation (planned but not implemented)

### `/prisma` - Database
- `/prisma/schema.prisma` (2.5KB) - Database schema definition
- 🚧 `/prisma/migrations/` - Database migrations (not yet set up)
- 🚧 `/prisma/seed.ts` - Database seeding (not yet implemented)

### `/scripts` - Development Utilities
- `/scripts/createTestChannel.ts` (1.6KB) - Creates test data for development

### Generated & Runtime Directories (not in git)
- `/dist` - Compiled JavaScript code (generated during build)
- `/node_modules` - Project dependencies (generated from package.json)

## WebSocket Events (implemented in index.ts)
All active and currently used:

### Channel Events
- `join-channel` - User joins a channel
- `leave-channel` - User leaves a channel
- `channel-message` - New message in channel

### Thread Events
- `thread:join` - User joins a thread
- `thread:leave` - User leaves a thread
- `thread:message` - New message in thread

### Direct Message Events
- `join-dm` - Start direct message session
- `direct-message` - Send direct message

## Future Improvements
1. Implement request validation middleware
2. Set up proper database migrations
3. Add database seeding for development
4. Add `.DS_Store` to .gitignore 