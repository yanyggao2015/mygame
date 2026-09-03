import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the application name", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "MyGame" }),
    ).toBeInTheDocument();
  });

  it("renders a non-empty build identifier", () => {
    render(<Home />);

    const buildIdEl = screen.getByTestId("build-id");
    expect(buildIdEl).toBeInTheDocument();
    expect(buildIdEl.textContent).toMatch(/Build:\s*\S+/);
  });
});
