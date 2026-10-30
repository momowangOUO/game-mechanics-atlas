import { describe, expect, it, vi } from "vitest";
import { Children, isValidElement, type ReactElement } from "react";
import ErrorPage from "./error";

describe("Next error boundary callback contract", () => {
  it("retry button calls the reset callback supplied by Next", () => {
    const reset = vi.fn();
    const page = ErrorPage({ error: new Error("render failed"), reset });
    const button = Children.toArray(page.props.children).find(
      (child) => isValidElement(child) && child.type === "button",
    ) as ReactElement<{ onClick: () => void }>;
    expect(button.props.onClick).toBe(reset);
    button.props.onClick();
    expect(reset).toHaveBeenCalledOnce();
  });
});
