import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EditProductPage from "./EditProductPage";
import { getProductById, updateProduct } from "../lib/api";

vi.mock("@clerk/react", () => ({
  useAuth: () => ({ userId: "user_1" }),
}));

vi.mock("../lib/api", () => ({
  syncUser: vi.fn(),
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  getMyProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

const products = {
  p1: {
    id: "p1",
    userId: "user_1",
    title: "Product One",
    description: "First description",
    imageUrl: "https://example.com/one.png",
  },
  p2: {
    id: "p2",
    userId: "user_1",
    title: "Product Two",
    description: "Second description",
    imageUrl: "https://example.com/two.png",
  },
};

function NavigateButtons() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate("/edit/p2")}>go-p2</button>
      <button onClick={() => navigate("/edit/p1")}>go-p1</button>
    </>
  );
}

function renderPage(initialEntry) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const renderResult = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/edit/:id"
            element={
              <>
                <EditProductPage />
                <NavigateButtons />
              </>
            }
          />
          <Route path="/product/:id" element={null} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...renderResult, queryClient };
}

beforeEach(() => {
  vi.clearAllMocks();
  getProductById.mockImplementation((id) =>
    Promise.resolve({ ...products[id] })
  );
  updateProduct.mockResolvedValue({});
});

afterEach(cleanup);

describe("EditProductPage", () => {
  it("remounts the form with the new product when navigating between ids and submits current product data", async () => {
    const user = userEvent.setup();
    const { queryClient } = renderPage("/edit/p1");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    expect(await screen.findByDisplayValue("Product One")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "go-p2" }));
    expect(await screen.findByDisplayValue("Product Two")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "go-p1" }));
    expect(await screen.findByDisplayValue("Product One")).toBeTruthy();

    const titleInput = screen.getByDisplayValue("Product One");
    await user.clear(titleInput);
    await user.type(titleInput, "Renamed");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateProduct).toHaveBeenCalledTimes(1));
    expect(updateProduct.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        id: "p1",
        title: "Renamed",
        description: "First description",
        imageUrl: "https://example.com/one.png",
      })
    );
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["myProducts"],
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["product", "p1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });
});
