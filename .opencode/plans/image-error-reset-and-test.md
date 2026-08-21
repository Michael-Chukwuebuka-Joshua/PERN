# Plan: Reset imageError on URL change + gate img rendering (approved)

## Verified finding (valid)

`frontend/src/components/EditProductForm.jsx`:
- `imageError` (line 17) only ever set to `true` via img `onError` (line 75); never reset.
- URL input onChange (lines 62-64) updates formData only → after one failed load, fallback stays visible even for a new valid URL.
- Line 69 gates `<img>` on `formData.imageUrl` alone → broken img and fallback render simultaneously while errored.

## Changes

### 1. `frontend/src/components/EditProductForm.jsx`

Reset flag in the image URL handler:

```jsx
value={formData.imageUrl}
onChange={(e) => {
  setImageError(false);
  setFormData({ ...formData, imageUrl: e.target.value });
}}
```

Hide img while errored:

```jsx
{formData.imageUrl && !imageError && (
```

Fallback block (lines ~80-87) unchanged.

### 2. New file `frontend/src/components/EditProductForm.test.jsx`

- Render `<EditProductForm>` directly inside `MemoryRouter` (Back link needs router) with product fixture `{ id:"p1", title:"Product One", description:"First description", imageUrl:"https://example.com/one.png" }`, `isPending/isError=false`, `onSubmit=vi.fn()`.
- Simulate load failure with `fireEvent.error(img)` (jsdom doesn't load images).
- Flow:
  1. Initial: `getByRole("img")` present; "Unable to load image preview" absent.
  2. `fireEvent.error(img)` → fallback text appears; `queryByRole("img")` null (rendering-gate fix).
  3. Type one char into URL field (`aria-label="Image URL"`) → img returns with updated src; fallback gone (reset fix; red without it).
- Explicit vitest imports + `afterEach(cleanup)`.

## Validation

1. `npm run test` — all green
2. Spot-check red: temporarily revert the `setImageError(false)` line → step 3 of test fails → re-apply
3. `npm run lint` — no new warnings beyond pre-existing ThemeSelector ones
