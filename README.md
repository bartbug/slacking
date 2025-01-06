# Slack Clone

A modern, scalable Slack clone built with Next.js, Node.js, and PostgreSQL.

## Project Structure

```
├── client/                 # Frontend application (Next.js)
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable React components
│   ├── lib/               # Client-side utilities and helpers
│   ├── styles/            # Global styles and theme
│   └── public/            # Static assets
│
├── server/                # Backend application (Node.js)
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   └── tests/            # Server-side tests
│
├── shared/                # Shared code between client and server
│   ├── types/            # TypeScript types/interfaces
│   ├── constants/        # Shared constants
│   └── utils/            # Shared utilities
│
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
│
├── config/               # Configuration files
│   ├── development.ts    # Development config
│   └── production.ts     # Production config
│
└── docs/                 # Documentation
    ├── api/              # API documentation
    └── setup/            # Setup guides
```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket (Socket.io)
- **Authentication**: JWT
- **Package Manager**: pnpm
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL
- pnpm (install globally using `npm install -g pnpm`)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd slack-clone
   ```

2. Set up environment variables:
   ```bash
   # Client environment setup
   cd client
   cp .env.example .env.local

   # Server environment setup
   cd ../server
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   pnpm install

   # Install server dependencies
   cd ../server
   pnpm install
   ```

4. Set up the database:
   ```bash
   # From the server directory
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

5. Start development servers:
   ```bash
   # Start client (from client directory)
   pnpm dev

   # Start server (from server directory)
   pnpm dev
   ```

The client will be available at `http://localhost:3000` and the server at `http://localhost:4000`.

## Development Guidelines

- Follow the established directory structure
- Use TypeScript for all new code
- Write tests for new features
- Follow the established coding style (enforced by ESLint)
- Use `pnpm` for package management:
  - Add dependencies: `pnpm add package-name`
  - Add dev dependencies: `pnpm add -D package-name`
  - Remove packages: `pnpm remove package-name`
  - Update packages: `pnpm update`

## Common Commands

```bash
# Generate Prisma client after schema changes
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Run tests
pnpm test

# Build for production
pnpm build

# Lint code
pnpm lint
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 