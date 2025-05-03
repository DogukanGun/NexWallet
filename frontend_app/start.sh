#!/bin/bash

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building the application..."
npm run build

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start npm --name "nexwallet-frontend" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo "Application started successfully!" 