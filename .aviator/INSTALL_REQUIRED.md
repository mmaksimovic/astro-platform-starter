# Required Installation Steps

## ESLint (Step 2.1)

Before running linting, please install the ESLint dependencies:

```bash
npm install --save-dev eslint@^9 @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-astro eslint-plugin-jsx-a11y
```

These dependencies are required for:
- `eslint@^9` - Core ESLint linter with flat config support
- `@typescript-eslint/parser` - TypeScript parsing for ESLint
- `@typescript-eslint/eslint-plugin` - TypeScript-specific linting rules
- `eslint-plugin-astro` - Astro file linting support
- `eslint-plugin-jsx-a11y` - Accessibility rules for JSX/React

After installation, run linting with:
```bash
npm run lint
```

To automatically fix issues:
```bash
npm run lint:fix
```

## Unit and Component Tests

Before running the unit and component tests, please install the following React Testing Library dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitejs/plugin-react
```

These dependencies are required for:
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom Jest/Vitest DOM matchers
- `@vitejs/plugin-react` - Vite plugin for React support in tests

After installation, run tests with:
```bash
npm test
```

To view the test UI:
```bash
npm run test:ui
```

To generate coverage report:
```bash
npm run test:coverage
```

## End-to-End Tests with Playwright

Before running the E2E tests, please install Playwright and browser binaries:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

These dependencies are required for:
- `@playwright/test` - End-to-end testing framework with browser automation
- Browser binaries (Chromium, Firefox, WebKit) are installed via `npx playwright install`

After installation, run E2E tests with:
```bash
npm run test:e2e
```

To view the Playwright test UI:
```bash
npm run test:e2e:ui
```

**Note:** For E2E tests to work properly, the application must be running. Start the dev server with:
```bash
npm run dev
```
Or use Netlify Dev for full platform features:
```bash
netlify dev
```
