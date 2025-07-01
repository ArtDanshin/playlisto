# AI Assistant Configuration for Playlisto Rush Monorepo

## Project Structure
This is a Rush monorepo using pnpm as package manager. Node.js version: >=22.16.0 <23.0.0

## Important Commands

### Package Management
- **Install dependencies:** `rush install` (NOT npm install)
- **Update dependencies:** `rush update` (NOT npm update)
- **Add new package:** `rush add --package <package-name> --project <project-name>`

### Running Scripts
- **Run scripts in projects:** `rushx <script-name>` (NOT npm run <script-name>)
- Examples:
  - `rushx dev` - start development server
  - `rushx build` - build project
  - `rushx lint` - run linter

### Building
- **Build all projects:** `rush build`
- **Rebuild all projects:** `rush rebuild`
- **Build specific project:** `rush build --to <project-name>`

### Other Useful Commands
- `rush list` - list all projects
- `rush check` - check repository state
- `rush purge` - clean temporary files
- `rush change` - create changelog entries

## Projects
- `services/frontend` - React + Vite application

## Workflow
1. `rush install` - after cloning or dependency changes
2. `rushx dev` - to start dev server in frontend project
3. `rush build` - to build all projects
4. `rushx build` - to build only frontend project

## Important Notes
- Always use Rush commands instead of npm/yarn
- The project uses pnpm version 9.15.5
- Rush version: 5.155.0
- Node.js version range: >=22.16.0 <23.0.0 