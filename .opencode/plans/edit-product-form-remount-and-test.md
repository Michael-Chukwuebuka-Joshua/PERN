# Plan: Remount EditProductForm on route id change + regression test

## Verified findings

- `frontend/src/components/EditProductForm.jsx:12-16` — form state initialized from props via `useState`, runs only on mount.
- `frontend/src/pages/EditProductPage.jsx:45` — `<EditProductForm>` rendered without `key`; route `/edit/:id` (App.jsx:63-66) reuses the same component instance across id changes.
- Stale-data bug: react-query v5 serves cached data for the new id without entering the loading branch, so the form keeps the previous product's values when navigating between edit routes.
- No test infrastructure exists in `frontend/` (no vitest, jsdom, testing-library, test script, or test files).

## Changes

### 1. Fix: `frontend/src/pages/EditProductPage.jsx`

Add key to force remount per route id:

```jsx
<EditProductForm
  key={id}
  product={product}
  ...
```

### 2. Test infra: `frontend/package.json` + `frontend/vite.config.js`

- devDeps (via `npm install -D`): `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`
- script: `"test": "vitest run"`
- vite.config.js:

```js
test: {
  environment: "jsdom",
},
```

### 3. New file: `frontend/src/pages/EditProductPage.test.jsx`

Regression test covering navigation between product ids:

- `vi.mock("@clerk/react")` → `useAuth` returns `{ userId: "user_1" }`
- `vi.mock("../lib/api")` → stub `getProductById` / `updateProduct` with `vi.fn()` (real hooks + react-query run)
- Render inside fresh `QueryClientProvider` (`retry: false`) + `MemoryRouter initialEntries={["/edit/p1"]}` with `Routes`/`Route path="/edit/:id"`, plus an in-tree button calling `navigate("/edit/p2")`
- Flow: load p1 → assert fields show p1 → navigate to p2 → assert p2 → navigate back to p1 → assert fields show p1 again (fails without the `key` fix since p1 is cached and form never remounts) → type new title, submit → assert `updateProduct` called once with `{ id: "p1", title: <edited>, ... }`
- Explicit vitest imports, explicit `afterEach(cleanup)`

## Validation

1. `npm install` in `frontend/`
2. `npm run test` (green; optionally revert `key={id}` to confirm red, re-apply)
3. `npm run lint` (oxlint)
