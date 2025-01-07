#!/bin/bash

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Install pnpm
sudo npm install -g pnpm

# Install PM2 for process management
sudo npm install -g pm2

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE slack_clone;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${DB_PASSWORD}';"

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Build the application
pnpm build

# Run migrations
pnpm prisma:migrate

# Start the server with PM2
pm2 start dist/index.js --name "slack-clone"

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup 