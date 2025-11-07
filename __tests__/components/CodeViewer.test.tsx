import { render, screen, fireEvent } from "@testing-library/react";
import { CodeViewer } from "@/components/CodeViewer";

describe("CodeViewer", () => {
  const mockFiles = [
    {
      name: "test.ts",
      path: "src/test.ts",
      code: "console.log('Hello World');",
    },
    {
      name: "app.tsx",
      path: "src/app.tsx",
      code: "export default function App() { return <div>App</div>; }",
    },
  ];

  it("should render file list", () => {
    render(<CodeViewer files={mockFiles} />);

    expect(screen.getByText("test.ts")).toBeInTheDocument();
    expect(screen.getByText("app.tsx")).toBeInTheDocument();
  });

  it("should display first file by default", () => {
    render(<CodeViewer files={mockFiles} />);

    expect(screen.getByText(/console.log/)).toBeInTheDocument();
  });

  it("should switch files when clicked", () => {
    render(<CodeViewer files={mockFiles} />);

    const appFile = screen.getByText("app.tsx");
    fireEvent.click(appFile);

    expect(screen.getByText(/export default function App/)).toBeInTheDocument();
  });

  it("should show empty state when no files", () => {
    render(<CodeViewer files={[]} />);

    expect(screen.getByText(/No code files generated yet/)).toBeInTheDocument();
  });

  it("should have copy button", () => {
    render(<CodeViewer files={mockFiles} />);

    const copyButton = screen.getByText("Copy");
    expect(copyButton).toBeInTheDocument();
  });

  it("should show file count", () => {
    render(<CodeViewer files={mockFiles} />);

    expect(screen.getByText(/2 files generated/)).toBeInTheDocument();
  });
});
