# Required Installation Steps

Before running the tests, please install the following React Testing Library dependencies:

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
