# Build Process

## Overview
The extension uses a dual-build system: one for the VS Code extension (TypeScript) and one for the webview UI (React + Vite).

## Build Configuration

### Vite Configuration
- **Location**: `vite.config.mjs`
- **Purpose**: Builds the React webview interface
- **Key Settings**:
  - Output directory: `dist`
  - Entry point: `src/webview/index.html`
  - Plugins: React, TailwindCSS
  - Bundle output: Single `webview.js` file

### Package.json Scripts
```json
{
  "scripts": {
    "vscode:prepublish": "npm run compile && npm run build:webview",
    "compile": "vite build && tsc -p ./",
    "build:webview": "vite build",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js"
  }
}
```

## Build Steps

### 1. WebView Build (`build:webview`)
- Uses Vite to bundle React components
- Processes TailwindCSS styles
- Outputs to `dist/` directory
- Generates: `webview.js`, `webview.css`

### 2. Extension Compilation (`compile`)
- TypeScript compilation of extension code
- Output: `out/extension.js`
- Includes GitProvider and extension entry point

### 3. Prepublish Build (`vscode:prepublish`)
- Runs both webview build and extension compilation
- Required before publishing to VS Code marketplace

## Development Workflow

### Development Mode
- `npm run watch`: Continuous TypeScript compilation
- Hot reload via Vite dev server for webview changes
- F5 in VS Code launches Extension Development Host

### Production Build
- `npm run vscode:prepublish`: Full production build
- Minified bundles for optimal performance
- Source maps for debugging

## File Structure

```
dist/
├── webview.js      # Bundled React application
├── webview.css     # Processed styles
└── webview.html    # WebView entry point

out/
└── extension.js    # Compiled TypeScript extension

src/
├── extension.ts    # Extension entry point
├── services/       # Backend services
└── webview/        # React frontend
```

## Dependencies

### Build Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type checking and compilation
- **ESLint**: Code linting

### Runtime Dependencies
- **React**: UI framework for webview
- **TailwindCSS**: Utility-first CSS framework
- **VS Code API**: Extension and Git integration

## Build Optimization

### Code Splitting
- Single bundle for webview to reduce load time
- Tree shaking removes unused code
- CSS optimization via TailwindCSS

### Development Experience
- Fast rebuilds with Vite HMR
- TypeScript for better developer experience
- ESLint for code quality