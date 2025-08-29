# Project Documentation

## Tech Stack

### Frontend (WebView)
- **React 19.1.1**: UI framework for the Git interface
- **TypeScript 5.9.2**: Type-safe JavaScript development
- **TailwindCSS 4.1.12**: Utility-first CSS framework
- **Vite 7.1.3**: Fast build tool and development server

### Backend (VS Code Extension)
- **TypeScript 5.9.2**: Extension development
- **VS Code API 1.74.0**: Extension host and Git integration
- **Node.js**: Runtime environment

### Package Manager
- **pnpm 9.12.1**: Fast, disk-efficient package manager

## Build Tools & Configuration

### Build System
- **Vite**: Frontend bundling and optimization
- **TypeScript Compiler**: Extension compilation
- **ESLint**: Code linting and quality

### Configuration Files
- `vite.config.mjs`: WebView build configuration
- `tsconfig.json`: TypeScript compilation settings
- `package.json`: Project dependencies and scripts
- `.eslintrc.json`: Linting rules

## Key Dependencies

### Runtime Dependencies
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

### Development Dependencies
```json
{
  "@types/node": "^24.3.0",
  "@types/react": "^19.1.12",
  "@types/react-dom": "^19.1.8",
  "@types/vscode": "^1.74.0",
  "@vitejs/plugin-react": "^4.0.0",
  "tailwindcss": "^4.1.12",
  "typescript": "^5.9.2",
  "vite": "^7.1.3"
}
```

## Build Scripts

### Development
- `npm run watch`: Continuous TypeScript compilation
- `npm run build:webview`: Build React webview
- `npm run lint`: Run ESLint

### Production
- `npm run compile`: Full compilation (extension + webview)
- `npm run vscode:prepublish`: Prepublish build

## Architecture

### Extension Structure
```
src/
├── extension.ts          # Main extension entry point
├── services/
│   └── GitProvider.ts    # Git operations backend
└── webview/              # React frontend
    ├── components/       # UI components
    ├── contexts/         # React context providers
    ├── services/         # Frontend services
    └── index.tsx         # React app entry point
```

### Build Output
```
dist/                     # WebView build output
├── webview.js           # Bundled React app
├── webview.css          # Processed styles
└── webview.html         # WebView template

out/                     # Extension compilation
└── extension.js         # Compiled extension
```

## Development Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Development Build**:
   ```bash
   npm run watch          # Extension compilation
   npm run build:webview  # WebView build
   ```

3. **Run Extension**:
   - Press F5 in VS Code
   - Launches Extension Development Host

## Key Features

### Git Integration
- VS Code Git extension API integration
- Real-time file status monitoring
- Branch management and switching
- Commit history with statistics

### UI Components
- React-based Git interface
- TailwindCSS for styling
- Responsive design
- Keyboard navigation support

### Performance
- Fast builds with Vite
- Optimized bundling
- Efficient state management
- Lazy loading for large datasets

## Documentation Structure

- `git-integration.md`: Git operations and API integration
- `build-process.md`: Build system and development workflow
- `sidebar-functionality.md`: UI components and user interactions