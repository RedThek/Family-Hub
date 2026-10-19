import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", db: "up" }),
      }),
    );
  });

  it("affiche le nom de l'application", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Family-Hub" })).toBeTruthy();
  });
});
