#!/bin/bash
echo "Installing repoclip globally..."
echo

# Install dependencies first
echo "Installing dependencies..."
npm install

# Build the TypeScript project
echo
echo "Building TypeScript..."
npx tsc

# Install globally using npm link (for development) or npm install -g
echo
echo "Installing globally..."
npm link

echo
echo "Installation complete!"
echo "You can now run 'repoclip' from anywhere."
echo