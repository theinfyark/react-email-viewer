import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EmailViewer } from "../src/index.js";

const emlText = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "fixtures/sample.eml"),
  "utf8",
);

describe("EmailViewer", () => {
  it("renders subject and body from eml source", async () => {
    render(<EmailViewer source={emlText} theme="light" />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Hello from react-email-viewer/i,
        }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email toolbar/i)).toBeInTheDocument();
  });

  it("shows empty state without source", () => {
    render(<EmailViewer theme="light" emptyLabel="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
