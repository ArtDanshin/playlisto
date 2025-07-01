# Playlisto

A Rush monorepo for playlist management application.

## Quick Start

### Prerequisites
- Node.js >=22.16.0 <23.0.0
- Rush CLI (will be installed automatically)

### Setup
```bash
# Install dependencies
rush install

# Start development server
rushx dev
```

## Project Structure

This is a Rush monorepo using pnpm as package manager.

### Projects
- `services/frontend` - React + Vite application

### Important Commands

#### Package Management
- `rush install` - Install all dependencies
- `rush update` - Update dependencies
- `rush add --package <package-name> --project <project-name>` - Add new package

#### Development
- `rushx dev` - Start development server
- `rushx build` - Build project
- `rushx lint` - Run linter

#### Building
- `rush build` - Build all projects
- `rush rebuild` - Rebuild all projects
- `rush build --to <project-name>` - Build specific project

#### Other
- `rush list` - List all projects
- `rush check` - Check repository state
- `rush purge` - Clean temporary files

## Configuration
- Rush version: 5.155.0
- pnpm version: 9.15.5
- Node.js version range: >=22.16.0 <23.0.0

## For AI Assistants
See `AI_ASSISTANT.md` for specific instructions on working with this Rush monorepo.