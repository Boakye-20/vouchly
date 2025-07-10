# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

# Vouchly

## Development Tools

### Context7 MCP

This project is configured with [Context7 MCP](https://context7.com) for enhanced AI coding assistance. Context7 provides up-to-date documentation and code examples directly in your AI coding assistant.

**Setup:**
- The project includes `.cursor/mcp.json` for Cursor integration
- See [CONTEXT7_SETUP.md](./CONTEXT7_SETUP.md) for detailed setup instructions

**Usage:**
- Add `use context7` to your prompts for current documentation
- Example: "Create a Next.js middleware for JWT authentication. use context7"

## Testing & Code Quality

### Unit Tests
- Run all unit tests:
  ```bash
  npm run test
  ```
- View coverage report:
  ```bash
  npm run test:coverage
  ```

### Integration Tests
- Place integration tests in `src/tests/api/integration/`
- Run with:
  ```bash
  npm run test
  ```

### E2E Tests (Playwright)
- Install Playwright browsers (first time only):
  ```bash
  npx playwright install
  ```
- Run all E2E tests:
  ```bash
  npx playwright test
  ```
- E2E tests are in `src/tests/e2e/`

### API Documentation
- See [`API_REFERENCE.md`](./API_REFERENCE.md) for all endpoints, methods, and examples.

### Code Quality & Deployment
- TypeScript strict mode is enabled (`tsconfig.json`)
- All code must pass `npm run typecheck` before deployment
- See `VOUCHLY_PROJECT_CHECKLIST.md` for technical debt and code quality status
