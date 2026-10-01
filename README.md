# mudgolt

## Prerequities

- Node.js v26.9.0 or newer (`nvm use`)
- npm

## Installation

- `npm install`

## Commands

- `start:server` - Starts the server
- `dev:server` - Starts the server in development mode
- `dev:client` - Starts the client in development mode
- `build:client` - Builds the client for production
- `lint` - Lint the project
- `check` - Type-check the server
- `test:server` - Test SQLite compatibility and WebSocket authentication in temporary directories
- `test:client` - Test connection races, event logging, and notification sounds with Node (no browser installation)

The server runs TypeScript directly with Node; development uses `node --watch`.
The existing `./db/store.db` is opened in place with `node:sqlite`, with no data conversion. Run server commands from the repository root. The adapter preserves the async service API, but database operations execute synchronously and can block the event loop.

WebSocket serving still uses `ws`, preserving the `/ws?public-key=...` authentication flow and event payloads.

Tests initialize a fresh temporary database and, when a local `db/store.db` exists, back it up into another temporary directory for authentication testing. They do not write to the original database.
