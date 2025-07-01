# eslint-config-playlisto

Base ESLint configuration for Playlisto monorepo projects.

## Installation

This package is part of the Playlisto monorepo and should be installed as a workspace dependency.

## Usage

### Basic Configuration

```javascript
// eslint.config.js
import playlistoConfig from 'eslint-config-playlisto'

export default playlistoConfig
```

### React Configuration

```javascript
// eslint.config.js
import reactConfig from 'eslint-config-playlisto/react.js'

export default reactConfig
```

### TypeScript Configuration

```javascript
// eslint.config.js
import typescriptConfig from 'eslint-config-playlisto/typescript.js'

export default typescriptConfig
```

## Features

- TypeScript support with recommended rules
- React support with hooks and refresh plugins
- Browser and Node.js globals
- Consistent code style across the monorepo
- Modern ESLint flat config format

## Rules

The configuration includes:

- TypeScript ESLint recommended rules
- React Hooks rules
- React Refresh rules for Vite
- Custom rules for better code quality
- Consistent formatting rules

## Dependencies

This package requires:
- ESLint >= 9.0.0
- TypeScript >= 5.0.0
- Various ESLint plugins (see package.json) 