# GeoWaves Development Guide

## Build Commands
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

## Project Structure
- `src/main.ts`: Entry point
- `src/scenes/`: Game scenes (Menu, Game, GameOver)
- `src/ui/`: UI components

## Code Style Guidelines
- **Imports**: Use named imports from modules
- **Types**: Always include TypeScript type annotations for params and returns
- **Naming**: Use camelCase for variables/methods, PascalCase for classes/interfaces
- **Classes**: Declare all class properties at the top with visibility modifiers
- **Comments**: Document non-obvious code with comments
- **Error Handling**: Use defensive programming and type guards
- **Game State**: Manage state within Scene classes, minimize globals

## Phaser Patterns
- Use Scene lifecycle methods (preload, create, update)
- Organize resources by scene
- Use Phaser's built-in math utilities (e.g., Phaser.Math.Clamp)
- Maintain consistent coordinate systems