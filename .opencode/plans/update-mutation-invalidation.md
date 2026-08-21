# Plan: Invalidate product queries after update + test assertion (approved)

## Verified finding (valid)

- `frontend/src/hooks/useProducts.js:49-51` — `useUpdateProduct` has no `onSuccess`; no cache invalidation after updates.
- Sibling conventions: create invalidates `["products"]` (line 19); delete invalidates `["myProducts"]`, `["products"]`, removes `["product", id]` (lines 34-38).
- Stale views after edit-save navigation: `["product", id]` (ProductPage), `["products"]` (HomePage), `["myProducts"]` (ProfilePage).
- Variables shape: `mutate({ id, ...formData })` → `id` available in onSuccess second arg.

## Changes

### 1. `frontend/src/hooks/useProducts.js`

```js
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};
```

(Invalidate detail, not remove — product still exists.)

### 2. `frontend/src/pages/EditProductPage.test.jsx`

- `renderPage` additionally returns `{ queryClient }`.
- After the existing `waitFor(updateProduct).toHaveBeenCalledTimes(1)`, add:

```js
await waitFor(() =>
  expect(queryClient.getQueryState(["product", "p1"]).isInvalidated).toBe(true)
);
```

(Detail query exists in cache from earlier fetches; list keys have no cache entries here, so only the detail key is asserted.)

## Validation

1. `npm run test` — all green (2 files / 2 tests)
2. Spot-check red: temporarily remove onSuccess block → new assertion fails → re-apply
3. `npm run lint` — only pre-existing ThemeSelector warnings
