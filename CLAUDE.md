# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZCF (Zero-Config Claude-Code Flow) is a CLI tool that automatically configures Claude Code environments. It's built with TypeScript and distributed as an npm package. The tool provides one-click setup for Claude Code including configuration files, API settings, MCP services, and AI workflows.

## Development Guidelines

- **Documentation Language**: Except for README_zh, all code comments and documentation should be written in English
- When writing tests, first verify if relevant test files already exist to avoid unnecessary duplication

## Development Commands

### Build & Run
```bash
# Development (uses tsx for TypeScript execution)
pnpm dev

# Build for production (uses unbuild)
pnpm build

# Type checking
pnpm typecheck
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage

# Run tests once (no watch mode)
pnpm test:run

# Run specific test file
pnpm vitest utils/config.test.ts

# Run tests matching pattern
pnpm vitest --grep "should handle"

# Run tests with coverage threshold check
pnpm vitest run --coverage
```

### Release & Publishing
```bash
# Create a changeset for version updates
pnpm changeset

# Update package version based on changesets
pnpm version

# Build and publish to npm
pnpm release
```

## Architecture & Code Organization

### Entry Points
- `bin/zcf.mjs` - CLI executable entry point
- `src/cli.ts` - CLI setup and parsing
- `src/cli-setup.ts` - Command registration and routing
- `src/index.ts` - Library exports

### Core Commands
- `src/commands/init.ts` - Full initialization flow (install Claude Code + configure API + setup MCP)
- `src/commands/update.ts` - Update workflow-related markdown files only
- `src/commands/menu.ts` - Interactive menu system (default command)

### Utilities Architecture
The project follows a modular utility architecture:

- **Configuration Management**
  - `utils/config.ts` - Core configuration operations (backup, copy, API setup)
  - `utils/config-operations.ts` - Advanced config operations (partial updates, merging)
  - `utils/json-config.ts` - JSON file operations with error handling
  - `utils/zcf-config.ts` - ZCF-specific configuration persistence

- **MCP (Model Context Protocol) Services**
  - `utils/mcp.ts` - MCP configuration management
  - `utils/mcp-selector.ts` - Interactive MCP service selection

- **Installation & Platform**
  - `utils/installer.ts` - Claude Code installation logic
  - `utils/platform.ts` - Cross-platform compatibility (Windows/macOS/Linux/Termux)

- **User Interaction**
  - `utils/prompts.ts` - Language selection and user prompts
  - `utils/ai-personality.ts` - AI personality configuration
  - `utils/banner.ts` - CLI banner display

### Key Design Patterns

1. **Modular Command Structure**: Each command is self-contained with its own options interface
2. **I18N Support**: All user-facing strings support zh-CN and en localization
3. **Error Handling**: Graceful error handling with user-friendly messages
4. **Configuration Merging**: Smart config merging to preserve user customizations
5. **Cross-Platform Support**: Special handling for Windows paths and Termux environment

### Testing Strategy

The project uses Vitest with a layered testing approach:

1. **Core Tests** (`*.test.ts`) - Basic functionality and main flows
2. **Edge Tests** (`*.edge.test.ts`) - Boundary conditions and error scenarios  
3. **Coverage Goals**: 90% for lines, functions, and statements (current: ~80%)

Tests extensively use mocking for:
- File system operations
- External command execution  
- User prompts
- Platform detection

### Test Architecture
- **Unit tests**: Located in `test/unit/` with separate files for commands and utils
- **Test isolation**: Each test file has corresponding `.edge.test.ts` for complex scenarios
- **Mock strategy**: Comprehensive mocking of external dependencies using vi.mock
- **Coverage configuration**: Excludes templates, dist, and type definitions from coverage calculations

### Important Implementation Details

1. **Windows Compatibility**: MCP configurations require special handling for Windows paths (using `cmd /c` wrapper)
2. **Configuration Backup**: All modifications create timestamped backups in `~/.claude/backup/`
3. **API Configuration**: Supports both Auth Token (OAuth) and API Key authentication methods
4. **Template System**: Configuration templates are stored in `templates/` with language-specific subdirectories (`en/` and `zh-CN/`)
5. **Error Recovery**: Exit prompt errors are handled separately to ensure clean termination
6. **Dangerous Operation Confirmation**: Built-in safety mechanism requiring explicit user confirmation for destructive operations
7. **Path Handling**: Automatic quote wrapping for paths containing spaces to ensure cross-platform compatibility

### Type System

The project uses strict TypeScript with:
- Explicit type definitions in `src/types/` and `src/types.ts`
- Interface-based design for options and configurations
- Proper null/undefined handling throughout
- Build configuration using `unbuild` with dual entry points (`src/index` and `src/cli`)
- TypeScript target: ES2022 with ESNext modules and bundler resolution

## Common Development Tasks

### Adding a New MCP Service
1. Add service definition to `MCP_SERVICES` in `src/constants.ts`
2. Update types in `src/types.ts` if needed
3. Test the service configuration flow

### Adding a New Command
1. Create command file in `src/commands/`
2. Define options interface
3. Register in `src/cli-setup.ts`
4. Add corresponding tests

### Updating Translations
1. Modify `I18N` object in `src/constants.ts`
2. Ensure all new strings have both zh-CN and en versions
3. Test both language flows

### Debugging Tips
- Use `pnpm dev` for rapid testing during development
- Check `~/.claude/` for generated configurations
- Review `~/.claude/backup/` for configuration history
- Test cross-platform behavior with platform detection mocks

### Development Workflow
1. **Feature Development**: Create corresponding test files before implementation
2. **Testing**: Run `pnpm test:watch` during development for immediate feedback
3. **Type Checking**: Use `pnpm typecheck` to ensure TypeScript compliance
4. **Build**: Run `pnpm build` before committing to verify build integrity
5. **Release**: Use `pnpm changeset` for version management and publishing

### Key Dependencies and Tools
- **CLI Framework**: `cac` for command-line interface
- **Testing**: `vitest` with coverage reporting via `@vitest/coverage-v8`
- **Build**: `unbuild` for TypeScript compilation and bundling
- **Execution**: `tsx` for TypeScript execution during development
- **Prompts**: `inquirer` for interactive command-line prompts
- **Utilities**: `pathe` for path operations, `tinyexec` for process execution