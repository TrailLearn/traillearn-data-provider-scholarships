import { render, screen } from "@testing-library/react";
import { DashboardLayout } from "./dashboard-layout";

// Mock next/navigation if needed, or simply test rendering
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("DashboardLayout", () => {
  it("renders the sidebar navigation", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText("TrailLearn")).toBeInTheDocument();
    expect(screen.getByText("Review Queue")).toBeInTheDocument();
    expect(screen.getByText("API Docs")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <DashboardLayout>
        <div data-testid="child-content">Child Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
