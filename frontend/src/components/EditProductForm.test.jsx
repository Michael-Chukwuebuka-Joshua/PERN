import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import EditProductForm from "./EditProductForm";

const product = {
  id: "p1",
  title: "Product One",
  description: "First description",
  imageUrl: "https://example.com/one.png",
};

function renderForm() {
  const onSubmit = vi.fn();
  render(
    <MemoryRouter>
      <EditProductForm
        product={product}
        isPending={false}
        isError={false}
        onSubmit={onSubmit}
      />
    </MemoryRouter>
  );
}

afterEach(cleanup);

describe("EditProductForm image preview", () => {
  it("shows the fallback on load error and retries when the URL changes", async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByRole("img")).toBeTruthy();
    expect(
      screen.queryByText("Unable to load image preview")
    ).toBeNull();

    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("Unable to load image preview")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();

    const urlInput = screen.getByLabelText("Image URL");
    await user.type(urlInput, "x");

    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("https://example.com/one.pngx");
    expect(
      screen.queryByText("Unable to load image preview")
    ).toBeNull();
  });
});
